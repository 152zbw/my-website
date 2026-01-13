// 百度地图初始化函数
function initializeMap() {
    // 检查百度地图API是否已加载
    if (typeof BMap === 'undefined') {
        console.error('百度地图API未加载');
        return;
    }

    // 获取地图容器元素
    const mapContainer = document.getElementById('googleMapContainer');
    if (!mapContainer) {
        console.error('地图容器元素未找到');
        return;
    }

    // 设置地图容器高度（如果未设置）
    if (!mapContainer.style.height) {
        mapContainer.style.height = '600px';
    }

    // 从localStorage获取地图设置
    let mapSettings = {
        latitude: 31.224361,
        longitude: 121.537021,
        zoomLevel: 15,
        companyAddress: '上海市浦东新区张江高科技园区科苑路88号',
        markerTitle: '我们的公司',
        markerDescription: '欢迎前来咨询！'
    };

    try {
        const savedSettings = localStorage.getItem('mapSettings');
        if (savedSettings) {
            mapSettings = { ...mapSettings, ...JSON.parse(savedSettings) };
        }
    } catch (error) {
        console.error('Error loading map settings from localStorage:', error);
    }

    // 创建地图实例
    const map = new BMap.Map(mapContainer);

    // 创建点坐标
    const point = new BMap.Point(mapSettings.longitude, mapSettings.latitude);

    // 初始化地图，设置中心点坐标和地图级别
    map.centerAndZoom(point, mapSettings.zoomLevel);

    // 添加地图类型控件
    map.addControl(new BMap.MapTypeControl({
        mapTypes: [BMAP_NORMAL_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP]
    }));

    // 启用滚轮放大缩小
    map.enableScrollWheelZoom(true);

    // 创建标记
    const marker = new BMap.Marker(point);
    map.addOverlay(marker);

    // 添加标记弹窗
    const infoWindow = new BMap.InfoWindow(`<div style="width: 250px;">
        <h4 style="margin-bottom: 10px;">${mapSettings.markerTitle}</h4>
        <p style="margin-bottom: 10px;">${mapSettings.markerDescription}</p>
        <p style="color: #666;">${mapSettings.companyAddress}</p>
    </div>`);

    // 添加标记点击事件
    marker.addEventListener('click', function () {
        map.openInfoWindow(infoWindow, point);
    });

    // 自动打开信息窗口
    // map.openInfoWindow(infoWindow, point);
}

// 页面加载完成后初始化地图
document.addEventListener('DOMContentLoaded', function () {
    // 检查是否在联系我们页面
    if (window.location.pathname.includes('contacts.html')) {
        // 动态加载百度地图API
        const script = document.createElement('script');
        script.src = 'https://api.map.baidu.com/api?v=3.0&ak=E4805d16520de693a3fe707cdc962045&callback=initializeMap';
        script.async = true;
        document.head.appendChild(script);
    }
});
