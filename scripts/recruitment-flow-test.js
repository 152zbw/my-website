// All submissions and attachments in this test stay in an isolated temporary database/directory.
const assert = require('assert');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const {spawn,execFileSync} = require('child_process');
const jwt = require('jsonwebtoken');
const {chromium} = require('playwright');

async function run(){
    const temp = await fs.mkdtemp(path.join(os.tmpdir(),'lisi-recruitment-'));
    const port=3121,origin=`http://127.0.0.1:${port}`;
    const env={...process.env,DB_DIALECT:'sqlite',SQLITE_PATH:path.join(temp,'test.sqlite'),APPLICATION_STORAGE_DIR:path.join(temp,'resumes'),JWT_SECRET:'isolated-recruitment-test-secret',PORT:String(port),NODE_ENV:'production'};
    const root=path.join(__dirname,'..');
    execFileSync(process.execPath,['scripts/init-recruitment.js'],{cwd:root,env,stdio:'pipe'});
    const second=execFileSync(process.execPath,['scripts/init-recruitment.js'],{cwd:root,env,encoding:'utf8'});
    assert(second.includes('"created":false'));
    const child=spawn(process.execPath,['app.js'],{cwd:root,env,stdio:['ignore','pipe','pipe']});
    let logs='';child.stdout.on('data',b=>{logs+=b;});child.stderr.on('data',b=>{logs+=b;});
    let browser;
    const token=jwt.sign({id:1,role:'admin'},env.JWT_SECRET);
    const headers={Authorization:`Bearer ${token}`};
    try{
        for(let n=0;n<80;n++){
            try{if((await fetch(origin+'/careers.html')).status===200)break;}catch(_){}
            if(n===79)throw new Error('Test server not ready: '+logs.slice(-1500));
            await new Promise(r=>setTimeout(r,250));
        }
        const careers=await(await fetch(origin+'/api/careers')).json();assert.equal(careers.length,1);const career=careers[0];
        assert.equal((await fetch(origin+'/data/database.sqlite',{method:'HEAD'})).status,404);
        assert.equal((await fetch(origin+'/data/world-countries-110m.geojson',{method:'HEAD'})).status,200);
        assert.equal((await fetch(origin+'/api/applications')).status,401);
        function form(extra={},resume){const data=new FormData();for(const [k,v]of Object.entries({name:'流程测试用户',email:'recruitment-test@example.invalid',direction:'咨询顾问',profile:'用于验证招聘资料提交链路的临时测试内容，不是真实求职资料。',consent:'true',...extra}))data.set(k,v);if(resume)data.set('resume',new Blob([resume],{type:'application/pdf'}),'resume.pdf');return data;}
        assert.equal((await fetch(origin+'/api/applications',{method:'POST',body:form({consent:'false'})})).status,400);
        assert.equal((await fetch(origin+'/api/applications',{method:'POST',body:form({},'not a PDF')})).status,400);
        assert.equal((await fetch(origin+'/api/applications',{method:'POST',body:form({},'%PDF-'+ 'x'.repeat(5*1024*1024))})).status,400);
        assert.equal((await fetch(origin+'/api/applications',{method:'POST',body:form({profile:'太短'})})).status,400);
        const posted=await fetch(origin+'/api/applications',{method:'POST',body:form({careerId:String(career.id)},'%PDF-1.4\nrecruitment test\n%%EOF')});assert.equal(posted.status,201);assert(!JSON.stringify(await posted.json()).includes('example.invalid'));
        let list=await(await fetch(origin+'/api/applications',{headers})).json();assert.equal(list.total,1);let row=list.items[0];assert.equal(row.position,'咨询顾问');assert(row.hasResume);assert(!('resumeFile'in row));
        assert.equal((await fetch(origin+`/api/applications/${row.id}/resume`)).status,401);
        const download=await fetch(origin+`/api/applications/${row.id}/resume`,{headers});assert.equal(download.status,200);assert((await download.text()).startsWith('%PDF-'));assert.equal(download.headers.get('cache-control'),'no-store');
        const limited=jwt.sign({id:2,role:'user'},env.JWT_SECRET);assert.equal((await fetch(origin+'/api/applications',{headers:{Authorization:`Bearer ${limited}`}})).status,403);
        assert.equal((await fetch(origin+`/api/applications/${row.id}`,{method:'PATCH',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({status:1})})).status,200);
        browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
        const context=await browser.newContext();const page=await context.newPage();
        for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.goto(origin+'/careers.html',{waitUntil:'networkidle'});assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));await page.locator('[data-apply-career]').click();assert.equal(await page.locator('#applicationCareer').inputValue(),String(career.id));await fs.mkdir(path.join(root,'artifacts/recruitment-20261027'),{recursive:true});await page.screenshot({path:path.join(root,`artifacts/recruitment-20261027/careers-${width}.png`),fullPage:true});}
        await page.goto(origin+`/single-job.html?id=${career.id}`,{waitUntil:'networkidle'});await page.locator('#jobApplyLink').click();await page.waitForLoadState('networkidle');assert.equal(await page.locator('#applicationCareer').inputValue(),String(career.id));
        // Empty jobs must retain the same working application form.
        const update=await fetch(origin+`/api/careers/${career.id}`,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({...career,isActive:0})});assert.equal(update.status,200);
        await page.goto(origin+'/careers.html',{waitUntil:'networkidle'});assert((await page.locator('#careersList').innerText()).includes('开放申请'));assert.equal(await page.locator('#applicationForm').count(),1);
        await page.locator('[name=name]').fill('无岗位流程测试');await page.locator('[name=email]').fill('no-job-test@example.invalid');await page.locator('[name=direction]').fill('组织与人才咨询');await page.locator('[name=profile]').fill('验证没有开放职位时，申请者依然可以填写个人经历并成功提交资料。');await page.locator('[name=consent]').check();await page.locator('#applicationForm button[type=submit]').click();await page.waitForFunction(()=>document.getElementById('applicationStatus').classList.contains('success'));assert((await page.locator('#applicationStatus').innerText()).includes('提交成功'));
        list=await(await fetch(origin+'/api/applications',{headers})).json();assert.equal(list.total,2);assert.equal(list.items[0].careerId,null);
        await page.addInitScript(t=>localStorage.setItem('adminToken',t),token);await page.goto(origin+'/admin/careers.html',{waitUntil:'networkidle'});assert.equal(await page.locator('a[href="applications.html"]').count(),1);await page.locator('a[href="applications.html"]').click();await page.waitForSelector('#rows tr');await page.locator('#rows button').first().click();assert((await page.locator('#fields').innerText()).includes('无岗位流程测试'));await page.locator('#close').click();await page.screenshot({path:path.join(root,'artifacts/recruitment-20261027/admin-applications.png'),fullPage:true});
        for(const item of list.items)assert.equal((await fetch(origin+`/api/applications/${item.id}`,{method:'DELETE',headers})).status,200);
        assert.equal((await fs.readdir(path.join(temp,'resumes'))).length,0);
        console.log('PASS: role initialization is idempotent; validation, private PDF storage, admin permissions, status and deletion work.');
        console.log('PASS: role application and no-vacancy application both persist; mobile layout and admin review work.');
    }finally{if(browser)await browser.close();child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));await fs.rm(temp,{recursive:true,force:true});}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
