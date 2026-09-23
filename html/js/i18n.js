(function () {
  'use strict';

  const LANGUAGE_KEY = 'siteLanguage';
  const ENGLISH = 'en';
  const CHINESE = 'zh';
  const catalog = window.SiteI18nCatalog || { text: {}, entities: {} };

  function getLanguage() {
    return localStorage.getItem(LANGUAGE_KEY) === ENGLISH ? ENGLISH : CHINESE;
  }

  function translateText(value) {
    if (getLanguage() !== ENGLISH || typeof value !== 'string') return value;
    const normalized = value.trim();
    if (!normalized) return value;
    const canonical = normalized.replace(/\s+/g, ' ');
    if (catalog.text[normalized] || catalog.text[canonical]) return catalog.text[normalized] || catalog.text[canonical];
    const titleSuffix = ' - 咨询公司官网';
    if (normalized.endsWith(titleSuffix)) {
      const prefix = normalized.slice(0, -titleSuffix.length);
      return `${catalog.text[prefix] || catalog.text[prefix.replace(/\s+/g, ' ')] || prefix} — Lisi Consulting`;
    }
    return value;
  }

  function translatePreservingWhitespace(value) {
    if (typeof value !== 'string') return value;
    const normalized = value.trim();
    if (!normalized) return value;
    const translated = translateText(normalized);
    if (translated === normalized) return value;
    const leading = value.match(/^\s*/)?.[0] || '';
    const trailing = value.match(/\s*$/)?.[0] || '';
    return `${leading}${translated}${trailing}`;
  }

  function mergeEntity(item, translations) {
    if (!item || typeof item !== 'object') return item;
    const translated = translations?.[String(item.id)] || translations?.[item.id];
    if (!translated) return item;
    const result = { ...item, ...translated };
    if (Array.isArray(item.points) && Array.isArray(translated.points)) {
      result.points = item.points.map((point, index) => ({ ...point, ...(translated.points[index] || {}) }));
    }
    return result;
  }

  function localizeApiResponse(endpoint, data, options) {
    if (getLanguage() !== ENGLISH) return data;
    const method = String(options?.method || 'GET').toUpperCase();
    if (method !== 'GET' || endpoint.includes('/admin')) return data;
    const resource = endpoint.split('?')[0].split('/').filter(Boolean)[0];
    const translations = catalog.entities[resource];
    if (!translations) return data;
    if (Array.isArray(data)) return data.map((item) => mergeEntity(item, translations));
    return mergeEntity(data, translations);
  }

  function shouldSkipNode(node) {
    const parent = node.parentElement;
    return !parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE'].includes(parent.tagName) || Boolean(parent.closest('[data-i18n-skip]'));
  }

  function translateAttributes(root) {
    const elements = [];
    if (root.nodeType === Node.ELEMENT_NODE) elements.push(root);
    if (root.querySelectorAll) elements.push(...root.querySelectorAll('[placeholder], [title], [aria-label]'));
    elements.forEach((element) => {
      ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
        if (!element.hasAttribute?.(attribute)) return;
        const current = element.getAttribute(attribute);
        const translated = translateText(current);
        if (translated !== current) element.setAttribute(attribute, translated);
      });
    });
  }

  function translateTree(root) {
    if (getLanguage() !== ENGLISH || !root) return;
    translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (shouldSkipNode(node)) return;
      const translated = translatePreservingWhitespace(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    });
  }

  function injectStyles() {
    if (document.getElementById('site-language-styles')) return;
    const style = document.createElement('style');
    style.id = 'site-language-styles';
    style.textContent = `
      .language-toggle{position:relative;z-index:20;display:inline-flex;flex:0 0 auto;align-items:center;justify-content:center;min-width:42px;min-height:34px;padding:6px 11px;border:1px solid rgba(53,72,121,.35);border-radius:999px;background:#fff;color:#354879;font:700 13px/1 Arial,sans-serif;cursor:pointer;transition:.2s}
      .language-toggle:hover,.language-toggle:focus-visible{background:#354879;border-color:#354879;color:#fff;outline:none}
      .rd-nav-item-language{display:flex;align-items:center}
      .site-language-floating{position:fixed;top:16px;right:16px;z-index:10000;box-shadow:0 4px 18px rgba(26,39,72,.18)}
      .preloader{display:none!important;visibility:hidden!important;opacity:0!important}
      .breadcrumbs-custom.bg-image{background-image:linear-gradient(135deg,#263760 0%,#4f7197 58%,#8ab2cb 100%)!important;background-color:#354879}
      .footer-minimal .brand,.footer-corporate-brand .brand{display:inline-flex;align-items:center;padding:6px 8px;border-radius:6px;background:#fff}
      .footer-minimal .brand img,.footer-corporate-brand .brand img{width:auto;max-width:190px;height:auto;max-height:48px;object-fit:contain}
      .layout-bordered .link-default{overflow-wrap:anywhere}
      html[lang="en"] .rd-navbar-list{min-width:0}
      html[lang="en"] #topPhone{max-width:310px;white-space:normal;line-height:1.35;letter-spacing:0}
      @media(max-width:767.98px){
        .breadcrumbs-custom-inner{padding-top:72px;padding-bottom:52px}
        .breadcrumbs-custom-title{font-size:34px;line-height:1.2}
        .layout-bordered-item-inner{padding-left:12px;padding-right:12px}
        .footer-minimal-inner{gap:20px}
      }
      @media(max-width:991.98px){
        .rd-navbar-minimal .rd-navbar-panel>.rd-navbar-brand{position:absolute;left:50%;top:50%;width:132px;transform:translate(-50%,-50%);margin:0}
        .rd-navbar-minimal .rd-navbar-panel>.rd-navbar-brand img{display:block;width:100%;height:auto;max-height:38px;object-fit:contain}
        .rd-navbar-panel>.site-language-panel{position:absolute;right:10px;top:50%;z-index:1090;transform:translateY(-50%);margin:0}
        .rd-navbar-minimal .rd-navbar-search-toggle.rd-navbar-fixed-element-2{display:none!important}
        .wow{visibility:visible!important;animation:none!important;opacity:1!important;transform:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLanguageToggle() {
    let toggle = document.getElementById('languageToggle');
    const compactHeader = window.matchMedia('(max-width: 991.98px)').matches;
    const headerBlock = document.querySelector('#rd-navbar-hidden-1, .rd-navbar-block');
    const headerPanel = document.querySelector('.rd-navbar-panel');
    if (toggle) {
      if (!headerBlock && compactHeader && headerPanel && toggle.parentElement !== headerPanel) {
        toggle.closest('.rd-nav-item-language')?.remove();
        toggle.classList.add('site-language-panel');
        headerPanel.appendChild(toggle);
      }
      return toggle;
    }
    toggle = document.createElement('button');
    toggle.id = 'languageToggle';
    toggle.type = 'button';
    toggle.className = 'language-toggle';
    const stableHeader = headerBlock || (compactHeader ? headerPanel : null);
    const nav = document.querySelector('.rd-navbar-nav');
    if (stableHeader) {
      if (stableHeader === headerPanel) toggle.classList.add('site-language-panel');
      stableHeader.appendChild(toggle);
    } else if (nav) {
      const item = document.createElement('li');
      item.className = 'rd-nav-item rd-nav-item-language';
      item.appendChild(toggle);
      nav.appendChild(item);
    } else {
      toggle.classList.add('site-language-floating');
      document.body.appendChild(toggle);
    }
    return toggle;
  }

  function updateToggle(toggle) {
    const isEnglish = getLanguage() === ENGLISH;
    const label = isEnglish ? '中' : 'EN';
    const accessibleLabel = isEnglish ? '切换到中文' : 'Switch to English';
    if (toggle.textContent !== label) toggle.textContent = label;
    if (toggle.getAttribute('aria-label') !== accessibleLabel) toggle.setAttribute('aria-label', accessibleLabel);
    if (toggle.getAttribute('title') !== accessibleLabel) toggle.setAttribute('title', accessibleLabel);
  }

  function bindToggle() {
    const toggle = ensureLanguageToggle();
    updateToggle(toggle);
    if (toggle.dataset.i18nBound === '1') return;
    toggle.dataset.i18nBound = '1';
    toggle.addEventListener('click', () => {
      const nextLanguage = getLanguage() === ENGLISH ? CHINESE : ENGLISH;
      localStorage.setItem(LANGUAGE_KEY, nextLanguage);
      document.documentElement.lang = nextLanguage === ENGLISH ? 'en' : 'zh-CN';
      window.location.reload();
    });
  }

  function applyLanguage() {
    const language = getLanguage();
    document.documentElement.lang = language === ENGLISH ? 'en' : 'zh-CN';
    if (language !== ENGLISH) return;
    document.title = translateText(document.title);
    translateTree(document.body);
  }

  function localizedWebsiteInfo(data) {
    if (!data || getLanguage() !== ENGLISH) return data;
    return mergeEntity(data, catalog.entities?.['website-info']);
  }

  function isPhoneNumber(value) {
    return /^[+\d][\d\s().-]{5,}$/.test(String(value || '').trim());
  }

  function setContactLink(element, value, type) {
    if (!element || !value) return;
    element.textContent = value;
    if (element.tagName !== 'A') return;
    if (type === 'email') element.href = `mailto:${value}`;
    else if (type === 'phone' && isPhoneNumber(value)) element.href = `tel:${value.replace(/\s+/g, '')}`;
    else if (type === 'phone') element.removeAttribute('href');
  }

  function hydrateWebsiteInfo(rawData) {
    if (!rawData || !document.body) return;
    const data = localizedWebsiteInfo(rawData);
    const logo = data.logo || 'images/ce-logo.png';

    document.querySelectorAll('.rd-navbar-brand img, .preloader-logo img, .footer-minimal .brand img, .footer-corporate-brand .brand img').forEach((image) => {
      image.src = logo;
      image.removeAttribute('srcset');
      image.alt = data.title || 'CE International Group Co.,LTD';
    });

    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && data.favicon) {
      // The legacy template favicon is not part of the Lisi brand. Keep old
      // database values from replacing the branded browser-tab icon.
      favicon.href = /(^|\/)images\/favicon\.ico(?:[?#]|$)/i.test(data.favicon)
        ? 'images/wblogo.ico'
        : data.favicon;
    }

    setContactLink(document.getElementById('topPhone'), data.phone, 'phone');
    setContactLink(document.getElementById('contactPhoneMain'), data.phone, 'phone');
    setContactLink(document.getElementById('contactEmail'), data.email, 'email');
    const contactAddress = document.getElementById('contactAddress');
    if (contactAddress && data.address) contactAddress.textContent = data.address;

    document.querySelectorAll('.footer-corporate-list .mdi-phone').forEach((icon) => {
      setContactLink(icon.closest('li')?.querySelector('a'), data.phone, 'phone');
    });
    document.querySelectorAll('.footer-corporate-list .mdi-email').forEach((icon) => {
      setContactLink(icon.closest('li')?.querySelector('a'), data.email, 'email');
    });
    document.querySelectorAll('.footer-corporate-list .mdi-map-marker').forEach((icon) => {
      const target = icon.closest('li')?.querySelector('a, p');
      if (target && data.address) target.textContent = data.address;
    });
    document.querySelectorAll('.privacy-link').forEach((link) => setContactLink(link, data.email, 'email'));

    document.querySelectorAll('[data-footer-brand], .footer-corporate-text').forEach((element) => {
      if (data.footerBrandText) element.textContent = data.footerBrandText;
    });
    document.querySelectorAll('[data-footer-copyright], .footer-corporate-copy').forEach((element) => {
      if (data.footerCopyright) element.textContent = data.footerCopyright;
    });

    document.documentElement.classList.add('site-info-ready');
    document.dispatchEvent(new CustomEvent('site-info-ready', { detail: data }));
  }

  function removeTemplateResidue() {
    // 内页残留的模板邮件表单会提交到不存在的 PHP 地址，统一移除。
    const isContactPage = location.pathname.endsWith('/contacts.html');
    document.querySelectorAll('form.rd-mailform, form#contactForm').forEach((form) => {
      const section = form.closest('section');
      if (section && !isContactPage) {
        section.hidden = true;
        section.style.display = 'none';
        section.setAttribute('aria-hidden', 'true');
      }
    });
    document.querySelectorAll('a[href*="mobanwang.com"]').forEach((link) => link.remove());
    document.querySelectorAll('a[href="#"] .mdi-facebook-messenger').forEach((icon) => {
      const wrapper = icon.closest('.wow-outer, a');
      if (wrapper) wrapper.hidden = true;
    });
    document.querySelectorAll('p').forEach((paragraph) => {
      if (paragraph.textContent.trim().toLowerCase() === 'or use') paragraph.hidden = true;
    });
    document.querySelectorAll('.profile-modern .group a[href="#"]').forEach((link) => {
      const group = link.closest('.group');
      if (group) group.hidden = true;
    });

    if (location.pathname.endsWith('/about-company.html')) {
      ['coreAdvantagesContainer', 'servicesContainer', 'teamContainer', 'testimonialsContainer'].forEach((id) => {
        const container = document.getElementById(id);
        if (container) {
          container.setAttribute('aria-busy', 'true');
          container.innerHTML = '<div class="col-12 text-center text-muted">内容加载中...</div>';
        }
      });
    }
  }

  let latestWebsiteInfo = null;
  try {
    latestWebsiteInfo = JSON.parse(sessionStorage.getItem('siteWebsiteInfo') || 'null');
  } catch (_) {}

  const websiteInfoPromise = fetch('/api/website-info', { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`Website info request failed: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      latestWebsiteInfo = data;
      try { sessionStorage.setItem('siteWebsiteInfo', JSON.stringify(data)); } catch (_) {}
      if (document.body) hydrateWebsiteInfo(data);
      return data;
    })
    .catch((error) => {
      console.warn('站点公共信息加载失败:', error);
      return latestWebsiteInfo;
    });

  window.SiteWebsiteInfoPromise = websiteInfoPromise;

  function observeDocumentTitle() {
    if (getLanguage() !== ENGLISH || !document.head) return;
    const observer = new MutationObserver(() => {
      const translated = translateText(document.title);
      if (translated !== document.title) document.title = translated;
    });
    observer.observe(document.head, { childList: true, characterData: true, subtree: true });
  }

  function observeDynamicContent() {
    if (getLanguage() !== ENGLISH || !document.body) return;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!shouldSkipNode(node)) node.nodeValue = translatePreservingWhitespace(node.nodeValue);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          translateTree(node);
        }
      }));
      bindToggle();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.SiteI18n = { getLanguage, isEnglish: () => getLanguage() === ENGLISH, t: translateText, apply: applyLanguage, localizeApiResponse, hydrateWebsiteInfo };
  window.translateNavText = translateText;
  window.applySiteLanguage = applyLanguage;
  const nativeAlert = window.alert.bind(window);
  window.alert = (message) => nativeAlert(translateText(String(message)));
  injectStyles();

  document.addEventListener('DOMContentLoaded', () => {
    removeTemplateResidue();
    if (latestWebsiteInfo) hydrateWebsiteInfo(latestWebsiteInfo);
    bindToggle();
    applyLanguage();
    observeDocumentTitle();
    observeDynamicContent();
    window.setTimeout(() => { bindToggle(); applyLanguage(); }, 600);
  });
})();
