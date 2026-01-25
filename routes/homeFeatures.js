const express = require('express');
const router = express.Router();
const HomeFeature = require('../models/HomeFeature');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有首页特色模块 (管理员和前端均可访问)
router.get('/', async (req, res) => {
  try {
    const features = await HomeFeature.findAll({
      where: { isActive: true }, // 前端只显示激活的
      order: [['sortOrder', 'ASC']],
    });
    res.json(features);
  } catch (err) {
    console.error('获取首页特色模块失败:', err);
    res.status(500).json({ message: '获取首页特色模块失败', error: err.message });
  }
});

// 获取所有首页特色模块，包括非激活的 (仅限管理员)
router.get('/admin', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const features = await HomeFeature.findAll({
      order: [['sortOrder', 'ASC']],
    });
    res.json(features);
  } catch (err) {
    console.error('获取所有首页特色模块失败:', err);
    res.status(500).json({ message: '获取所有首页特色模块失败', error: err.message });
  }
});

// 获取单个首页特色模块 (仅限管理员)
router.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const feature = await HomeFeature.findByPk(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: '首页特色模块未找到' });
    }
    res.json(feature);
  } catch (err) {
    console.error('获取单个首页特色模块失败:', err);
    res.status(500).json({ message: '获取单个首页特色模块失败', error: err.message });
  }
});

// 创建首页特色模块 (仅限管理员)
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, icon, sortOrder, isActive } = req.body;
    const newFeature = await HomeFeature.create({
      title,
      description,
      icon,
      sortOrder,
      isActive,
    });
    res.status(201).json(newFeature);
  } catch (err) {
    console.error('创建首页特色模块失败:', err);
    res.status(400).json({ message: '创建首页特色模块失败', error: err.message });
  }
});

// 更新首页特色模块 (仅限管理员)
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, icon, sortOrder, isActive } = req.body;
    const feature = await HomeFeature.findByPk(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: '首页特色模块未找到' });
    }
    feature.title = title;
    feature.description = description;
    feature.icon = icon;
    feature.sortOrder = sortOrder;
    feature.isActive = isActive;
    await feature.save();
    res.json(feature);
  } catch (err) {
    console.error('更新首页特色模块失败:', err);
    res.status(400).json({ message: '更新首页特色模块失败', error: err.message });
  }
});

// 删除首页特色模块 (仅限管理员)
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const feature = await HomeFeature.findByPk(req.params.id);
    if (!feature) {
      return res.status(404).json({ message: '首页特色模块未找到' });
    }
    await feature.destroy();
    res.json({ message: '首页特色模块删除成功' });
  } catch (err) {
    console.error('删除首页特色模块失败:', err);
    res.status(500).json({ message: '删除首页特色模块失败', error: err.message });
  }
});

module.exports = router;
