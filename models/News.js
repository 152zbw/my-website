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
    authorTitle: {
        type: DataTypes.STRING(100),
        field: 'author_title',
        comment: '作者头衔/职位'
    },
    authorImage: {
        type: DataTypes.STRING(255),
        field: 'author_image',
        comment: '作者头像'
    },
    authorBio: {
        type: DataTypes.TEXT,
        field: 'author_bio',
        comment: '作者简介'
    },
    // 博客展示用的“示例评论”（可在后台编辑）
    commentName: {
        type: DataTypes.STRING(100),
        field: 'comment_name',
        comment: '评论展示-姓名'
    },
    commentAvatar: {
        type: DataTypes.STRING(255),
        field: 'comment_avatar',
        comment: '评论展示-头像'
    },
    commentContent: {
        type: DataTypes.TEXT,
        field: 'comment_content',
        comment: '评论展示-内容'
    },
    commentTime: {
        type: DataTypes.STRING(100),
        field: 'comment_time',
        comment: '评论展示-时间文本'
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