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

module.exports = router;