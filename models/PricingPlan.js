const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // 更正数据库配置文件路径

const PricingPlan = sequelize.define('PricingPlan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '¥'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true // 允许为空，因为是富文本
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true // 允许为空，存储JSON数组
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'pricing_plans',
    timestamps: true
});

module.exports = PricingPlan;
