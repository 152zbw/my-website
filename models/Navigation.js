const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Navigation = sequelize.define('Navigation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '导航名称'
    },
    url: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '导航链接'
    },
    group: {
        type: DataTypes.STRING(50),
        comment: '分组标识'
    },
    parentId: {
        type: DataTypes.INTEGER,
        field: 'parent_id',
        allowNull: true,
        comment: '父级导航ID，null为一级导航'
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '排序顺序'
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        comment: '状态：1-显示，0-隐藏'
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
    tableName: 'navigation',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = Navigation;

