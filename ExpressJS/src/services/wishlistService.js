const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { normalizeProduct } = require('./productService');

const activeShopInclude = {
    model: Shop,
    as: 'shop',
    attributes: ['id', 'name', 'logo', 'status'],
    where: { status: 'active' },
    required: true
};

const getWishlist = async (userId) => {
    const items = await Wishlist.findAll({ where: { userId } });
    const productIds = items.map((i) => i.productId);
    if (productIds.length === 0) return [];

    const products = await Product.findAll({ where: { id: productIds, status: 'active' }, include: [activeShopInclude] });
    return products.map(normalizeProduct);
};

const toggleWishlist = async (userId, productId) => {
    const product = await Product.findOne({ where: { id: productId, status: 'active' }, include: [activeShopInclude] });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });

    const existing = await Wishlist.findOne({ where: { userId, productId } });
    if (existing) {
        await existing.destroy();
        return { added: false };
    }
    await Wishlist.create({ userId, productId });
    return { added: true };
};

module.exports = { getWishlist, toggleWishlist };
