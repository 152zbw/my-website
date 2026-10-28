// Add only the new application table and one requested role. Existing roles are never overwritten.
const sequelize = require('../config/db');
const Application = require('../models/Application');
const Career = require('../models/Career');
async function run() {
    await Application.sync();
    await Career.sync();
    const [career,created] = await Career.findOrCreate({where:{title:'咨询顾问'},defaults:{
        jobType:'全职',location:'烟台',isActive:1,sortOrder:0,
        description:'<h3>岗位职责</h3><ul><li>参与企业管理咨询项目，开展资料研究、访谈支持与数据分析。</li><li>围绕组织与岗位、薪酬绩效、人才发展或企业国际化等方向，协助梳理问题、形成方案与项目材料。</li><li>与项目团队协作，支持客户沟通、方案实施及阶段复盘。</li></ul><h3>我们期待</h3><ul><li>具备清晰的分析思路、文字表达能力和良好的沟通协作能力。</li><li>愿意深入理解企业业务，能够认真完成研究与交付工作。</li><li>有管理咨询、人力资源或企业管理相关经历者，欢迎结合专长介绍项目经验。</li></ul><p>工作地点：烟台。具体岗位级别、薪酬及工作安排在沟通中确认。欢迎通过官网提交个人资料与简历。</p>'
    }});
    console.log(JSON.stringify({applicationTable:'ready',consultantId:career.id,created}));
}
if(require.main===module)run().then(()=>sequelize.close()).catch(async error=>{console.error('招聘初始化失败:',error.name);await sequelize.close();process.exitCode=1;});
module.exports = run;
