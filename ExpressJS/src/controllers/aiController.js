const aiService = require('../services/aiService');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const productService = require('../services/productService');
const { Op } = require('sequelize');

exports.chat = async (req, res) => {
    try {
        const { messages, model } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ ok: false, message: 'Thiếu trường `messages` (mảng).' });
        }

        // Lấy danh sách sản phẩm từ DB (chỉ lấy những thông tin cơ bản để tránh quá tải token)
        const products = await Product.findAll({
            where: { status: 'active' },
            attributes: ['id', 'title', 'price', 'category', 'description'],
            limit: 60
        });

        // Tạo chuỗi thông tin sản phẩm
        const productContext = products.map(p => 
            `- ID: ${p.id} | Tên: ${p.title} | Giá: ${p.price} VNĐ | Danh mục: ${p.category} | Mô tả: ${p.description ? p.description.substring(0, 50) + '...' : 'Trống'}`
        ).join('\n');

        // Tạo câu lệnh (prompt) hướng dẫn cho AI
        const systemMessage = {
            role: 'system',
            content: `Bạn là trợ lý ảo tư vấn bán hàng tận tâm của cửa hàng. Dưới đây là danh sách sản phẩm hiện có trong hệ thống của chúng ta:\n\n${productContext}\n\nHãy dùng những thông tin trên để tư vấn, gợi ý và trả lời câu hỏi của khách hàng. Hãy trả lời ngắn gọn, lịch sự và tự nhiên nhất có thể. QUAN TRỌNG: Hãy trả lời bằng văn bản thuần túy (plain text), tuyệt đối KHÔNG sử dụng định dạng Markdown (như in đậm **, in nghiêng *, danh sách -, tiêu đề #, v.v.).`
        };

        // Chèn system message vào đầu mảng tin nhắn
        messages.unshift(systemMessage);

        const result = await aiService.chat(messages, model);
        return res.json({ ok: true, result });
    } catch (err) {
        console.error('AI chat error:', err);
        return res.status(500).json({ ok: false, message: err.message || 'Lỗi AI.' });
    }
};

exports.imageSearch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ ok: false, message: 'Vui lòng chọn một file ảnh.' });
        }

        const analysis = await aiService.analyzeProductImage(
            req.file.buffer,
            req.file.mimetype
        );
        const terms = [
            analysis.object,
            analysis.category,
            ...(Array.isArray(analysis.colors) ? analysis.colors : []),
            ...(Array.isArray(analysis.keywords) ? analysis.keywords : [])
        ]
            .map((term) => String(term || '').trim())
            .filter((term) => term.length >= 2)
            .filter((term, index, list) =>
                list.findIndex((item) => item.toLowerCase() === term.toLowerCase()) === index
            )
            .slice(0, 12);

        if (!terms.length) {
            return res.json({ ok: true, analysis, products: [] });
        }

        const orConditions = terms.flatMap((term) => [
            { title: { [Op.like]: `%${term}%` } },
            { category: { [Op.like]: `%${term}%` } },
            { description: { [Op.like]: `%${term}%` } }
        ]);
        const products = await Product.findAll({
            where: {
                status: 'active',
                [Op.or]: orConditions
            },
            include: [{
                model: Shop,
                as: 'shop',
                attributes: ['id', 'name', 'logo', 'rating', 'reviewCount'],
                where: { status: 'active' },
                required: true
            }],
            limit: 30
        });

        const normalizeText = (value) =>
            String(value || '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
        const objectTerm = normalizeText(analysis.object);
        const ignoredKeywordWords = new Set([
            'san', 'pham', 'thoi', 'trang', 'nam', 'nu', 'mau',
            'dep', 'cao', 'cap', 'phong', 'cach', 'the', 'thao',
            'phu', 'kien', 'khong', 'day', 'bluetooth', 'wireless',
            'den', 'do', 'xanh', 'vang', 'hong', 'xam', 'nau', 'tim'
        ]);
        const usefulKeyword = (term) =>
            term
                .split(/\s+/)
                .some((token) => token.length >= 3 && !ignoredKeywordWords.has(token));
        const keywordTerms = [
            analysis.object,
            ...(Array.isArray(analysis.keywords) ? analysis.keywords : [])
        ]
            .map(normalizeText)
            .filter(Boolean)
            .filter((term) => term === objectTerm || usefulKeyword(term))
            .filter((term, index, list) => list.indexOf(term) === index);
        const categoryTerm = normalizeText(analysis.category);
        const colorTerms = (Array.isArray(analysis.colors) ? analysis.colors : [])
            .map(normalizeText)
            .filter(Boolean);
        const genericWords = new Set([
            'san', 'pham', 'thoi', 'trang', 'nam', 'nu', 'mau',
            'dep', 'cao', 'cap', 'phong', 'cach', 'chun',
            'the', 'thao', 'phu', 'kien'
        ]);
        const coreTokens = objectTerm
            .split(/\s+/)
            .filter((token) => token.length >= 2 && !genericWords.has(token));

        const scored = products
            .map((product) => {
                const plain = product.get({ plain: true });
                const title = normalizeText(plain.title);
                const category = normalizeText(plain.category);
                const description = normalizeText(plain.description);
                const colors = normalizeText(
                    (Array.isArray(plain.colors) ? plain.colors : [])
                        .map((color) => color?.label || color)
                        .join(' ')
                );
                let typeScore = 0;
                if (objectTerm) {
                    if (title.includes(objectTerm)) typeScore += 20;
                }
                for (const term of keywordTerms) {
                    if (term === objectTerm) continue;
                    if (title.includes(term)) typeScore += 8;
                }
                if (
                    typeScore === 0 &&
                    coreTokens.length > 0 &&
                    coreTokens.every((token) => title.includes(token))
                ) {
                    typeScore += 6;
                }

                let auxiliaryScore = 0;
                if (categoryTerm && category.includes(categoryTerm)) auxiliaryScore += 2;
                if (
                    typeScore > 0 &&
                    keywordTerms.some((term) => description.includes(term))
                ) {
                    auxiliaryScore += 1;
                }
                auxiliaryScore += colorTerms.reduce(
                    (total, color) =>
                        total + (colors.includes(color) || title.includes(color) ? 1 : 0),
                    0
                );

                return { product, typeScore, score: typeScore + auxiliaryScore };
            })
            // Danh mục/màu không được tự mình đưa một sản phẩm không cùng loại vào kết quả.
            .filter(({ typeScore }) => typeScore > 0)
            .sort((a, b) =>
                b.score - a.score ||
                Number(b.product.sold) - Number(a.product.sold)
            )
            .slice(0, 12)
            .map(({ product }) => productService.normalizeProduct(product));

        return res.json({ ok: true, analysis, products: scored });
    } catch (err) {
        console.error('AI image search error:', err.message);
        return res.status(500).json({
            ok: false,
            message: err.message || 'Không thể tìm sản phẩm bằng ảnh.'
        });
    }
};
