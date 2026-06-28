const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductAlert = sequelize.define('ProductAlert', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    priceDrop: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    backInStock: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    referencePrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    lastNotifiedPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    wasOutOfStock: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
    tableName: 'product_alerts',
    timestamps: true,
    indexes: [{ unique: true, fields: ['userId', 'productId'] }]
});

module.exports = ProductAlert;
