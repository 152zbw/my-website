const express = require('express');
const router = express.Router();
const About = require('../models/About');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取关于我们信息
router.get('/', async (req, res) => {
    try {
        const about = await About.findAll({
            order: [['id', 'ASC']]
        });
        res.json(about);
    } catch (error) {
        console.error('获取关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个关于我们信息
router.get('/:id', async (req, res) => {
    try {
        const about = await About.findByPk(req.params.id);
        if (!about) {
            return res.status(404).json({ message: '关于我们信息不存在' });
        }
        res.json(about);
    } catch (error) {
        console.error('获取关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建关于我们信息
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, content, image } = req.body;
        const about = await About.create({
            title,
            content,
            image
        });
        res.status(201).json({ message: '关于我们信息创建成功', about });
    } catch (error) {
        console.error('创建关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新关于我们信息
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, content, image } = req.body;
        const about = await About.findByPk(req.params.id);
        if (!about) {
            return res.status(404).json({ message: '关于我们信息不存在' });
        }
        await about.update({
            title,
            content,
            image
        });
        res.json({ message: '关于我们信息更新成功', about });
    } catch (error) {
        console.error('更新关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除关于我们信息
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const about = await About.findByPk(req.params.id);
        if (!about) {
            return res.status(404).json({ message: '关于我们信息不存在' });
        }
        await about.destroy();
        res.json({ message: '关于我们信息删除成功' });
    } catch (error) {
        console.error('删除关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;



