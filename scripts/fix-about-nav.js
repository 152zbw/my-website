#!/usr/bin/env node
/**
 * 修复「关于我们」下拉菜单：仅保留4项（关于我们、公司简介、个人简介、招贤纳士）
 * 将原「团队成员」改为「关于我们」，并调整排序
 * 运行：node scripts/fix-about-nav.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const sequelize = require('../config/db');
const Navigation = require('../models/Navigation');

async function fixAboutNav() {
  try {
    await sequelize.authenticate();
    const item = await Navigation.findByPk(13);
    if (item) {
      if (item.name === '团队成员' && item.url === 'team.html') {
        await item.update({ name: '关于我们', url: 'about.html', order: 1 });
        await Navigation.update(
          { order: 2 },
          { where: { id: 11 } } // 公司简介
        );
        await Navigation.update(
          { order: 3 },
          { where: { id: 12 } } // 个人简介
        );
        await Navigation.update(
          { order: 4 },
          { where: { id: 14 } } // 招贤纳士
        );
        console.log('已修复：关于我们下拉菜单现在仅包含4项');
      } else {
        console.log('导航 id=13 已是正确配置，无需修改');
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('修复失败:', err);
    process.exit(1);
  }
}

fixAboutNav();
