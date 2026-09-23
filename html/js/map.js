(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  async function getWebsiteInfo() {
    if (window.SiteWebsiteInfoPromise) return (await window.SiteWebsiteInfoPromise) || {};
    const response = await fetch('/api/website-info', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Website info request failed: ${response.status}`);
    return response.json();
  }

  async function loadMap() {
    const container = document.getElementById('googleMapContainer');
    if (!container || container.closest('[hidden]') || getComputedStyle(container).display === 'none') return;

    let info = {};
    try {
      info = await getWebsiteInfo();
    } catch (error) {
      console.warn('地图信息加载失败:', error);
    }

    const address = info.mapAddress || info.address || '山东省烟台市莱山区蓝海路蓝海软件园B座';
    const latitude = Number(info.mapLat) || 37.461219;
    const longitude = Number(info.mapLng) || 121.488077;
    const navigationUrl = `https://api.map.baidu.com/marker?location=${latitude},${longitude}&title=${encodeURIComponent('笠偌咨询')}&content=${encodeURIComponent(address)}&output=html`;

    container.classList.add('lazy-loaded', 'site-map-card');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.minWidth = '0';
    container.style.minHeight = '360px';
    container.innerHTML = `
      <div style="display:flex;min-height:360px;height:100%;align-items:center;justify-content:center;padding:36px;background:linear-gradient(135deg,#e8f3fa,#d4e7f3);text-align:center;color:#25365f;">
        <div style="width:min(100%,520px);padding:34px 26px;border-radius:18px;background:rgba(255,255,255,.9);box-shadow:0 14px 40px rgba(53,72,121,.12);">
          <span class="icon mdi mdi-map-marker" style="display:block;margin-bottom:14px;font-size:42px;color:#354879;"></span>
          <h4 style="margin:0 0 12px;">公司地址</h4>
          <p style="margin:0 0 22px;line-height:1.8;">${escapeHtml(address)}</p>
          <a class="button button-primary" href="${navigationUrl}" target="_blank" rel="noopener noreferrer">打开地图导航</a>
        </div>
      </div>`;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadMap);
  else loadMap();
})();
