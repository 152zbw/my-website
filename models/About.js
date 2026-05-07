const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const About = sequelize.define('About', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '标题'
    },
    content: {
        type: DataTypes.TEXT,
        comment: '内容'
    },
    image: {
        type: DataTypes.STRING(255),
        comment: '图片'
    },
    videoTitle: {
        type: DataTypes.STRING(255),
        field: 'video_title',
        comment: '视频标题'
    },
    videoUrl: {
        type: DataTypes.STRING(500),
        field: 'video_url',
        comment: '视频地址'
    },
    videoPoster: {
        type: DataTypes.STRING(255),
        field: 'video_poster',
        comment: '视频封面'
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
    tableName: 'about',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = About;