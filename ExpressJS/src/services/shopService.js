const Shop = require('../models/Shop');
const User = require('../models/User');
const { sequelize } = require('../config/database');

const slugify = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();

const registerShop = async (userId, { name, description, address, phone, logo }) => {
    const existing = await Shop.findOne({ where: { userId } });
    if (existing) throw Object.assign(new Error('Bạn đã có shop.'), { status: 409 });

    const t = await sequelize.transaction();
    try {
        const shop = await Shop.create(
            { userId, name, slug: slugify(name), description, address, phone, logo, status: 'active' },
            { transaction: t }
        );
        await User.update({ role: 'vendor' }, { where: { id: userId }, transaction: t });
        await t.commit();
        return shop;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

const getMyShop = async (userId) => {
    const shop = await Shop.findOne({ where: { userId } });
    if (!shop) throw Object.assign(new Error('Bạn chưa có shop.'), { status: 404 });
    return shop;
};

const updateShop = async (userId, updates) => {
    const shop = await Shop.findOne({ where: { userId } });
    if (!shop) throw Object.assign(new Error('Shop không tồn tại.'), { status: 404 });
    await shop.update(updates);
    return shop;
};

const getShopById = async (id) => {
    const shop = await Shop.findByPk(id);
    if (!shop || shop.status !== 'active') throw Object.assign(new Error('Shop không tồn tại.'), { status: 404 });
    return shop;
};

const listShops = async ({ page = 1, limit = 20, status, search }) => {
    const { Op } = require('sequelize');
    const where = {};
    if (status) where.status = status;
    if (search) where.name = { [Op.like]: `%${search}%` };
    const offset = (page - 1) * limit;
    const { count, rows } = await Shop.findAndCountAll({
        where,
        include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }],
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset
    });
    return { total: count, page: Number(page), limit: Number(limit), shops: rows };
};

const setShopStatus = async (shopId, status) => {
    const validStatuses = ['pending', 'active', 'suspended', 'closed'];
    if (!validStatuses.includes(status)) throw Object.assign(new Error('Trạng thái không hợp lệ.'), { status: 400 });
    const shop = await Shop.findByPk(shopId);
    if (!shop) throw Object.assign(new Error('Shop không tồn tại.'), { status: 404 });
    await shop.update({ status });
    return shop;
};

const getManagerStats = async () => {
    const { Order } = require('../models/Order');
    const Product = require('../models/Product');
    
    const totalVendors = await Shop.count();
    const activeVendors = await Shop.count({ where: { status: 'active' } });
    const verifiedPercentage = totalVendors > 0 ? Number(((activeVendors / totalVendors) * 100).toFixed(1)) : 0;

    const totalRevenueResult = await Order.sum('total', { where: { status: 'delivered' } });
    const totalRevenue = totalRevenueResult ? Number(totalRevenueResult) : 0;

    const avgRatingResult = await Shop.avg('rating');
    const avgRating = avgRatingResult ? Number(Number(avgRatingResult).toFixed(1)) : 0;

    // Category distribution from products
    const categories = await Product.findAll({
        attributes: [
            'category',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['category']
    });

    const categoryDistribution = categories.map(c => ({
        category: c.category || 'Khác',
        count: Number(c.getDataValue('count'))
    }));

    // Recent alerts: e.g. newly registered shops (pending) or recent reviews with low rating
    const recentShops = await Shop.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }]
    });

    const alerts = [];
    recentShops.forEach(s => {
        if (s.status === 'pending') {
            alerts.push({
                id: `shop-${s.id}`,
                type: 'warning',
                message: `Yêu cầu xác minh gian hàng mới: "${s.name}" từ ${s.owner?.name || 'Khách'}`
            });
        }
    });

    // Check for pending products
    const pendingProducts = await Product.findAll({
        where: { status: 'pending' },
        limit: 5,
        include: [{ model: Shop, as: 'shop', attributes: ['name'] }]
    });

    pendingProducts.forEach(p => {
        alerts.push({
            id: `prod-${p.id}`,
            type: 'info',
            message: `Sản phẩm chờ duyệt: "${p.title}" của shop "${p.shop?.name || 'Unknown'}"`
        });
    });

    if (alerts.length === 0) {
        alerts.push({
            id: 'system-ok',
            type: 'success',
            message: 'Hệ thống hoạt động bình thường. Không có yêu cầu chờ xử lý.'
        });
    }

    return {
        totalVendors,
        verifiedPercentage,
        totalRevenue,
        avgRating,
        categoryDistribution,
        alerts
    };
};

module.exports = { registerShop, getMyShop, updateShop, getShopById, listShops, setShopStatus, getManagerStats };