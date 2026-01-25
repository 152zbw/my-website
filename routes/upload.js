const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

// 单文件上传 - 包装multer中间件以处理错误
const uploadSingleMiddleware = (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            console.error('Multer错误:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: '文件太大，最大允许5MB' });
            }
            if (err.message) {
                return res.status(400).json({ message: err.message });
            }
            return res.status(400).json({ message: '文件上传失败: ' + err.message });
        }
        next();
    });
};

router.post('/single', authenticateToken, uploadSingleMiddleware, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '没有上传文件，请检查文件大小和格式' });
        }

        // 返回文件路径（相对于uploads目录）
        const filePath = `/uploads/${req.file.filename}`;
        
        res.json({
            success: true,
            message: '文件上传成功',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                path: filePath,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('文件上传错误:', error);
        res.status(500).json({ message: '文件上传失败', error: error.message });
    }
});

// 多文件上传
router.post('/multiple', authenticateToken, upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '没有上传文件' });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            originalname: file.originalname,
            path: `/uploads/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({
            success: true,
            message: '文件上传成功',
            files: files
        });
    } catch (error) {
        console.error('文件上传错误:', error);
        res.status(500).json({ message: '文件上传失败', error: error.message });
    }
});

module.exports = router;

