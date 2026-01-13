const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有服务项目
router.get('/', async (req, res) => {
    try {
        const services = await Service.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC']]
        });
        res.json(services);
    } catch (error) {
        console.error('获取服务项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个服务项目
router.get('/:id', async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: '服务项目不存在' });
        }
        res.json(service);
    } catch (error) {
        console.error('获取服务项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建服务项目
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, icon, description, content, sortOrder, isActive } = req.body;
        const service = await Service.create({
            title,
            icon,
            description,
            content,
            sortOrder,
            isActive
        });
        res.status(201).json({ message: '服务项目创建成功', service });
    } catch (error) {
        console.error('创建服务项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新服务项目
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, icon, description, content, sortOrder, isActive } = req.body;
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: '服务项目不存在' });
        }
        await service.update({
            title,
            icon,
            description,
            content,
            sortOrder,
            isActive
        });
        res.json({ message: '服务项目更新成功', service });
    } catch (error) {
        console.error('更新服务项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除服务项目
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: '服务项目不存在' });
        }
        await service.destroy();
        res.json({ message: '服务项目删除成功' });
    } catch (error) {
        console.error('删除服务项目错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;