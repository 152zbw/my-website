// 使用百度地图JavaScript API，直接在页面中渲染地图
function loadMap() {
  const mapContainer = document.getElementById('googleMapContainer');
  if (!mapContainer) {
    console.log('地图容器不存在');
    return;
  }

  if (mapContainer.classList.contains('lazy-loaded')) {
    console.log('地图已经加载过');
    return;
  }

  const mapSettings = localStorage.getItem('mapSettings');
  const defaultSettings = {
    companyAddress: '上海市浦东新区张江高科技园区科苑路88号',
    latitude: 31.224361,
    longitude: 121.537021,
    zoomLevel: 15,
    mapWidth: '100%',
    mapHeight: 500,
    markerTitle: '我们的公司',
    markerDescription: '欢迎前来咨询！',
    mapType: 'roadmap'
  };

  const settings = mapSettings ? { ...defaultSettings, ...JSON.parse(mapSettings) } : defaultSettings;
  console.log('使用的地图设置:', settings);

  mapContainer.style.width = settings.mapWidth;
  mapContainer.style.height = settings.mapHeight + 'px';
  mapContainer.style.minHeight = '300px';
  mapContainer.style.minWidth = '300px';
  mapContainer.style.display = 'block';
  mapContainer.style.overflow = 'hidden';
  mapContainer.style.border = '1px solid #ddd';
  mapContainer.style.borderRadius = '4px';
  mapContainer.style.backgroundColor = '#f0f0f0';
  mapContainer.innerHTML = '';

  const showFallback = (message) => {
    mapContainer.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:${settings.mapHeight}px;padding:24px;text-align:center;background:#f7f9fc;color:#556;">
        <div style="font-size:18px;font-weight:600;margin-bottom:10px;">${message}</div>
        <div style="font-size:14px;line-height:1.8;max-width:420px;">
          <div>地址：${settings.companyAddress}</div>
          <div>经纬度：${settings.latitude}, ${settings.longitude}</div>
          <div style="margin-top:12px;"><a href="https://api.map.baidu.com/marker?location=${settings.latitude},${settings.longitude}&title=${encodeURIComponent(settings.markerTitle)}&content=${encodeURIComponent(settings.markerDescription)}&output=html" target="_blank" rel="noopener noreferrer">打开地图导航</a></div>
        </div>
      </div>
    `;
    mapContainer.classList.add('lazy-loaded');
  };

  if (typeof BMap === 'undefined') {
    const script = document.createElement('script');
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=5lxkJXs0kXPRL62ZyImrIVfubkrjICwa&callback=initBaiduMap`;
    script.type = 'text/javascript';
    script.async = true;
    script.onerror = function () {
      console.error('百度地图API加载失败');
      showFallback('地图暂时无法加载');
    };
    document.body.appendChild(script);

    window.mapSettings = settings;
    window.mapContainer = mapContainer;
  } else {
    initBaiduMap();
  }

  const addressElement = document.querySelector('.link-default[href="#"]');
  if (addressElement) {
    addressElement.textContent = settings.companyAddress;
    console.log('更新地址成功:', settings.companyAddress);
  }

  console.log('地图加载完成');
}

function initBaiduMap() {
  try {
    const mapSettingsRaw = window.mapSettings || localStorage.getItem('mapSettings');
    const settings = mapSettingsRaw ? { 
      latitude: 31.224361,
      longitude: 121.537021,
      zoomLevel: 15,
      markerTitle: '我们的公司',
      markerDescription: '欢迎前来咨询！',
      companyAddress: '上海市浦东新区张江高科技园区科苑路88号',
      ...JSON.parse(mapSettingsRaw)
    } : {
      latitude: 31.224361,
      longitude: 121.537021,
      zoomLevel: 15,
      markerTitle: '我们的公司',
      markerDescription: '欢迎前来咨询！',
      companyAddress: '上海市浦东新区张江高科技园区科苑路88号'
    };
    const mapContainer = window.mapContainer || document.getElementById('googleMapContainer');

    if (!mapContainer) {
      console.error('地图容器不存在');
      return;
    }

    mapContainer.innerHTML = '';
    mapContainer.style.backgroundColor = '';

    const map = new BMap.Map(mapContainer);
    const point = new BMap.Point(settings.longitude, settings.latitude);
    map.centerAndZoom(point, settings.zoomLevel);
    map.addControl(new BMap.MapTypeControl({ mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP] }));
    map.enableScrollWheelZoom(true);
    new BMap.Geocoder();

    const marker = new BMap.Marker(point);
    map.addOverlay(marker);

    const infoWindow = new BMap.InfoWindow(`
      <div style="padding: 10px;">
        <h4 style="margin: 0 0 10px 0;">${settings.markerTitle}</h4>
        <p style="margin: 0;">${settings.markerDescription}</p>
      </div>
    `);

    marker.addEventListener('click', function () {
      map.openInfoWindow(infoWindow, point);
    });

    mapContainer.classList.add('lazy-loaded');
    console.log('百度地图初始化完成');
  } catch (error) {
    console.error('百度地图初始化失败:', error);
    const mapContainer = window.mapContainer || document.getElementById('googleMapContainer');
    if (mapContainer) {
      mapContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:16px;padding:24px;text-align:center;">地图暂时无法加载，请稍后再试</div>';
      mapContainer.classList.add('lazy-loaded');
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM加载完成，准备加载地图');
  loadMap();
});

window.addEventListener('resize', function () {
  const mapContainer = document.getElementById('googleMapContainer');
  if (mapContainer && mapContainer.classList.contains('lazy-loaded')) {
    console.log('窗口大小改变，重新加载地图');
    mapContainer.innerHTML = '';
    mapContainer.classList.remove('lazy-loaded');
    loadMap();
  }
});