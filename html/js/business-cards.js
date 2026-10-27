(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BusinessCards = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function lines(html) {
    const text = String(html || '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?\s*>|<\/(?:div|p|li|h[1-6])\s*>/gi, '\n').replace(/<[^>]+>/g, '')
      .replace(/&(?:nbsp|amp|lt|gt|quot|apos|#39);/gi, entity => ({'&nbsp;':' ','&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'"}[entity.toLowerCase()]))
      .replace(/&#(x[0-9a-f]+|\d+);/gi, (_,number) => {const code=number[0].toLowerCase()==='x'?parseInt(number.slice(1),16):Number(number);return code>0&&code<=0x10ffff?String.fromCodePoint(code):'';});
    return text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
  }
  const icons = {
    global:'<circle cx="24" cy="24" r="16"/><ellipse cx="24" cy="24" rx="7" ry="16"/><path d="M9 19h30M9 29h30M5 35c10 2 29-9 36-22m-10 1 10-1-1 10"/>',
    management:'<circle cx="24" cy="9" r="5"/><path d="M16 24v-3a8 8 0 0 1 16 0v3ZM24 24v6M9 36v-6h30v6"/><circle cx="9" cy="39" r="4"/><circle cx="24" cy="39" r="4"/><circle cx="39" cy="39" r="4"/>',
    digital:'<rect x="11" y="11" width="26" height="26" rx="5"/><rect x="18" y="18" width="12" height="12" rx="2"/><path d="M17 4v7m7-7v7m7-7v7M17 37v7m7-7v7m7-7v7M4 17h7m-7 7h7m-7 7h7m26-14h7m-7 7h7m-7 7h7"/>'
  };
  const meta = {
    global:{eyebrow:'GLOBAL CONSULTING',href:'/overseas-consulting.html'},
    management:{eyebrow:'MANAGEMENT CONSULTING',href:'/organization-hr.html'},
    digital:{eyebrow:'DIGITAL SOLUTIONS',href:'/digital-transformation.html'}
  };
  const summaries = {
    global:['支持企业进入海外市场，完善属地组织与用工安排。','Support international market entry, local organizations and employment.'],
    management:['围绕组织效能与人才机制，推动管理方案落地。','Improve organizational performance and put people strategies into practice.'],
    digital:['以数字化产品与实施服务，支撑管理流程与决策。','Digital products and implementation to support management and decisions.']
  };
  function render(features, english, options = {}) {
    return (Array.isArray(features)?features:[]).filter(f => (f.isActive ?? f.is_active ?? true) !== false && (f.isActive ?? f.is_active ?? 1) !== 0)
      .slice().sort((a,b)=>(a.sortOrder??a.sort_order??0)-(b.sortOrder??b.sort_order??0)).map((feature,index)=>{
        const kind = ({1:'global',2:'management',3:'digital'})[feature.id] || (/海外|international|global/i.test(feature.title)?'global':/SaaS|AI|数字/i.test(feature.title)?'digital':'management');
        const info=meta[kind];
        const legacy=['linearicons-pie-chart','linearicons-folder','linearicons-credit-card'];
        const custom=feature.icon&&!legacy.includes(feature.icon)&&/^(?:linearicons-|fa\s|fa-)[\w -]+$/.test(feature.icon);
        const icon=custom?`<span class="business-custom-icon ${escape(feature.icon)}"></span>`:`<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[kind]}</svg>`;
        const decoration=kind==='digital'?'<svg class="business-card-network" viewBox="0 0 360 150" fill="none" aria-hidden="true"><g stroke="currentColor"><path d="M-20 128C60 16 156 174 240 73S340 16 380 48M-20 96C80 176 110 18 214 105S316 160 380 36M-20 142C100 69 115 142 228 46S315 112 380 88"/></g><g fill="currentColor"><circle cx="56" cy="88" r="5"/><circle cx="131" cy="105" r="6"/><circle cx="228" cy="46" r="6"/><circle cx="277" cy="106" r="5"/><circle cx="331" cy="36" r="6"/></g></svg>':'';
        return `<article class="business-card business-card--${kind}" data-service-category="${kind}"><div class="business-card-top"><div class="business-card-icon" aria-hidden="true">${icon}</div><span class="business-card-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span></div><p class="business-card-eyebrow" lang="en">${info.eyebrow}</p><h3 class="business-card-title">${escape(feature.title)}</h3>${options.overview?`<p class="business-card-summary">${escape(summaries[kind][english?1:0])}</p>`:''}<ul class="business-card-list">${lines(feature.description).map(line=>`<li>${escape(line)}</li>`).join('')}</ul><div class="business-card-space">${decoration}</div><a class="business-card-link" href="${info.href}" aria-label="${escape((english?'Explore ':'了解')+feature.title)}"><span>${english?'Explore our services':options.overview?'查看服务详情':'了解业务详情'}</span><span class="business-card-arrow" aria-hidden="true">↗</span></a></article>`;
      }).join('');
  }
  return {render,lines};
});
