// 数据库初始化脚本 - 创建默认管理员用户 + 示例数据
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const WebsiteInfo = require('./models/WebsiteInfo');
const Service = require('./models/Service');
const Project = require('./models/Project');
const News = require('./models/News');
const Testimonial = require('./models/Testimonial');
const Partner = require('./models/Partner');
const Team = require('./models/Team');
const About = require('./models/About');
const Navigation = require('./models/Navigation');
const sequelize = require('./config/db');

async function initDatabase() {
    try {
        console.log('开始初始化数据库...');
        
        // 同步数据库模型
        await sequelize.sync({ alter: true });
        console.log('数据库模型同步成功');

        // 检查是否已有管理员用户
        const existingUser = await User.findOne({ where: { username: 'admin' } });
        
        if (!existingUser) {
            // 创建默认管理员用户（用户名: admin, 密码: admin123）
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                name: '管理员',
                email: 'admin@example.com',
                role: 'admin',
                isActive: 1
            });
            console.log('默认管理员用户创建成功');
            console.log('用户名: admin');
            console.log('密码: admin123');
            console.log('⚠️  请在生产环境中修改默认密码！');
        } else {
            console.log('管理员用户已存在，跳过创建');
        }

        // 检查是否已有网站信息
        const existingInfo = await WebsiteInfo.findOne();
        if (!existingInfo) {
            await WebsiteInfo.create({
                title: '咨询公司官网 - 专业的商业咨询服务',
                description: '专业的商业咨询服务，包括战略规划、市场分析、管理咨询等，帮助企业实现可持续发展。',
                keywords: '咨询公司,商业咨询,战略规划,市场分析,管理咨询',
                phone: '+86-400-123-4567',
                email: 'info@consulting.com',
                address: '北京市朝阳区建国路88号',
                logo: 'images/ce-logo.png',
                favicon: 'images/favicon.ico',
                heroTitle: '专业咨询',
                heroSubtitle: '战略规划',
                heroDescription: '我们公司提供各类专业咨询和规划服务，帮助全球中小企业实现可持续发展。',
                heroButtonText: '了解更多',
                heroButtonLink: '#',
                statAwards: 12,
                statSatisfaction: 99,
                statExperience: 15,
                statConsultants: 54
            });
            console.log('默认网站信息创建成功');
        } else {
            console.log('网站信息已存在，跳过创建');
        }

        // 示例服务项目
        const serviceCount = await Service.count();
        if (serviceCount === 0) {
            await Service.bulkCreate([
                {
                    title: '战略咨询',
                    icon: '📊',
                    description: '为企业提供整体发展战略规划，帮助明确方向与路径。',
                    content: '从行业研究、竞争分析到战略落地路径设计，提供一站式战略咨询服务。',
                    sortOrder: 1
                },
                {
                    title: '数字化转型',
                    icon: '💻',
                    description: '围绕业务场景设计数字化解决方案，提升运营效率。',
                    content: '评估现有IT与业务流程，规划数字化蓝图，分阶段实施与落地。',
                    sortOrder: 2
                },
                {
                    title: '组织与人力优化',
                    icon: '👥',
                    description: '优化组织架构与人才体系，提升团队协同与执行力。',
                    content: '从组织设计、岗位职责梳理到绩效与激励机制搭建，形成闭环管理体系。',
                    sortOrder: 3
                }
            ]);
            console.log('示例服务项目创建成功');
        }

        // 示例案例项目
        const projectCount = await Project.count();
        if (projectCount === 0) {
            await Project.bulkCreate([
                {
                    title: '华东制造集团供应链优化项目',
                    category: '供应链优化',
                    image: 'images/grid-layout-1-370x256.jpg',
                    description: '通过供应链诊断与流程重构，将库存周转天数降低 35%。',
                    content: '项目从需求预测、采购策略、库存策略与物流网络四个维度进行系统性优化……',
                    client: '华东制造集团',
                    sortOrder: 1
                },
                {
                    title: '互联网金融公司数字化运营中台建设',
                    category: '数字化转型',
                    image: 'images/grid-layout-2-370x256.jpg',
                    description: '搭建统一的运营数据中台，实现多渠道业务的实时监控与分析。',
                    content: '围绕“一个数据底座 + 多业务应用”的思路，重构数据采集、加工与应用体系……',
                    client: '某互联网金融公司',
                    sortOrder: 2
                }
            ]);
            console.log('示例案例项目创建成功');
        }

        // 示例新闻
        const newsCount = await News.count();
        if (newsCount === 0) {
            await News.bulkCreate([
                {
                    title: '2025 企业数字化转型五大趋势',
                    image: 'images/blog-1.jpg',
                    excerpt: '云原生、AI 应用、数据治理、流程自动化与安全合规将成为企业关注重点……',
                    content: '<p>随着技术与商业环境的变化，数字化转型已经从“是否做”转为“如何做”……</p>',
                    author: '咨询研究院',
                    sortOrder: 1
                },
                {
                    title: '供应链韧性建设实践案例分享',
                    image: 'images/blog-2.jpg',
                    excerpt: '通过多地点布局与风险预警机制，提升供应链整体抗风险能力。',
                    content: '<p>在全球不确定性增强的背景下，供应链韧性成为企业核心竞争力的重要组成部分……</p>',
                    author: '高级合伙人',
                    sortOrder: 2
                }
            ]);
            console.log('示例新闻创建成功');
        }

        // 示例客户评价
        const testimonialCount = await Testimonial.count();
        if (testimonialCount === 0) {
            await Testimonial.bulkCreate([
                {
                    name: '张总',
                    position: '某制造集团 CEO',
                    company: '华东制造集团',
                    image: 'images/avatar-1.jpg',
                    content: '通过这次战略与供应链咨询，我们的库存周转效率明显提升，整体运营更加稳健。',
                    sortOrder: 1
                },
                {
                    name: '李总',
                    position: '互联网金融公司 COO',
                    company: 'XX 金融',
                    image: 'images/avatar-2.jpg',
                    content: '团队既懂业务又懂技术，帮助我们快速搭建了运营中台，决策效率提升非常明显。',
                    sortOrder: 2
                }
            ]);
            console.log('示例客户评价创建成功');
        }

        // 示例合作伙伴
        const partnerCount = await Partner.count();
        if (partnerCount === 0) {
            await Partner.bulkCreate([
                {
                    name: '华为',
                    logo: 'images/partners-1-270x145.png',
                    website: 'https://www.huawei.com',
                    sortOrder: 1
                },
                {
                    name: '阿里云',
                    logo: 'images/partners-2-270x145.png',
                    website: 'https://www.aliyun.com',
                    sortOrder: 2
                }
            ]);
            console.log('示例合作伙伴创建成功');
        }

        // 示例团队成员
        const teamCount = await Team.count();
        if (teamCount === 0) {
            await Team.bulkCreate([
                {
                    name: '王伟',
                    position: '首席顾问 / 战略与组织',
                    image: 'images/team-1-270x273.jpg',
                    bio: '15 年管理咨询经验，专注战略规划与组织变革项目。',
                    sortOrder: 1
                },
                {
                    name: '刘敏',
                    position: '合伙人 / 数字化转型',
                    image: 'images/team-2-270x273.jpg',
                    bio: '曾主导多家大型企业的数字化与数据治理项目。',
                    sortOrder: 2
                }
            ]);
            console.log('示例团队成员创建成功');
        }

        // 示例“关于我们”
        const aboutCount = await About.count();
        if (aboutCount === 0) {
            await About.create({
                title: '关于我们',
                content: '我们是一家专注于为企业提供战略规划、数字化转型、组织与人力优化等全方位服务的综合型咨询公司。',
                image: 'images/about-1-570x368.jpg'
            });
            console.log('示例关于我们创建成功');
        }

        // 示例导航数据
        const navigationCount = await Navigation.count();
        if (navigationCount === 0) {
            await Navigation.bulkCreate([
                // 一级导航
                { id: 1, name: '首页', url: 'index.html', group: '', parentId: null, order: 1, status: 1 },
                { id: 2, name: '服务项目', url: 'services.html', group: '2', parentId: null, order: 2, status: 1 },
                { id: 3, name: '博客', url: 'sidebar-blog.html', group: '3', parentId: null, order: 3, status: 1 },
                { id: 4, name: '成功案例', url: 'grid-gallery.html', group: '4', parentId: null, order: 4, status: 1 },
                { id: 5, name: '关于我们', url: 'about.html', group: '5', parentId: null, order: 5, status: 1 },
                { id: 6, name: '联系我们', url: 'contacts.html', group: '', parentId: null, order: 6, status: 1 },
                // 二级导航 - 成功案例
                { id: 7, name: '案例展示', url: 'grid-gallery.html', group: '4', parentId: 4, order: 1, status: 1 },
                { id: 8, name: '案例详情', url: 'single-project.html', group: '4', parentId: 4, order: 2, status: 1 },
                // 二级导航 - 博客
                { id: 9, name: '博客列表', url: 'sidebar-blog.html', group: '3', parentId: 3, order: 1, status: 1 },
                { id: 10, name: '博客详情', url: 'single-blog-post.html', group: '3', parentId: 3, order: 2, status: 1 },
                // 二级导航 - 关于我们（仅4项：关于我们、公司简介、个人简介、招贤纳士）
                { id: 11, name: '公司简介', url: 'about-company.html', group: '5', parentId: 5, order: 2, status: 1 },
                { id: 12, name: '个人简介', url: 'about-me.html', group: '5', parentId: 5, order: 3, status: 1 },
                { id: 13, name: '关于我们', url: 'about.html', group: '5', parentId: 5, order: 1, status: 1 },
                { id: 14, name: '招贤纳士', url: 'careers.html', group: '5', parentId: 5, order: 4, status: 1 },
                // 二级导航 - 服务
                { id: 15, name: '服务项目', url: 'services.html', group: '2', parentId: 2, order: 1, status: 1 },
                { id: 16, name: '服务详情', url: 'single-service.html', group: '2', parentId: 2, order: 2, status: 1 }
            ]);
            console.log('示例导航数据创建成功');
        }

        console.log('数据库初始化完成！');
        process.exit(0);
    } catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1);
    }
}

initDatabase();


