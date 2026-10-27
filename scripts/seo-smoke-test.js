const assert = require('assert');
const {
    renderStaticPage,
    renderServicePage,
    renderProjectPage,
    renderArticlePage,
    renderCareerPage
} = require('../lib/seo-renderer');

function assertCommonSeo(html, expectedTitlePart) {
    expectedTitlePart = expectedTitlePart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(html, new RegExp(`<title>[^<]*${expectedTitlePart}[^<]*<\\/title>`));
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.match(html, /<link rel="canonical" href="https:\/\/www\.ec-int\.cn\/[^"]*">/);
    assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large">/);
    assert.strictEqual((html.match(/<h1\b/g) || []).length, 1);
}

const home = renderStaticPage('/', {});
assertCommonSeo(home, '笠偲咨询');
assert.match(home, /"@type":"Organization"/);

const person = renderStaticPage('/about-me.html', {});
assertCommonSeo(person, '辛笠');
assert.match(person, /"@type":"Person"/);

const service = renderServicePage({
    id: 7,
    title: '海外人力资源咨询',
    description: '<p>服务摘要</p>',
    content: '<p>来自数据库的服务正文</p>',
    image: '/uploads/service.webp'
});
assertCommonSeo(service, '海外人力资源咨询');
assert.match(service, /<div id="serviceDetailDescription"><p>来自数据库的服务正文<\/p><\/div>/);
assert.match(service, /"@type":"Service"/);

const project = renderProjectPage({
    id: 8,
    title: '东南亚出海案例',
    description: '<p>案例摘要</p>',
    content: '<p>来自数据库的案例正文</p>',
    services: ['组织设计'],
    updatedAt: new Date('2026-01-03')
});
assertCommonSeo(project, '东南亚出海案例');
assert.match(project, /<div id="aboutProjectText"[^>]*><p>来自数据库的案例正文<\/p><\/div>/);

const article = renderArticlePage({
    id: 9,
    title: '越南用工合规指南',
    excerpt: '文章摘要',
    content: '<p>来自数据库的文章正文</p>',
    author: '辛笠',
    createdAt: new Date('2026-01-02'),
    updatedAt: new Date('2026-01-03')
});
assertCommonSeo(article, '越南用工合规指南');
assert.match(article, /<div id="postContent"><p>来自数据库的文章正文<\/p><\/div>/);
assert.match(article, /"@type":"Article"/);

const career = renderCareerPage({
    id: 10,
    title: '国际化咨询顾问',
    description: '<p>来自数据库的职位说明</p>',
    jobType: '全职',
    location: '上海',
    createdAt: new Date('2026-01-02')
});
assertCommonSeo(career, '国际化咨询顾问');
assert.match(career, /data-job-description><p>来自数据库的职位说明<\/p><\/div>/);
assert.match(career, /"@type":"JobPosting"/);

for (const html of [home, person, service, project, article, career]) {
    const match = html.match(/<script type="application\/ld\+json" data-seo-jsonld>([\s\S]*?)<\/script>/);
    assert.ok(match, '缺少 JSON-LD');
    JSON.parse(match[1]);
}

console.log('SEO smoke tests passed');

// Search crawlers must see real list content and expert identity without executing JavaScript.
const renderedHome = renderStaticPage('/', { phone: '更多请关注“笠偲咨询”公众号' }, {
    services: [{ id: 1, title: '海外业务', description: '<p>海外咨询摘要</p>' }],
    projects: [{ id: 2, title: '项目 A & B', category: '海外布局' }],
    news: [{ id: 3, title: '公开洞察', excerpt: '文章摘要' }],
    partners: [], features: [{id:1,title:"海外管理咨询",description:"<p>海外咨询摘要</p>"}]
});
const bodyText = html => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, '');
assert.match(bodyText(renderedHome), /海外咨询摘要/);
assert.match(renderedHome, /href="\/single-project.html\?id=2"/);
assert.match(renderedHome, /项目 A &amp; B/);
assert.match(bodyText(renderedHome), /公开洞察/);
assert.doesNotMatch(bodyText(renderedHome), /内容加载中|正在加载合作伙伴|笠偌咨询/);
assert.doesNotMatch(renderedHome, /"telephone":"更多请关注/);
assert.doesNotMatch(renderedHome, /about-me\.html#person/);

const facts = renderStaticPage('/company-facts.html');
assertCommonSeo(facts, '笠偲咨询');
assert.match(bodyText(facts), /原 www\.ec-in\.cn 已停止使用/);
assert.match(facts, /https:\/\/events\.sap\.cn\/hrconnect-qd-2025\//);
const graph = JSON.parse(facts.match(/data-seo-jsonld>([\s\S]*?)<\/script>/)[1])['@graph'];
assert.strictEqual(graph.find(x => x['@type'] === 'FAQPage').mainEntity.length, 7);
const teamPage = renderStaticPage('/team.html', {}, { team: [{ name: 'xxxxx', bio: '不应公开的占位信息' }] });
assert.match(bodyText(teamPage), /辛笠/);
assert.doesNotMatch(bodyText(teamPage), /xxxxx|不应公开的占位信息/);
console.log('Crawler content and public source checks passed');

const { SERVICE_TOPICS } = require('../lib/service-topics');
for (const [url, topic] of Object.entries(SERVICE_TOPICS)) {
    const html = renderStaticPage(url, {}, { projects: [] });
    assertCommonSeo(html, topic.name);
    assert.match(bodyText(html), /咨询内容/);
    assert.match(bodyText(html), /交付方向/);
    assert.match(bodyText(html), /如何沟通项目需求/);
    assert.match(html, /"@type":"Service"/);
}
const expert = renderStaticPage('/expert-xin-li.html');
assertCommonSeo(expert, '辛笠');
assert.match(bodyText(expert), /中国企业出海的理想与经验/);
assert.match(expert, /"@type":"Person"/);
assert.match(expert, /"@type":"Book"/);
const organizationArticle = renderArticlePage({ id: 12, title: '管理洞察', content: '<p>正文</p>', author: '笠偲咨询' });
assert.doesNotMatch(organizationArticle, /"@type":"Person","name":"笠偲咨询"/);
const disclosedCase = renderProjectPage({ id: 1, title: '匿名案例', client: '某企业', content: '<p>案例正文</p>' });
assert.match(bodyText(disclosedCase), /未披露具体企业名称/);
assert.match(bodyText(disclosedCase), /案例示意图/);
assert.doesNotMatch(bodyText(disclosedCase), /正在加载团队成员/);
console.log('Service topics, expert sources and case disclosure checks passed');

// WebsiteInfo metrics must remain visible and must retain their original units.
for (const route of ['/', '/about-company.html']) {
    const page = renderStaticPage(route, {statExperience:11,statAwards:27,statConsultants:57,statSatisfaction:99});
    for (const [kind,value] of [['experience',11],['awards',27],['consultants',57],['satisfaction',99]]) {
        assert.match(page, new RegExp('data-counter-type="'+kind+'"><div class="company-metric-number"><span class="counter">'+value+'</span>'));
    }
    assert.match(page, /company-metric-unit">%<\/span>/);
    assert.match(page, /客户满意度/);
    const changed = renderStaticPage(route, {statExperience:0,statAwards:8,statConsultants:12,statSatisfaction:95});
    assert.match(changed, /data-counter-type="experience"><div class="company-metric-number"><span class="counter">0<\/span>/);
    assert.match(changed, /data-counter-type="satisfaction"><div class="company-metric-number"><span class="counter">95<\/span>/);
}
console.log('Configured public metrics and percentage units passed');

// Homepage business cards retain editable service content in the raw HTML.
const businessCards = require('../html/js/business-cards');
const editableFeatures = [
    {id:1,title:'海外管理咨询与专业服务',description:'<div>海外并购整合咨询</div><div>海外HRO、EOR</div>',isActive:true,sortOrder:2},
    {id:3,title:'SaaS+AI',description:'<div>笠偲绩效SaaS平台</div>',isActive:true,sortOrder:1},
    {id:2,title:'隐藏模块',description:'不应展示',isActive:false}
];
const cardsHome = renderStaticPage('/', {}, {features:editableFeatures});
assert.match(cardsHome, /business-card--global/);
assert.match(cardsHome, /<li>海外HRO、EOR<\/li>/);
assert.match(cardsHome, /href="\/digital-transformation.html"/);
assert(!cardsHome.includes('隐藏模块'));
assert(cardsHome.indexOf('business-card--digital') < cardsHome.indexOf('business-card--global'));
assert.deepStrictEqual(businessCards.lines('<div>A &amp; B</div><div><br></div><p>服务二</p>'), ['A & B','服务二']);
assert(!businessCards.render([{id:1,title:'<img src=x>',description:'<script>alert(1)</script><div>Safe &amp; readable</div>'}],false).includes('<img'));
console.log('Editable business cards, ordering, links and safe service lists passed');

const categoryFeatures = [
    {id:1,title:'海外管理咨询',description:'<div>海外并购整合咨询</div>',isActive:true,sortOrder:1},
    {id:2,title:'国内管理咨询',description:'<div>组织架构与定岗定编</div>',isActive:true,sortOrder:2},
    {id:3,title:'SaaS + AI',description:'<div>SAP SF系统实施</div>',isActive:true,sortOrder:3}
];
const overview = renderStaticPage('/services.html', {}, {features:categoryFeatures});
assertCommonSeo(overview, '咨询服务');
for (const item of categoryFeatures) assert(overview.includes(item.title));
assert.match(overview,/id="serviceCategoriesContainer" data-server-rendered="true"/);
assert.match(overview,/data-category="digital"/);
assert.match(overview,/href="\/contacts.html"/);
assert.match(overview,/<li>组织架构与定岗定编<\/li>/);
for (const [name,href] of [['海外业务','overseas-consulting.html'],['数字化转型','digital-transformation.html'],['组织与人力优化','organization-hr.html']]) {
    assert(renderServicePage({id:10,title:name,description:'Legacy description'}).includes(href));
}
console.log('Unified service overview and legacy detail links passed');

// Domestic service pages must be discoverable and must not borrow overseas cases as evidence.
const mixedCases = [
    { id: 81, title: '海外组织与薪酬绩效优化', category: '企业出海' },
    { id: 82, title: '企业薪酬绩效优化', category: '国内管理' },
    { id: 83, title: '国企三项制度改革', category: '国内管理' }
];
for (const route of ['/organization-hr.html', '/soe-reform.html', '/compensation-performance.html']) {
    const html = renderStaticPage(route, {}, {projects:mixedCases});
    assertCommonSeo(html, SERVICE_TOPICS[route].name);
    assert.doesNotMatch(html, /single-project\.html\?id=81/);
    const schema = JSON.parse(html.match(/data-seo-jsonld>([\s\S]*?)<\/script>/)[1]);
    assert(schema['@graph'].some(item => item['@type'] === 'Service' && item.url.endsWith(route)));
    for (const [q,a] of SERVICE_TOPICS[route].faq) {
        assert(bodyText(html).includes(q));
        assert(bodyText(html).includes(a));
    }
}
assert(renderStaticPage('/compensation-performance.html', {}, {projects:mixedCases}).includes('single-project.html?id=82'));
assert(renderStaticPage('/soe-reform.html', {}, {projects:mixedCases}).includes('single-project.html?id=83'));
for (const route of ['/services.html', '/company-facts.html', '/about-company.html']) {
    const html = renderStaticPage(route);
    for (const target of ['/soe-reform.html', '/compensation-performance.html']) assert(html.includes(`href="${target}"`));
}
const profile = renderStaticPage('/about-company.html', {}, {company:{content:'<p>已有公司介绍保留。</p>'}});
assert.match(bodyText(profile), /总部位于山东烟台的本土企业管理咨询公司/);
assert.match(bodyText(profile), /已有公司介绍保留/);
const homeMain = home.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
assert(!homeMain.includes('href="/soe-reform.html"'), 'Do not add a domestic expertise block to the homepage');
console.log('Domestic positioning, internal discovery, schema/body consistency and case relevance passed');
