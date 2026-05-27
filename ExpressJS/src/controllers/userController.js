const userService = require('../services/userService');

const getProfile = async (req, res) => {
    try {
        const user = await userService.getProfile(req.user.id);
        return res.json({ user });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await userService.updateProfile(req.user.id, { name, phone, file: req.file });
        return res.json({ message: 'Cập nhật hồ sơ thành công.', user });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const upsertAddress = async (req, res) => {
    try {
        const addresses = await userService.upsertAddress(req.user.id, req.body);
        return res.json(addresses);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const removeAddress = async (req, res) => {
    try {
        const addresses = await userService.removeAddress(req.user.id, req.params.addressId);
        return res.json(addresses);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const setDefaultAddress = async (req, res) => {
    try {
        const addresses = await userService.setDefaultAddress(req.user.id, req.params.addressId);
        return res.json(addresses);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const listUsers = async (req, res) => {
    try {
        const result = await userService.listUsers(req.query);
        return res.json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const setUserStatus = async (req, res) => {
    try {
        const { isActive, reason } = req.body;
        const user = await userService.setUserStatus(req.params.id, isActive, reason);
        return res.json({ user });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const setUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await userService.setUserRole(req.params.id, role);
        return res.json({ user });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

const getUserCoupons = async (req, res) => {
    try {
        const coupons = await userService.getUserCoupons(req.user.id);
        return res.json(coupons);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message });
    }
};

module.exports = { getProfile, updateProfile, upsertAddress, removeAddress, setDefaultAddress, listUsers, setUserStatus, setUserRole, getUserCoupons };