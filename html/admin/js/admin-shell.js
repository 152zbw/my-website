(function () {
  'use strict';

  const menuItems = [
    ['dashboard-new.html', 'fa-dashboard', '仪表盘'],
    ['website-info.html', 'fa-info-circle', '网站信息'],
    ['navigation.html', 'fa-bars', '导航管理'],
    ['services.html', 'fa-bell', '服务项目'],
    ['projects.html', 'fa-briefcase', '成功案例'],
    ['news.html', 'fa-newspaper-o', '博客/新闻'],
    ['testimonials.html', 'fa-comments', '客户评价'],
    ['partners.html', 'fa-handshake-o', '合作伙伴'],
    ['business-distribution.html', 'fa-globe', '业务分布'],
    ['about.html', 'fa-file-text-o', '关于我们'],
    ['about-company.html', 'fa-building-o', '公司简介'],
    ['about-me.html', 'fa-user', '个人简介'],
    ['team.html', 'fa-users', '团队成员'],
    ['careers.html', 'fa-suitcase', '招贤纳士'],
    ['pricing.html', 'fa-dollar', '价格表'],
    ['home-features.html', 'fa-star', '首页特色模块'],
    ['contacts.html', 'fa-envelope', '联系我们'],
    ['map-settings.html', 'fa-map-marker', '地图管理'],
    ['users.html', 'fa-user-circle-o', '用户管理']
  ];

  const currentPage = location.pathname.split('/').pop() || 'dashboard-new.html';

  function addSharedStyles() {
    const style = document.createElement('style');
    style.id = 'admin-shell-styles';
    style.textContent = `
      .sidebar{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.42) transparent;overscroll-behavior:contain}
      .sidebar::-webkit-scrollbar{width:7px}
      .sidebar::-webkit-scrollbar-track{background:transparent}
      .sidebar::-webkit-scrollbar-thumb{background:rgba(255,255,255,.36);border-radius:10px}
      .sidebar .nav-menu{padding-bottom:28px!important}
      .sidebar .nav-menu a{min-height:48px}
      .admin-sidebar-backdrop{display:none;position:fixed;inset:0;background:rgba(14,25,48,.46);z-index:999}
      @media(max-width:1100px){
        .sidebar{transition:transform .25s ease!important}
        .sidebar.open{display:block!important;transform:translateX(0)!important}
        .sidebar.open~.admin-sidebar-backdrop{display:block}
      }
      @media(max-width:768px){
        .top-nav{gap:12px}
        .top-nav-right{gap:8px}
        .user-info span{display:none}
        .logout-btn{padding:9px 12px!important;white-space:nowrap}
        .page-title{font-size:17px!important}
        .main-content{padding:14px!important}
        .card{padding:14px!important;overflow-x:auto}
      }
    `;
    document.head.appendChild(style);
  }

  function buildMenu(sidebar) {
    const menu = sidebar.querySelector('.nav-menu');
    if (!menu) return;

    menu.innerHTML = menuItems.map(([href, icon, label]) => {
      const active = href === currentPage;
      return `<li><a href="${href}"${active ? ' class="active" aria-current="page"' : ''}><i class="fa ${icon}"></i><span>${label}</span></a></li>`;
    }).join('');

    const storageKey = 'adminSidebarScrollTop';
    const savedPosition = Number(sessionStorage.getItem(storageKey));
    if (Number.isFinite(savedPosition) && savedPosition > 0) {
      sidebar.scrollTop = savedPosition;
    } else {
      const activeLink = menu.querySelector('a.active');
      if (activeLink) activeLink.scrollIntoView({ block: 'center' });
    }

    let saveTimer;
    sidebar.addEventListener('scroll', function () {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        sessionStorage.setItem(storageKey, String(sidebar.scrollTop));
      }, 80);
    }, { passive: true });

    menu.addEventListener('click', function () {
      sessionStorage.setItem(storageKey, String(sidebar.scrollTop));
    });
  }

  function improveMobileSidebar(sidebar) {
    const backdrop = document.createElement('div');
    backdrop.className = 'admin-sidebar-backdrop';
    sidebar.insertAdjacentElement('afterend', backdrop);

    const closeSidebar = function () { sidebar.classList.remove('open'); };
    backdrop.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (matchMedia('(max-width: 1100px)').matches) closeSidebar();
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeSidebar();
    });
  }

  function initAdminShell() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    addSharedStyles();
    buildMenu(sidebar);
    improveMobileSidebar(sidebar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminShell, { once: true });
  } else {
    initAdminShell();
  }
})();
