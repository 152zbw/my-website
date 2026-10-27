const express = require('express');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const sequelize = require('./config/db');
const Service = require('./models/Service');
const Project = require('./models/Project');
const News = require('./models/News');
const Career = require('./models/Career');
const WebsiteInfo = require('./models/WebsiteInfo');
const About = require('./models/About');
const Team = require('./models/Team');
const HomeFeature = require('./models/HomeFeature');
const BusinessDistribution = require('./models/BusinessDistribution');
const { SERVICE_TOPICS } = require('./lib/service-topics');
const optimizedUploads = require('./routes/optimizedUploads');
const {
    SITE_ORIGIN,
    PAGE_SEO,
    HTML_DIR,
    renderStaticPage,
    renderServicePage,
    renderProjectPage,
    renderArticlePage,
    renderCareerPage,
    readTemplate,
    upsertHead
} = require('./lib/seo-renderer');
require('dotenv').config();

// 创建Express应用
const app = express();
app.set('trust proxy', 1);

// 配置中间件
app.use(compression());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 个人简介页暂时不对外展示；保留源文件和后台编辑能力，方便后续恢复。
app.get(['/about-me.html', '/html/about-me.html'], (req, res) => {
    return res.redirect(301, '/company-facts.html#xin-li');
});

// 统一官网规范地址。证书校验发生在请求进入 Node.js 之前，裸域名证书仍需在 Nginx/Certbot 配置中覆盖。
app.use((req, res, next) => {
    const forwardedProto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
    const publicHosts = new Set(['ec-int.cn', 'www.ec-int.cn']);
    let canonicalPath = req.originalUrl;

    if (req.path === '/index.html' || req.path === '/html/index.html') {
        canonicalPath = req.originalUrl.replace(req.path, '/');
    } else if (req.path.startsWith('/html/') && !req.path.startsWith('/html/admin/')) {
        canonicalPath = req.originalUrl.replace('/html/', '/');
    }

    if (publicHosts.has(host) && (forwardedProto !== 'https' || host !== 'www.ec-int.cn' || canonicalPath !== req.originalUrl)) {
        return res.redirect(301, `https://www.ec-int.cn${canonicalPath}`);
    }

    if (canonicalPath !== req.originalUrl) {
        return res.redirect(301, canonicalPath);
    }
    next();
});

// 后台、API 与站内搜索结果不应进入公开搜索索引。
app.use((req, res, next) => {
    if (req.path.startsWith('/admin/') || req.path.startsWith('/html/admin/') || req.path.startsWith('/api/') || req.path === '/search-results.html') {
        res.set('X-Robots-Tag', 'noindex, nofollow');
    }
    next();
});

// 上传图片优先按浏览器支持情况生成 WebP，并缓存生成结果。
// 文件名本身是唯一的，因此可以安全使用长期 immutable 缓存。
app.use('/uploads', optimizedUploads);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1y',
    immutable: true
}));
app.use('/data', express.static(path.join(__dirname, 'data'), {
    maxAge: '30d'
}));

// 注册路由
app.use('/api', routes);

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});

// 前端页面路由
async function getWebsiteInfo() {
    try {
        return (await WebsiteInfo.findOne({ order: [['id', 'DESC']] })) || {};
    } catch (error) {
        console.error('读取网站信息用于 SEO 渲染失败:', error?.message || error);
        return {};
    }
}

async function getPublicContent(pathname) {
    const data = {};
    const jobs = [];
    const list = (key, Model) => jobs.push(Model.findAll({
        where: { isActive: 1 }, order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    }).then(rows => { data[key] = rows.map(row => row.toJSON()); }));
    if (['/', '/services.html', '/about-company.html'].includes(pathname)) list('services', Service);
    if (['/', '/grid-gallery.html', ...Object.keys(SERVICE_TOPICS)].includes(pathname)) list('projects', Project);
    if (['/', '/sidebar-blog.html'].includes(pathname)) list('news', News);
    if (['/', '/services.html', '/about-company.html'].includes(pathname)) list('features', HomeFeature);
    if (pathname === '/') jobs.push(BusinessDistribution.findOne({order:[['id','ASC']]}).then(row => {data.distribution = row ? row.toJSON() : null;}));
    if (['/team.html', '/about-company.html'].includes(pathname)) list('team', Team);
    if (pathname === '/careers.html') list('careers', Career);
    if (pathname === '/about-company.html') jobs.push(About.findAll({ order: [['id', 'ASC']] }).then(rows => {
        data.company = rows.map(row => row.toJSON()).find(record => {
            if (!record.isActive) return false;
            try { const parsed = JSON.parse(record.content); return !(parsed._contentType === 'about-profile' || parsed.name || Array.isArray(parsed.skills)); }
            catch (_) { return true; }
        });
    }));
    await Promise.all(jobs);
    return data;
}

function sendSeoNotFound(res, templateFile, label) {
    const html = upsertHead(readTemplate(templateFile), {
        title: `${label}不存在｜笠偲咨询`,
        description: `未找到请求的${label}内容。`,
        canonical: null,
        noindex: true
    });
    return res.status(404).type('html').send(html);
}

// 服务、案例、文章详情由服务器先读取数据库并输出完整 HTML；原有浏览器端动态更新逻辑继续保留。
app.get('/single-service.html', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.query.id, 10);
        if (!Number.isInteger(id) || id <= 0) return sendSeoNotFound(res, 'single-service.html', '服务');
        const service = await Service.findOne({ where: { id, isActive: 1 } });
        if (!service) return sendSeoNotFound(res, 'single-service.html', '服务');
        res.type('html').send(renderServicePage(service.toJSON()));
    } catch (error) {
        next(error);
    }
});

app.get('/single-project.html', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.query.id, 10);
        if (!Number.isInteger(id) || id <= 0) return sendSeoNotFound(res, 'single-project.html', '案例');
        const project = await Project.findOne({ where: { id, isActive: 1 } });
        if (!project) return sendSeoNotFound(res, 'single-project.html', '案例');
        res.type('html').send(renderProjectPage(project.toJSON()));
    } catch (error) {
        next(error);
    }
});

app.get('/single-blog-post.html', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.query.id, 10);
        if (!Number.isInteger(id) || id <= 0) return sendSeoNotFound(res, 'single-blog-post.html', '文章');
        const article = await News.findOne({ where: { id, isActive: 1 } });
        if (!article) return sendSeoNotFound(res, 'single-blog-post.html', '文章');
        res.type('html').send(renderArticlePage(article.toJSON()));
    } catch (error) {
        next(error);
    }
});

app.get('/single-job.html', async (req, res, next) => {
    try {
        const id = Number.parseInt(req.query.id, 10);
        if (!Number.isInteger(id) || id <= 0) return sendSeoNotFound(res, 'single-job.html', '职位');
        const career = await Career.findOne({ where: { id, isActive: 1 } });
        if (!career) return sendSeoNotFound(res, 'single-job.html', '职位');
        res.type('html').send(renderCareerPage(career.toJSON()));
    } catch (error) {
        next(error);
    }
});

// 兼容曾经提交给搜索引擎的旧地址，同时把权重合并到真实列表页。
app.get('/projects.html', (req, res) => res.redirect(301, '/grid-gallery.html'));
app.get('/news.html', (req, res) => res.redirect(301, '/sidebar-blog.html'));

for (const pathname of Object.keys(PAGE_SEO)) {
    app.get(pathname, async (req, res, next) => {
        try {
            const [info, content] = await Promise.all([getWebsiteInfo(), getPublicContent(pathname)]);
            res.type('html').send(renderStaticPage(pathname, info.toJSON ? info.toJSON() : info, content));
        } catch (error) {
            console.error('公开页面内容读取失败:', error.message);
            res.set('Retry-After', '120').set('X-Robots-Tag', 'noindex').status(503).type('html').send('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>页面暂时不可用｜笠偲咨询</title><p>页面暂时不可用，请稍后重试。</p></html>');
        }
    });
}

app.get('/search-results.html', (req, res) => {
    const html = upsertHead(readTemplate('search-results.html'), {
        title: '站内搜索｜笠偲咨询',
        description: '笠偲咨询官方网站站内搜索结果。',
        noindex: true
    });
    res.type('html').send(html);
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
    return SITE_ORIGIN;
}

// robots.txt（指向 sitemap.xml）
app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    res.type('text/plain; charset=utf-8').send(
        [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin/',
            'Disallow: /html/admin/',
            'Disallow: /api/',
            'Disallow: /search-results.html',
            `Sitemap: ${baseUrl}/sitemap.xml`,
            ''
        ].join('\n')
    );
});

// sitemap.xml（网站地图）
app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = resolveBaseUrl(req);
        const staticPaths = [
            '/',
            '/services.html',
            '/grid-gallery.html',
            '/sidebar-blog.html',
            '/about.html',
            '/about-company.html',
            '/company-facts.html',
            '/expert-xin-li.html',
            ...Object.keys(SERVICE_TOPICS),
            '/team.html',
            '/careers.html',
            '/contacts.html',
            '/privacy-policy.html'
        ];

        const [services, projects, news, careers] = await Promise.all([
            Service.findAll({ where: { isActive: 1 }, attributes: ['id', 'updatedAt'], order: [['id', 'ASC']] }),
            Project.findAll({ where: { isActive: 1 }, attributes: ['id', 'updatedAt'], order: [['id', 'ASC']] }),
            News.findAll({ where: { isActive: 1 }, attributes: ['id', 'updatedAt'], order: [['id', 'ASC']] }),
            Career.findAll({ where: { isActive: 1 }, attributes: ['id', 'updatedAt'], order: [['id', 'ASC']] })
        ]);

        const urls = [];

        const newestDate = (records, fallback) => records.reduce((latest, item) => {
            const value = new Date(item.updatedAt || item.createdAt || fallback);
            return value > latest ? value : latest;
        }, new Date(fallback));

        const contentDates = {
            '/services.html': newestDate(services, fs.statSync(path.join(HTML_DIR, 'services.html')).mtime),
            '/grid-gallery.html': newestDate(projects, fs.statSync(path.join(HTML_DIR, 'grid-gallery.html')).mtime),
            '/sidebar-blog.html': newestDate(news, fs.statSync(path.join(HTML_DIR, 'sidebar-blog.html')).mtime),
            '/careers.html': newestDate(careers, fs.statSync(path.join(HTML_DIR, 'careers.html')).mtime)
        };

        for (const p of staticPaths) {
            const file = PAGE_SEO[p]?.file || 'index.html';
            const pageSources = [path.join(HTML_DIR, file), path.join(__dirname, 'lib/seo-renderer.js'), path.join(__dirname, 'lib/company-facts.js')];
            if (SERVICE_TOPICS[p]) pageSources.push(path.join(__dirname, 'lib/service-topics.js'));
            if (SERVICE_TOPICS[p]?.parent === '/organization-hr.html') pageSources.push(path.join(__dirname, 'lib/domestic-service-topics.js'));
            if (['/company-facts.html', '/expert-xin-li.html'].includes(p)) pageSources.push(path.join(__dirname, 'lib/company-facts.js'), path.join(__dirname, 'lib/seo-renderer.js'));
            const lastmod = new Date(Math.max(contentDates[p]?.getTime() || 0, ...pageSources.map(source => fs.statSync(source).mtimeMs)));
            urls.push({ loc: `${baseUrl}${p}`, lastmod: new Date(lastmod).toISOString() });
        }

        const serviceRenderDate = Math.max(...['lib/seo-renderer.js', 'lib/service-topics.js', 'lib/domestic-service-topics.js', 'html/single-service.html'].map(file => fs.statSync(path.join(__dirname, file)).mtimeMs));
        for (const s of services) urls.push({ loc: `${baseUrl}/single-service.html?id=${s.id}`, lastmod: new Date(Math.max(new Date(s.updatedAt).getTime(), serviceRenderDate)).toISOString() });
        for (const p of projects) urls.push({ loc: `${baseUrl}/single-project.html?id=${p.id}`, lastmod: new Date(p.updatedAt).toISOString() });
        for (const n of news) urls.push({ loc: `${baseUrl}/single-blog-post.html?id=${n.id}`, lastmod: new Date(n.updatedAt).toISOString() });
        for (const c of careers) urls.push({ loc: `${baseUrl}/single-job.html?id=${c.id}`, lastmod: new Date(c.updatedAt).toISOString() });

        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...urls.map(u => [
                '  <url>',
                `    <loc>${xmlEscape(u.loc)}</loc>`,
                `    <lastmod>${xmlEscape(u.lastmod)}</lastmod>`,
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

// 为根路径提供静态资源，确保 CSS/JS/图片可直接以相对路径加载。
// 页面级路由必须放在静态中间件之前，才能输出数据库中的最新 HTML。
app.use(express.static(path.join(__dirname, 'html'), { index: false }));
// 仅保留后台及静态资源兼容；公开 HTML 会在上方被 301 到规范地址。
app.use('/html', express.static(path.join(__dirname, 'html'), { index: false }));

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
// Schema changes must be intentional; routine content deployments must not rebuild live tables.
sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' }).then(() => {
    console.log('数据库模型同步成功');
}).catch(err => {
    console.error('数据库模型同步失败:', err);
});
