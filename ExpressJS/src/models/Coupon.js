const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    shopId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    type: {
        type: DataTypes.ENUM('percent', 'fixed'),
        allowNull: false,
        defaultValue: 'percent'
    },
    value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    minOrderAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    maxDiscount: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    usageLimit: { type: DataTypes.INTEGER, allowNull: true },
    usedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    startsAt: { type: DataTypes.DATE, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { tableName: 'coupons', timestamps: true });

module.exports = Coupon;