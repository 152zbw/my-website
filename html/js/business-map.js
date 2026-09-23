(function () {
  const WORLD_GEOJSON_URL = '/data/world-countries-110m.geojson';
  const excludeCountries = new Set(['ATA', 'GRL', 'RUS']);
  const northAmerica = new Set(['USA', 'CAN', 'MEX']);
  const europe = new Set([
    'FRA', 'DEU', 'ITA', 'ESP', 'PRT', 'GBR', 'IRL', 'NLD', 'BEL', 'LUX', 'CHE', 'AUT',
    'POL', 'CZE', 'SVK', 'HUN', 'DNK', 'NOR', 'SWE', 'FIN', 'ISL', 'EST', 'LVA', 'LTU',
    'ROU', 'BGR', 'GRC', 'SVN', 'HRV', 'BIH', 'SRB', 'MNE', 'MKD', 'ALB'
  ]);
  const numericIsoA3 = {
    '008': 'ALB', '010': 'ATA', '040': 'AUT', '056': 'BEL', '070': 'BIH', '100': 'BGR',
    '124': 'CAN', '156': 'CHN', '191': 'HRV', '203': 'CZE', '208': 'DNK', '233': 'EST',
    '246': 'FIN', '250': 'FRA', '276': 'DEU', '300': 'GRC', '304': 'GRL', '348': 'HUN',
    '352': 'ISL', '372': 'IRL', '380': 'ITA', '428': 'LVA', '440': 'LTU', '442': 'LUX',
    '484': 'MEX', '499': 'MNE', '528': 'NLD', '578': 'NOR', '616': 'POL', '620': 'PRT',
    '642': 'ROU', '688': 'SRB', '703': 'SVK', '705': 'SVN', '724': 'ESP', '752': 'SWE',
    '756': 'CHE', '807': 'MKD', '826': 'GBR', '840': 'USA', '643': 'RUS'
  };
  let geoJsonPromise = null;

  function getIsoA3(feature) {
    const raw = feature?.properties?.ISO_A3 || feature?.properties?.iso_a3 || feature?.properties?.ADM0_A3 || '';
    if (raw) return String(raw).toUpperCase();
    const numericId = String(feature?.id || feature?.properties?.id || feature?.properties?.ISO_N3 || '').padStart(3, '0');
    return numericIsoA3[numericId] || String(feature?.id || '').toUpperCase();
  }

  function getCountryColor(feature) {
    const iso = getIsoA3(feature);
    if (iso === 'CHN') return '#ef1b2d';
    if (northAmerica.has(iso)) return '#20208c';
    if (europe.has(iso)) return '#f5b23c';
    return '#cfd7e6';
  }

  function getPointColor(type) {
    if (type === 'headquarters') return '#e60012';
    if (type === 'partner') return '#111111';
    return '#14a04a';
  }

  function getPointSymbolHtml(type) {
    if (type === 'headquarters') {
      return '<span class="bd-map-marker bd-map-marker-headquarters"></span>';
    }
    if (type === 'partner') {
      return '<span class="bd-map-marker bd-map-marker-partner"></span>';
    }
    return '<span class="bd-map-marker bd-map-marker-branch"></span>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function normalizePath(path) {
    if (!path) return '';
    if (window.normalizePublicImagePath) return window.normalizePublicImagePath(path);
    const value = String(path).trim();
    if (value.startsWith('http') || value.startsWith('/')) return value;
    if (value.startsWith('uploads/') || value.startsWith('images/')) return `/${value}`;
    return value;
  }

  async function loadWorldGeoJSON() {
    if (!geoJsonPromise) {
      const requestUrl = new URL(WORLD_GEOJSON_URL, window.location.origin).href;
      console.info('[BusinessMap] 正在加载世界地图数据:', requestUrl);
      geoJsonPromise = fetch(requestUrl, { cache: 'force-cache' })
        .then((response) => {
          if (!response.ok) {
            console.error('[BusinessMap] 世界地图数据加载失败:', requestUrl, response.status, response.statusText);
            throw new Error(`世界地图数据加载失败，请检查 GeoJSON 文件路径：${requestUrl}`);
          }
          return response.json();
        })
        .then((geoJson) => {
          geoJson.features = (geoJson.features || []).filter((feature) => !excludeCountries.has(getIsoA3(feature)));
          return geoJson;
        })
        .catch((error) => {
          geoJsonPromise = null;
          throw error;
        });
    }
    return geoJsonPromise;
  }

  function ensureStyles() {
    if (document.getElementById('businessDistributionMapCanvasStyles')) return;
    const style = document.createElement('style');
    style.id = 'businessDistributionMapCanvasStyles';
    style.textContent = `
      .bd-map-canvas{position:relative;width:100%;aspect-ratio:2/1;min-height:360px;overflow:hidden;background:#fff;border-radius:14px;}
      .bd-map-chart{position:absolute;inset:0;width:100%;height:100%;}
      .bd-map-points{position:absolute;inset:0;z-index:10;pointer-events:none;}
      .bd-map-point{position:absolute;left:var(--x);top:var(--y);transform:translate(-50%,-50%);z-index:2;pointer-events:none;}
      .bd-map-canvas-edit .bd-map-point{pointer-events:auto;cursor:grab;}
      .bd-map-canvas-edit .bd-map-point.dragging{cursor:grabbing;}
      .bd-map-point.selected{filter:drop-shadow(0 0 8px #354879);}
      .bd-map-marker{display:block;width:14px;height:14px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25);}
      .bd-map-marker-headquarters{background:#e60012;border-radius:50%;}
      .bd-map-marker-branch{background:#14a04a;border-radius:2px;}
      .bd-map-marker-partner{width:0;height:0;background:transparent;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:16px solid #111;border-top:0;border-radius:0;border-color:transparent transparent #111 transparent;box-shadow:none;}
      .bd-map-label{position:absolute;left:18px;top:50%;transform:translateY(-50%);white-space:nowrap;background:rgba(255,255,255,.92);border-radius:999px;padding:3px 8px;font-size:12px;color:#26324f;box-shadow:0 2px 8px rgba(0,0,0,.12);}
      .bd-map-logo-panel{position:absolute;left:50%;top:calc(100% + 10px);transform:translateX(-50%);display:none;gap:8px;align-items:center;padding:8px;background:rgba(255,255,255,.96);border-radius:10px;box-shadow:0 8px 22px rgba(0,0,0,.16);white-space:nowrap;z-index:20;}
      .bd-map-canvas-view .bd-map-point:hover .bd-map-logo-panel{display:flex;}
      .bd-map-partner-logo{width:64px;height:34px;object-fit:contain;border:1px solid #e5e8ef;border-radius:6px;background:#fff;padding:3px;}
      .bd-map-coordinate{position:absolute;right:12px;bottom:12px;z-index:30;background:rgba(38,50,79,.88);color:#fff;padding:5px 10px;border-radius:999px;font-size:12px;pointer-events:none;}
      @media(max-width:767.98px){.bd-map-canvas{min-height:280px;}.bd-map-label{display:none;}}
    `;
    document.head.appendChild(style);
  }

  function getPointFromEvent(event, container) {
    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }

  function renderPoint(point, index, options, overlay) {
    const type = ['headquarters', 'branch', 'partner'].includes(point.type) ? point.type : 'branch';
    const marker = document.createElement('div');
    marker.className = `bd-map-point ${options.selectedPointId === point.id || options.selectedPointId === index ? 'selected' : ''}`;
    marker.style.setProperty('--x', `${Math.max(0, Math.min(100, Number(point.x) || 0))}%`);
    marker.style.setProperty('--y', `${Math.max(0, Math.min(100, Number(point.y) || 0))}%`);
    marker.dataset.index = String(index);

    const logos = Array.isArray(point.logos) ? point.logos : [];
    const logosHtml = logos.length
      ? `<span class="bd-map-logo-panel">${logos.map((logo) => logo?.image ? `<img class="bd-map-partner-logo" src="${normalizePath(logo.image)}" alt="${escapeHtml(logo.name || point.name || 'partner')}" title="${escapeHtml(logo.name || '')}" />` : '').join('')}</span>`
      : '';

    marker.innerHTML = `${getPointSymbolHtml(type)}${point.name ? `<span class="bd-map-label">${escapeHtml(point.name)}</span>` : ''}${logosHtml}`;

    if (options.mode === 'edit') {
      marker.addEventListener('click', (event) => {
        event.stopPropagation();
        options.onPointSelect?.(point, index);
      });
      marker.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        marker.classList.add('dragging');
        options.onPointSelect?.(point, index);
        const move = (moveEvent) => {
          const next = getPointFromEvent(moveEvent, options.container);
          options.onPointMove?.(point, index, next);
        };
        const up = () => {
          marker.classList.remove('dragging');
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
    }

    overlay.appendChild(marker);
  }

  async function renderMapCanvas(container, options = {}) {
    ensureStyles();
    const mode = options.mode || 'view';
    const points = Array.isArray(options.points) ? options.points : [];
    if (!window.echarts) {
      container.innerHTML = '<div style="height:360px;display:flex;align-items:center;justify-content:center;color:#999;background:#fff;border-radius:14px;">ECharts 加载失败，请检查网络或 CDN。</div>';
      throw new Error('ECharts 未加载');
    }

    container.innerHTML = '';
    container.classList.add('bd-map-canvas', mode === 'edit' ? 'bd-map-canvas-edit' : 'bd-map-canvas-view');
    if (!container.style.height && !container.style.minHeight) {
      container.style.minHeight = mode === 'edit' ? '430px' : '420px';
    }

    const chartEl = document.createElement('div');
    chartEl.className = 'bd-map-chart';
    const overlay = document.createElement('div');
    overlay.className = 'bd-map-points';
    container.appendChild(chartEl);
    container.appendChild(overlay);

    if (mode === 'edit') {
      const coordinate = document.createElement('div');
      coordinate.className = 'bd-map-coordinate';
      coordinate.textContent = 'X: --%, Y: --%';
      container.appendChild(coordinate);
      container.addEventListener('mousemove', (event) => {
        const point = getPointFromEvent(event, container);
        coordinate.textContent = `X: ${point.x.toFixed(2)}%, Y: ${point.y.toFixed(2)}%`;
      });
      container.addEventListener('click', (event) => {
        if (event.target.closest('.bd-map-point')) return;
        const point = getPointFromEvent(event, container);
        options.onPointAdd?.(point);
      });
    }

    let geoJson;
    try {
      geoJson = await loadWorldGeoJSON();
    } catch (error) {
      console.error('[BusinessMap] 地图底图渲染失败:', error);
      container.innerHTML = '<div style="height:360px;display:flex;align-items:center;justify-content:center;color:#9b1c1c;background:#fff5f5;border:1px solid #f5c2c7;border-radius:14px;padding:20px;text-align:center;">世界地图数据加载失败，请检查 GeoJSON 文件路径。<br><small>应能直接访问 /data/world-countries-110m.geojson</small></div>';
      throw error;
    }
    echarts.registerMap('businessWorld', geoJson);
    const chart = echarts.init(chartEl, null, { renderer: 'svg' });
    setTimeout(() => chart.resize(), 0);
    chart.setOption({
      animation: false,
      backgroundColor: '#ffffff',
      tooltip: { show: false },
      geo: {
        map: 'businessWorld',
        roam: false,
        silent: true,
        top: 28,
        bottom: 18,
        left: 8,
        right: 8,
        itemStyle: {
          areaColor: '#cfd7e6',
          borderColor: '#ffffff',
          borderWidth: 0.8
        },
        emphasis: { disabled: true },
        select: { disabled: true },
        regions: geoJson.features.map((feature) => ({
          name: feature.properties.name,
          itemStyle: {
            areaColor: getCountryColor(feature),
            borderColor: '#ffffff',
            borderWidth: 0.8
          },
          emphasis: { disabled: true },
          select: { disabled: true }
        }))
      },
      series: []
    });

    const renderPoints = () => {
      overlay.innerHTML = '';
      points.forEach((point, index) => renderPoint(point, index, { ...options, container }, overlay));
    };
    renderPoints();

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);

    return {
      chart,
      renderPoints,
      destroy() {
        window.removeEventListener('resize', resize);
        chart.dispose();
      }
    };
  }

  window.BusinessDistributionMapCanvas = { render: renderMapCanvas };
  window.BusinessWorldMap = { render: (container, points) => renderMapCanvas(container, { mode: 'view', points }) };
})();
