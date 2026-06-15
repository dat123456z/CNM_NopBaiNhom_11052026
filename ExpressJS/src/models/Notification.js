const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: {
        type: DataTypes.ENUM(
            'order_new', 'order_confirmed', 'order_preparing', 'order_shipping',
            'order_delivered', 'order_cancelled', 'order_cancel_requested',
            'review_new', 'review_reply',
            'manager_product_pending', 'manager_product_updated_pending',
            'manager_vendor_new', 'product_rejected', 'system'
        ),
        allowNull: false
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    orderId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'notifications',
    timestamps: true
});

module.exports = Notification;
