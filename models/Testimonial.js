const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Testimonial = sequelize.define('Testimonial', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '客户姓名'
    },
    position: {
        type: DataTypes.STRING(100),
        comment: '客户职位'
    },
    company: {
        type: DataTypes.STRING(100),
        comment: '客户公司'
    },
    image: {
        type: DataTypes.STRING(255),
        comment: '客户头像'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '评价内容'
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
    tableName: 'testimonials',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = Testimonial;