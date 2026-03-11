const express = require('express');
const router = express.Router();
const Career = require('../models/Career');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 前台：获取所有激活的职位
router.get('/', async (req, res) => {
    try {
        const careers = await Career.findAll({
            where: { isActive: 1 },
            order: [['sortOrder', 'ASC'], ['id', 'ASC']]
        });
        res.json(careers);
    } catch (err) {
        console.error('获取职位列表失败:', err);
        res.status(500).json({ message: '获取职位列表失败', error: err.message });
    }
});

// 后台：获取所有职位
router.get('/admin/all', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const careers = await Career.findAll({
            order: [['sortOrder', 'ASC'], ['id', 'ASC']]
        });
        res.json(careers);
    } catch (err) {
        console.error('获取职位列表(admin) 失败:', err);
        res.status(500).json({ message: '获取职位列表失败', error: err.message });
    }
});

// 后台：获取单个职位
router.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const career = await Career.findByPk(req.params.id);
        if (!career) {
            return res.status(404).json({ message: '职位不存在' });
        }
        res.json(career);
    } catch (err) {
        console.error('获取职位失败:', err);
        res.status(500).json({ message: '获取职位失败', error: err.message });
    }
});

// 后台：创建职位
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, jobType, location, description, sortOrder, isActive } = req.body;
        if (!title) {
            return res.status(400).json({ message: '职位名称为必填项' });
        }
        const career = await Career.create({
            title,
            jobType,
            location,
            description,
            sortOrder: sortOrder ?? 0,
            isActive: isActive ? 1 : 0
        });
        res.status(201).json(career);
    } catch (err) {
        console.error('创建职位失败:', err);
        res.status(500).json({ message: '创建职位失败', error: err.message });
    }
});

// 后台：更新职位
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, jobType, location, description, sortOrder, isActive } = req.body;
        const career = await Career.findByPk(req.params.id);
        if (!career) {
            return res.status(404).json({ message: '职位不存在' });
        }
        await career.update({
            title,
            jobType,
            location,
            description,
            sortOrder: sortOrder ?? 0,
            isActive: isActive ? 1 : 0
        });
        res.json(career);
    } catch (err) {
        console.error('更新职位失败:', err);
        res.status(500).json({ message: '更新职位失败', error: err.message });
    }
});

// 后台：删除职位
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const career = await Career.findByPk(req.params.id);
        if (!career) {
            return res.status(404).json({ message: '职位不存在' });
        }
        await career.destroy();
        res.json({ message: '职位已删除' });
    } catch (err) {
        console.error('删除职位失败:', err);
        res.status(500).json({ message: '删除职位失败', error: err.message });
    }
});

module.exports = router;

