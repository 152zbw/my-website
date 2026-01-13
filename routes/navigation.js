const express = require('express');
const router = express.Router();
const Navigation = require('../models/Navigation');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有导航项（公开接口，前台使用）
router.get('/', async (req, res) => {
    try {
        const navigation = await Navigation.findAll({
            where: { status: 1 },
            order: [['order', 'ASC'], ['id', 'ASC']]
        });
        res.json(navigation);
    } catch (error) {
        console.error('获取导航错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取所有导航项（管理接口，包含隐藏的）- 必须在 /:id 之前
router.get('/admin/all', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const navigation = await Navigation.findAll({
            order: [['order', 'ASC'], ['id', 'ASC']]
        });
        res.json(navigation);
    } catch (error) {
        console.error('获取导航错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个导航项 - 必须在 /admin/all 之后
router.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const item = await Navigation.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: '导航项不存在' });
        }
        res.json(item);
    } catch (error) {
        console.error('获取导航项错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建导航项
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, url, group, parentId, order, status } = req.body;
        const item = await Navigation.create({
            name,
            url,
            group: group || '',
            parentId: parentId || null,
            order: order || 0,
            status: status !== undefined ? status : 1
        });
        res.status(201).json({ message: '导航项创建成功', item });
    } catch (error) {
        console.error('创建导航项错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新导航项
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, url, group, parentId, order, status } = req.body;
        const item = await Navigation.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: '导航项不存在' });
        }
        await item.update({
            name,
            url,
            group: group || '',
            parentId: parentId || null,
            order: order || 0,
            status: status !== undefined ? status : 1
        });
        res.json({ message: '导航项更新成功', item });
    } catch (error) {
        console.error('更新导航项错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除导航项
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const item = await Navigation.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: '导航项不存在' });
        }
        // 检查是否有子导航
        const children = await Navigation.count({ where: { parentId: item.id } });
        if (children > 0) {
            return res.status(400).json({ message: '该导航项下有子导航，请先删除子导航' });
        }
        await item.destroy();
        res.json({ message: '导航项删除成功' });
    } catch (error) {
        console.error('删除导航项错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;

