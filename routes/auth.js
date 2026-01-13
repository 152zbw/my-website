const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// 登录路由
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ message: '请提供用户名和密码' });
        }

        // 查找用户
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 检查用户是否激活
        if (!user.isActive) {
            return res.status(401).json({ message: '用户已被禁用' });
        }

        // 获取JWT密钥和过期时间
        const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-for-development-only-change-in-production';
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
        
        // 创建JWT令牌
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({ 
            message: '登录成功',
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '未提供认证令牌' });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-for-development-only-change-in-production';
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id, { 
            attributes: { exclude: ['password'] } 
        });

        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json(user);
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;