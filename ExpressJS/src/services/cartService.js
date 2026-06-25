const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

const activeShopInclude = {
    model: Shop,
    as: 'shop',
    attributes: ['id', 'name', 'status'],
    where: { status: 'active' },
    required: true
};

const getCart = async (userId) => {
    const items = await CartItem.findAll({ where: { userId } });
    if (items.length === 0) return { items: [], total: 0 };

    const productIds = items.map((i) => i.productId);
    const products = await Product.findAll({ where: { id: productIds, status: 'active' }, include: [activeShopInclude] });
    const productMap = {};
    for (const p of products) productMap[p.id] = p;

    let total = 0;
    const enriched = items.map((item) => {
        const p = productMap[item.productId];
        const lineTotal = p ? Number(p.price) * item.quantity : 0;
        total += lineTotal;
        return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            color: item.color,
            product: p ? {
                id: p.id,
                title: p.title,
                price: Number(p.price),
                image: p.images?.[0] || null,
                stock: p.stock,
                status: p.status,
                shop: p.shop ? {
                    id: p.shop.id,
                    name: p.shop.name,
                    status: p.shop.status
                } : null
            } : null,
            lineTotal
        };
    });

    return { items: enriched, total };
};

const addToCart = async (userId, { productId, quantity = 1, color }) => {
    const product = await Product.findOne({ where: { id: productId, status: 'active' }, include: [activeShopInclude] });
    if (!product) throw Object.assign(new Error('Sản phẩm không tồn tại.'), { status: 404 });
    if (product.stock < quantity) throw Object.assign(new Error('Sản phẩm không đủ hàng.'), { status: 400 });

    const existing = await CartItem.findOne({ where: { userId, productId, color: color || null } });
    if (existing) {
        await existing.update({ quantity: existing.quantity + quantity });
        return existing;
    }
    return CartItem.create({ userId, productId, quantity, color: color || null });
};

const updateCartItem = async (userId, cartItemId, quantity) => {
    const item = await CartItem.findOne({ where: { id: cartItemId, userId } });
    if (!item) throw Object.assign(new Error('Không tìm thấy sản phẩm trong giỏ.'), { status: 404 });
    if (quantity <= 0) {
        await item.destroy();
        return null;
    }
    await item.update({ quantity });
    return item;
};

const removeFromCart = async (userId, cartItemId) => {
    const item = await CartItem.findOne({ where: { id: cartItemId, userId } });
    if (!item) throw Object.assign(new Error('Không tìm thấy sản phẩm trong giỏ.'), { status: 404 });
    await item.destroy();
};

const clearCart = async (userId) => {
    await CartItem.destroy({ where: { userId } });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
