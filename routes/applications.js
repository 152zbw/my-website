const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const {randomUUID} = require('crypto');
const Application = require('../models/Application');
const Career = require('../models/Career');
const {authenticateToken, authorizeAdmin} = require('../middleware/auth');
const router = express.Router();
const resumeDir = path.resolve(process.env.APPLICATION_STORAGE_DIR || path.join(__dirname,'../private/applications'));
const upload = multer({storage:multer.memoryStorage(), limits:{fileSize:5*1024*1024,files:1,fields:12,fieldSize:40000}}).single('resume');
const attempts = new Map();
router.use((req,res,next)=>{res.set('Cache-Control','no-store');next();});

router.post('/', (req,res,next)=>{
    const now = Date.now();
    for (const [ip,item] of attempts) if (item.until <= now) attempts.delete(ip);
    const item = attempts.get(req.ip) || {count:0,until:now+15*60*1000};
    if (item.count >= 15) return res.status(429).json({message:'提交过于频繁，请稍后重试。'});
    item.count++; attempts.set(req.ip,item);
    upload(req,res,error=>{
        if (error) return res.status(400).json({message:error.code==='LIMIT_FILE_SIZE'?'简历不能超过 5MB。':'资料格式不正确，请重新选择文件或精简内容。'});
        next();
    });
}, async(req,res)=>{
    let savedFile;
    try {
        const values = {};
        for (const [key,max] of Object.entries({name:100,email:150,phone:30,city:80,experience:80,direction:120,profile:8000})) {
            const value = req.body?.[key];
            if (value != null && typeof value !== 'string') return res.status(400).json({message:'填写内容格式不正确。'});
            values[key] = (value || '').trim();
            if (values[key].length>max) return res.status(400).json({message:'填写内容超出长度限制，请精简后提交。'});
        }
        if (req.body.website) return res.status(400).json({message:'提交未通过验证，请刷新页面重试。'});
        if (!values.name || !values.direction || values.profile.length<20 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return res.status(400).json({message:'请填写姓名、有效邮箱、意向方向及至少20字的经历介绍。'});
        if (req.body.consent !== 'true') return res.status(400).json({message:'请先阅读并同意招聘资料使用说明。'});
        let careerId = null, position = values.direction;
        if (req.body.careerId) {
            if (!/^\d+$/.test(String(req.body.careerId))) return res.status(400).json({message:'请选择有效岗位或开放申请。'});
            const career = await Career.findOne({where:{id:Number(req.body.careerId),isActive:1}});
            if (!career) return res.status(400).json({message:'该岗位已调整，请选择开放申请后重新提交。'});
            careerId = career.id; position = career.title;
        }
        if (req.file && (path.extname(req.file.originalname).toLowerCase()!=='.pdf' || req.file.buffer.subarray(0,5).toString()!=='%PDF-')) return res.status(400).json({message:'简历附件仅支持有效的 PDF 文件。'});
        if (req.file) {
            await fs.mkdir(resumeDir,{recursive:true,mode:0o700});
            savedFile = `${randomUUID()}.pdf`;
            await fs.writeFile(path.join(resumeDir,savedFile),req.file.buffer,{mode:0o600,flag:'wx'});
        }
        await Application.create({...values,position,careerId,consentAt:new Date(),resumeFile:savedFile || null,resumeName:req.file ? '个人简历.pdf' : null,status:0});
        res.status(201).json({message:'资料已提交成功。我们会结合岗位需求评估，合适时通过您留下的联系方式联系。'});
    } catch(error) {
        if (savedFile) await fs.unlink(path.join(resumeDir,savedFile)).catch(()=>{});
        console.error('求职资料保存失败:',error.name);
        res.status(500).json({message:'资料暂未提交成功，请稍后重试。页面内容可保留后再次提交。'});
    }
});

router.use(authenticateToken,authorizeAdmin);
router.get('/',async(req,res)=>{
    try {
        const page = Math.max(1,Math.min(100000,parseInt(req.query.page,10)||1));
        const where = {};
        if (['0','1','2'].includes(req.query.status)) where.status=Number(req.query.status);
        const result = await Application.findAndCountAll({where,order:[['createdAt','DESC'],['id','DESC']],limit:25,offset:(page-1)*25,attributes:{exclude:['resumeFile']}});
        res.json({total:result.count,page,pageSize:25,items:result.rows.map(row=>({...row.toJSON(),hasResume:!!row.resumeName}))});
    } catch(error) {res.status(500).json({message:'读取求职申请失败。'});}
});
router.get('/:id/resume',async(req,res)=>{
    try {
        const row = await Application.findByPk(req.params.id);
        if (!row?.resumeFile) return res.status(404).json({message:'没有简历附件。'});
        if (!/^[a-f0-9-]+\.pdf$/.test(row.resumeFile)) return res.status(404).end();
        res.set('Cache-Control','no-store').set('X-Content-Type-Options','nosniff');
        res.download(path.join(resumeDir,row.resumeFile),`resume-${row.id}.pdf`,error=>{if(error&&!res.headersSent)res.status(404).json({message:'简历文件暂不可用。'});});
    } catch(error) {if(!res.headersSent)res.status(500).json({message:'下载简历失败。'});}
});
router.patch('/:id',async(req,res)=>{
    try {
        if (![0,1,2].includes(req.body.status)) return res.status(400).json({message:'无效处理状态。'});
        const row = await Application.findByPk(req.params.id);
        if (!row) return res.status(404).json({message:'申请不存在。'});
        await row.update({status:req.body.status});res.json({message:'已更新处理状态。'});
    } catch(error) {res.status(500).json({message:'更新失败。'});}
});
router.delete('/:id',async(req,res)=>{
    try {
        const row = await Application.findByPk(req.params.id);
        if (!row) return res.status(404).json({message:'申请不存在。'});
        if (row.resumeFile && /^[a-f0-9-]+\.pdf$/.test(row.resumeFile)) await fs.unlink(path.join(resumeDir,row.resumeFile)).catch(error=>{if(error.code!=='ENOENT')throw error;});
        await row.destroy();res.json({message:'资料及简历附件已删除。'});
    } catch(error) {res.status(500).json({message:'删除失败，请稍后重试。'});}
});
module.exports = router;
