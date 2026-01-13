const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有合作伙伴
router.get('/', async (req, res) => {
    try {
        const partners = await Partner.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC']]
        });
        res.json(partners);
    } catch (error) {
        console.error('获取合作伙伴错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个合作伙伴
router.get('/:id', async (req, res) => {
    try {
        const partner = await Partner.findByPk(req.params.id);
        if (!partner) {
            return res.status(404).json({ message: '合作伙伴不存在' });
        }
        res.json(partner);
    } catch (error) {
        console.error('获取合作伙伴错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建合作伙伴
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, logo, website, sortOrder, isActive } = req.body;
        const partner = await Partner.create({
            name,
            logo,
            website,
            sortOrder,
            isActive
        });
        res.status(201).json({ message: '合作伙伴创建成功', partner });
    } catch (error) {
        console.error('创建合作伙伴错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新合作伙伴
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, logo, website, sortOrder, isActive } = req.body;
        const partner = await Partner.findByPk(req.params.id);
        if (!partner) {
            return res.status(404).json({ message: '合作伙伴不存在' });
        }
        await partner.update({
            name,
            logo,
            website,
            sortOrder,
            isActive
        });
        res.json({ message: '合作伙伴更新成功', partner });
    } catch (error) {
        console.error('更新合作伙伴错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除合作伙伴
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const partner = await Partner.findByPk(req.params.id);
        if (!partner) {
            return res.status(404).json({ message: '合作伙伴不存在' });
        }
        await partner.destroy();
        res.json({ message: '合作伙伴删除成功' });
    } catch (error) {
        console.error('删除合作伙伴错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;



