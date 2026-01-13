const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const sequelize = require('./config/db');
require('dotenv').config();

// 创建Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 为根路径提供静态资源，确保 CSS/JS/图片可直接以相对路径加载
app.use(express.static(path.join(__dirname, 'html')));
// 兼容原有 /html 前缀
app.use('/html', express.static(path.join(__dirname, 'html')));

// 注册路由
app.use('/api', routes);

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});

// 前端页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ message: '请求的资源不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器正在运行，端口: ${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
    console.log(`API地址: http://localhost:${PORT}/api`);
});

// 同步数据库模型
sequelize.sync({ alter: true }).then(() => {
    console.log('数据库模型同步成功');
}).catch(err => {
    console.error('数据库模型同步失败:', err);
});