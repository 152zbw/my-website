const express = require('express');
const router = express.Router();

// 导入路由模块
const authRoutes = require('./auth');
const websiteInfoRoutes = require('./websiteInfo');
const serviceRoutes = require('./services');
const projectRoutes = require('./projects');
const newsRoutes = require('./news');
const testimonialRoutes = require('./testimonials');
const partnerRoutes = require('./partners');
const aboutRoutes = require('./about');
const teamRoutes = require('./team');
const contactRoutes = require('./contacts');
const navigationRoutes = require('./navigation');
const uploadRoutes = require('./upload');
const pricingPlansRoutes = require('./pricingPlans'); // 引入新的价格计划路由
const homeFeaturesRoutes = require('./homeFeatures'); // 引入新的首页特色模块路由
const careersRoutes = require('./careers'); // 招贤纳士路由

// 注册路由
router.use('/auth', authRoutes);
router.use('/website-info', websiteInfoRoutes);
router.use('/services', serviceRoutes);
router.use('/projects', projectRoutes);
router.use('/news', newsRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/partners', partnerRoutes);
router.use('/about', aboutRoutes);
router.use('/team', teamRoutes);
router.use('/contacts', contactRoutes);
router.use('/navigation', navigationRoutes);
router.use('/upload', uploadRoutes);
router.use('/pricingPlans', pricingPlansRoutes); // 注册新的价格计划路由
router.use('/homeFeatures', homeFeaturesRoutes); // 注册新的首页特色模块路由
router.use('/careers', careersRoutes); // 注册招贤纳士路由

module.exports = router;