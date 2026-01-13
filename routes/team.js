const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有团队成员（公开接口，只返回激活的）
router.get('/', async (req, res) => {
    try {
        const team = await Team.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC']]
        });
        res.json(team);
    } catch (error) {
        console.error('获取团队成员错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取所有团队成员（管理接口，包含禁用的）- 必须在 /:id 之前
router.get('/admin/all', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const team = await Team.findAll({
            order: [['sortOrder', 'ASC'], ['id', 'ASC']]
        });
        res.json(team);
    } catch (error) {
        console.error('获取团队成员错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个团队成员 - 必须在 /admin/all 之后
router.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const member = await Team.findByPk(req.params.id);
        if (!member) {
            return res.status(404).json({ message: '团队成员不存在' });
        }
        res.json(member);
    } catch (error) {
        console.error('获取团队成员错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建团队成员
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, position, image, bio, sortOrder, isActive } = req.body;
        const member = await Team.create({
            name,
            position,
            image,
            bio,
            sortOrder,
            isActive
        });
        res.status(201).json({ message: '团队成员创建成功', member });
    } catch (error) {
        console.error('创建团队成员错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新团队成员
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { name, position, image, bio, sortOrder, isActive } = req.body;
        const member = await Team.findByPk(req.params.id);
        if (!member) {
            return res.status(404).json({ message: '团队成员不存在' });
        }
        await member.update({
            name,
            position,
            image,
            bio,
            sortOrder,
            isActive
        });
        res.json({ message: '团队成员更新成功', member });
    } catch (error) {
        console.error('更新团队成员错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除团队成员
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const member = await Team.findByPk(req.params.id);
        if (!member) {
            return res.status(404).json({ message: '团队成员不存在' });
        }
        await member.destroy();
        res.json({ message: '团队成员删除成功' });
    } catch (error) {
        console.error('删除团队成员错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;



