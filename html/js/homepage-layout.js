(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./distribution-data'));else root.HomepageLayout=factory(root.DistributionData);})(typeof globalThis!=='undefined'?globalThis:this,function(Distribution){
  'use strict';
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text=value=>String(value||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  function image(value){const src=String(value||'').trim();if(/^https?:\/\//i.test(src)||src.startsWith('/'))return escape(src);return /^(?:uploads|images)\//.test(src)?'/'+escape(src):'';}
  function photo(value,width){const source=image(value);return source.startsWith('/uploads/')?source+(source.includes('?')?'&amp;':'?')+'w='+width:source;}
  function projects(items,english){return (items||[]).slice(0,2).map(item=>`<article class="home-case"><a class="home-case-photo" href="/single-project.html?id=${encodeURIComponent(item.id)}"><img src="${photo(item.image,800)}" alt="${escape(item.title)}" loading="lazy" decoding="async" width="640" height="240"></a><div class="home-case-copy"><p class="home-case-category">${escape(item.category||'')}</p><h3><a href="/single-project.html?id=${encodeURIComponent(item.id)}">${escape(item.title)}</a></h3><p class="home-case-summary">${escape(text(item.description||item.content))}</p><a class="home-text-link" href="/single-project.html?id=${encodeURIComponent(item.id)}">${english?'Explore case study':'查看案例'} <span aria-hidden="true">→</span></a></div></article>`).join('')||`<p>${english?'Please contact us to discuss project experience.':'欢迎联系我们了解项目经验。'}</p>`;}
  function news(items,english){return (items||[]).slice(0,2).map(item=>`<article class="home-insight"><a class="home-insight-photo" href="/single-blog-post.html?id=${encodeURIComponent(item.id)}"><img src="${photo(item.image,400)}" alt="${escape(item.title)}" loading="lazy" decoding="async" width="240" height="160"></a><div><h3><a href="/single-blog-post.html?id=${encodeURIComponent(item.id)}">${escape(item.title)}</a></h3><p>${escape(text(item.description||item.excerpt||item.content).slice(0,110))}</p><a class="home-text-link" href="/single-blog-post.html?id=${encodeURIComponent(item.id)}">${english?'Read article':'阅读全文'} <span aria-hidden="true">→</span></a></div></article>`).join('')||`<p>${english?'Insights will be updated here.':'专业洞察持续更新中。'}</p>`;}
  function sources(items,english){const labels=english?['SAP HR Connect 2025 Qingdao','AI and workforce productivity salon','Investing in Hungary: international expansion event','2024 HR Services Customer Satisfaction Award']:[];const dates=['2025 · SAP','2024 · 行业沙龙','2025 · 出海交流','2024 · HRflag 金帜奖'];return (items||[]).map((source,index)=>`<li><a href="${image(source.url)}" target="_blank" rel="noopener noreferrer"><span class="home-source-meta">${escape(english?['2025 · SAP','2024 · Industry salon','2025 · Global business','2024 · HRflag'][index]||source.publisher:dates[index]||source.publisher)}</span><h3>${escape(english?labels[index]||source.title:source.title)}</h3><span class="home-source-arrow" aria-hidden="true">↗</span></a></li>`).join('');}
  function distribution(data,english){const all=Distribution.points(data?.points);return Distribution.regions.map(([id,zh,en])=>{const group=all.map((point,index)=>({point,index})).filter(x=>Distribution.region(x.point)===id);return `<section class="home-region-group" data-region-group="${id}"><h3>${english?en:zh}<span>${group.length}</span></h3><ul>${group.map(({point,index})=>`<li><button type="button" class="home-location" data-point-index="${index}"><span class="home-location-marker" data-type="${escape(point.type)}" aria-hidden="true"></span><span>${escape(Distribution.name(point,english))}</span><small>${Distribution.type(point,english)}</small></button></li>`).join('')}</ul></section>`;}).join('');}
  async function init(){
    const page=document.querySelector('.home-redesigned');if(!page)return;
    const english=()=>window.SiteI18n?.isEnglish();
    if(english()){
      try {
        const info=await API.WebsiteInfo.get();
        const heading=document.getElementById('heroTitle');heading.replaceChildren(document.createTextNode(info.heroTitle||'Connecting global opportunities'),document.createElement('br'),document.createTextNode(info.heroSubtitle||'Unlocking organizational potential'));
        if(info.heroDescription)document.getElementById('heroDescription').innerHTML=info.heroDescription;
        if(info.address)document.getElementById('homeContactAddress').textContent=info.address;
      }catch(_){}
      const tasks=[['projectsContainer',()=>API.Projects.getAll(),projects],['blogsContainer',()=>API.News.getAll(),news],['homeFeaturesContainer',()=>API.HomeFeatures.getAll(),items=>window.BusinessCards.render(items,true)]];
      await Promise.allSettled(tasks.map(async([id,load,render])=>{const items=await load();document.getElementById(id).innerHTML=render(items,true);}));
      const sourceData=JSON.parse(document.getElementById('homePublicSources')?.textContent||'[]');document.getElementById('homeSources').innerHTML=sources(sourceData,true);
    }
    const regionButtons=[...document.querySelectorAll('[data-distribution-region]')];
    const mapContainer=document.getElementById('businessMapWrap');
    let mapInstance;
    let data;
    try{data=await API.BusinessDistribution.get();}catch(_){data=JSON.parse(document.getElementById('homeDistributionData')?.textContent||'null');}
    if(!data||data.isActive===0){document.getElementById('businessDistributionSection').hidden=true;return;}
    const all=Distribution.points(data.points);document.getElementById('homeRegions').innerHTML=distribution(data,english());
    document.getElementById('businessDistributionTitle').textContent=english()?'Global presence':data.title||'业务分布';
    document.getElementById('businessDistributionSubtitle').textContent=english()?'Working with our international partners to support Chinese enterprises in global markets.':data.subtitle||'';
    function select(index){document.querySelectorAll('.home-location').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.pointIndex)===index)));mapContainer.querySelectorAll('.bd-map-point').forEach(marker=>{const chosen=Number(marker.dataset.index)===index;marker.classList.toggle('selected',chosen);if(chosen)marker.focus({preventScroll:true});});document.getElementById('homeMapStatus').textContent=Distribution.name(all[index],english());}
    document.getElementById('homeRegions').addEventListener('click',event=>{const button=event.target.closest('[data-point-index]');if(button)select(Number(button.dataset.pointIndex));});
    function region(id){regionButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.distributionRegion===id)));document.querySelectorAll('[data-region-group]').forEach(group=>group.hidden=id!=='all'&&group.dataset.regionGroup!==id);mapContainer.querySelectorAll('.bd-map-point').forEach(marker=>{marker.hidden=id!=='all'&&Distribution.region(all[Number(marker.dataset.index)])!==id;});}
    regionButtons.forEach(button=>button.addEventListener('click',()=>region(button.dataset.distributionRegion)));
    try{mapInstance=await window.BusinessDistributionMapCanvas.render(mapContainer,{mode:'view',points:all.map(point=>({...point,name:Distribution.name(point,english())})),onPointSelect:(_,index)=>select(index)});region('all');}catch(_){mapContainer.textContent=english()?'The map is temporarily unavailable. All offices and partners are listed alongside.':'地图暂时加载失败，可在旁边清单查看全部机构。';}
    window.addEventListener('pagehide',()=>mapInstance?.destroy?.(),{once:true});
  }
  if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();}
  return {projects,news,sources,distribution,text,image};
});
