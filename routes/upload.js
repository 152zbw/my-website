const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { authenticateToken } = require('../middleware/auth');

const optimizableImageTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/tiff'
]);

async function optimizeUploadedFile(file) {
    if (!file || !optimizableImageTypes.has(file.mimetype)) return file;

    const parsed = path.parse(file.path);
    const outputFilename = parsed.ext.toLowerCase() === '.webp'
        ? `${parsed.name}-optimized.webp`
        : `${parsed.name}.webp`;
    const outputPath = path.join(parsed.dir, outputFilename);
    const temporaryPath = `${outputPath}.${process.pid}-${Date.now()}.tmp`;

    try {
        await sharp(file.path, { failOn: 'none' })
            .rotate()
            .resize({
                width: 1920,
                height: 1920,
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 82, effort: 4 })
            .toFile(temporaryPath);

        if (outputPath !== file.path) {
            await fs.promises.unlink(file.path);
        }
        await fs.promises.rename(temporaryPath, outputPath);
        const stat = await fs.promises.stat(outputPath);

        return {
            ...file,
            filename: outputFilename,
            path: outputPath,
            size: stat.size,
            mimetype: 'image/webp'
        };
    } catch (error) {
        await fs.promises.unlink(temporaryPath).catch(() => {});
        console.error('图片压缩失败，保留原文件:', file.originalname, error.message);
        return file;
    }
}

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

router.post('/single', authenticateToken, uploadSingleMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '没有上传文件，请检查文件大小和格式' });
        }

        const optimizedFile = await optimizeUploadedFile(req.file);
        // 返回文件路径（相对于uploads目录）
        const filePath = `/uploads/${optimizedFile.filename}`;
        
        res.json({
            success: true,
            message: '文件上传成功',
            file: {
                filename: optimizedFile.filename,
                originalname: optimizedFile.originalname,
                path: filePath,
                size: optimizedFile.size,
                mimetype: optimizedFile.mimetype
            }
        });
    } catch (error) {
        console.error('文件上传错误:', error);
        res.status(500).json({ message: '文件上传失败', error: error.message });
    }
});

// 多文件上传
router.post('/multiple', authenticateToken, upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: '没有上传文件' });
        }

        const optimizedFiles = await Promise.all(req.files.map(optimizeUploadedFile));
        const files = optimizedFiles.map(file => ({
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
