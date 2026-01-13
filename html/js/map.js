// 使用百度地图JavaScript API，直接在页面中渲染地图
function loadMap() {
  // 检查地图容器是否存在
  const mapContainer = document.getElementById('googleMapContainer');
  if (!mapContainer) {
    console.log('地图容器不存在');
    return;
  }

  // 检查是否已经被lazy-loaded，如果是则不重复加载
  if (mapContainer.classList.contains('lazy-loaded')) {
    console.log('地图已经加载过');
    return;
  }

  // 获取地图设置
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

  // 确保地图容器有固定高度和宽度
  mapContainer.style.width = settings.mapWidth;
  mapContainer.style.height = settings.mapHeight + 'px';
  mapContainer.style.minHeight = '300px';
  mapContainer.style.minWidth = '300px';
  mapContainer.style.display = 'block';
  mapContainer.style.overflow = 'hidden';
  mapContainer.style.border = '1px solid #ddd';
  mapContainer.style.borderRadius = '4px';
  mapContainer.style.backgroundColor = '#f0f0f0';

  // 清空地图容器
  mapContainer.innerHTML = '';

  // 检查百度地图API是否已加载
  if (typeof BMap === 'undefined') {
    // 动态加载百度地图API
    const script = document.createElement('script');
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=E4805d16520de693a3fe707cdc962045&callback=initBaiduMap`;
    script.type = 'text/javascript';
    script.async = true;
    script.onerror = function () {
      console.error('百度地图API加载失败');
      // 显示错误信息
      mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 16px;">地图加载失败，请刷新页面重试</div>';
    };
    document.body.appendChild(script);

    // 保存设置到全局变量，供回调函数使用
    window.mapSettings = settings;
    window.mapContainer = mapContainer;
  } else {
    // 百度地图API已加载，直接初始化地图
    initBaiduMap();
  }

  // 更新页面上的地址
  const addressElement = document.querySelector('.link-default[href="#"]');
  if (addressElement) {
    addressElement.textContent = settings.companyAddress;
    console.log('更新地址成功:', settings.companyAddress);
  }

  // 标记为已加载
  mapContainer.classList.add('lazy-loaded');
  console.log('地图加载完成');
}

// 初始化百度地图
function initBaiduMap() {
  const settings = window.mapSettings || localStorage.getItem('mapSettings') ? JSON.parse(localStorage.getItem('mapSettings')) : {
    latitude: 31.224361,
    longitude: 121.537021,
    zoomLevel: 15,
    markerTitle: '我们的公司',
    markerDescription: '欢迎前来咨询！'
  };
  const mapContainer = window.mapContainer || document.getElementById('googleMapContainer');

  if (!mapContainer) {
    console.error('地图容器不存在');
    return;
  }

  // 清空地图容器
  mapContainer.innerHTML = '';
  mapContainer.style.backgroundColor = '';

  // 创建地图实例
  const map = new BMap.Map(mapContainer);
  // 创建点坐标
  const point = new BMap.Point(settings.longitude, settings.latitude);
  // 初始化地图，设置中心点坐标和地图级别
  map.centerAndZoom(point, settings.zoomLevel);
  // 添加地图类型控件
  map.addControl(new BMap.MapTypeControl({
    mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP]
  }));
  // 启用滚轮放大缩小
  map.enableScrollWheelZoom(true);
  // 创建地理编码实例
  const geocoder = new BMap.Geocoder();

  // 创建标记
  const marker = new BMap.Marker(point);
  map.addOverlay(marker);

  // 添加标记信息窗口
  const infoWindow = new BMap.InfoWindow(
    `<div style="padding: 10px;">
      <h4 style="margin: 0 0 10px 0;">${settings.markerTitle}</h4>
      <p style="margin: 0;">${settings.markerDescription}</p>
    </div>`
  );

  // 标记点击事件
  marker.addEventListener('click', function () {
    map.openInfoWindow(infoWindow, point);
  });

  console.log('百度地图初始化完成');
}

// 确保在DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM加载完成，准备加载地图');
  // 直接执行，不需要延迟
  loadMap();
});

// 当窗口大小改变时重新加载地图
window.addEventListener('resize', function () {
  const mapContainer = document.getElementById('googleMapContainer');
  if (mapContainer && mapContainer.classList.contains('lazy-loaded')) {
    console.log('窗口大小改变，重新加载地图');
    // 移除旧的地图实例
    mapContainer.innerHTML = '';
    mapContainer.classList.remove('lazy-loaded');
    loadMap();
  }
});