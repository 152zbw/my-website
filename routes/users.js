const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user.toJSON ? user.toJSON() : user;
  return rest;
}

// 后台：获取所有用户（不返回密码）
router.get('/admin/all', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 后台：创建用户
router.post('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { username, password, name, email, role, isActive } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '请提供用户名和密码' });
    }

    const exists = await User.findOne({ where: { username } });
    if (exists) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashed,
      name,
      email,
      role: role || 'admin',
      isActive: typeof isActive === 'number' ? isActive : 1
    });

    res.status(201).json({ message: '用户创建成功', user: sanitizeUser(user) });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 后台：更新用户（可选更新密码）
router.put('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { username, password, name, email, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    if (username && username !== user.username) {
      const exists = await User.findOne({ where: { username } });
      if (exists) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      user.username = username;
    }

    if (typeof name !== 'undefined') user.name = name;
    if (typeof email !== 'undefined') user.email = email;
    if (typeof role !== 'undefined') user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive ? 1 : 0;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({ message: '用户更新成功', user: sanitizeUser(user) });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 后台：删除用户（防止删除自己）
router.delete('/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (req.user && req.user.id === id) {
      return res.status(400).json({ message: '不能删除当前登录用户' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.destroy();
    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 当前用户：修改自己的密码（需旧密码）
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '请提供旧密码和新密码' });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: '新密码至少 8 位' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(401).json({ message: '旧密码错误' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;

