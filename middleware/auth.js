const jwt = require('jsonwebtoken');
require('dotenv').config();

// 获取JWT密钥，如果没有设置则使用默认值（仅用于开发环境）
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-for-development-only-change-in-production';

// 验证JWT令牌
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '无效的认证令牌' });
        }
        req.user = user;
        next();
    });
};

// 验证管理员权限
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: '没有管理员权限' });
    }
};

module.exports = {
    authenticateToken,
    authorizeAdmin
};