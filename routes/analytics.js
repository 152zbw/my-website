const { createHash } = require('node:crypto');
const express = require('express');
const { Op, col, fn } = require('sequelize');
const PageView = require('../models/PageView');
const News = require('../models/News');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();
const shanghaiDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' });
const browserIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

router.post('/views', async (req, res, next) => {
    const fetchSite = req.get('Sec-Fetch-Site');
    if (!req.is('application/json') || (fetchSite && fetchSite !== 'same-origin')) {
        return res.sendStatus(400);
    }
    const { articleId = null, browserId } = req.body || {};
    if (articleId !== null && (!Number.isInteger(articleId) || articleId < 1 || articleId > 2147483647)) {
        return res.sendStatus(400);
    }

    try {
        if (articleId !== null && !await News.findOne({
            attributes: ['id'],
            where: { id: articleId, isActive: true }
        })) {
            return res.sendStatus(404);
        }

        // Scope the hash to one article so it cannot link readers across articles.
        const readerKey = articleId !== null && typeof browserId === 'string' && browserIdPattern.test(browserId)
            ? createHash('sha256').update(`${articleId}:${browserId}`).digest('hex')
            : null;
        await PageView.create({ day: shanghaiDate.format(), articleId, readerKey });
        if (articleId === null) return res.sendStatus(204);

        const readers = await PageView.count({ where: { articleId }, distinct: true, col: 'readerKey' });
        return res.json({ readers });
    } catch (error) {
        next(error);
    }
});

router.get('/overview', authenticateToken, authorizeAdmin, async (_req, res, next) => {
    try {
        const [total, today] = await Promise.all([
            PageView.count(),
            PageView.count({ where: { day: shanghaiDate.format() } })
        ]);
        res.json({ total, today });
    } catch (error) {
        next(error);
    }
});

router.get('/article-readers', authenticateToken, authorizeAdmin, async (_req, res, next) => {
    try {
        const readerCount = fn('COUNT', fn('DISTINCT', col('readerKey')));
        const rows = await PageView.findAll({
            attributes: ['articleId', [readerCount, 'readers']],
            where: { articleId: { [Op.ne]: null } },
            group: ['articleId'],
            raw: true
        });
        res.json(Object.fromEntries(rows.map(row => [row.articleId, Number(row.readers)])));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
