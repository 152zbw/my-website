const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// 获取所有联系信息（仅管理员）
router.get('/', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(contacts);
    } catch (error) {
        console.error('获取联系信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 获取单个联系信息（仅管理员）
router.get('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: '联系信息不存在' });
        }
        res.json(contact);
    } catch (error) {
        console.error('获取联系信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 创建联系信息（公开接口）
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ message: '请填写必填字段：姓名、邮箱和留言内容' });
        }
        
        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
            status: 0
        });
        res.status(201).json({ message: '留言提交成功，我们会尽快与您联系', contact });
    } catch (error) {
        console.error('创建联系信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 更新联系信息状态（仅管理员）
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const contact = await Contact.findByPk(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: '联系信息不存在' });
        }
        await contact.update({ status });
        res.json({ message: '联系信息更新成功', contact });
    } catch (error) {
        console.error('更新联系信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

// 删除联系信息（仅管理员）
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: '联系信息不存在' });
        }
        await contact.destroy();
        res.json({ message: '联系信息删除成功' });
    } catch (error) {
        console.error('删除联系信息错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
});

module.exports = router;



