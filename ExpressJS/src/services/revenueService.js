const { sequelize } = require('../config/database');
const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { Op } = require('sequelize');

// Trả về chuỗi ngày theo local time (YYYY-MM-DD), tránh lệch timezone UTC
const localDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getPeriodRange = (period) => {
    const now = new Date();
    let start, end, groupFn, labelFn, points;

    switch (period) {
        case '7d':
            start = new Date(now); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
            end = new Date(now); end.setHours(23, 59, 59, 999);
            groupFn = (d) => localDate(d);
            labelFn = (k) => { const [, m, day] = k.split('-'); return `${Number(day)}/${Number(m)}`; };
            points = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(now); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
                return localDate(d);
            });
            break;
        case '30d':
            start = new Date(now); start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0);
            end = new Date(now); end.setHours(23, 59, 59, 999);
            groupFn = (d) => localDate(d);
            labelFn = (k) => { const [, m, day] = k.split('-'); return `${Number(day)}/${Number(m)}`; };
            points = Array.from({ length: 30 }, (_, i) => {
                const d = new Date(now); d.setDate(d.getDate() - (29 - i)); d.setHours(0, 0, 0, 0);
                return localDate(d);
            });
            break;
        case '12m':
        default:
            start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            groupFn = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            labelFn = (k) => { const [y, m] = k.split('-'); return `T${m}/${y}`; };
            points = Array.from({ length: 12 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            });
            break;
    }
    return { start, end, groupFn, labelFn, points };
};

const getShopAnalytics = async (shopId, period = '12m') => {
    const { start, end, groupFn, labelFn, points } = getPeriodRange(period);

    const allOrders = await Order.findAll({
        where: {
            shopId,
            createdAt: { [Op.between]: [start, end] }
        },
        include: [{ model: OrderItem, as: 'items' }]
    });

    const deliveredOrders = allOrders.filter(o => o.status === 'delivered');
    const revenueMap = {};
    const orderCountMap = {};
    points.forEach(p => { revenueMap[p] = 0; orderCountMap[p] = 0; });

    deliveredOrders.forEach(o => {
        const key = groupFn(new Date(o.createdAt));
        if (revenueMap[key] !== undefined) {
            revenueMap[key] += Number(o.total);
            orderCountMap[key] = (orderCountMap[key] || 0) + 1;
        }
    });

    const chart = points.map(k => ({
        period: labelFn(k),
        revenue: revenueMap[k] || 0,
        orderCount: orderCountMap[k] || 0
    }));

    const statusCounts = {};
    allOrders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const shippingRevenue = allOrders
        .filter(o => o.status === 'shipping')
        .reduce((s, o) => s + Number(o.total), 0);
    const pendingRevenue = allOrders
        .filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status))
        .reduce((s, o) => s + Number(o.total), 0);
    const totalRevenue = deliveredOrders.reduce((s, o) => s + Number(o.total), 0);
    const cancelledRevenue = allOrders
        .filter(o => ['cancelled', 'refunded'].includes(o.status))
        .reduce((s, o) => s + Number(o.total), 0);

    const allShopOrdersBefore = await Order.findAll({
        where: { shopId, createdAt: { [Op.lt]: start } },
        attributes: ['userId']
    });
    const existingCustomerIds = new Set(allShopOrdersBefore.map(o => o.userId));
    const newCustomerIds = new Set();
    allOrders.forEach(o => {
        if (!existingCustomerIds.has(o.userId)) newCustomerIds.add(o.userId);
    });
    const totalUniqueCustomers = new Set(allOrders.map(o => o.userId)).size;

    const newCustMap = {};
    points.forEach(p => { newCustMap[p] = new Set(); });
    allOrders.forEach(o => {
        if (!existingCustomerIds.has(o.userId)) {
            const key = groupFn(new Date(o.createdAt));
            if (newCustMap[key]) newCustMap[key].add(o.userId);
        }
    });
    const newCustomersChart = points.map(k => ({
        period: labelFn(k),
        count: newCustMap[k]?.size || 0
    }));

    const productStats = {};
    allOrders
        .filter(o => o.status === 'delivered')
        .forEach(o => {
            (o.items || []).forEach(item => {
                if (!productStats[item.productId]) {
                    productStats[item.productId] = {
                        productId: item.productId,
                        title: item.productTitle,
                        image: item.productImage,
                        totalQty: 0,
                        totalRevenue: 0,
                        orderCount: 0
                    };
                }
                productStats[item.productId].totalQty += item.quantity;
                productStats[item.productId].totalRevenue += Number(item.price) * item.quantity;
                productStats[item.productId].orderCount += 1;
            });
        });

    const topProducts = Object.values(productStats)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10);

    const brackets = [
        { label: '< 100k',   min: 0,       max: 100000 },
        { label: '100-300k', min: 100000,   max: 300000 },
        { label: '300-500k', min: 300000,   max: 500000 },
        { label: '500k-1tr', min: 500000,   max: 1000000 },
        { label: '> 1tr',    min: 1000000,  max: Infinity }
    ];
    const orderValueDist = brackets.map(b => ({
        label: b.label,
        count: deliveredOrders.filter(o => Number(o.total) >= b.min && Number(o.total) < b.max).length
    }));

    const shop = await Shop.findByPk(shopId, { attributes: ['balance', 'rating', 'reviewCount'] });

    const periodMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodMs);
    const prevEnd = new Date(start.getTime() - 1);
    const prevOrders = await Order.findAll({
        where: { shopId, status: 'delivered', createdAt: { [Op.between]: [prevStart, prevEnd] } },
        attributes: ['total']
    });
    const prevRevenue = prevOrders.reduce((s, o) => s + Number(o.total), 0);
    const revenueGrowth = prevRevenue > 0
        ? (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
        : (totalRevenue > 0 ? 100 : 0);

    return {
        summary: {
            totalRevenue,
            totalOrders: deliveredOrders.length,
            allOrdersCount: allOrders.length,
            balance: Number(shop?.balance || 0),
            rating: Number(shop?.rating || 0),
            reviewCount: Number(shop?.reviewCount || 0),
            revenueGrowth: Number(revenueGrowth),
            pendingRevenue,
            shippingRevenue,
            cancelledRevenue,
            newCustomers: newCustomerIds.size,
            totalUniqueCustomers,
            avgOrderValue: deliveredOrders.length > 0
                ? Math.round(totalRevenue / deliveredOrders.length)
                : 0
        },
        chart,
        statusCounts,
        cashFlow: {
            delivered: totalRevenue,
            shipping: shippingRevenue,
            pending: pendingRevenue,
            cancelled: cancelledRevenue
        },
        topProducts,
        newCustomersChart,
        orderValueDist,
        period
    };
};

const getWalletHistory = async (shopId, { page = 1, limit = 20 } = {}) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await WalletTransaction.findAndCountAll({
        where: { shopId },
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset
    });
    return { total: count, page: Number(page), limit: Number(limit), transactions: rows };
};

const withdraw = async (shopId, amount) => {
    if (!amount || amount < 50000)
        throw Object.assign(new Error('Số tiền rút tối thiểu là 50.000đ.'), { status: 400 });

    const shop = await Shop.findByPk(shopId);
    if (!shop) throw Object.assign(new Error('Shop không tồn tại.'), { status: 404 });
    if (Number(shop.balance) < amount)
        throw Object.assign(new Error('Số dư không đủ.'), { status: 400 });

    const t = await sequelize.transaction();
    try {
        const newBalance = Number(shop.balance) - amount;
        await shop.update({ balance: newBalance }, { transaction: t });
        const tx = await WalletTransaction.create({
            shopId,
            type: 'debit',
            amount,
            balanceAfter: newBalance,
            note: `Yêu cầu rút tiền về tài khoản ngân hàng`
        }, { transaction: t });
        await t.commit();
        return { transaction: tx, balance: newBalance };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

module.exports = { getShopAnalytics, getWalletHistory, withdraw };