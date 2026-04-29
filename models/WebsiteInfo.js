const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WebsiteInfo = sequelize.define('WebsiteInfo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: '网站标题'
    },
    description: {
        type: DataTypes.TEXT,
        comment: '网站描述'
    },
    keywords: {
        type: DataTypes.STRING(255),
        comment: '网站关键词'
    },
    phone: {
        type: DataTypes.STRING(20),
        comment: '联系电话'
    },
    email: {
        type: DataTypes.STRING(100),
        comment: '联系邮箱'
    },
    address: {
        type: DataTypes.TEXT,
        comment: '公司地址'
    },
    logo: {
        type: DataTypes.STRING(255),
        comment: 'logo路径'
    },
    favicon: {
        type: DataTypes.STRING(255),
        comment: 'favicon路径'
    },
    // 首页视觉与统计配置
    heroRightImage: {
        type: DataTypes.STRING(255),
        field: 'hero_right_image',
        comment: '首页右侧图片'
    },
    mapProvince: {
        type: DataTypes.STRING(100),
        field: 'map_province',
        comment: '地图省份'
    },
    mapCity: {
        type: DataTypes.STRING(100),
        field: 'map_city',
        comment: '地图城市'
    },
    mapAddressDetail: {
        type: DataTypes.STRING(255),
        field: 'map_address_detail',
        comment: '地图详细地址'
    },
    mapAddress: {
        type: DataTypes.STRING(255),
        field: 'map_address',
        comment: '地图完整地址'
    },
    mapLat: {
        type: DataTypes.DECIMAL(10, 6),
        field: 'map_lat',
        comment: '地图纬度'
    },
    mapLng: {
        type: DataTypes.DECIMAL(10, 6),
        field: 'map_lng',
        comment: '地图经度'
    },
    mapZoom: {
        type: DataTypes.INTEGER,
        field: 'map_zoom',
        defaultValue: 15,
        comment: '地图缩放级别'
    },
    mapDesc: {
        type: DataTypes.TEXT,
        field: 'map_desc',
        comment: '地图标记描述'
    },
    heroTitle: {
        type: DataTypes.STRING(255),
        field: 'hero_title',
        comment: '首页主标题'
    },
    heroSubtitle: {
        type: DataTypes.STRING(255),
        field: 'hero_subtitle',
        comment: '首页副标题'
    },
    heroDescription: {
        type: DataTypes.TEXT,
        field: 'hero_description',
        comment: '首页简介文案'
    },
    heroButtonText: {
        type: DataTypes.STRING(100),
        field: 'hero_button_text',
        comment: '首页按钮文字'
    },
    heroButtonLink: {
        type: DataTypes.STRING(255),
        field: 'hero_button_link',
        comment: '首页按钮链接'
    },
    statAwards: {
        type: DataTypes.INTEGER,
        field: 'stat_awards',
        defaultValue: 12,
        comment: '国际奖项数量'
    },
    statCases: {
        type: DataTypes.INTEGER,
        field: 'stat_cases',
        defaultValue: 200,
        comment: '成功案例数量'
    },
    statSatisfaction: {
        type: DataTypes.INTEGER,
        field: 'stat_satisfaction',
        defaultValue: 99,
        comment: '客户满意度百分比'
    },
    statExperience: {
        type: DataTypes.INTEGER,
        field: 'stat_experience',
        defaultValue: 15,
        comment: '行业经验（年）'
    },
    statConsultants: {
        type: DataTypes.INTEGER,
        field: 'stat_consultants',
        defaultValue: 54,
        comment: '专业顾问数量'
    },
    statClients: {
        type: DataTypes.INTEGER,
        field: 'stat_clients',
        defaultValue: 150,
        comment: '满意客户数量'
    },
    updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
}, {
    tableName: 'website_info',
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

module.exports = WebsiteInfo;