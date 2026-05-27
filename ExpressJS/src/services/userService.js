const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const User = require('../models/User');

const formatUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    addresses: user.addresses || [],
    role: user.role,
    isActive: user.isActive,
    bannedAt: user.bannedAt,
    bannedReason: user.bannedReason,
    points: user.points || 0,
    createdAt: user.createdAt
});

const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
    });
    if (!user) throw Object.assign(new Error('Người dùng không tồn tại.'), { status: 404 });
    return formatUser(user);
};

const updateProfile = async (userId, { name, phone, file }) => {
    const user = await User.findByPk(userId);
    if (!user) throw Object.assign(new Error('Người dùng không tồn tại.'), { status: 404 });

    const updates = {};
    if (name !== undefined) updates.name = name?.trim() || user.name;
    if (phone !== undefined) updates.phone = phone?.trim() || null;

    if (file) {
        if (user.avatar) {
            const oldPath = path.join(__dirname, '../../uploads', path.basename(user.avatar));
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updates.avatar = `/uploads/${file.filename}`;
    }

    await user.update(updates);
    return formatUser(user);
};

const upsertAddress = async (userId, addressData) => {
    const user = await User.findByPk(userId);
    if (!user) throw Object.assign(new Error('Người dùng không tồn tại.'), { status: 404 });

    const addresses = [...(user.addresses || [])];
    const { id, isDefault, ...rest } = addressData;

    if (id) {
        const idx = addresses.findIndex((a) => a.id === id);
        if (idx === -1) throw Object.assign(new Error('Địa chỉ không tồn tại.'), { status: 404 });
        addresses[idx] = { ...addresses[idx], ...rest, id, isDefault: !!isDefault };
    } else {
        const newId = Date.now().toString();
        addresses.push({ ...rest, id: newId, isDefault: !!isDefault });
    }

    if (isDefault) {
        const targetId = id || addresses[addresses.length - 1].id;
        for (const a of addresses) a.isDefault = a.id === targetId;
    }

    await user.update({ addresses });
    return user.addresses;
};

const removeAddress = async (userId, addressId) => {
    const user = await User.findByPk(userId);
    if (!user) throw Object.assign(new Error('Người dùng không tồn tại.'), { status: 404 });

    const addresses = (user.addresses || []).filter((a) => a.id !== addressId);
    if (addresses.length === user.addresses.length)
        throw Object.assign(new Error('Địa chỉ không tồn tại.'), { status: 404 });

    if (!addresses.some((a) => a.isDefault) && addresses.length > 0) {
        addresses[0].isDefault = true;
    }

    await user.update({ addresses });
    return addresses;
};

const setDefaultAddress = async (userId, addressId) => {
    const user = await User.findByPk(userId);
    if (!user) throw Object.assign(new Error('Người dùng không tồn tại.'), { status: 404 });

    const addresses = user.addresses || [];
    const target = addresses.find((a) => a.id === addressId);
    if (!target) throw Object.assign(new Error('Địa chỉ không tồn tại.'), { status: 404 });

    for (const a of addresses) a.isDefault = a.id === addressId;
    await user.update({ addresses });
    return addresses;
};

const listUsers = async ({ page = 1, limit = 20, role, search }) => {
    const where = {};
    if (role) where.role = role;
    if (search) where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
    ];

    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset
    });
    return { total: count, page: Number(page), limit: Number(limit), users: rows };
};

const setUserStatus = async (userId, isActive, reason) => {
    const user = await User.findByPk(userId);
    if (!user) throw Object.assign(new Error('Người dùng không tồn tại.'), { status: 404 });
    await user.update({
        isActive,
        bannedAt: isActive ? null : new Date(),
        bannedReason: isActive ? null : reason
    });
    return user;
};

const setUserRole = async (userId, role) => {
    const validRoles = ['user', 'vendor', 'manager', 'admin'];
    if (!validRoles.includes(role)) throw Object.assign(new Error('Role không hợp lệ.'), { status: 400 });
    const user = await User.findByPk(userId);
    if (!user) throw Object.assign(new Error('Người dùng không tồn tại.'), { status: 404 });
    await user.update({ role });
    return user;
};

const couponService = require('./couponService');

const getUserCoupons = async (userId) => {
    return couponService.getUserCoupons(userId);
};

module.exports = {
    getProfile, updateProfile,
    upsertAddress, removeAddress, setDefaultAddress,
    listUsers, setUserStatus, setUserRole,
    getUserCoupons
};