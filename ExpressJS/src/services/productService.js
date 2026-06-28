const { Op } = require('sequelize');
const Product = require('../models/Product');
const { ProductReview } = require('../models/Review');
const Shop = require('../models/Shop');
const { sequelize } = require('../config/database');
const notificationService = require('./notificationService');
const productAlertService = require('./productAlertService');

const slugify = (text) =>
    text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
        .replace(/-+/g, '-');

const normalizeProduct = (product) => {
    if (!product) return null;
    const p = product.get ? product.get({ plain: true }) : product;
    return {
        id: p.id,
        shopId: p.shopId,
        title: p.title,
        slug: p.slug,
        desc: p.description,
        price: Number(p.price),
        originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
        images: Array.isArray(p.images) ? p.images : [],
        image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null,
        category: p.category,
        stock: Number(p.stock),
        colors: Array.isArray(p.colors) ? p.colors : [],
        status: p.status,
        rating: p.rating != null ? Number(p.rating) : null,
        reviewCount: p.reviewCount != null ? Number(p.reviewCount) : 0,
        sold: p.sold != null ? Number(p.sold) : 0,
        views: p.views != null ? Number(p.views) : 0,
        rejectionReason: p.rejectionReason || null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        shop: p.Shop || p.shop || null
    };
};

const activeShopInclude = {
    model: Shop,
    as: 'shop',
    attributes: ['id', 'name', 'logo', 'rating', 'reviewCount', 'description', 'address', 'createdAt', 'status'],
    where: { status: 'active' },
    required: true
};

const getProducts = async ({ ids, category, search, shopId, minPrice, maxPrice, sort = 'newest', page = 1, limit = 20 }) => {
    const where = {};
    const include = [activeShopInclude];
    if (shopId) {
        where.shopId = shopId;
    }
    where.status = 'active';
    if (ids) {
        const parsedIds = ids.split(',').map((v) => parseInt(v.trim(), 10)).filter((n) => !isNaN(n));
        if (parsedIds.length === 0) return { total: 0, page: Number(page), limit: Number(limit), products: [] };
        where.id = { [Op.in]: parsedIds };
    }
    if (category && category !== 'all') where.category = category;
    if (search) where.title = { [Op.like]: `%${search}%` };
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price[Op.gte] = Number(minPrice);
        if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    const orderMap = {
        newest:     [['createdAt', 'DESC']],
        oldest:     [['createdAt', 'ASC']],
        price_asc:  [['price', 'ASC']],
        price_desc: [['price', 'DESC']],
        popular:    [['sold', 'DESC']],
        rating:     [['rating', 'DESC']],
        views:      [['views', 'DESC']]
    };
    const order = orderMap[sort] || orderMap.newest;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
        where,
        include,
        distinct: true,
        order,
        limit: Number(limit),
        offset
    });
    return { total: count, page: Number(page), limit: Number(limit), products: rows.map(normalizeProduct) };
};

const getShopProducts = async (shopId, { page = 1, limit = 100 } = {}) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
        where: {
            shopId,
            status: { [Op.ne]: 'deleted' }
        },
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset
    });
    return { total: count, page: Number(page), limit: Number(limit), products: rows.map(normalizeProduct) };
};

const getProductById = async (id) => {
    const product = await Product.findOne({
        where: { id, status: 'active' },
        include: [activeShopInclude]
    });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });

    // Increment views count
    await product.increment('views');

    const [soldResult] = await sequelize.query(
        `SELECT COALESCE(SUM(oi.quantity), 0) as sold
         FROM order_items oi
         INNER JOIN orders o ON o.id = oi.orderId
         WHERE oi.productId = :productId
           AND o.status NOT IN ('cancelled', 'refunded', 'cancel_requested')`,
        { replacements: { productId: id }, type: sequelize.QueryTypes.SELECT }
    );
    const soldCount = Number(soldResult.sold || 0);

    const commentersCount = await ProductReview.count({
        where: { productId: id, isHidden: 0 }
    });

    const normalized = normalizeProduct(product);
    if (normalized.sold !== soldCount) {
        await Product.update({ sold: soldCount }, { where: { id } });
        normalized.sold = soldCount;
    }
    normalized.buyersCount = soldCount;
    normalized.commentersCount = commentersCount;
    return normalized;
};

const createProduct = async (shopId, data) => {
    const { title, description, price, originalPrice, images, category, stock, colors } = data;
    const slug = `${slugify(title)}-${Date.now()}`;
    const product = await Product.create({
        shopId, title, slug, description, price, originalPrice,
        images: images || [], category, stock: stock || 0,
        colors: colors || [], status: 'pending'
    });

    try {
        const shop = await Shop.findByPk(shopId, { attributes: ['name'] });
        await notificationService.notifyManagers({
            type: 'manager_product_pending',
            title: 'Sản phẩm mới chờ duyệt',
            message: `Vendor ${shop?.name || `Shop #${shopId}`} vừa gửi sản phẩm "${title}" để manager duyệt.`
        });
    } catch (err) {
        console.error('[Notify] manager product moderation error:', err.message);
    }

    return normalizeProduct(product);
};

const updateProduct = async (productId, shopId, data) => {
    const product = await Product.findOne({ where: { id: productId, shopId } });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });

    const allowedFields = [
        'title', 'description', 'price', 'originalPrice',
        'images', 'category', 'stock', 'colors'
    ];
    const updates = Object.fromEntries(
        allowedFields
            .filter((field) => data[field] !== undefined)
            .map((field) => [field, data[field]])
    );

    const sameNumber = (a, b) => {
        if (a == null && b == null) return true;
        return Number(a) === Number(b);
    };
    const sameJson = (a, b) =>
        JSON.stringify(a || []) === JSON.stringify(b || []);
    const moderationFields = [
        'title', 'description', 'price', 'originalPrice',
        'images', 'category', 'colors'
    ];
    const moderationChanged = moderationFields.some((field) => {
        if (updates[field] === undefined) return false;
        if (['price', 'originalPrice'].includes(field)) {
            return !sameNumber(updates[field], product[field]);
        }
        if (['images', 'colors'].includes(field)) {
            return !sameJson(updates[field], product[field]);
        }
        return String(updates[field] ?? '').trim() !== String(product[field] ?? '').trim();
    });
    const stockChanged =
        updates.stock !== undefined && Number(updates.stock) !== Number(product.stock);

    if (moderationChanged) {
        if (updates.title && updates.title !== product.title) {
            updates.slug = `${slugify(updates.title)}-${Date.now()}`;
        }
        updates.status = 'pending';
        updates.rejectionReason = null;
    }

    await product.update(updates);

    if (moderationChanged) {
        try {
            const shop = await Shop.findByPk(shopId, { attributes: ['name'] });
            await notificationService.notifyManagers({
                type: 'manager_product_updated_pending',
                title: 'Sản phẩm vừa cập nhật chờ duyệt',
                message: `Vendor ${shop?.name || `Shop #${shopId}`} vừa cập nhật sản phẩm "${product.title}" và cần manager duyệt lại.`
            });
        } catch (err) {
            console.error('[Notify] manager product update moderation error:', err.message);
        }
    } else if (stockChanged && product.status === 'active') {
        try {
            await productAlertService.processProductAlerts(product);
        } catch (err) {
            console.error('[Notify] product stock alert error:', err.message);
        }
    }

    return normalizeProduct(product);
};

const deleteProduct = async (productId, shopId) => {
    const product = await Product.findOne({ where: { id: productId, shopId } });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });
    await product.update({ status: 'deleted' });
};

const setProductStatus = async (productId, status, options = {}) => {
    const validStatuses = ['active', 'draft', 'hidden', 'deleted', 'pending', 'rejected'];
    if (!validStatuses.includes(status)) {
        throw Object.assign(new Error('Trạng thái sản phẩm không hợp lệ.'), { status: 400 });
    }
    if (options.allowedStatuses && !options.allowedStatuses.includes(status)) {
        throw Object.assign(new Error('Bạn không có quyền cập nhật trạng thái này.'), { status: 403 });
    }

    const where = { id: productId };
    if (options.shopId) where.shopId = options.shopId;
    const product = await Product.findOne({ where });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });
    if (options.allowedTransitions) {
        const nextStatuses = options.allowedTransitions[product.status] || [];
        if (!nextStatuses.includes(status)) {
            throw Object.assign(new Error('Bạn không có quyền chuyển sản phẩm sang trạng thái này.'), { status: 403 });
        }
    }
    const reason = options.reason?.trim();
    if (status === 'rejected' && !reason) {
        throw Object.assign(new Error('Vui lòng nhập lý do từ chối hoặc nội dung cần chỉnh sửa.'), { status: 400 });
    }

    const updates = { status };
    if (status === 'rejected') updates.rejectionReason = reason;
    if (['active', 'pending'].includes(status)) updates.rejectionReason = null;

    await product.update(updates);

    if (status === 'active') {
        try {
            await productAlertService.processProductAlerts(product);
        } catch (err) {
            console.error('[Notify] product alert error:', err.message);
        }
    }

    if (status === 'rejected') {
        try {
            const shop = await Shop.findByPk(product.shopId, { attributes: ['name', 'userId'] });
            if (shop?.userId) {
                await notificationService.notify({
                    userId: shop.userId,
                    type: 'product_rejected',
                    title: 'Sản phẩm bị từ chối',
                    message: `Sản phẩm "${product.title}" bị từ chối. Lý do: ${reason}`
                });
            }
        } catch (err) {
            console.error('[Notify] product rejected error:', err.message);
        }
    }

    return normalizeProduct(product);
};

const getSimilarProducts = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) return [];

    const candidates = await Product.findAll({
        where: {
            id: { [Op.ne]: id },
            status: 'active'
        },
        include: [activeShopInclude],
        limit: 200
    });

    const normalizeText = (value) =>
        String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .toLowerCase();
    const stopWords = new Set([
        'nam', 'nu', 'thoi', 'trang', 'san', 'pham', 'chinh', 'hang',
        'cao', 'cap', 'dang', 'ong', 'phoi', 'bo', 'cho', 'voi', 'va',
        'mini', 'classic', 'premium', 'moi'
    ]);
    const tokenize = (value) =>
        normalizeText(value)
            .split(/[^a-z0-9]+/)
            .filter((word) => word.length >= 2 && !stopWords.has(word));
    const sourceTokens = [...new Set(tokenize(product.title))];
    const sourceCategory = normalizeText(product.category);
    const sourcePrice = Number(product.price);
    const sourceColors = new Set(
        (Array.isArray(product.colors) ? product.colors : [])
            .map((color) => normalizeText(color?.label || color))
            .filter(Boolean)
    );

    const ranked = candidates
        .map((candidate) => {
            const tokens = [...new Set(tokenize(candidate.title))];
            const sharedTokens = tokens.filter((token) => sourceTokens.includes(token));
            const sameCategory =
                sourceCategory && normalizeText(candidate.category) === sourceCategory;
            const sameLeadingType =
                sourceTokens[0] && tokens[0] && sourceTokens[0] === tokens[0];
            const candidatePrice = Number(candidate.price);
            const priceSimilarity = sourcePrice > 0 && candidatePrice > 0
                ? Math.min(sourcePrice, candidatePrice) / Math.max(sourcePrice, candidatePrice)
                : 0;
            const sharedColors = (Array.isArray(candidate.colors) ? candidate.colors : [])
                .map((color) => normalizeText(color?.label || color))
                .filter((color) => sourceColors.has(color)).length;

            const score =
                (sameCategory ? 40 : 0) +
                sharedTokens.length * 25 +
                (sameLeadingType ? 30 : 0) +
                priceSimilarity * 15 +
                Math.min(sharedColors, 2) * 2 +
                Math.min(Number(candidate.rating || 0), 5);

            return {
                candidate,
                score,
                relevant:
                    sameCategory ||
                    sameLeadingType
            };
        })
        .filter((item) => item.relevant)
        .sort((a, b) =>
            b.score - a.score ||
            Number(b.candidate.sold || 0) - Number(a.candidate.sold || 0)
        )
        .slice(0, 4)
        .map(({ candidate }) => normalizeProduct(candidate));

    return ranked;
};

const getManagerProducts = async ({ status, page = 1, limit = 20 }) => {
    const where = {};
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{ model: Shop, as: 'shop', attributes: ['id', 'name', 'logo'] }],
        order: [['updatedAt', 'DESC']],
        limit: Number(limit),
        offset
    });
    return {
        total: count,
        page: Number(page),
        limit: Number(limit),
        products: rows.map(normalizeProduct)
    };
};

module.exports = {
    normalizeProduct,
    getProducts,
    getShopProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setProductStatus,
    getSimilarProducts,
    getManagerProducts
};
