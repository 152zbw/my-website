// 通用JavaScript功能

// 更新页面上的logo图片
function updateLogo() {
  console.log('开始更新logo图片');
  // 从localStorage获取网站信息
  const websiteInfo = localStorage.getItem('websiteInfo');

  if (websiteInfo) {
    const websiteData = JSON.parse(websiteInfo);
    console.log('获取到网站信息:', websiteData);

    // 更新logo图片
    if (websiteData.logo) {
      console.log('开始更新logo图片，新路径:', websiteData.logo);

      // 更全面地更新页面上的所有logo图片
      // 1. 更新导航栏中的logo
      const navLogos = document.querySelectorAll('.rd-navbar-brand img');
      navLogos.forEach(img => {
        img.src = websiteData.logo;
        img.alt = '咨询公司logo';
        img.removeAttribute('srcset');
        // 设置导航栏logo的合适尺寸
        img.width = 169;
        img.height = 24;
        console.log('更新了导航栏logo:', img);
      });

      // 2. 更新页脚中的logo
      const footerBrands = document.querySelectorAll('.brand');
      footerBrands.forEach(brand => {
        const logo = brand.querySelector('img');
        if (logo) {
          logo.src = websiteData.logo;
          logo.alt = '咨询公司logo';
          logo.removeAttribute('srcset');
          // 设置页脚logo的合适尺寸
          logo.width = 169;
          logo.height = 24;
          console.log('更新了页脚logo:', logo);
        }
      });

      // 3. 更新预加载动画中的logo
      const preloaderLogos = document.querySelectorAll('.preloader-logo img');
      preloaderLogos.forEach(img => {
        img.src = websiteData.logo;
        img.alt = '咨询公司logo';
        img.removeAttribute('srcset');
        // 设置预加载logo的合适尺寸
        img.width = 169;
        img.height = 24;
        console.log('更新了预加载动画logo:', img);
      });

      // 4. 直接查找所有可能的logo图片（作为备用方案）
      const allLogos = document.querySelectorAll('img[alt*="logo"], img[src*="logo"]');
      allLogos.forEach(img => {
        // 检查是否已经更新过（避免重复更新）
        if (img.src !== websiteData.logo) {
          img.src = websiteData.logo;
          img.alt = '咨询公司logo';
          img.removeAttribute('srcset');
          // 设置通用logo的合适尺寸
          img.width = 169;
          img.height = 24;
          console.log('更新了通用logo:', img);
        }
      });

      console.log('logo图片更新完成');
    }

    // 更新favicon
    if (websiteData.favicon) {
      console.log('开始更新favicon，新路径:', websiteData.favicon);
      let favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = websiteData.favicon;
      } else {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = websiteData.favicon;
        document.head.appendChild(favicon);
      }
      console.log('favicon更新完成');
    }
  }
}

// 页面加载时执行通用功能
document.addEventListener('DOMContentLoaded', function () {
  // 更新logo
  updateLogo();
});
