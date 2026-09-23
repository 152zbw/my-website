const express = require('express');
const router = express.Router();
const BusinessDistribution = require('../models/BusinessDistribution');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

function parsePoints(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function serialize(record) {
  if (!record) return null;
  const data = record.toJSON();
  return { ...data, points: parsePoints(data.points) };
}

async function ensureDefault() {
  let record = await BusinessDistribution.findOne({ order: [['id', 'ASC']] });
  if (!record) {
    record = await BusinessDistribution.create({
      title: '业务分布',
      subtitle: '笠偲咨询助力于与海外战略合作伙伴一起为中国企业提供参与全球化竞争的核心业务解决方案',
      points: JSON.stringify([
        { name: '笠偲咨询总部（烟台）', type: 'headquarters', x: 74, y: 42, description: '总部', logos: [] },
        { name: '深圳分公司', type: 'branch', x: 76, y: 49, description: '分公司/分支机构', logos: [] },
        { name: 'SAP中国', type: 'partner', x: 78, y: 46, description: '合作伙伴', logos: [{ name: 'SAP', image: 'images/brand-1-180x90.png' }] }
      ])
    });
  }
  return record;
}

router.get('/', async (req, res) => {
  try {
    const record = await ensureDefault();
    if (!record.isActive) return res.json(null);
    res.json(serialize(record));
  } catch (error) {
    console.error('获取业务分布错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.get('/admin', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const record = await ensureDefault();
    res.json(serialize(record));
  } catch (error) {
    console.error('获取业务分布配置错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

router.put('/', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const record = await ensureDefault();
    const { title, subtitle, points, isActive } = req.body;
    await record.update({
      title: title || '业务分布',
      subtitle: subtitle || '',
      logo: '',
      mapImage: '',
      points: JSON.stringify(Array.isArray(points) ? points : []),
      isActive: isActive ? 1 : 0
    });
    res.json({ message: '业务分布配置更新成功', data: serialize(record) });
  } catch (error) {
    console.error('更新业务分布配置错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;
