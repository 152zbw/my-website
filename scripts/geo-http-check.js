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
        assert(html.includes('rel="icon" href="/favicon.ico"'), `${pathname} favicon`);
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
    assert.strictEqual((await fetch(`${origin}/data/database.sqlite`, {method:'HEAD'})).status, 404, 'database is not public');
    assert.strictEqual((await fetch(`${origin}/data/world-countries-110m.geojson`, {method:'HEAD'})).status, 200, 'public map remains available');
    const robots = await (await fetch(`${origin}/robots.txt`)).text();
    for (const agent of ['Mozilla/5.0', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)']) {
        const icon = await fetch(`${origin}/favicon.ico`, {headers:{'User-Agent':agent}});
        assert.strictEqual(icon.status, 200, 'favicon crawl access');
        assert(/image\/(?:x-icon|vnd.microsoft.icon)/i.test(icon.headers.get('content-type')), 'favicon MIME');
        const bytes = new Uint8Array(await icon.arrayBuffer());
        assert(bytes.length > 6 && bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0, 'valid ICO signature');
    }
    assert(robots.includes(`Sitemap: ${publicOrigin}/sitemap.xml`));
    assert(!robots.includes('Disallow: /about-me.html'));
    assert(robots.includes('Disallow: /admin/'));
    const machineDirectory = await fetch(`${origin}/llms.txt`);
    assert.strictEqual(machineDirectory.status, 200);
    assert((await machineDirectory.text()).includes('company-facts.html'));
    console.log(`Validated ${urls.length} sitemap pages, structured data, redirects, invalid IDs, robots and content directory.`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
