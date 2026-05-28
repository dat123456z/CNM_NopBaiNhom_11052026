const { sequelize } = require('../config/database');
const { Order } = require('../models/Order');
const Shop = require('../models/Shop');
const WalletTransaction = require('../models/WalletTransaction');
const { Op, fn, col, literal } = require('sequelize');

const getShopRevenue = async (shopId, { from, to, groupBy = 'day' }) => {
    const groupFormats = { day: '%Y-%m-%d', month: '%Y-%m', year: '%Y' };
    const fmt = groupFormats[groupBy] || groupFormats.day;

    const replacements = { shopId, fmt };
    let dateFilter = '';
    if (from) { dateFilter += ' AND deliveredAt >= :from'; replacements.from = new Date(from); }
    if (to)   { dateFilter += ' AND deliveredAt <= :to';   replacements.to   = new Date(to); }

    const chart = await sequelize.query(
        `SELECT DATE_FORMAT(deliveredAt, :fmt) as period,
                COUNT(*) as orderCount,
                SUM(total) as revenue,
                SUM(discount) as totalDiscount
         FROM orders
         WHERE shopId = :shopId AND status = 'delivered'
         ${dateFilter}
         GROUP BY period
         ORDER BY period ASC`,
        { replacements, type: sequelize.QueryTypes.SELECT }
    );

    const shop = await Shop.findByPk(shopId, { attributes: ['id', 'name', 'balance', 'rating'] });
    if (!shop) throw Object.assign(new Error('Shop không tồn tại.'), { status: 404 });

    const [stats] = await sequelize.query(
        `SELECT COUNT(*) as totalOrders,
                COALESCE(SUM(total), 0) as totalRevenue,
                COALESCE(SUM(discount), 0) as totalDiscount
         FROM orders
         WHERE shopId = :shopId AND status = 'delivered'`,
        { replacements: { shopId }, type: sequelize.QueryTypes.SELECT }
    );

    return {
        summary: {
            balance: Number(shop.balance),
            totalRevenue: Number(stats.totalRevenue),
            totalOrders: Number(stats.totalOrders),
            totalDiscount: Number(stats.totalDiscount),
            rating: Number(shop.rating)
        },
        chart
    };
};

const getWalletHistory = async (shopId, { page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await WalletTransaction.findAndCountAll({
        where: { shopId },
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset
    });
    return { total: count, page: Number(page), limit: Number(limit), transactions: rows };
};

const getPlatformRevenue = async ({ from, to }) => {
    const replacements = {};
    let dateFilter = '';
    if (from) { dateFilter += ' AND deliveredAt >= :from'; replacements.from = new Date(from); }
    if (to)   { dateFilter += ' AND deliveredAt <= :to';   replacements.to   = new Date(to); }

    const [result] = await sequelize.query(
        `SELECT COUNT(*) as totalOrders,
                COALESCE(SUM(total), 0) as totalRevenue,
                COUNT(DISTINCT userId) as uniqueCustomers
         FROM orders
         WHERE status = 'delivered'
         ${dateFilter}`,
        { replacements, type: sequelize.QueryTypes.SELECT }
    );

    const topShops = await sequelize.query(
        `SELECT s.id, s.name, s.rating,
                COUNT(o.id) as totalOrders,
                COALESCE(SUM(o.total), 0) as totalRevenue
         FROM shops s
         LEFT JOIN orders o ON o.shopId = s.id AND o.status = 'delivered'
         GROUP BY s.id
         ORDER BY totalRevenue DESC
         LIMIT 10`,
        { type: sequelize.QueryTypes.SELECT }
    );

    return { platform: result, topShops };
};

const requestWithdrawal = async (shopId, amount) => {
    const shop = await Shop.findByPk(shopId);
    if (!shop) throw Object.assign(new Error('Shop không tồn tại.'), { status: 404 });

    if (Number(shop.balance) < amount) {
        throw Object.assign(new Error('Số dư ví không đủ để thực hiện giao dịch này.'), { status: 400 });
    }

    const t = await sequelize.transaction();
    try {
        const newBalance = Number(shop.balance) - amount;
        await shop.update({ balance: newBalance }, { transaction: t });

        const tx = await WalletTransaction.create({
            shopId,
            type: 'withdrawal',
            amount: -amount,
            balanceAfter: newBalance,
            note: `Rút tiền từ ví về tài khoản ngân hàng`
        }, { transaction: t });

        await t.commit();
        return {
            message: 'Rút tiền thành công.',
            balance: newBalance,
            transaction: tx
        };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

module.exports = { getShopRevenue, getWalletHistory, getPlatformRevenue, requestWithdrawal };