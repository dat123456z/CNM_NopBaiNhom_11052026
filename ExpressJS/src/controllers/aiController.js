const aiService = require('../services/aiService');
const Product = require('../models/Product');

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
