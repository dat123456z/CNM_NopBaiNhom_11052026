const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    avatar: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    addresses: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    role: {
        type: DataTypes.ENUM('guest', 'user', 'vendor', 'manager', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    bannedAt: { type: DataTypes.DATE, allowNull: true },
    bannedReason: { type: DataTypes.STRING, allowNull: true },
    points: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 }
}, { tableName: 'users', timestamps: true });

module.exports = User;