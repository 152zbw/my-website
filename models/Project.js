const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '案例标题'
    },
    category: {
        type: DataTypes.STRING(100),
        comment: '案例分类'
    },
    image: {
        type: DataTypes.STRING(255),
        comment: '案例图片'
    },
    description: {
        type: DataTypes.TEXT,
        comment: '案例描述'
    },
    content: {
        type: DataTypes.TEXT,
        comment: '案例详细内容'
    },
    client: {
        type: DataTypes.STRING(100),
        comment: '客户名称'
    },
    services: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: '服务内容 (JSON数组)'
    },
    duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: '项目周期'
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
    tableName: 'projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = Project;