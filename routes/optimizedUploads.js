const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
const cacheDir = path.join(uploadDir, '.optimized');
const rasterExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);

function getRequestedWidth(value) {
    const width = Number.parseInt(value, 10);
    if (!Number.isFinite(width)) return 1600;
    return Math.min(1920, Math.max(96, width));
}

router.get('/:filename', async (req, res, next) => {
    const filename = path.basename(req.params.filename || '');
    if (!filename || filename !== req.params.filename) return next();

    const sourcePath = path.join(uploadDir, filename);
    const extension = path.extname(filename).toLowerCase();
    // 只在客户端明确声明支持 WebP 时转换；不能把通配符 */* 当成支持。
    const acceptsWebp = (req.get('accept') || '').toLowerCase().includes('image/webp');

    if (!acceptsWebp || !rasterExtensions.has(extension)) return next();

    try {
        const sourceStat = await fs.promises.stat(sourcePath);
        if (!sourceStat.isFile()) return next();

        const width = getRequestedWidth(req.query.w);
        const cacheFilename = `${filename}-${width}.webp`;
        const cachePath = path.join(cacheDir, cacheFilename);

        let cacheIsFresh = false;
        try {
            const cacheStat = await fs.promises.stat(cachePath);
            cacheIsFresh = cacheStat.isFile() && cacheStat.mtimeMs >= sourceStat.mtimeMs;
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }

        if (!cacheIsFresh) {
            await fs.promises.mkdir(cacheDir, { recursive: true });
            const temporaryPath = `${cachePath}.${process.pid}-${Date.now()}.tmp`;
            await sharp(sourcePath, { failOn: 'none' })
                .rotate()
                .resize({
                    width,
                    height: width,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 80, effort: 4 })
                .toFile(temporaryPath);
            await fs.promises.rename(temporaryPath, cachePath);
        }

        res.set({
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Vary': 'Accept'
        });
        res.type('image/webp');
        return res.sendFile(cachePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.error('生成优化图片失败，回退到原图:', filename, error.message);
        }
        return next();
    }
});

module.exports = router;
