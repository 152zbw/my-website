const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有客户评价
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC']]
        });
        res.json(testimonials);
    } catch (error) {
        console.error('获取客户评价错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个客户评价
router.get('/:id', async (req, res) => {
    try {
        const testimonial = await Testimonial.findByPk(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: '客户评价不存在' });
        }
        res.json(testimonial);
    } catch (error) {
        console.error('获取客户评价错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建客户评价
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, position, company, image, content, sortOrder, isActive } = req.body;
        const testimonial = await Testimonial.create({
            name,
            position,
            company,
            image,
            content,
            sortOrder,
            isActive
        });
        res.status(201).json({ message: '客户评价创建成功', testimonial });
    } catch (error) {
        console.error('创建客户评价错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新客户评价
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, position, company, image, content, sortOrder, isActive } = req.body;
        const testimonial = await Testimonial.findByPk(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: '客户评价不存在' });
        }
        await testimonial.update({
            name,
            position,
            company,
            image,
            content,
            sortOrder,
            isActive
        });
        res.json({ message: '客户评价更新成功', testimonial });
    } catch (error) {
        console.error('更新客户评价错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除客户评价
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const testimonial = await Testimonial.findByPk(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ message: '客户评价不存在' });
        }
        await testimonial.destroy();
        res.json({ message: '客户评价删除成功' });
    } catch (error) {
        console.error('删除客户评价错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;



