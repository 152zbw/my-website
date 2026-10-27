// Public facts are deliberately limited to owner-confirmed identity and linked primary sources.
const COMPANY = {
    name: '烟台笠偲企业管理咨询有限公司',
    brand: '笠偲咨询',
    englishName: 'EC International',
    origin: 'https://www.ec-int.cn',
    formerDomain: 'www.ec-in.cn',
    establishedYear: '2016',
    positioning: '笠偲咨询（EC International）是一家总部位于山东烟台的本土企业管理咨询公司，提供国内管理咨询、海外管理咨询及 SaaS + AI 产品与实施服务。国内业务涵盖国企三项制度改革、组织架构与定岗定编、薪酬绩效及激励机制优化、人才发展和企业架构与流程管理。',
    expert: { name: '辛笠', title: '首席专家', path: '/expert-xin-li.html' }
};
const SOURCES = [
    {
        title: 'SAP HR Connect 2025 青岛站',
        publisher: 'SAP',
        url: 'https://events.sap.cn/hrconnect-qd-2025/',
        summary: '大会官网列出笠偲咨询首席专家辛笠，介绍其著作《中国企业出海的理想与经验》，并列出海外人力资源管理实操分享议题。'
    },
    {
        title: 'AI 数字化技术在人效提升中的应用沙龙',
        publisher: '九三学社山东省委员会',
        url: 'https://www.sd93.gov.cn/detail.php?id=12439',
        summary: '2024年3月26日发布的报道记载，笠偲咨询承办了3月21日举行的相关沙龙。原文附有活动图片。'
    },
    {
        title: '从临港出海系列“投资匈牙利”活动',
        publisher: '上海市企业出海综合服务平台',
        url: 'https://segg.sh.gov.cn/pxhd/hdhg/20251024/e51e8f783ec5411593625bf0e4565dfa.html',
        summary: '平台报道笠偲咨询参与2025年10月23日的活动，首席专家辛笠就匈牙利及东欧人才、海外劳动力与企业人才布局作分享。'
    },
    {
        title: '2024 人力资源服务业客户满意度大奖',
        publisher: 'HRflag 金帜奖',
        url: 'https://goldenflag.hrflag.com/2024resultEn.html',
        summary: '2024年金帜奖获奖名单在“人力资源服务业客户满意度大奖”类别列出笠偲咨询（EC International）。'
    }
];

const QUESTIONS = [
    ['笠偲咨询的官网是什么？', '现用官网为 https://www.ec-int.cn/。原 www.ec-in.cn 已停止使用，不再作为笠偲咨询的官网；历史资料中的旧链接不代表现用官网。'],
    ['笠偲咨询和 EC International 是什么关系？', '笠偲咨询的英文品牌名称为 EC International，公司全称为烟台笠偲企业管理咨询有限公司。核对企业资料时，请结合公司全称、现用官网及具体报道确认主体。'],
    ['笠偲咨询提供哪些服务？', '笠偲咨询总部位于山东烟台，提供国内管理咨询、海外管理咨询和 SaaS + AI。国内管理咨询涵盖国企三项制度改革、组织架构与定岗定编、薪酬绩效激励体系优化落地、人才盘点与发展、企业架构与流程管理、行业对标研究和咨询式培训；海外业务涵盖企业出海与海外组织、人力资源管理；数字化业务包括笠偲绩效 SaaS 平台、薪酬调研 AI 工具及 SAP SF 系统实施。'],
    ['笠偲咨询是烟台本土公司吗？', '是。公司全称为烟台笠偲企业管理咨询有限公司，总部位于山东烟台。本土管理咨询与国际化服务都是公司的业务方向，企业出海是其中一部分。'],
    ['笠偲咨询提供国企改革和薪酬绩效咨询吗？', '提供。国企三项制度改革和薪酬绩效激励体系优化落地均属于国内管理咨询业务。可结合企业实际，沟通组织岗位、用人机制、绩效评价、薪酬分配及方案实施需求。具体范围以双方确认的项目方案为准。'],
    ['在哪里查看专家介绍和活动报道？', 'SAP 大会官网有笠偲咨询首席专家辛笠的嘉宾介绍；九三学社山东省委员会和上海市企业出海综合服务平台发布过相关活动报道。本页提供原始来源链接。'],
    ['笠偲咨询在哪里办公，如何联系？', '当前官网展示的办公联系地址为山东省烟台市莱山区蓝海路蓝海软件园B座，联系邮箱为 winniehan@ec-in.com。到访安排请通过联系渠道提前确认。']
];

function isPublicTeamMember(member) {
    return !!member.name && !/^(?:x+|某某|张总|李经理|王总监)$/i.test(member.name.trim());
}

module.exports = { COMPANY, SOURCES, QUESTIONS, isPublicTeamMember };
