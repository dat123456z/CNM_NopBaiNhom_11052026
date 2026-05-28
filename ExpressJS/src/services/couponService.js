const { Op } = require('sequelize');
const Coupon = require('../models/Coupon');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

/**
 * Lấy danh sách mã giảm giá khả dụng của người dùng
 */
const getUserCoupons = async (userId) => {
    const coupons = await Coupon.findAll({
        where: {
            isActive: true,
            [Op.or]: [{ userId: null }, { userId }],
            [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gte]: new Date() } }]
        },
        include: [{
            model: Shop,
            as: 'shop',
            attributes: ['id', 'name', 'avatar']
        }]
    });
    return coupons;
};

/**
 * Kiểm tra tính hợp lệ của mã giảm giá và tính toán số tiền giảm giá
 */
const checkCoupon = async (userId, { items, couponCode }) => {
    if (!couponCode) return { discount: 0, coupon: null };

    const productIds = items.map((i) => i.productId);
    const products = await Product.findAll({ where: { id: { [Op.in]: productIds }, status: 'active' } });

    const shopSubtotals = {};
    for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;
        if (!shopSubtotals[product.shopId]) shopSubtotals[product.shopId] = 0;
        shopSubtotals[product.shopId] += Number(product.price) * item.quantity;
    }

    const coupon = await Coupon.findOne({
        where: {
            code: couponCode,
            isActive: true,
            [Op.or]: [{ userId: null }, { userId }],
            [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gte]: new Date() } }]
        }
    });

    if (!coupon) {
        throw Object.assign(new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn.'), { status: 400 });
    }

    const shopSubtotal = shopSubtotals[coupon.shopId] || 0;
    if (shopSubtotal === 0) {
        throw Object.assign(new Error('Mã giảm giá không áp dụng cho các sản phẩm trong giỏ hàng.'), { status: 400 });
    }

    if (coupon.minOrderAmount && shopSubtotal < Number(coupon.minOrderAmount)) {
        throw Object.assign(new Error(`Đơn hàng của shop phải tối thiểu ${Number(coupon.minOrderAmount).toLocaleString('vi-VN')}đ để dùng mã này.`), { status: 400 });
    }

    let discount = coupon.type === 'percent'
        ? (shopSubtotal * Number(coupon.value)) / 100
        : Number(coupon.value);

    if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
    }
    discount = Math.min(discount, shopSubtotal);

    return {
        discount,
        discountAmount: discount,
        code: coupon.code,
        couponCode: coupon.code,
        shopId: coupon.shopId,
        type: coupon.type,
        value: coupon.value
    };
};

/**
 * Tạo mã giảm giá thưởng khi khách hàng đánh giá sản phẩm (REV-)
 */
const createReviewRewardCoupon = async (userId, shopId) => {
    const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const couponCode = `REV-${userId}-${randStr}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Hạn 30 ngày

    await Coupon.create({
        shopId: shopId,
        userId: userId,
        code: couponCode,
        type: 'percent',
        value: 10.00,
        minOrderAmount: 50000.00,
        maxDiscount: 20000.00,
        usageLimit: 1,
        usedCount: 0,
        startsAt: new Date(),
        expiresAt,
        isActive: true
    });

    return couponCode;
};

const getShopCoupons = async (shopId) => {
    return await Coupon.findAll({
        where: { shopId },
        order: [['createdAt', 'DESC']]
    });
};

const createCoupon = async (shopId, data) => {
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, startsAt, expiresAt } = data;
    const existing = await Coupon.findOne({ where: { code } });
    if (existing) throw Object.assign(new Error('Mã giảm giá đã tồn tại.'), { status: 400 });

    return await Coupon.create({
        shopId,
        code: code.trim().toUpperCase(),
        type,
        value,
        minOrderAmount: minOrderAmount || 0,
        maxDiscount: maxDiscount || null,
        usageLimit: usageLimit || null,
        startsAt: startsAt || new Date(),
        expiresAt: expiresAt || null,
        isActive: true
    });
};

const updateCoupon = async (shopId, couponId, data) => {
    const coupon = await Coupon.findOne({ where: { id: couponId, shopId } });
    if (!coupon) throw Object.assign(new Error('Mã giảm giá không tồn tại.'), { status: 404 });

    const { type, value, minOrderAmount, maxDiscount, usageLimit, startsAt, expiresAt, isActive } = data;
    await coupon.update({
        type,
        value,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        startsAt,
        expiresAt,
        isActive: isActive !== undefined ? isActive : coupon.isActive
    });
    return coupon;
};

const deleteCoupon = async (shopId, couponId) => {
    const coupon = await Coupon.findOne({ where: { id: couponId, shopId } });
    if (!coupon) throw Object.assign(new Error('Mã giảm giá không tồn tại.'), { status: 404 });

    await coupon.destroy();
    return { message: 'Đã xóa mã giảm giá.' };
};

module.exports = {
    getUserCoupons,
    checkCoupon,
    createReviewRewardCoupon,
    getShopCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
};
