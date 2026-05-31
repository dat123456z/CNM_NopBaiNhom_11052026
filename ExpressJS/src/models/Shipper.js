const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shipper = sequelize.define('Shipper', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    shopId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    vehicle: { type: DataTypes.STRING(100), allowNull: true },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    }
}, { tableName: 'shippers', timestamps: true });

module.exports = Shipper;
