const express = require('express');
const router = express.Router();
const WebsiteInfo = require('../models/WebsiteInfo');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取网站基本信息
router.get('/', async (req, res) => {
    try {
        const websiteInfo = await WebsiteInfo.findOne({ order: [['id', 'DESC']] });
        if (!websiteInfo) {
            return res.status(404).json({ message: '网站信息不存在' });
        }
        res.json(websiteInfo);
    } catch (error) {
        console.error('获取网站信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新网站基本信息
router.put('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const {
            title,
            description,
            keywords,
            phone,
            email,
            address,
            logo,
            favicon,
            heroTitle,
            heroSubtitle,
            heroDescription,
            heroButtonText,
            heroButtonLink,
            statAwards,
            statSatisfaction,
            statExperience,
            statConsultants
        } = req.body;
        
        let websiteInfo = await WebsiteInfo.findOne({ order: [['id', 'DESC']] });
        
        if (websiteInfo) {
            // 更新现有信息
            await websiteInfo.update({
                title,
                description,
                keywords,
                phone,
                email,
                address,
                logo,
                favicon,
                heroTitle,
                heroSubtitle,
                heroDescription,
                heroButtonText,
                heroButtonLink,
                statAwards,
                statSatisfaction,
                statExperience,
                statConsultants
            });
        } else {
            // 创建新信息
            websiteInfo = await WebsiteInfo.create({
                title,
                description,
                keywords,
                phone,
                email,
                address,
                logo,
                favicon,
                heroTitle,
                heroSubtitle,
                heroDescription,
                heroButtonText,
                heroButtonLink,
                statAwards,
                statSatisfaction,
                statExperience,
                statConsultants
            });
        }
        
        res.json({ message: '网站信息更新成功', websiteInfo });
    } catch (error) {
        console.error('更新网站信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;