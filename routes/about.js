const express = require('express');
const router = express.Router();
const About = require('../models/About');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const DEFAULT_PROFILE = {
    name: '辛笠',
    position: '笠偲咨询首席专家',
    avatar: '',
    bio: '笠偲咨询首席专家，《中国企业出海的理想与经验》作者。公开嘉宾介绍见 SAP HR Connect 2025 官网。',
    skills: [],
    projects: [],
    testimonials: [],
    videoTitle: '',
    videoUrl: '',
    videoPoster: ''
};

function parseProfile(record) {
    if (!record || !record.content) return null;
    try {
        const data = JSON.parse(record.content);
        if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
        if (data._contentType === 'about-profile' || data.name || Array.isArray(data.skills)) {
            const { _contentType, ...profile } = data;
            return profile;
        }
    } catch (error) {
        // 公司简介是 HTML，不是个人简介记录。
    }
    return null;
}

async function findProfileRecord() {
    const records = await About.findAll({ order: [['id', 'ASC']] });
    return records.find(record => parseProfile(record)) || null;
}

async function findCompanyRecord() {
    const records = await About.findAll({ order: [['id', 'ASC']] });
    return records.find(record => !parseProfile(record)) || null;
}

// 公司简介和个人简介原先都取 about 表第一条，会互相覆盖。
// 专用端点按内容类型识别记录，兼容现有表结构和旧数据。
router.get('/company', async (req, res) => {
    try {
        const record = await findCompanyRecord();
        res.json(record || null);
    } catch (error) {
        console.error('获取公司简介错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

router.put('/company', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, summary, content, image, sortOrder, isActive, videoTitle, videoUrl, videoPoster } = req.body;
        let record = await findCompanyRecord();
        const values = { title, summary, content, image, sortOrder, isActive, videoTitle, videoUrl, videoPoster };
        record = record ? await record.update(values) : await About.create(values);
        res.json({ message: '公司简介更新成功', about: record });
    } catch (error) {
        console.error('更新公司简介错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

router.get('/profile', async (req, res) => {
    try {
        const record = await findProfileRecord();
        res.json(record ? { ...DEFAULT_PROFILE, ...parseProfile(record), id: record.id } : DEFAULT_PROFILE);
    } catch (error) {
        console.error('获取个人简介错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

router.put('/profile', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const profile = {
            name: req.body.name || '',
            position: req.body.position || '',
            avatar: req.body.avatar || '',
            bio: req.body.bio || '',
            skills: Array.isArray(req.body.skills) ? req.body.skills : [],
            projects: Array.isArray(req.body.projects) ? req.body.projects : [],
            testimonials: Array.isArray(req.body.testimonials) ? req.body.testimonials : [],
            videoTitle: req.body.videoTitle || '',
            videoUrl: req.body.videoUrl || '',
            videoPoster: req.body.videoPoster || ''
        };
        const values = {
            title: profile.name || '个人简介',
            image: profile.avatar,
            content: JSON.stringify({ _contentType: 'about-profile', ...profile }),
            videoTitle: profile.videoTitle,
            videoUrl: profile.videoUrl,
            videoPoster: profile.videoPoster
        };
        let record = await findProfileRecord();
        record = record ? await record.update(values) : await About.create(values);
        res.json({ message: '个人简介更新成功', data: { ...profile, id: record.id } });
    } catch (error) {
        console.error('更新个人简介错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取关于我们信息
router.get('/', async (req, res) => {
    try {
        const about = await About.findAll({
            order: [['id', 'ASC']]
        });
        res.json(about);
    } catch (error) {
        console.error('获取关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个关于我们信息
router.get('/:id', async (req, res) => {
    try {
        const about = await About.findByPk(req.params.id);
        if (!about) {
            return res.status(404).json({ message: '关于我们信息不存在' });
        }
        res.json(about);
    } catch (error) {
        console.error('获取关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建关于我们信息
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, content, image, videoTitle, videoUrl, videoPoster } = req.body;
        const about = await About.create({
            title,
            content,
            image,
            videoTitle,
            videoUrl,
            videoPoster
        });
        res.status(201).json({ message: '关于我们信息创建成功', about });
    } catch (error) {
        console.error('创建关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新关于我们信息
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { title, content, image, videoTitle, videoUrl, videoPoster } = req.body;
        const about = await About.findByPk(req.params.id);
        if (!about) {
            return res.status(404).json({ message: '关于我们信息不存在' });
        }
        await about.update({
            title,
            content,
            image,
            videoTitle,
            videoUrl,
            videoPoster
        });
        res.json({ message: '关于我们信息更新成功', about });
    } catch (error) {
        console.error('更新关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除关于我们信息
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const about = await About.findByPk(req.params.id);
        if (!about) {
            return res.status(404).json({ message: '关于我们信息不存在' });
        }
        await about.destroy();
        res.json({ message: '关于我们信息删除成功' });
    } catch (error) {
        console.error('删除关于我们信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;
