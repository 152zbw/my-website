(function () {
  const navTranslations = {
    '首页': 'Home',
    '服务': 'Services',
    '服务项目': 'Services',
    '服务详情': 'Service Details',
    '博客': 'Blog',
    '博客列表': 'Blog List',
    '博客详情': 'Blog Details',
    '单篇博客': 'Blog Post',
    '成功案例': 'Case Studies',
    '案例展示': 'Case Studies',
    '案例详情': 'Project Details',
    '关于我们': 'About Us',
    '公司简介': 'Company Profile',
    '个人简介': 'Personal Profile',
    '招贤纳士': 'Careers',
    '团队成员': 'Team',
    '联系我们': 'Contact Us',
    '隐私政策': 'Privacy Policy',
    '快速链接': 'Quick Links',
    '关注我们': 'Follow Us',
    '查看详情': 'View Details',
    '了解更多': 'Learn More',
    '查看所有博客': 'View All Blogs',
    '免费咨询': 'Free Consultation',
    '发送消息': 'Send Message',
    '电子邮箱': 'Email',
    '电话': 'Phone',
    '留言内容': 'Message',
    '姓': 'First Name',
    '名': 'Last Name',
    '信使': 'Messenger',
    '客户评价': 'Testimonials',
    '我们的服务': 'Our Services',
    '我们的成就': 'Our Achievements',
    '获得奖项': 'Awards',
    '客户满意度': 'Client Satisfaction',
    '行业经验': 'Industry Experience',
    '专业顾问': 'Professional Consultants',
    '合作伙伴': 'Partners',
    '搜索...': 'Search...'
  };

  const phraseTranslations = {
    '自2016年成立以来，我们的团队取得了丰硕的成果。以下是关于我们咨询公司的一些统计数据和有趣事实。': 'Since our establishment in 2016, our team has achieved fruitful results. Here are some statistics and facts about our consulting company.',
    '助力全球企业成长': 'Helping Global Businesses Grow',
    '查看我们最近完成的一些项目案例。每个项目都经过了大量的研究和分析，以创造出卓越的解决方案。': 'View some of our recently completed projects. Each project involved extensive research and analysis to create outstanding solutions.',
    '让我们讨论如何帮助您': 'Let’s discuss how we can help you',
    '消息发送成功！我们会尽快与您联系。': 'Message sent successfully! We will contact you as soon as possible.',
    '我们提供专业的咨询服务，帮助企业实现可持续发展。': 'We provide professional consulting services to help businesses achieve sustainable growth.',
    '© 2024 咨询公司. 保留所有权利.': '© 2024 Consulting Company. All rights reserved.',
    '认识我们的公司、团队与服务理念。': 'Learn about our company, team, and service philosophy.',
    '了解我们的公司历史、使命和愿景。': 'Learn about our company history, mission, and vision.',
    '认识我们的创始人和核心团队成员，了解他们的专业背景和行业经验。': 'Meet our founder and core team members, and learn about their professional background and industry experience.',
    '内容加载中...': 'Loading content...',
    '正在加载合作伙伴...': 'Loading partners...',
    '暂无首页客户评价': 'No homepage testimonials yet',
    '加载客户评价失败，请稍后重试': 'Failed to load testimonials. Please try again later.'
  };

  const zhCache = new WeakMap();

  function getDictionary() {
    return { ...navTranslations, ...phraseTranslations };
  }

  function getLanguage() {
    return localStorage.getItem('siteLanguage') || 'zh';
  }

  function translateText(text, lang) {
    const normalized = String(text || '').trim();
    if (!normalized) return text;
    if (lang === 'zh') return text;
    return getDictionary()[normalized] || text;
  }

  function shouldTranslateElement(element) {
    if (!element || element.children.length > 0) return false;
    const tag = element.tagName;
    return ['A', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'P', 'LABEL', 'BUTTON', 'DIV'].includes(tag);
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (!zhCache.has(element)) zhCache.set(element, element.textContent);
      const source = zhCache.get(element);
      element.textContent = lang === 'en' ? translateText(source, 'en') : source;
    });

    document.querySelectorAll('a, span, h1, h2, h3, h4, h5, p, label, button').forEach((element) => {
      if (!shouldTranslateElement(element)) return;
      if (!zhCache.has(element)) zhCache.set(element, element.textContent);
      const source = zhCache.get(element);
      const translated = lang === 'en' ? translateText(source, 'en') : source;
      if (translated !== element.textContent) element.textContent = translated;
    });

    document.querySelectorAll('.form-label').forEach((element) => {
      if (!zhCache.has(element)) zhCache.set(element, element.textContent);
      const source = zhCache.get(element);
      element.textContent = lang === 'en' ? translateText(source, 'en') : source;
    });

    const toggle = document.getElementById('languageToggle');
    if (toggle) toggle.textContent = lang === 'en' ? '中' : 'EN';
  }

  function ensureLanguageToggle() {
    if (document.getElementById('languageToggle')) return;
    const nav = document.querySelector('.rd-navbar-nav');
    if (!nav) return;
    const li = document.createElement('li');
    li.className = 'rd-nav-item rd-nav-item-language';
    li.innerHTML = '<button class="language-toggle" id="languageToggle" type="button" aria-label="Switch language">EN</button>';
    nav.appendChild(li);
  }

  function bindToggle() {
    const toggle = document.getElementById('languageToggle');
    if (!toggle || toggle.dataset.i18nBound) return;
    toggle.dataset.i18nBound = '1';
    toggle.addEventListener('click', function () {
      const nextLanguage = getLanguage() === 'en' ? 'zh' : 'en';
      localStorage.setItem('siteLanguage', nextLanguage);
      applyLanguage(nextLanguage);
    });
  }

  window.translateNavText = function (text) {
    return translateText(text, getLanguage());
  };
  window.applySiteLanguage = applyLanguage;

  document.addEventListener('DOMContentLoaded', function () {
    ensureLanguageToggle();
    bindToggle();
    applyLanguage(getLanguage());

    setTimeout(function () {
      ensureLanguageToggle();
      bindToggle();
      applyLanguage(getLanguage());
    }, 500);
  });
})();
