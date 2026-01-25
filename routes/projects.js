const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有项目
router.get('/', async (req, res) => {
    try {
        const projects = await Project.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC']]
        });
        res.json(projects);
    } catch (error) {
        console.error('获取项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个项目
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }
        res.json(project);
    } catch (error) {
        console.error('获取项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建项目
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, category, image, description, content, client, services, duration, sortOrder, isActive } = req.body;
        const project = await Project.create({
            title,
            category,
            image,
            description,
            content,
            client,
            services,
            duration,
            sortOrder,
            isActive
        });
        res.status(201).json({ message: '项目创建成功', project });
    } catch (error) {
        console.error('创建项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新项目
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, category, image, description, content, client, services, duration, sortOrder, isActive } = req.body;
        const project = await Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }
        await project.update({
            title,
            category,
            image,
            description,
            content,
            client,
            services,
            duration,
            sortOrder,
            isActive
        });
        res.json({ message: '项目更新成功', project });
    } catch (error) {
        console.error('更新项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除项目
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).json({ message: '项目不存在' });
        }
        await project.destroy();
        res.json({ message: '项目删除成功' });
    } catch (error) {
        console.error('删除项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;
