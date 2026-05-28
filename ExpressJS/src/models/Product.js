const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    shopId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(300), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    originalPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    images: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    category: { type: DataTypes.STRING(150), allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    sold: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    similarIds: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    colors: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    status: {
        type: DataTypes.ENUM('active', 'draft', 'hidden', 'deleted', 'pending', 'rejected'),
        allowNull: false,
        defaultValue: 'active'
    },
    rating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0 },
    reviewCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    views: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }
}, { tableName: 'products', timestamps: true });

module.exports = Product;