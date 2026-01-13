const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '联系人姓名'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: '联系人邮箱'
    },
    phone: {
        type: DataTypes.STRING(20),
        comment: '联系人电话'
    },
    subject: {
        type: DataTypes.STRING(255),
        comment: '主题'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '留言内容'
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        comment: '处理状态：0-未处理，1-已处理'
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'contacts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = Contact;