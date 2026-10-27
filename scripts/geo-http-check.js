// Read-only checks against a running staging or production server.
const assert = require('assert');
const origin = process.argv[2] || 'http://127.0.0.1:3107';
const publicOrigin = 'https://www.ec-int.cn';
const bodyText = html => html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' ');

async function run() {
    const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
    assert.strictEqual(sitemapResponse.status, 200);
    const sitemap = await sitemapResponse.text();
    const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'));
    assert(urls.includes(`${publicOrigin}/company-facts.html`));
    for (const pathname of ['/expert-xin-li.html', '/overseas-consulting.html', '/organization-hr.html', '/digital-transformation.html', '/soe-reform.html', '/compensation-performance.html', '/iaeste-internship.html']) assert(urls.includes(`${publicOrigin}${pathname}`));
    assert(!urls.some(url => url.includes('about-me.html')));
    for (const url of urls) {
        const pathname = url.slice(publicOrigin.length);
        const response = await fetch(`${origin}${pathname}`, { redirect: 'manual' });
        assert.strictEqual(response.status, 200, pathname);
        const html = await response.text();
        assert.strictEqual((html.match(/<link rel="canonical"/g) || []).length, 1, pathname);
        assert(html.includes(`href="${url.replaceAll('&', '&amp;')}"`), `${pathname} canonical`);
        assert.strictEqual((html.match(/<h1\b/gi) || []).length, 1, `${pathname} h1`);
        assert(!/内容加载中|正在加载合作伙伴|正在加载团队成员|笠偌咨询|xxxxx/.test(bodyText(html)), `${pathname} placeholder`);
        for (const match of html.matchAll(/<script type="application\/ld\+json" data-seo-jsonld>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
        console.log(`PASS ${pathname}`);
    }
    for (const [path, marker] of [
        ['/', '笠偲咨询'],
        ['/services.html', '海外管理咨询'],
        ['/services.html', '国内管理咨询'],
        ['/services.html', 'SaaS + AI'],
        ['/team.html', '辛笠'],
        ['/company-facts.html', '原 www.ec-in.cn 已停止使用'],
        ['/company-facts.html', '总部位于山东烟台'],
        ['/soe-reform.html', '国企三项制度改革'],
        ['/compensation-performance.html', '薪酬绩效与激励'],
        ['/iaeste-internship.html', '海外实习生接收'],
        ['/iaeste-internship.html', 'Co-operating Institution']
    ]) {
        assert(bodyText(await (await fetch(`${origin}${path}`)).text()).includes(marker), `${path} crawler-visible content`);
    }
    for (const type of ['service', 'project', 'blog-post', 'job']) {
        const response = await fetch(`${origin}/single-${type}.html?id=0`);
        assert.strictEqual(response.status, 404);
        assert((await response.text()).includes('noindex'));
    }
    for (const path of ['/about-me.html', '/html/about-me.html']) {
        const response = await fetch(`${origin}${path}`, { redirect: 'manual' });
        assert.strictEqual(response.status, 301);
        assert.strictEqual(response.headers.get('location'), '/company-facts.html#xin-li');
    }
    const robots = await (await fetch(`${origin}/robots.txt`)).text();
    assert(robots.includes(`Sitemap: ${publicOrigin}/sitemap.xml`));
    assert(!robots.includes('Disallow: /about-me.html'));
    assert(robots.includes('Disallow: /admin/'));
    const machineDirectory = await fetch(`${origin}/llms.txt`);
    assert.strictEqual(machineDirectory.status, 200);
    assert((await machineDirectory.text()).includes('company-facts.html'));
    console.log(`Validated ${urls.length} sitemap pages, structured data, redirects, invalid IDs, robots and content directory.`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
