const { Op } = require('sequelize');
const Product = require('../models/Product');
const { Order, OrderItem } = require('../models/Order');
const { ProductReview } = require('../models/Review');
const Shop = require('../models/Shop');

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
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        shop: p.Shop || p.shop || null
    };
};

const getProducts = async ({ ids, category, search, shopId, minPrice, maxPrice, sort = 'newest', page = 1, limit = 20, allStatus }) => {
    const where = {};
    if (!shopId && allStatus !== 'true') {
        where.status = 'active';
    } else if (shopId && allStatus !== 'true') {
        where.shopId = shopId;
    }
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

    const { count, rows } = await Product.findAndCountAll({ where, order, limit: Number(limit), offset });
    return { total: count, page: Number(page), limit: Number(limit), products: rows.map(normalizeProduct) };
};

const getProductById = async (id) => {
    const product = await Product.findOne({
        where: { id, status: 'active' },
        include: [{
            model: Shop,
            as: 'shop',
            attributes: ['id', 'name', 'logo', 'rating', 'reviewCount', 'description', 'address', 'createdAt']
        }]
    });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });

    // Increment views count
    await product.increment('views');

    const buyersCount = await Order.count({
        include: [{
            model: OrderItem,
            as: 'items',
            where: { productId: id }
        }],
        where: {
            status: { [Op.ne]: 'cancelled' }
        }
    });

    const commentersCount = await ProductReview.count({
        where: { productId: id, isHidden: 0 }
    });

    const normalized = normalizeProduct(product);
    normalized.buyersCount = buyersCount;
    normalized.commentersCount = commentersCount;
    return normalized;
};

const createProduct = async (shopId, data) => {
    const { title, description, price, originalPrice, images, category, stock, colors } = data;
    const slug = `${slugify(title)}-${Date.now()}`;
    const product = await Product.create({
        shopId, title, slug, description, price, originalPrice,
        images: images || [], category, stock: stock || 0,
        colors: colors || [], status: 'active'
    });
    return normalizeProduct(product);
};

const updateProduct = async (productId, shopId, data) => {
    const product = await Product.findOne({ where: { id: productId, shopId } });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });
    if (data.title && data.title !== product.title) {
        data.slug = `${slugify(data.title)}-${Date.now()}`;
    }
    await product.update(data);
    return normalizeProduct(product);
};

const deleteProduct = async (productId, shopId) => {
    const product = await Product.findOne({ where: { id: productId, shopId } });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });
    await product.update({ status: 'deleted' });
};

const setProductStatus = async (productId, status) => {
    const product = await Product.findByPk(productId);
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });
    await product.update({ status });
    return normalizeProduct(product);
};

const getSimilarProducts = async (id) => {
    const product = await Product.findByPk(id);
    if (!product) return [];

    const category = product.category || '';
    const catWords = category.split(/[\s,]+/);
    const mainCatWord = catWords[0] ? catWords[0].trim() : '';

    const clauses = [];
    if (category) {
        clauses.push({ category: { [Op.like]: `%${category}%` } });
    }
    if (mainCatWord && mainCatWord.length >= 2) {
        clauses.push({ category: { [Op.like]: `%${mainCatWord}%` } });
        clauses.push({ title: { [Op.like]: `%${mainCatWord}%` } });
    }

    if (clauses.length === 0) {
        clauses.push({ category: 'others' });
    }

    const similar = await Product.findAll({
        where: {
            id: { [Op.ne]: id },
            status: 'active',
            [Op.or]: clauses
        },
        limit: 4,
        order: [['sold', 'DESC']]
    });

    return similar.map(normalizeProduct);
};

const getManagerProducts = async ({ status, page = 1, limit = 20 }) => {
    const where = {};
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{ model: Shop, as: 'shop', attributes: ['id', 'name', 'logo'] }],
        order: [['createdAt', 'DESC']],
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
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setProductStatus,
    getSimilarProducts,
    getManagerProducts
};