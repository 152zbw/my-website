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
      html[lang="en"] .rd-navbar-list{min-width:0}
      html[lang="en"] #topPhone{max-width:310px;white-space:normal;line-height:1.35;letter-spacing:0}
    `;
    document.head.appendChild(style);
  }

  function ensureLanguageToggle() {
    let toggle = document.getElementById('languageToggle');
    if (toggle) return toggle;
    toggle = document.createElement('button');
    toggle.id = 'languageToggle';
    toggle.type = 'button';
    toggle.className = 'language-toggle';
    const stableHeader = document.querySelector('#rd-navbar-hidden-1, .rd-navbar-block');
    const nav = document.querySelector('.rd-navbar-nav');
    if (stableHeader) {
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

  window.SiteI18n = { getLanguage, isEnglish: () => getLanguage() === ENGLISH, t: translateText, apply: applyLanguage, localizeApiResponse };
  window.translateNavText = translateText;
  window.applySiteLanguage = applyLanguage;
  const nativeAlert = window.alert.bind(window);
  window.alert = (message) => nativeAlert(translateText(String(message)));
  injectStyles();

  document.addEventListener('DOMContentLoaded', () => {
    bindToggle();
    applyLanguage();
    observeDocumentTitle();
    observeDynamicContent();
    window.setTimeout(() => { bindToggle(); applyLanguage(); }, 600);
  });
})();
