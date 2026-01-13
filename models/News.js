const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const News = sequelize.define('News', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '新闻标题'
    },
    image: {
        type: DataTypes.STRING(255),
        comment: '新闻图片'
    },
    excerpt: {
        type: DataTypes.TEXT,
        comment: '新闻摘要'
    },
    content: {
        type: DataTypes.TEXT,
        comment: '新闻内容'
    },
    author: {
        type: DataTypes.STRING(100),
        comment: '作者'
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        field: 'sort_order',
        defaultValue: 0,
        comment: '排序顺序'
    },
    isActive: {
        type: DataTypes.TINYINT,
        field: 'is_active',
        defaultValue: 1,
        comment: '是否激活'
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
    tableName: 'news',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = News;