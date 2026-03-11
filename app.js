const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes');
const sequelize = require('./config/db');
const Service = require('./models/Service');
const Project = require('./models/Project');
const News = require('./models/News');
const Career = require('./models/Career');
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

function xmlEscape(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function resolveBaseUrl(req) {
    const envUrl = process.env.PUBLIC_BASE_URL || process.env.SITE_URL;
    if (envUrl) return envUrl.replace(/\/+$/, '');

    const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    return `${proto}://${host}`.replace(/\/+$/, '');
}

// robots.txt（指向 sitemap.xml）
app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.type('text/plain; charset=utf-8').send(
        [
            'User-agent: *',
            'Allow: /',
            `Sitemap: ${baseUrl}/sitemap.xml`,
            ''
        ].join('\n')
    );
});

// sitemap.xml（网站地图）
app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = resolveBaseUrl(req);
        const now = new Date().toISOString();

        const staticPaths = [
            '/', // 首页
            '/services.html',
            '/projects.html',
            '/news.html',
            '/about.html',
            '/about-company.html',
            '/about-me.html',
            '/careers.html',
            '/contacts.html',
            '/sidebar-blog.html'
        ];

        const [services, projects, news, careers] = await Promise.all([
            Service.findAll({ where: { isActive: 1 }, attributes: ['id', 'updatedAt'], order: [['id', 'ASC']] }),
            Project.findAll({ where: { isActive: 1 }, attributes: ['id', 'updatedAt'], order: [['id', 'ASC']] }),
            News.findAll({ where: { isActive: 1 }, attributes: ['id', 'updatedAt'], order: [['id', 'ASC']] }),
            Career.findAll({ where: { isActive: 1 }, attributes: ['id', 'updatedAt'], order: [['id', 'ASC']] })
        ]);

        const urls = [];

        for (const p of staticPaths) {
            urls.push({ loc: `${baseUrl}${p}`, lastmod: now, changefreq: 'weekly', priority: p === '/' ? '1.0' : '0.7' });
        }

        for (const s of services) urls.push({ loc: `${baseUrl}/single-service.html?id=${s.id}`, lastmod: new Date(s.updatedAt).toISOString(), changefreq: 'monthly', priority: '0.6' });
        for (const p of projects) urls.push({ loc: `${baseUrl}/single-project.html?id=${p.id}`, lastmod: new Date(p.updatedAt).toISOString(), changefreq: 'monthly', priority: '0.6' });
        for (const n of news) urls.push({ loc: `${baseUrl}/single-blog-post.html?id=${n.id}`, lastmod: new Date(n.updatedAt).toISOString(), changefreq: 'monthly', priority: '0.5' });
        // careers 目前是列表页展示，这里只保证列表页被收录；如果后续有职位详情页，再补充
        if (careers.length > 0) {
            // 让列表页更“新”，利于收录更新
            const newest = careers.reduce((acc, cur) => (cur.updatedAt > acc ? cur.updatedAt : acc), careers[0].updatedAt);
            const idx = urls.findIndex(u => u.loc === `${baseUrl}/careers.html`);
            if (idx >= 0) urls[idx].lastmod = new Date(newest).toISOString();
        }

        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...urls.map(u => [
                '  <url>',
                `    <loc>${xmlEscape(u.loc)}</loc>`,
                `    <lastmod>${xmlEscape(u.lastmod)}</lastmod>`,
                `    <changefreq>${xmlEscape(u.changefreq)}</changefreq>`,
                `    <priority>${xmlEscape(u.priority)}</priority>`,
                '  </url>'
            ].join('\n')),
            '</urlset>',
            ''
        ].join('\n');

        res.type('application/xml; charset=utf-8').send(xml);
    } catch (err) {
        console.error('生成 sitemap.xml 失败:', err);
        res.status(500).json({ message: '生成网站地图失败' });
    }
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