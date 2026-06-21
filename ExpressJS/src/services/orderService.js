const { sequelize } = require('../config/database');
const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const CartItem = require('../models/CartItem');
const Coupon = require('../models/Coupon');
const Shop = require('../models/Shop');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { ProductReview } = require('../models/Review');
const { Op } = require('sequelize');
const notificationService = require('./notificationService');

const scheduleAutoConfirm = (orderId) => {
    const THIRTY_MIN = 30 * 60 * 1000;
    setTimeout(async () => {
        try {
            const order = await Order.findByPk(orderId);
            if (order && order.status === 'pending') {
                await order.update({ status: 'confirmed', confirmedAt: new Date() });
                // Notify user khi auto-confirm
                const user = await User.findByPk(order.userId);
                if (user) {
                    await notificationService.notifyOrderStatusChanged({ order, user, newStatus: 'confirmed' });
                }
                console.log(`[Auto-confirm] Order #${orderId} confirmed automatically.`);
            }
        } catch (err) {
            console.error(`[Auto-confirm] Error confirming order #${orderId}:`, err.message);
        }
    }, THIRTY_MIN);
};

const createOrder = async (userId, { items, couponCode, usePoints, shippingAddress, paymentMethod, note }) => {
    if (!items || items.length === 0) throw Object.assign(new Error('Giỏ hàng trống.'), { status: 400 });

    const productIds = items.map((i) => i.productId);
    const products = await Product.findAll({
        where: { id: { [Op.in]: productIds }, status: 'active' },
        include: [{
            model: Shop,
            as: 'shop',
            attributes: ['id', 'status'],
            where: { status: 'active' },
            required: true
        }]
    });
    if (products.length !== productIds.length)
        throw Object.assign(new Error('Một số sản phẩm không tồn tại.'), { status: 400 });

    const shopMap = {};
    for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (product.stock < item.quantity)
            throw Object.assign(new Error(`Sản phẩm "${product.title}" không đủ hàng.`), { status: 400 });
        if (!shopMap[product.shopId]) shopMap[product.shopId] = [];
        shopMap[product.shopId].push({ item, product });
    }

    const t = await sequelize.transaction();
    const orders = [];

    try {
        const user = await User.findByPk(userId, { transaction: t });
        let userPoints = user ? user.points : 0;
        let totalPointsUsed = 0;

        for (const [shopId, entries] of Object.entries(shopMap)) {
            let subtotal = 0;
            const orderItems = [];

            for (const { item, product } of entries) {
                const lineTotal = Number(product.price) * item.quantity;
                subtotal += lineTotal;
                orderItems.push({
                    productId: product.id,
                    quantity: item.quantity,
                    price: product.price,
                    color: item.color || null,
                    productTitle: product.title,
                    productImage: product.images?.[0] || null
                });
            }

            let discount = 0;
            if (couponCode) {
                const coupon = await Coupon.findOne({
                    where: {
                        shopId,
                        code: couponCode,
                        isActive: true,
                        [Op.or]: [{ userId: null }, { userId }],
                        [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gte]: new Date() } }],
                    },
                    transaction: t
                });
                if (coupon) {
                    if (!coupon.minOrderAmount || subtotal >= Number(coupon.minOrderAmount)) {
                        discount = coupon.type === 'percent'
                            ? (subtotal * Number(coupon.value)) / 100
                            : Number(coupon.value);
                        if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
                        discount = Math.min(discount, subtotal);
                        await coupon.increment('usedCount', { transaction: t });
                    }
                }
            }

            let pointsUsed = 0;
            let pointsDiscount = 0;
            if (usePoints && userPoints > 0) {
                const maxPointsToUse = Math.floor((subtotal - discount) / 1000);
                const pointsToUse = Math.min(userPoints, maxPointsToUse);
                if (pointsToUse > 0) {
                    pointsUsed = pointsToUse;
                    pointsDiscount = pointsToUse * 1000;
                    userPoints -= pointsToUse;
                    totalPointsUsed += pointsToUse;
                }
            }

            const shippingFee = 0;
            const tax = Math.round(subtotal * 0.08);
            const total = subtotal + tax - discount - pointsDiscount + shippingFee;

            const order = await Order.create({
                userId,
                shopId: Number(shopId),
                subtotal,
                discount,
                shippingFee,
                tax,
                total,
                pointsUsed,
                pointsDiscount,
                couponCode: couponCode || null,
                paymentMethod,
                shippingAddress,
                note,
                status: 'pending',
                paymentStatus: 'unpaid'
            }, { transaction: t });

            await OrderItem.bulkCreate(
                orderItems.map((i) => ({ ...i, orderId: order.id })),
                { transaction: t }
            );

            for (const { item, product } of entries) {
                await product.decrement('stock', { by: item.quantity, transaction: t });
                await product.increment('sold', { by: item.quantity, transaction: t });
            }

            orders.push({ order, shopId: Number(shopId), orderItems });
        }

        if (totalPointsUsed > 0 && user) {
            await user.decrement('points', { by: totalPointsUsed, transaction: t });
        }

        await CartItem.destroy({ where: { userId, productId: { [Op.in]: productIds } }, transaction: t });
        await t.commit();

        for (const { order, shopId, orderItems } of orders) {
            if (order.paymentMethod === 'vnpay') continue;
            scheduleAutoConfirm(order.id);

            try {
                const shop = await Shop.findByPk(shopId);
                const shopOwner = shop ? await User.findByPk(shop.userId) : null;
                if (shopOwner) {
                    await notificationService.notifyNewOrder({
                        order,
                        shopOwner,
                        items: orderItems
                    });
                }
            } catch (err) {
                console.error('[Notify] notifyNewOrder error:', err.message);
            }
        }

        return orders.map(o => o.order);
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

const confirmOrder = async (orderId, shopId) => {
    const order = await Order.findOne({ where: { id: orderId, shopId } });
    if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại.'), { status: 404 });
    if (order.status !== 'pending')
        throw Object.assign(new Error('Chỉ có thể xác nhận đơn hàng mới.'), { status: 400 });
    await order.update({ status: 'confirmed', confirmedAt: new Date() });

    // Notify người dùng
    try {
        const user = await User.findByPk(order.userId);
        if (user) {
            await notificationService.notifyOrderStatusChanged({ order, user, newStatus: 'confirmed' });
        }
    } catch (err) {
        console.error('[Notify] confirmOrder error:', err.message);
    }

    return order;
};

const getMyOrders = async (userId, { page = 1, limit = 10, status }) => {
    const where = { userId };
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const { count, rows } = await Order.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset,
        include: [
            { model: OrderItem, as: 'items' },
            {
                model: ProductReview,
                as: 'productReviews',
                attributes: ['id', 'productId', 'rating', 'comment', 'createdAt']
            }
        ]
    });
    return { total: count, page: Number(page), limit: Number(limit), orders: rows };
};

const getOrderDetail = async (orderId, userId, role) => {
    const where = { id: orderId };
    if (!['admin', 'manager'].includes(role)) where.userId = userId;
    const Shipper = require('../models/Shipper');
    const order = await Order.findOne({
        where,
        include: [
            { model: OrderItem, as: 'items' },
            {
                model: ProductReview,
                as: 'productReviews',
                attributes: ['id', 'productId', 'rating', 'comment', 'createdAt']
            },
            { model: Shipper, as: 'shipper' }
        ]
    });
    if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại.'), { status: 404 });
    return order;
};

const cancelOrder = async (orderId, userId, reason) => {
    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại.'), { status: 404 });

    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMs = now - createdAt;
    const THIRTY_MIN = 30 * 60 * 1000;

    if (order.status === 'preparing') {
        await order.update({ status: 'cancel_requested', cancelReason: reason || null });

        try {
            const shop = await Shop.findByPk(order.shopId);
            const shopOwner = shop ? await User.findByPk(shop.userId) : null;
            const user = await User.findByPk(userId);
            if (shopOwner && user) {
                await notificationService.notifyCancelRequest({ order, shopOwner, user });
            }
        } catch (err) {
            console.error('[Notify] cancelOrder (cancel_requested) error:', err.message);
        }

        return order;
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
        throw Object.assign(new Error('Không thể huỷ đơn hàng ở trạng thái này.'), { status: 400 });
    }

    if (diffMs > THIRTY_MIN) {
        throw Object.assign(new Error('Đã quá 30 phút, không thể hủy đơn hàng.'), { status: 400 });
    }

    const t = await sequelize.transaction();
    try {
        await order.update({ status: 'cancelled', cancelledAt: new Date(), cancelReason: reason }, { transaction: t });

        const items = await OrderItem.findAll({ where: { orderId } });
        for (const item of items) {
            await Product.increment('stock', { by: item.quantity, where: { id: item.productId }, transaction: t });
            await Product.decrement('sold', { by: item.quantity, where: { id: item.productId }, transaction: t });
        }
        await t.commit();
    } catch (err) {
        await t.rollback();
        throw err;
    }
    return order;
};

const updateOrderStatus = async (orderId, shopId, newStatus) => {
    const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['shipping', 'cancelled'],
        shipping: ['delivered'],
        cancel_requested: ['cancelled', 'preparing']
    };

    const order = await Order.findOne({ where: { id: orderId, shopId } });
    if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại.'), { status: 404 });
    if (!validTransitions[order.status]?.includes(newStatus))
        throw Object.assign(new Error(`Không thể chuyển sang trạng thái "${newStatus}".`), { status: 400 });

    const updates = { status: newStatus };

    if (newStatus === 'confirmed') updates.confirmedAt = new Date();

    if (newStatus === 'delivered') {
        updates.deliveredAt = new Date();
        updates.paymentStatus = 'paid';

        const t = await sequelize.transaction();
        try {
            const shop = await Shop.findByPk(shopId, { transaction: t });
            const newBalance = Number(shop.balance) + Number(order.total);
            await shop.update({ balance: newBalance }, { transaction: t });

            await WalletTransaction.create({
                shopId,
                orderId,
                type: 'credit',
                amount: order.total,
                balanceAfter: newBalance,
                note: `Đơn hàng #${orderId} hoàn thành`
            }, { transaction: t });

            await order.update(updates, { transaction: t });
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } else if (newStatus === 'cancelled') {
        const t = await sequelize.transaction();
        try {
            await order.update(updates, { transaction: t });
            const items = await OrderItem.findAll({ where: { orderId } });
            for (const item of items) {
                await Product.increment('stock', { by: item.quantity, where: { id: item.productId }, transaction: t });
                await Product.decrement('sold', { by: item.quantity, where: { id: item.productId }, transaction: t });
            }
            await t.commit();
        } catch (err) {
            await t.rollback();
            throw err;
        }
    } else {
        await order.update(updates);
    }

    try {
        const user = await User.findByPk(order.userId);
        if (user) {
            await notificationService.notifyOrderStatusChanged({ order, user, newStatus });
        }
    } catch (err) {
        console.error('[Notify] updateOrderStatus error:', err.message);
    }

    return order;
};

const getShopOrders = async (shopId, { page = 1, limit = 20, status }) => {
    const where = { shopId };
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const Shipper = require('../models/Shipper');
    const { count, rows } = await Order.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset,
        include: [
            { model: OrderItem, as: 'items' },
            { model: Shipper, as: 'shipper' }
        ]
    });
    return { total: count, page: Number(page), limit: Number(limit), orders: rows };
};

const getAllOrders = async ({ page = 1, limit = 50, status } = {}) => {
    const where = {};
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const Shipper = require('../models/Shipper');
    const { count, rows } = await Order.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset,
        include: [
            { model: OrderItem, as: 'items' },
            { model: Shipper, as: 'shipper' },
            { model: Shop, as: 'shop', attributes: ['id', 'name', 'logo'] },
            { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
        ]
    });
    return { total: count, page: Number(page), limit: Number(limit), orders: rows };
};

const activatePaidOrders = async (orderIds = []) => {
    if (!orderIds.length) return [];
    const orders = await Order.findAll({
        where: { id: { [Op.in]: orderIds } },
        include: [{ model: OrderItem, as: 'items' }]
    });

    for (const order of orders) {
        const wasUnpaid = order.paymentStatus !== 'paid';
        if (order.paymentStatus !== 'paid') {
            await order.update({ paymentStatus: 'paid' });
        }
        if (!wasUnpaid) continue;
        scheduleAutoConfirm(order.id);
        try {
            const shop = await Shop.findByPk(order.shopId);
            const shopOwner = shop ? await User.findByPk(shop.userId) : null;
            if (shopOwner) {
                await notificationService.notifyNewOrder({
                    order,
                    shopOwner,
                    items: order.items || []
                });
            }
        } catch (err) {
            console.error('[Notify] notify paid VNPay order error:', err.message);
        }
    }

    return orders;
};

const cancelUnpaidPaymentOrders = async (orderIds = [], reason = 'Thanh toán VNPay thất bại') => {
    if (!orderIds.length) return [];
    const orders = await Order.findAll({
        where: {
            id: { [Op.in]: orderIds },
            paymentStatus: 'unpaid',
            status: 'pending'
        },
        include: [{ model: OrderItem, as: 'items' }]
    });

    const t = await sequelize.transaction();
    try {
        for (const order of orders) {
            await order.update({ status: 'cancelled', cancelledAt: new Date(), cancelReason: reason }, { transaction: t });
            for (const item of order.items || []) {
                await Product.increment('stock', { by: item.quantity, where: { id: item.productId }, transaction: t });
                await Product.decrement('sold', { by: item.quantity, where: { id: item.productId }, transaction: t });
            }
        }
        await t.commit();
        return orders;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

const checkCoupon = async (userId, { items, couponCode }) => {
    const couponService = require('./couponService');
    return couponService.checkCoupon(userId, { items, couponCode });
};

const assignShipper = async (orderId, shopId, shipperId) => {
    const order = await Order.findOne({ where: { id: orderId, shopId } });
    if (!order) throw Object.assign(new Error('Đơn hàng không tồn tại.'), { status: 404 });

    if (order.status === 'pending') {
        throw Object.assign(new Error('Vui lòng xác nhận đơn hàng trước khi chọn shipper.'), { status: 400 });
    }
    if (['cancelled', 'delivered', 'refunded'].includes(order.status)) {
        throw Object.assign(new Error('Không thể gán shipper cho đơn hàng ở trạng thái này.'), { status: 400 });
    }

    if (shipperId) {
        const Shipper = require('../models/Shipper');
        const shipper = await Shipper.findOne({ where: { id: shipperId, shopId } });
        if (!shipper) throw Object.assign(new Error('Shipper không tồn tại hoặc không thuộc shop của bạn.'), { status: 404 });
    }

    order.shipperId = shipperId || null;
    await order.save();

    const ShipperModel = require('../models/Shipper');
    return await Order.findOne({
        where: { id: orderId },
        include: [
            { model: OrderItem, as: 'items' },
            { model: ShipperModel, as: 'shipper' }
        ]
    });
};

module.exports = {
    createOrder,
    confirmOrder,
    getMyOrders,
    getOrderDetail,
    cancelOrder,
    updateOrderStatus,
    getShopOrders,
    getAllOrders,
    activatePaidOrders,
    cancelUnpaidPaymentOrders,
    checkCoupon,
    assignShipper
};
