const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有新闻
router.get('/', async (req, res) => {
    try {
        const news = await News.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC'], [['createdAt', 'DESC']]]
        });
        res.json(news);
    } catch (error) {
        console.error('获取新闻错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个新闻
router.get('/:id', async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: '新闻不存在' });
        }
        res.json(news);
    } catch (error) {
        console.error('获取新闻错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建新闻
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, image, excerpt, content, author, authorTitle, authorImage, authorBio, commentName, commentAvatar, commentContent, commentTime, sortOrder, isActive } = req.body;
        const news = await News.create({
            title,
            image,
            excerpt,
            content,
            author,
            authorTitle,
            authorImage,
            authorBio,
            commentName,
            commentAvatar,
            commentContent,
            commentTime,
            sortOrder,
            isActive
        });
        res.status(201).json({ message: '新闻创建成功', news });
    } catch (error) {
        console.error('创建新闻错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新新闻
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, image, excerpt, content, author, authorTitle, authorImage, authorBio, commentName, commentAvatar, commentContent, commentTime, sortOrder, isActive } = req.body;
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: '新闻不存在' });
        }
        await news.update({
            title,
            image,
            excerpt,
            content,
            author,
            authorTitle,
            authorImage,
            authorBio,
            commentName,
            commentAvatar,
            commentContent,
            commentTime,
            sortOrder,
            isActive
        });
        res.json({ message: '新闻更新成功', news });
    } catch (error) {
        console.error('更新新闻错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除新闻
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: '新闻不存在' });
        }
        await news.destroy();
        res.json({ message: '新闻删除成功' });
    } catch (error) {
        console.error('删除新闻错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;



