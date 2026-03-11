const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 招贤纳士页面配置模型（单条记录，用于整页配置）
const Careers = sequelize.define('Careers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '页面标题，如“招贤纳士”'
    },
    introTitle: {
        type: DataTypes.STRING(255),
        comment: '顶部介绍标题，如“加入我们”'
    },
    introContent: {
        type: DataTypes.TEXT,
        comment: '顶部介绍内容（HTML）'
    },
    heroImage: {
        type: DataTypes.STRING(255),
        comment: '顶部配图地址'
    },
    ctaText: {
        type: DataTypes.STRING(255),
        comment: '顶部按钮文字'
    },
    ctaLink: {
        type: DataTypes.STRING(255),
        comment: '顶部按钮链接'
    },
    isActive: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: '是否启用 1 启用 0 禁用'
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
    tableName: 'careers',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = Careers;

