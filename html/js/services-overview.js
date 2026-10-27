(function () {
  'use strict';
  async function init() {
    const container = document.getElementById('serviceCategoriesContainer');
    if (!container) return;
    const english = () => window.SiteI18n?.isEnglish();
    const buttons = [...document.querySelectorAll('[data-category]')];
    function filter(category) {
      const selected = buttons.some(button => button.dataset.category === category) ? category : 'all';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === selected)));
      const cards = [...container.querySelectorAll('[data-service-category]')];
      cards.forEach(card => card.hidden = selected !== 'all' && card.dataset.serviceCategory !== selected);
      container.classList.toggle('is-filtered', selected !== 'all');
      const shown = cards.filter(card => !card.hidden).length;
      document.getElementById('serviceFilterStatus').textContent = english() ? `${shown} service categories shown` : `显示 ${shown} 类服务`;
    }
    buttons.forEach(button => button.addEventListener('click', () => {
      const category = button.dataset.category;
      const url = new URL(location.href);
      if (category === 'all') url.searchParams.delete('category'); else url.searchParams.set('category',category);
      history.replaceState(null,'',url);
      filter(category);
    }));
    window.addEventListener('popstate', () => filter(new URL(location.href).searchParams.get('category')));
    const toggle = document.querySelector('.service-nav-toggle');
    const nav = document.getElementById('servicePrimaryNav');
    function closeMenu() {nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');}
    toggle.addEventListener('click', () => {const open = nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));});
    document.addEventListener('keydown', event => {if(event.key === 'Escape') closeMenu();});
    document.addEventListener('click', event => {if(!event.target.closest('.service-header-inner')) closeMenu();});
    nav.addEventListener('click', event => {if(event.target.closest('a')) closeMenu();});
    filter(new URL(location.href).searchParams.get('category'));
    if (!container.dataset.serverRendered || english()) {
      try {
        const features = await window.API.HomeFeatures.getAll();
        container.innerHTML = window.BusinessCards.render(features, english(), {overview:true});
      } catch (_) {
        if (!container.querySelector('.business-card')) container.textContent = english() ? 'Services are temporarily unavailable. Please contact us.' : '服务内容暂时加载失败，请通过下方入口联系我们。';
      }
    }
    filter(new URL(location.href).searchParams.get('category'));

  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
