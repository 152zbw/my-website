const fs = require('fs');
const BusinessCards = require('../html/js/business-cards');
const HomepageLayout = require('../html/js/homepage-layout');
const path = require('path');
const { COMPANY, SOURCES, QUESTIONS, isPublicTeamMember } = require('./company-facts');
const { SERVICE_TOPICS } = require('./service-topics');

const SITE_ORIGIN = (process.env.PUBLIC_BASE_URL || process.env.SITE_URL || 'https://www.ec-int.cn').replace(/\/+$/, '');
const HTML_DIR = path.join(__dirname, '..', 'html');
const BRAND_NAME = COMPANY.brand;
const LEGAL_NAME = COMPANY.name;

const PAGE_SEO = {
    ...Object.fromEntries(Object.entries(SERVICE_TOPICS).map(([pathname, topic]) => [pathname, {
        file: 'topic.html', title: topic.seoTitle || `${topic.name}｜笠偲咨询 EC International`, description: topic.description
    }])),
    '/expert-xin-li.html': {
        file: 'topic.html', title: '辛笠｜笠偲咨询首席专家与企业出海著作作者',
        description: '查看笠偲咨询首席专家辛笠的公开介绍、著作《中国企业出海的理想与经验》、SAP 大会议题及企业出海活动原始报道。'
    },
    '/company-facts.html': {
        file: 'company-facts.html',
        title: '笠偲咨询公司资料｜烟台总部、国内与海外管理咨询',
        description: '笠偲咨询（EC International）总部位于山东烟台，提供国企三项制度改革、组织优化、薪酬绩效、企业出海及 SaaS + AI。查看公司全称、现用官网与公开来源。'
    },
    '/': {
        file: 'index.html',
        title: '笠偲咨询 EC International｜烟台企业管理咨询、国企改革与薪酬绩效',
        description: COMPANY.positioning
    },
    '/services.html': {
        file: 'services.html',
        title: '企业管理咨询服务｜国企改革、薪酬绩效与企业出海｜笠偲咨询',
        description: '了解总部位于烟台的笠偲咨询：国企三项制度改革、组织架构与定岗定编、薪酬绩效激励、人才发展、企业架构与流程管理、海外管理咨询及 SaaS + AI。'
    },
    '/grid-gallery.html': {
        file: 'grid-gallery.html',
        title: '企业管理咨询案例｜海外组织能力与数字化实践｜笠偲咨询',
        description: '查看笠偲咨询发布的企业管理项目介绍，包括家电集团海外业务开发与组织能力提升、互联网公司企业架构建设等实践，了解项目背景、管理问题与咨询工作。匿名案例不披露具体客户身份，服务范围可通过官网联系渠道沟通。'
    },
    '/sidebar-blog.html': {
        file: 'sidebar-blog.html',
        title: '企业管理与国际化洞察｜笠偲咨询',
        description: '笠偲咨询分享组织效能、人才管理、薪酬绩效、数字化管理与企业国际化等专业洞察。'
    },
    '/about.html': {
        file: 'about.html',
        title: '关于笠偲咨询｜公司介绍与公开资料入口',
        description: '从这里了解笠偲咨询（EC International），查看公司简介、现用官网、首席专家及活动报道等公开资料。公司总部位于山东烟台，国内管理咨询、海外管理咨询及 SaaS + AI 的具体内容可通过官网服务入口了解。'
    },
    '/about-company.html': {
        file: 'about-company.html',
        title: '公司简介｜烟台本土企业管理咨询公司｜笠偲咨询',
        description: '了解烟台笠偲企业管理咨询有限公司的发展与服务理念：立足山东烟台，结合本土企业实际开展自主交付与实施支持。公司业务涵盖国企改革、组织与薪酬绩效、国际化人才管理及数字化服务，可进一步查看团队介绍、咨询方向和公开资料。'
    },
    '/about-me.html': {
        file: 'about-me.html',
        title: '辛笠｜笠偲咨询首席专家',
        description: '了解笠偲咨询首席专家辛笠在企业出海、国际化人才管理、组织效能与领导力发展领域的专业经验。'
    },
    '/team.html': {
        file: 'team.html',
        title: '专业顾问团队与首席专家介绍｜笠偲咨询',
        description: '了解笠偲咨询首席专家辛笠及官网公开展示的顾问资料，查看其《中国企业出海的理想与经验》著作、SAP 大会嘉宾介绍与专业活动来源，并通过相关服务入口了解组织管理、薪酬绩效和国际化人才发展的咨询方向。'
    },
    '/careers.html': {
        file: 'careers.html',
        title: '加入我们｜咨询顾问招聘与开放申请｜笠偲咨询',
        description: '了解笠偲咨询的咨询顾问等开放岗位，填写个人信息、项目经历并选填 PDF 简历。没有匹配岗位时，也可通过开放申请提交资料，沟通未来的咨询与项目工作机会。'
    },
    '/contacts.html': {
        file: 'contacts.html',
        title: '联系笠偲咨询｜烟台办公地址与企业管理咨询需求沟通',
        description: '联系总部位于山东烟台的笠偲咨询，沟通国企三项制度改革、薪酬绩效、组织优化、企业出海与数字化管理需求。'
    },
    '/privacy-policy.html': {
        file: 'privacy-policy.html',
        title: '隐私政策｜笠偲咨询',
        description: '笠偲咨询官方网站隐私政策与个人信息处理说明。'
    },
    '/business-map.html': {
        file: 'business-map.html',
        title: '全球业务分布｜笠偲咨询',
        description: '查看笠偲咨询的全球业务分布与企业国际化服务网络。'
    }
};

const COMPANY_METRICS = [
    ['statExperience', 'experience', '年行业经验', ''],
    ['statAwards', 'awards', '获得奖项', ''],
    ['statConsultants', 'consultants', '专业顾问', ''],
    ['statSatisfaction', 'satisfaction', '客户满意度', '%']
];
function companyMetricsHtml(info) {
    return COMPANY_METRICS.filter(([key]) => Number.isFinite(info[key]) && info[key] >= 0)
        .map(([key, type, label, suffix]) => `<div class="company-metric" data-counter-type="${type}"><div class="company-metric-number"><span class="counter">${info[key]}</span><span class="company-metric-unit">${suffix}</span></div><p>${label}</p></div>`).join('');
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function stripHtml(value = '') {
    return String(value)
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

function makeDescription(...values) {
    const text = values.map(stripHtml).find(Boolean) || COMPANY.positioning;
    return text.length > 170 ? `${text.slice(0, 167)}…` : text;
}

function absoluteUrl(value, fallbackPath = '/') {
    if (!value) return `${SITE_ORIGIN}${fallbackPath}`;
    if (/^https?:\/\//i.test(value)) return value;
    return `${SITE_ORIGIN}/${String(value).replace(/^\/+/, '')}`;
}

function safeJsonLd(data) {
    return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function upsertHead(html, { title, description, canonical, jsonLd, noindex = false }) {
    const safeTitle = escapeHtml(title);
    const safeDescription = escapeHtml(description);
    let output = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

    output = output.replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '');
    output = output.replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, '');
    output = output.replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '');
    output = output.replace(/\s*<link\b(?=[^>]*\brel=["'](?:shortcut\s+)?icon["'])[^>]*>/gi, '');
    output = output.replace(/\s*<meta\s+(?:property|name)=["'](?:og:|twitter:)[^"']*["'][^>]*>/gi, '');
    output = output.replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*data-seo-jsonld[^>]*>[\s\S]*?<\/script>/gi, '');

    const tags = [
        '  <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16 32x32 48x48 256x256">',
        '  <link rel="stylesheet" href="/css/site-refinement.css?v=compact-20261023">',
        `  <meta name="description" content="${safeDescription}">`,
        `  <meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">`,
        canonical ? `  <link rel="canonical" href="${escapeHtml(canonical)}">` : '',
        `  <meta property="og:title" content="${safeTitle}">`,
        `  <meta property="og:description" content="${safeDescription}">`,
        canonical ? `  <meta property="og:url" content="${escapeHtml(canonical)}">` : '',
        `  <meta property="og:site_name" content="笠偲咨询 EC International">`,
        `  <meta property="og:type" content="website">`,
        jsonLd ? `  <script type="application/ld+json" data-seo-jsonld>${safeJsonLd(jsonLd)}</script>` : ''
    ].filter(Boolean).join('\n');

    output = output.replace(/<\/head>/i, `${tags}\n</head>`);
    output = output.replace(/href=["'](?:\/)?about-me\.html["']/g, 'href="/company-facts.html#xin-li"');
    output = output.replace(/js\/i18n\.js\?v=[^"']*/g, 'js/i18n.js?v=brand-20261027');
    output = output.replace(/js\/i18n-catalog\.js\?v=[^"']*/g, 'js/i18n-catalog.js?v=homepage-20261023');
    return addPublicFactsLink(output.replaceAll('笠偌咨询', BRAND_NAME));
}

function replaceElementContent(html, id, content) {
    const idPattern = escapeRegExp(id);
    const openPattern = new RegExp(`<([a-zA-Z][\\w:-]*)\\b[^>]*\\bid=["']${idPattern}["'][^>]*>`, 'i');
    const match = openPattern.exec(html);
    if (!match) return html;

    const tagName = match[1];
    const contentStart = match.index + match[0].length;
    const tokenPattern = new RegExp(`<\\/?${escapeRegExp(tagName)}\\b[^>]*>`, 'gi');
    tokenPattern.lastIndex = contentStart;
    let depth = 1;
    let token;

    while ((token = tokenPattern.exec(html))) {
        if (token[0].startsWith('</')) depth -= 1;
        else if (!token[0].endsWith('/>')) depth += 1;
        if (depth === 0) {
            return `${html.slice(0, contentStart)}${content}${html.slice(token.index)}`;
        }
    }
    return html;
}

function replaceFirstElementByClass(html, tagName, className, content) {
    const pattern = new RegExp(`(<${tagName}\\b[^>]*class=["'][^"']*\\b${escapeRegExp(className)}\\b[^"']*["'][^>]*>)[\\s\\S]*?(<\\/${tagName}>)`, 'i');
    return html.replace(pattern, `$1${content}$2`);
}

function replaceAttributeById(html, id, attribute, value) {
    const pattern = new RegExp(`(<[a-zA-Z][\\w:-]*\\b[^>]*\\bid=["']${escapeRegExp(id)}["'][^>]*)(>)`, 'i');
    return html.replace(pattern, (full, start, end) => {
        const attrPattern = new RegExp(`\\s${escapeRegExp(attribute)}=["'][^"']*["']`, 'i');
        const safeValue = escapeHtml(value);
        return attrPattern.test(start)
            ? `${start.replace(attrPattern, ` ${attribute}="${safeValue}"`)}${end}`
            : `${start} ${attribute}="${safeValue}"${end}`;
    });
}

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readTemplate(file) {
    return fs.readFileSync(path.join(HTML_DIR, file), 'utf8');
}

function organizationJsonLd(info = {}) {
    const address = info.address || info.mapAddress || info.mapAddressDetail || '山东省烟台市莱山区蓝海软件园B座';
    const logo = absoluteUrl(info.logo || 'images/ce-logo.png');
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: LEGAL_NAME,
        alternateName: [BRAND_NAME, 'EC International'],
        url: `${SITE_ORIGIN}/`,
        logo,
        description: PAGE_SEO['/'].description,
        address: {
            '@type': 'PostalAddress',
            streetAddress: address,
            addressLocality: info.mapCity || '烟台市',
            addressRegion: info.mapProvince || '山东省',
            addressCountry: 'CN'
        },
        email: info.email || undefined,
        telephone: /^[+\d][\d\s().-]{5,}$/.test(String(info.phone || '').trim()) ? info.phone : undefined,
        subjectOf: SOURCES.map(source => ({ '@type': 'WebPage', name: source.title, url: source.url })),
        employee: {
            '@type': 'Person',
            '@id': `${SITE_ORIGIN}${COMPANY.expert.path}#person`,
            name: '辛笠',
            jobTitle: '首席专家'
        }
    };
}

function renderStaticPage(pathname, info = {}, content = {}) {
    const page = PAGE_SEO[pathname];
    if (!page) return null;
    let html = readTemplate(page.file);
    let schema = pathname === '/' || pathname === '/about-company.html' || pathname === '/contacts.html'
        ? organizationJsonLd(info)
        : pathname === '/about-me.html'
            ? {
                '@context': 'https://schema.org',
                '@type': 'Person',
                '@id': `${SITE_ORIGIN}/about-me.html#person`,
                name: '辛笠',
                jobTitle: '首席专家',
                worksFor: { '@id': `${SITE_ORIGIN}/#organization` },
                url: `${SITE_ORIGIN}/about-me.html`
            }
            : undefined;

    if (pathname === '/company-facts.html') {
        html = replaceElementContent(html, 'companyFactsContent', companyFactsHtml(info));
        schema = {
            '@context': 'https://schema.org',
            '@graph': [organizationJsonLd(info), {
                '@type': 'Person', '@id': `${SITE_ORIGIN}${COMPANY.expert.path}#person`,
                name: '辛笠', jobTitle: '首席专家',
                worksFor: { '@id': `${SITE_ORIGIN}/#organization` },
                url: `${SITE_ORIGIN}${COMPANY.expert.path}`,
                subjectOf: { '@type': 'WebPage', url: SOURCES[0].url, name: SOURCES[0].title }
            }, {
                '@type': 'FAQPage', '@id': `${SITE_ORIGIN}/company-facts.html#faq`,
                mainEntity: companyQuestions(info).map(([question, answer]) => ({
                    '@type': 'Question', name: question,
                    acceptedAnswer: { '@type': 'Answer', text: answer }
                }))
            }]
        };
    }
    const topic = SERVICE_TOPICS[pathname];
    if (topic) {
        html = replaceFirstElementByClass(html, 'h1', 'breadcrumbs-custom-title', escapeHtml(topic.name));
        html = replaceElementContent(html, 'topicBreadcrumb', escapeHtml(topic.name));
        html = replaceElementContent(html, 'topicContent', serviceTopicHtml(topic, content.projects || []));
        schema = {
            '@context': 'https://schema.org', '@graph': [organizationJsonLd(info), {
                '@type': 'Service', '@id': `${SITE_ORIGIN}${pathname}#service`,
                name: topic.name, description: topic.description, url: `${SITE_ORIGIN}${pathname}`,
                provider: { '@id': `${SITE_ORIGIN}/#organization` },
                subjectOf: topic.externalSources?.map(source => ({ '@type': 'WebPage', name: source.title, url: source.url }))
            }, {
                '@type': 'FAQPage', '@id': `${SITE_ORIGIN}${pathname}#faq`,
                mainEntity: topic.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
            }]
        };
    }
    if (pathname === COMPANY.expert.path) {
        html = replaceFirstElementByClass(html, 'h1', 'breadcrumbs-custom-title', '辛笠 · 笠偲咨询首席专家');
        html = replaceElementContent(html, 'topicBreadcrumb', '首席专家辛笠');
        html = replaceElementContent(html, 'topicContent', expertHtml());
        schema = {
            '@context': 'https://schema.org', '@graph': [organizationJsonLd(info), {
                '@type': 'Person', '@id': `${SITE_ORIGIN}${COMPANY.expert.path}#person`, name: '辛笠',
                jobTitle: '首席专家', url: `${SITE_ORIGIN}${COMPANY.expert.path}`,
                worksFor: { '@id': `${SITE_ORIGIN}/#organization` },
                subjectOf: [SOURCES[0], SOURCES[2]].map(s => ({ '@type': 'WebPage', name: s.title, url: s.url }))
            }, {
                '@type': 'Book', name: '中国企业出海的理想与经验',
                author: { '@id': `${SITE_ORIGIN}${COMPANY.expert.path}#person` }
            }]
        };
    }
    html = renderPublicContent(html, pathname, info, content);
    const listed = [
        ...(content.services || []).map(item => ({ ...item, kind: 'service' })),
        ...(content.projects || []).map(item => ({ ...item, kind: 'project' })),
        ...(content.news || []).map(item => ({ ...item, kind: 'blog-post' }))
    ];
    if (listed.length && !topic) schema = {
        '@context': 'https://schema.org',
        '@graph': [schema || organizationJsonLd(info), {
            '@type': 'ItemList',
            itemListElement: listed.map((item, index) => ({
                '@type': 'ListItem', position: index + 1, name: item.title,
                url: `${SITE_ORIGIN}/single-${item.kind}.html?id=${item.id}`
            }))
        }]
    };

    if (pathname === '/') {
        // These destinations already appear in the homepage navigation or footer.
        // This describes the site hierarchy; search engines choose their own sitelinks.
        const sections = [
            ['/services.html', '服务项目'], ['/about-company.html', '公司简介'],
            ['/grid-gallery.html', '成功案例'], ['/sidebar-blog.html', '专业洞察'],
            ['/company-facts.html', '公司资料与公开来源'], ['/contacts.html', '联系我们']
        ];
        schema = {
            '@context': 'https://schema.org',
            '@graph': [...(schema?.['@graph'] || [schema || organizationJsonLd(info)]), {
                '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`,
                name: BRAND_NAME, alternateName: ['笠偲咨询 EC International', COMPANY.englishName, LEGAL_NAME],
                url: `${SITE_ORIGIN}/`, inLanguage: 'zh-CN',
                publisher: { '@id': `${SITE_ORIGIN}/#organization` },
                hasPart: sections.map(([url, name]) => ({ '@type': 'WebPage', name, url: `${SITE_ORIGIN}${url}` }))
            }]
        };
    }

    html = upsertHead(html, {
        title: page.title,
        description: page.description,
        canonical: `${SITE_ORIGIN}${pathname}`,
        jsonLd: schema
    });
    return addPublicFactsLink(html);
}

function addPublicFactsLink(html) {
    const footer = `<footer class="refined-footer"><div class="container"><div class="refined-footer-grid"><div class="refined-footer-brand"><a href="/"><img src="/images/ce-logo.png" alt="笠偲咨询 EC International"></a><p>以全球视野，回应企业发展的真实问题。</p><p style="font-size:11px;opacity:.65">本站配图为 AI 生成示意图。</p></div><div><h5>探索笠偲</h5><nav><a href="/about-company.html">公司简介</a><a href="/services.html">咨询服务</a><a href="/grid-gallery.html">项目案例</a><a href="/expert-xin-li.html">专业团队</a><a href="/sidebar-blog.html">专业洞察</a><a href="/company-facts.html">公开资料</a><a href="/careers.html">加入我们</a></nav></div><div><h5>开启一次专业对话</h5><a href="mailto:winniehan@ec-in.com">winniehan@ec-in.com ↗</a><p>关注「笠偲咨询」微信公众号<br>了解我们的专业服务与最新动态。</p><a href="/contacts.html">联系我们 →</a></div></div><div class="refined-footer-bottom"><span>© 烟台笠偲企业管理咨询有限公司</span><div class="refined-footer-meta"><a href="/company-facts.html" data-company-facts-link>公司资料与公开来源</a><a href="/privacy-policy.html">隐私政策</a><span>www.ec-int.cn</span></div></div></div></footer>`;
    const homeFooter = `<footer class="refined-footer"><div class="container"><div class="refined-footer-grid"><div class="refined-footer-brand"><a href="/"><img src="/images/ce-logo.png" alt="笠偲咨询 EC International"></a><p>以全球视野，回应企业发展的真实问题。</p><p style="font-size:10px;opacity:.6">本站配图为 AI 生成示意图。</p></div><div><h5>探索笠偲</h5><nav><a href="/about-company.html">公司简介</a><a href="/expert-xin-li.html">专业团队</a><a href="/grid-gallery.html">项目案例</a><a href="/careers.html">加入我们</a></nav></div><div><h5>专业服务</h5><nav><a href="/overseas-consulting.html">海外管理咨询</a><a href="/organization-hr.html">国内管理咨询</a><a href="/digital-transformation.html">SaaS + AI</a></nav></div><div><h5>联系与资料</h5><nav><a href="/contacts.html">联系我们</a><a href="/sidebar-blog.html">专业洞察</a><a href="/company-facts.html" data-company-facts-link>公司资料与公开来源</a></nav></div></div><div class="refined-footer-bottom"><span>© 烟台笠偲企业管理咨询有限公司</span><div class="refined-footer-meta"><a href="/privacy-policy.html">隐私政策</a><span>www.ec-int.cn</span></div></div></div></footer>`;
    return html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/i, html.includes('class="home-redesigned"') ? homeFooter : footer);
}

function companyFactsHtml(info = {}) {
    return `<p>${escapeHtml(COMPANY.positioning)}</p><p>公司全称为烟台笠偲企业管理咨询有限公司。本页汇总现用官网、业务入口及可核实的专家、活动与获奖资料。</p>
        <h2>现用官网与品牌名称</h2>
        <dl><dt>中文品牌</dt><dd>${escapeHtml(COMPANY.brand)}</dd><dt>英文品牌</dt><dd>${escapeHtml(COMPANY.englishName)}</dd><dt>公司全称</dt><dd>${escapeHtml(COMPANY.name)}</dd><dt>成立年份</dt><dd>${COMPANY.establishedYear}年（<a href="/about-company.html">公司简介</a>）</dd><dt>现用官网</dt><dd><a href="${SITE_ORIGIN}/">${SITE_ORIGIN}/</a></dd><dt>办公联系地址</dt><dd>${escapeHtml(info.address || '山东省烟台市莱山区蓝海路蓝海软件园B座')}</dd><dt>联系邮箱</dt><dd>${escapeHtml(info.email || 'winniehan@ec-in.com')}</dd></dl>
        <p><strong>原 www.ec-in.cn 已停止使用，不再作为笠偲咨询官网。</strong>历史报道中可能保留旧域名，请以本网站为准。</p>
        <h2>业务与咨询服务</h2><p>国内管理咨询、海外管理咨询、SaaS + AI。国内业务包括<a href="/soe-reform.html">国企三项制度改革</a>、组织架构与定岗定编、<a href="/compensation-performance.html">薪酬绩效激励体系优化落地</a>、人才盘点与发展、企业架构与流程管理、行业对标研究及咨询式培训。数字化业务包括笠偲绩效 SaaS 平台、薪酬调研 AI 工具、SAP SF 系统实施及海外用工平台。</p><p>查看<a href="/services.html">服务项目</a>、<a href="/grid-gallery.html">项目案例</a>、<a href="/sidebar-blog.html">专业洞察</a>或<a href="/contacts.html">联系我们</a>。</p>${topicLinksHtml()}
        <h2>爱因斯特（IAESTE）项目</h2><p>海外业务包括<a href="/iaeste-internship.html">爱因斯特（IAESTE）海外实习生交换项目</a>，围绕海外实习生接收、导师带教与具备条件的人员海外发展型外派，支持企业国际化人才培养。<a href="https://iaeste.org/member-countries/china-ecint-f4f5b93f-5624-4df0-98bd-7aa36cd260c2" target="_blank" rel="noopener noreferrer">IAESTE 官方 China, ECInt 名录</a>列明合作机构身份、2024年加入、烟台联系地址，并链接本公司现用官网。</p>
        <h2 id="xin-li">首席专家辛笠</h2><p>辛笠为笠偲咨询首席专家，《中国企业出海的理想与经验》作者。SAP HR Connect 2025 官网列有其嘉宾介绍及海外人力资源管理实操分享议题。<a href="${SOURCES[0].url}" target="_blank" rel="noopener noreferrer">查看 SAP 原始介绍</a>，或查看<a href="${COMPANY.expert.path}">专家介绍与公开活动</a>。</p>
        <h2>活动与获奖公开来源</h2><p>以下为外部机构发布的原始资料摘要，具体活动与奖项信息可通过链接核实。</p>
        ${SOURCES.map(s => `<article class="public-source"><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.summary)}</p><p>来源：<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.publisher)}</a></p></article>`).join('')}
        <h2 id="faq">常见问题</h2>${companyQuestions(info).map(([q, a]) => `<section class="public-question"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></section>`).join('')}`;
}

function companyQuestions(info = {}) {
    return QUESTIONS.map(([q, a]) => q === '笠偲咨询在哪里办公，如何联系？'
        ? [q, `当前官网展示的办公联系地址为${info.address || '山东省烟台市莱山区蓝海路蓝海软件园B座'}，联系邮箱为 ${info.email || 'winniehan@ec-in.com'}。到访安排请通过联系渠道提前确认。`]
        : [q, a]);
}

function imageHtml(value, title, className = '', width = 740) {
    if (!value) return '';
    const url = absoluteUrl(value);
    if (!/^https?:\/\//i.test(url)) return '';
    const optimized = url.startsWith(`${SITE_ORIGIN}/uploads/`) && !url.includes('?') ? `${url}?w=${width}` : url;
    return `<img src="${escapeHtml(optimized)}" alt="${escapeHtml(title)}" class="${className}" loading="lazy" decoding="async">`;
}

function topicLinksHtml() {
    return `<nav class="topic-links" aria-label="业务专题" style="display:flex;flex-wrap:wrap;gap:12px;margin:20px 0">${Object.entries(SERVICE_TOPICS).map(([url, topic]) => `<a href="${url}">${escapeHtml(topic.name)}</a>`).join('')}</nav>`;
}

function serviceTopicHtml(topic, projects) {
    const bullets = items => `<ul>${items.map(text => `<li>${escapeHtml(text)}</li>`).join('')}</ul>`;
    const sources = [...topic.sourceIndexes.map(index => SOURCES[index]), ...(topic.externalSources || [])];
    const related = projects.filter(project => {
        const text = `${project.title} ${project.category} ${project.client}`;
        return topic.casePattern.test(text) && !topic.excludeCasePattern?.test(text);
    });
    return `<p>${escapeHtml(topic.description)}</p>${(topic.overview || []).map(text => `<p>${escapeHtml(text)}</p>`).join('')}<div class="topic-summary"><strong>适合哪些企业</strong><p>${escapeHtml(topic.audience)}</p></div>
        <h2>需要解决的管理问题</h2>${bullets(topic.problems)}
        <h2>${escapeHtml(topic.scopeHeading || '咨询内容')}</h2>${topic.scope.map(([title, text]) => `<article class="public-source"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`).join('')}
        ${topic.process?.length ? `<h2>项目如何开展</h2><ol>${topic.process.map(([title,text]) => `<li><strong>${escapeHtml(title)}</strong>：${escapeHtml(text)}</li>`).join('')}</ol>` : ''}
        ${topic.relatedPaths?.length ? `<h2>进一步了解相关服务</h2><nav class="topic-links" aria-label="相关咨询服务">${topic.relatedPaths.map(url => `<a href="${url}">${escapeHtml(SERVICE_TOPICS[url].name)}</a>`).join('')}</nav>` : ''}
        <h2>可沟通的交付方向</h2>${bullets(topic.deliverables)}<p>以上用于说明需求沟通方向，具体工作范围、交付内容和实施安排以双方确认的项目方案为准。</p>
        <h2>如何沟通项目需求</h2><p>初次沟通时，可先提供以下信息，再共同确定诊断与方案讨论的重点：</p>${bullets(topic.preparation)}
        ${related.length || sources.length ? '<h2>相关案例与公开资料</h2>' : ''}${related.map(project => `<article class="public-source"><h3><a href="/single-project.html?id=${encodeURIComponent(project.id)}">${escapeHtml(project.title)}</a></h3><p>${escapeHtml(stripHtml(project.description || ''))}</p><p>笠偲咨询自行发布的项目介绍，客户以匿名方式展示。</p></article>`).join('')}
        ${sources.map(source => `<p><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.publisher)}：${escapeHtml(source.title)}</a>。${escapeHtml(source.summary)}</p>`).join('')}
        <h2>常见问题</h2>${topic.faq.map(([q, a]) => `<section class="public-question"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></section>`).join('')}
        <h2>联系笠偲咨询</h2><p><a class="button button-primary" href="/contacts.html">沟通咨询需求</a> · <a href="/services.html">查看服务项目</a> · <a href="/company-facts.html">公司资料与公开来源</a></p>${topicLinksHtml()}`;
}

function expertHtml() {
    return `<p>辛笠为笠偲咨询（EC International）首席专家，《中国企业出海的理想与经验》作者。以下介绍依据公开发布的嘉宾资料与活动报道整理，附有原始来源。</p>
        <div class="topic-summary"><dl><dt>姓名</dt><dd>辛笠</dd><dt>机构与职务</dt><dd>笠偲咨询首席专家</dd><dt>公开著作</dt><dd>《中国企业出海的理想与经验》</dd></dl></div>
        <h2>企业出海著作</h2><p>SAP HR Connect 2025 官网的嘉宾介绍同时列明了辛笠的首席专家职务与上述著作作者身份。<a href="${SOURCES[0].url}" target="_blank" rel="noopener noreferrer">查看 SAP 嘉宾资料</a>。</p>
        <h2>公开议题与专业活动</h2>
        <article class="public-source"><h3>SAP HR Connect 2025 青岛站</h3><p>大会官网将辛笠列为特邀嘉宾，议题为“创业式出海 - 海外人力资源管理实操分享”。大会页面标明2025年11月6日在青岛举办。</p><p>来源：<a href="${SOURCES[0].url}" target="_blank" rel="noopener noreferrer">SAP 大会官网</a></p></article>
        <article class="public-source"><h3>从临港出海系列“投资匈牙利”活动</h3><p>上海市企业出海综合服务平台报道，辛笠在2025年10月23日的活动中，就匈牙利及东欧人才结构、海外劳动力趋势和企业人才布局作分享。</p><p>来源：<a href="${SOURCES[2].url}" target="_blank" rel="noopener noreferrer">上海市企业出海综合服务平台</a></p></article>
        <h2>相关咨询方向</h2><p>上述公开议题涉及企业国际化、海外人力资源与人才布局。具体项目可通过笠偲咨询官方联系渠道沟通。</p>${topicLinksHtml()}
        <p><a class="button button-primary" href="/contacts.html">联系笠偲咨询</a> · <a href="/company-facts.html">核对公司资料与更多公开来源</a></p>`;
}

function cards(items, type, home = false) {
    return items.map(item => {
        const url = `/single-${type}.html?id=${encodeURIComponent(item.id)}`;
        const description = stripHtml(item.description || item.excerpt || '');
        if (type === 'project' && home) return `<div class="col-sm-6 col-lg-4"><article class="box-creative"><a href="${url}">${imageHtml(item.image, item.title, 'service-card-img')}</a><h4><a href="${url}">${escapeHtml(item.title)}</a></h4><p>${escapeHtml(item.category || '')}</p></article></div>`;
        if (type === 'project') return `<div class="col-sm-6 col-lg-4 isotope-item" data-filter="${escapeHtml(item.category || '未分类')}"><a class="thumbnail-modern" href="${url}">${imageHtml(item.image, item.title, 'thumbnail-modern-image')}<div class="thumbnail-modern-caption"><div class="project-info"><div class="project-title">${escapeHtml(item.title)}</div><div class="project-category">${escapeHtml(item.category || '')}</div></div></div><div class="thumbnail-modern-dummy"></div></a></div>`;
        return `<div class="col-sm-6 col-lg-4"><article class="box-creative">${imageHtml(item.image, item.title, type === 'service' ? 'service-card-img' : 'img-fluid')}<h4><a href="${url}">${escapeHtml(item.title)}</a></h4><p>${escapeHtml(description)}</p></article></div>`;
    }).join('');
}

function setRenderedContent(html, id, content) {
    html = replaceElementContent(html, id, content);
    return replaceAttributeById(html, id, 'data-server-rendered', 'true');
}

function renderPublicContent(html, pathname, info, data) {
    html = html.replaceAll('笠偌咨询', BRAND_NAME);
    const set = (id, value) => { html = setRenderedContent(html, id, value); };
    set('dynamicNavbar', [
        ['/', '首页'], ['/services.html', '服务项目'], ['/grid-gallery.html', '成功案例'],
        ['/sidebar-blog.html', '专业洞察'], ['/about-company.html', '公司简介'],
        ['/company-facts.html', '公司资料与公开来源'], ['/contacts.html', '联系我们']
    ].map(([url, label]) => `<li class="rd-nav-item"><a class="rd-nav-link" href="${url}">${label}</a></li>`).join(''));
    if (data.services) set('servicesContainer', cards(pathname === '/' ? data.services.slice(0, 3) : data.services, 'service') || '<p>服务详情请联系我们。</p>');
    if (data.projects) set('projectsContainer', cards(data.projects, 'project', pathname === '/') || '<p>项目详情请联系我们。</p>');
    if (data.news) {
        const items = pathname === '/' ? data.news.slice(0, 4) : data.news;
        set('blogsContainer', cards(items, 'blog-post') || '<p>专业动态持续更新中。</p>');
        set('archivesList', '<li><a href="/sidebar-blog.html">查看全部专业洞察</a></li>');
        set('categoriesList', '<li><a href="/company-facts.html">活动报道与公开来源</a></li>');
    }
    if (data.features) {
        set('homeFeaturesContainer', BusinessCards.render(data.features, false));
        if (pathname === '/services.html') set('serviceCategoriesContainer', BusinessCards.render(data.features, false, {overview:true}));
    }
    if (data.partners) set('partnersContainer', data.partners.slice(0, 8).map(p => `<div class="col-6 col-sm-4 col-md-3 col-lg-2"><div class="partner-item"><span class="partner-name">${imageHtml(p.logo, p.name, 'partner-logo', 360)}${escapeHtml(p.name)}</span></div></div>`).join(''));
    if (pathname === '/') {
        const heading = [info.heroTitle || '连接全球机遇', info.heroSubtitle || '释放组织潜能'].map(escapeHtml).join('<br>');
        set('heroTitle', heading);
        set('heroDescription', info.heroDescription || info.description || '');
        set('homeStatisticsContainer', companyMetricsHtml(info));
        set('projectsContainer', HomepageLayout.projects(data.projects || [], false));
        set('blogsContainer', HomepageLayout.news(data.news || [], false));
        set('homeSources', HomepageLayout.sources(SOURCES, false));
        set('homePublicSources', safeJsonLd(SOURCES));
        set('homeDistributionData', safeJsonLd(data.distribution || null));
        set('homeRegions', HomepageLayout.distribution(data.distribution, false));
        if (data.distribution?.isActive === 0) html = replaceAttributeById(html, 'businessDistributionSection', 'hidden', '');
        if (info.heroRightImage) html = replaceAttributeById(html, 'heroRightImage', 'src', absoluteUrl(info.heroRightImage));
        if (info.heroButtonText) set('heroButton', escapeHtml(info.heroButtonText) + ' <span aria-hidden="true">→</span>');
        const buttonHref = /^(?:https?:\/\/|\/(?!\/))/.test(info.heroButtonLink || '') ? info.heroButtonLink : '/services.html';
        html = replaceAttributeById(html, 'heroButton', 'href', buttonHref);
        if (info.email) {set('homeContactEmail', escapeHtml(info.email)); html = replaceAttributeById(html, 'homeContactEmail', 'href', `mailto:${info.email}`);}
        if (info.address) set('homeContactAddress', escapeHtml(info.address));
    }
    if (pathname === '/about-company.html') {
        const company = data.company || {};
        set('companyTitle', escapeHtml(company.title || '公司简介'));
        set('companyContent', `<p>${escapeHtml(COMPANY.positioning)}</p>` + (company.summary || '') + (company.content || '') + '<p>了解我们的<a href="/soe-reform.html">国企三项制度改革咨询</a>、<a href="/compensation-performance.html">薪酬绩效与激励咨询</a>及<a href="/organization-hr.html">国内管理咨询服务</a>。</p>');
        if (company.image) html = replaceAttributeById(html, 'companyImage', 'src', absoluteUrl(company.image));
        set('statisticsContainer', companyMetricsHtml(info));
        set('coreAdvantagesContainer', (data.features || []).map(f => `<div class="col-md-4"><h4>${escapeHtml(f.title)}</h4><p>${escapeHtml(stripHtml(f.description))}</p></div>`).join(''));
        set('servicesContainer', cards(data.services || [], 'service'));
        set('teamContainer', teamCards(data.team || []));
        set('testimonialsContainer', '<p>相关专业实践见<a href="/company-facts.html">活动报道与公开来源</a>。</p>');
    }
    if (pathname === '/team.html') set('teamMembersContainer', teamCards(data.team || []));
    if (pathname === '/') set('serviceTopics', `<h3>按业务方向了解服务</h3>${topicLinksHtml()}<p>查看服务对象、咨询内容、交付方向及相关案例。</p>`);
    if (pathname === '/contacts.html') {
        if (info.address) set('contactAddress', escapeHtml(info.address));
        if (info.email) { set('contactEmail', escapeHtml(info.email)); html = replaceAttributeById(html, 'contactEmail', 'href', `mailto:${info.email}`); }
        if (info.phone) set('contactPhoneMain', escapeHtml(info.phone));
    }
    if (pathname === '/careers.html') {
        const careers = data.careers || [];
        set('careersList', careers.map(c => `<article class="recruitment-job"><h3><a href="/single-job.html?id=${encodeURIComponent(c.id)}">${escapeHtml(c.title)}</a></h3><p>${escapeHtml([c.location,c.jobType].filter(Boolean).join(' · '))}</p><p>${escapeHtml(stripHtml(c.description || '').slice(0,120))}${stripHtml(c.description || '').length>120?'…':''}</p><div class="recruitment-job-links"><a href="/single-job.html?id=${encodeURIComponent(c.id)}">查看岗位详情</a><a href="#apply" data-apply-career="${escapeHtml(c.id)}">申请这个岗位</a></div></article>`).join('') || '<p class="recruitment-empty">暂未发布具体岗位。欢迎通过下方开放申请提交资料，我们会结合后续需求评估。</p>');
        set('applicationCareer', '<option value="">开放申请 / 暂无匹配岗位</option>' + careers.map(c=>`<option value="${escapeHtml(c.id)}">${escapeHtml(c.title)}</option>`).join(''));
    }
    return html;
}

function teamCards(members) {
    return `<div class="col-12" id="chief-expert"><h3>辛笠 · 笠偲咨询首席专家</h3><p>《中国企业出海的理想与经验》作者。<a href="${SOURCES[0].url}" target="_blank" rel="noopener noreferrer">查看 SAP 大会嘉宾介绍</a> · <a href="${COMPANY.expert.path}">专家介绍、著作与公开活动</a></p></div>` + members.filter(isPublicTeamMember).filter(m => m.name !== '辛笠').map(m => `<div class="col-md-6 col-lg-4 mb-4"><article class="card card-team"><div class="card-body"><h4>${escapeHtml(m.name)}</h4><p>${escapeHtml(m.position || '')}</p><div>${m.bio || ''}</div></div></article></div>`).join('');
}

function renderServicePage(service) {
    let html = readTemplate('single-service.html');
    const related = Object.entries(SERVICE_TOPICS).filter(([, topic]) => topic.serviceTitle === service.title || (topic.legacyTitles || []).includes(service.title));
    const topic = related[0]?.[1];
    const title = `${topic?.detailTitle || service.title}｜笠偲咨询服务`;
    const description = topic ? topic.description : makeDescription(service.description, service.content);
    const canonical = `${SITE_ORIGIN}/single-service.html?id=${service.id}`;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: service.title,
        description,
        url: canonical,
        image: service.image ? absoluteUrl(service.image) : undefined,
        provider: { '@id': `${SITE_ORIGIN}/#organization` },
        areaServed: ['CN', 'Worldwide']
    };
    html = upsertHead(html, { title, description, canonical, jsonLd: schema });
    html = replaceFirstElementByClass(html, 'h1', 'breadcrumbs-custom-title', escapeHtml(service.title));
    html = replaceElementContent(html, 'serviceFeatureTitle', escapeHtml(service.title));
    html = setRenderedContent(html, 'serviceFeatureDescription', topic ? `<p>${escapeHtml(description)}</p>` : service.description || '');
    html = replaceElementContent(html, 'serviceDetailTitle', escapeHtml(service.title));
    const scope = topic ? `<h4>服务内容与沟通方向</h4>${topic.scope.map(([name,text]) => `<h5>${escapeHtml(name)}</h5><p>${escapeHtml(text)}</p>`).join('')}<p>具体服务范围、交付内容和实施安排以双方确认的项目方案为准。</p>` : '';
    html = replaceElementContent(html, 'serviceDetailDescription', (service.content || service.description || '') + scope);
    const relatedUrls = [...new Set(related.flatMap(([url, topic]) => [url, ...(topic.relatedPaths || [])]))];
    html = replaceElementContent(html, 'serviceTopicLinks', relatedUrls.map(url => `<p><a href="${url}">进一步了解：${escapeHtml(SERVICE_TOPICS[url].name)}</a></p>`).join(''));
    return html;
}

function normalizeServices(services) {
    if (Array.isArray(services)) return services;
    if (typeof services === 'string') {
        try {
            const parsed = JSON.parse(services);
            if (Array.isArray(parsed)) return parsed;
        } catch (_) {
            return services.split(/[，,、]/).map(item => item.trim()).filter(Boolean);
        }
    }
    return [];
}

function renderProjectPage(project) {
    let html = readTemplate('single-project.html');
    const title = `${project.title}｜笠偲咨询案例`;
    const description = makeDescription(project.description, project.content);
    const canonical = `${SITE_ORIGIN}/single-project.html?id=${project.id}`;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        '@id': `${canonical}#case-study`,
        name: project.title,
        description,
        url: canonical,
        image: project.image ? absoluteUrl(project.image) : undefined,
        creator: { '@id': `${SITE_ORIGIN}/#organization` },
        dateModified: project.updatedAt ? new Date(project.updatedAt).toISOString() : undefined
    };
    html = upsertHead(html, { title, description, canonical, jsonLd: schema });
    html = replaceFirstElementByClass(html, 'h1', 'breadcrumbs-custom-title', escapeHtml(project.title));
    html = replaceElementContent(html, 'projectClient', escapeHtml(project.client || ''));
    html = replaceElementContent(html, 'projectCategory', escapeHtml(project.category || ''));
    html = replaceElementContent(
        html,
        'projectServices',
        normalizeServices(project.services).map(item => `<li><a href="services.html">${escapeHtml(item)}</a></li>`).join('')
    );
    html = replaceElementContent(html, 'projectDuration', escapeHtml(project.duration ? `${project.duration}个月` : ''));
    html = replaceElementContent(html, 'projectDescription', project.description || project.content || '');
    html = replaceElementContent(html, 'aboutProjectTitle', escapeHtml(project.title));
    html = replaceElementContent(html, 'aboutProjectText', project.content || project.description || '');
    html = setRenderedContent(html, 'teamContainer', teamCards([]));
    const anonymous = /某|匿名/.test(`${project.title || ''} ${project.client || ''}`);
    html = replaceElementContent(html, 'caseDisclosure', `<p>${anonymous ? '本案例由笠偲咨询自行发布，客户采用匿名方式展示，未披露具体企业名称。' : '本案例由笠偲咨询自行发布。'}相关内容用于介绍项目背景与管理工作，所述内容不代表其他企业可获得相同结果。</p><p><a href="/company-facts.html">查看公司资料与第三方公开报道</a> · <a href="/services.html">了解咨询服务</a></p>`);
    if (project.image) {
        html = replaceElementContent(
            html,
            'swiperWrapper',
            `<div class="project-hero-image-inner"><img src="${escapeHtml(absoluteUrl(project.image))}" alt="${escapeHtml(project.title)}" class="project-hero-image"></div>`
        );
    }
    return html;
}

function renderArticlePage(article) {
    let html = readTemplate('single-blog-post.html');
    const title = `${article.title}｜笠偲咨询洞察`;
    const description = makeDescription(article.excerpt, article.content);
    const canonical = `${SITE_ORIGIN}/single-blog-post.html?id=${article.id}`;
    const published = article.createdAt ? new Date(article.createdAt) : null;
    const modified = article.updatedAt ? new Date(article.updatedAt) : published;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: article.title,
        description,
        url: canonical,
        image: article.image ? [absoluteUrl(article.image)] : undefined,
        datePublished: published ? published.toISOString() : undefined,
        dateModified: modified ? modified.toISOString() : undefined,
        author: article.author
            ? [COMPANY.brand, COMPANY.name, COMPANY.englishName].includes(article.author)
                ? { '@id': `${SITE_ORIGIN}/#organization` }
                : { '@type': 'Person', name: article.author }
            : { '@id': `${SITE_ORIGIN}/#organization` },
        publisher: { '@id': `${SITE_ORIGIN}/#organization` },
        mainEntityOfPage: canonical
    };
    html = upsertHead(html, { title, description, canonical, jsonLd: schema });
    html = replaceElementContent(html, 'blogTitle', escapeHtml(article.title));
    html = replaceElementContent(html, 'blogPath', escapeHtml(article.title));
    html = replaceElementContent(html, 'postCreativeTitle', escapeHtml(article.title));
    html = replaceElementContent(html, 'postSubtitle', escapeHtml(article.excerpt || article.title));
    html = replaceElementContent(html, 'postContent', article.content || article.excerpt || '');
    if (published) {
        html = replaceElementContent(html, 'postDate', escapeHtml(published.toLocaleDateString('zh-CN')));
        html = replaceAttributeById(html, 'postDate', 'datetime', published.toISOString().slice(0, 10));
    }
    if (article.image) {
        html = replaceAttributeById(html, 'postImage', 'src', absoluteUrl(article.image));
        html = replaceAttributeById(html, 'postImage', 'alt', article.title);
    }
    return html;
}

function renderCareerPage(career) {
    let html = readTemplate('single-job.html');
    const title = `${career.title}招聘｜笠偲咨询`;
    const description = makeDescription(career.description, `${career.title}招聘信息`);
    const canonical = `${SITE_ORIGIN}/single-job.html?id=${career.id}`;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        '@id': `${canonical}#job`,
        title: career.title,
        description: career.description || description,
        datePosted: career.createdAt ? new Date(career.createdAt).toISOString() : undefined,
        hiringOrganization: { '@type':'Organization', '@id': `${SITE_ORIGIN}/#organization`, name:LEGAL_NAME, url:`${SITE_ORIGIN}/`, logo:`${SITE_ORIGIN}/images/ce-logo.png` },
        employmentType: ({'全职':'FULL_TIME','兼职':'PART_TIME','实习':'INTERN'})[career.jobType] || undefined,
        jobLocation: career.location ? {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: career.location,
                addressCountry: 'CN'
            }
        } : undefined
    };
    html = upsertHead(html, { title, description, canonical, jsonLd: schema });
    html = replaceFirstElementByClass(html, 'h1', 'breadcrumbs-custom-title', escapeHtml(career.title));
    html = replaceElementContent(html, 'jobTitle', escapeHtml(career.title));
    html = replaceElementContent(html, 'jobMeta', escapeHtml([career.location,career.jobType].filter(Boolean).join(' · ')));
    html = replaceAttributeById(html,'jobApplyLink','href',`/careers.html?careerId=${encodeURIComponent(career.id)}#apply`);
    html = replaceElementContent(html, 'tabs-1-1', career.description || '<p>职位详情请联系笠偲咨询。</p>');
    return html;
}

module.exports = {
    SITE_ORIGIN,
    PAGE_SEO,
    HTML_DIR,
    readTemplate,
    renderStaticPage,
    renderServicePage,
    renderProjectPage,
    renderArticlePage,
    renderCareerPage,
    upsertHead,
    organizationJsonLd,
    makeDescription,
    escapeHtml
};
