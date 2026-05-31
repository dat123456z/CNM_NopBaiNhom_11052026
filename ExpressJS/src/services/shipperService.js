const Shipper = require('../models/Shipper');

const getShippers = async (shopId) => {
    return await Shipper.findAll({
        where: { shopId },
        order: [['createdAt', 'DESC']]
    });
};

const createShipper = async (shopId, { name, phone, vehicle, status }) => {
    if (!name || !phone) {
        throw Object.assign(new Error('Vui lòng điền đầy đủ Tên và Số điện thoại.'), { status: 400 });
    }
    return await Shipper.create({
        shopId,
        name,
        phone,
        vehicle: vehicle || null,
        status: status || 'active'
    });
};

const updateShipper = async (id, shopId, { name, phone, vehicle, status }) => {
    const shipper = await Shipper.findOne({ where: { id, shopId } });
    if (!shipper) {
        throw Object.assign(new Error('Không tìm thấy shipper.'), { status: 404 });
    }
    
    if (name !== undefined) shipper.name = name;
    if (phone !== undefined) shipper.phone = phone;
    if (vehicle !== undefined) shipper.vehicle = vehicle;
    if (status !== undefined) shipper.status = status;

    await shipper.save();
    return shipper;
};

const deleteShipper = async (id, shopId) => {
    const shipper = await Shipper.findOne({ where: { id, shopId } });
    if (!shipper) {
        throw Object.assign(new Error('Không tìm thấy shipper.'), { status: 404 });
    }
    await shipper.destroy();
    return { message: 'Xóa shipper thành công.' };
};

const getShipperOrders = async (id, shopId) => {
    const shipper = await Shipper.findOne({ where: { id, shopId } });
    if (!shipper) {
        throw Object.assign(new Error('Không tìm thấy shipper.'), { status: 404 });
    }
    const { Order, OrderItem } = require('../models/Order');
    return await Order.findAll({
        where: { shipperId: id, shopId },
        include: [{ model: OrderItem, as: 'items' }],
        order: [['createdAt', 'DESC']]
    });
};

module.exports = {
    getShippers,
    createShipper,
    updateShipper,
    deleteShipper,
    getShipperOrders
};
