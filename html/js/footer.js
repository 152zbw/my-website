(function () {
  function parseLinks(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function renderMinimalFooter(data) {
    const brand = document.querySelector('[data-footer-brand]');
    const copyright = document.querySelector('[data-footer-copyright]');
    const terms = document.querySelector('[data-footer-terms]');
    const links = document.querySelector('[data-footer-links]');

    if (brand) brand.textContent = data.footerBrandText || '我们提供专业的咨询服务，帮助企业实现可持续发展。';
    if (copyright) copyright.textContent = data.footerCopyright || '© 2024 笠偲咨询. 保留所有权利.';
    if (terms) terms.textContent = data.footerTermsText || '隐私政策';

    if (links) {
      const items = parseLinks(data.footerLinksJson);
      const finalItems = items.length ? items : [
        { title: '隐私政策', url: 'privacy-policy.html' },
        { title: '联系我们', url: 'contacts.html' }
      ];
      links.innerHTML = finalItems.map(item => `<a href="${item.url || '#'}">${item.title || ''}</a>`).join('<span> | </span>');
    }
  }

  async function init() {
    if (!window.API || !window.API.WebsiteInfo || !window.API.WebsiteInfo.get) return;
    try {
      const data = await window.API.WebsiteInfo.get();
      renderMinimalFooter(data || {});
    } catch (err) {
      console.error('加载页脚配置失败:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
