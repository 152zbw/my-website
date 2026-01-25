const express = require('express');
const router = express.Router();
const PricingPlan = require('../models/PricingPlan');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有激活的价格计划 (用于前端显示)
router.get('/', async (req, res) => {
    try {
        const plans = await PricingPlan.findAll({ where: { isActive: true }, order: [['sortOrder', 'ASC']] });
        res.json(plans);
    } catch (err) {
        console.error('获取价格计划失败:', err);
        res.status(500).json({ message: '获取价格计划失败', error: err.message });
    }
});

// 获取所有价格计划 (包括非激活的，用于后台管理)
router.get('/admin', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const plans = await PricingPlan.findAll({ order: [['sortOrder', 'ASC']] });
        res.json(plans);
    } catch (err) {
        console.error('获取所有价格计划 (admin) 失败:', err);
        res.status(500).json({ message: '获取所有价格计划 (admin) 失败', error: err.message });
    }
});

// 根据ID获取单个价格计划 (用于后台管理)
router.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const plan = await PricingPlan.findByPk(req.params.id);
        if (plan) {
            res.json(plan);
        } else {
            res.status(404).json({ message: '价格计划未找到' });
        }
    } catch (err) {
        console.error('获取单个价格计划失败:', err);
        res.status(500).json({ message: '获取单个价格计划失败', error: err.message });
    }
});

// 创建新的价格计划
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, price, currency, description, features, sortOrder, isActive } = req.body;
        const newPlan = await PricingPlan.create({ title, price, currency, description, features, sortOrder, isActive });
        res.status(201).json(newPlan);
    } catch (err) {
        console.error('创建价格计划失败:', err);
        res.status(400).json({ message: '创建价格计划失败', error: err.message });
    }
});

// 更新价格计划
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, price, currency, description, features, sortOrder, isActive } = req.body;
        const [updated] = await PricingPlan.update({
            title, price, currency, description, features, sortOrder, isActive
        }, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedPlan = await PricingPlan.findByPk(req.params.id);
            res.json(updatedPlan);
        } else {
            res.status(404).json({ message: '价格计划未找到' });
        }
    } catch (err) {
        console.error('更新价格计划失败:', err);
        res.status(400).json({ message: '更新价格计划失败', error: err.message });
    }
});

// 删除价格计划
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const deleted = await PricingPlan.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.status(204).json({ message: '价格计划已删除' });
        } else {
            res.status(404).json({ message: '价格计划未找到' });
        }
    } catch (err) {
        console.error('删除价格计划失败:', err);
        res.status(500).json({ message: '删除价格计划失败', error: err.message });
    }
});

module.exports = router;
