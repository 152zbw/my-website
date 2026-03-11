// API工具类 - 用于前端与后端API通信
const API_BASE_URL = window.location.origin + '/api';

// 通用API请求函数
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // 如果有token，添加到headers
    const token = localStorage.getItem('adminToken');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, config);
        
        // 检查响应类型
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            if (!response.ok && response.status === 401) {
                handleAuthExpired();
                throw new Error('登录已过期，请重新登录');
            }
            throw new Error(`服务器返回非JSON格式: ${text.substring(0, 100)}`);
        }
        
        if (!response.ok) {
            if (response.status === 401) {
                handleAuthExpired();
                throw new Error(data.message || '登录已过期，请重新登录');
            }
            throw new Error(data.message || `请求失败 (${response.status})`);
        }
        
        return data;
    } catch (error) {
        console.error('API请求错误:', {
            url,
            error: error.message,
            stack: error.stack
        });
        // 如果是网络错误，给出更友好的提示
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('无法连接到服务器，请确保后端服务正在运行');
        }
        throw error;
    }
}

function handleAuthExpired() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // 确保跳转到后台登录页
    window.location.href = '/html/admin/index.html';
}

// 网站信息API
const WebsiteInfoAPI = {
    get: () => apiRequest('/website-info'),
    update: (data) => apiRequest('/website-info', {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// 服务项目API
const ServicesAPI = {
    getAll: () => apiRequest('/services'),
    get: (id) => apiRequest(`/services/${id}`),
    create: (data) => apiRequest('/services', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/services/${id}`, { method: 'DELETE' })
};

// 项目API
const ProjectsAPI = {
    getAll: () => apiRequest('/projects'),
    get: (id) => apiRequest(`/projects/${id}`),
    create: (data) => apiRequest('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE' })
};

// 新闻API
const NewsAPI = {
    getAll: () => apiRequest('/news'),
    get: (id) => apiRequest(`/news/${id}`),
    create: (data) => apiRequest('/news', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/news/${id}`, { method: 'DELETE' })
};

// 客户评价API
const TestimonialsAPI = {
    getAll: () => apiRequest('/testimonials'),
    get: (id) => apiRequest(`/testimonials/${id}`),
    create: (data) => apiRequest('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/testimonials/${id}`, { method: 'DELETE' })
};

// 合作伙伴API
const PartnersAPI = {
    getAll: () => apiRequest('/partners'),
    get: (id) => apiRequest(`/partners/${id}`),
    create: (data) => apiRequest('/partners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/partners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/partners/${id}`, { method: 'DELETE' })
};

// 关于我们API
const AboutAPI = {
    getAll: () => apiRequest('/about'),
    get: (id) => apiRequest(`/about/${id}`),
    create: (data) => apiRequest('/about', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/about/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/about/${id}`, { method: 'DELETE' })
};

// 公司简介API（基于 About 表，只使用第一条记录）
const AboutCompanyAPI = {
    // 获取公司简介（如果没有记录，返回 null）
    get: async () => {
        const list = await AboutAPI.getAll();
        return Array.isArray(list) && list.length ? list[0] : null;
    },
    // 更新公司简介：如果已有记录则更新第一条，否则创建新记录
    update: async (data) => {
        const list = await AboutAPI.getAll();
        if (Array.isArray(list) && list.length && list[0].id) {
            return AboutAPI.update(list[0].id, data);
        }
        return AboutAPI.create(data);
    }
};

// 团队成员API
const TeamAPI = {
    getAll: () => apiRequest('/team'),
    getAllAdmin: () => apiRequest('/team/admin/all'),
    get: (id) => apiRequest(`/team/${id}`),
    create: (data) => apiRequest('/team', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/team/${id}`, { method: 'DELETE' })
};

// 联系信息API
const ContactsAPI = {
    create: (data) => apiRequest('/contacts', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => apiRequest('/contacts'),
    get: (id) => apiRequest(`/contacts/${id}`),
    updateStatus: (id, status) => apiRequest(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    delete: (id) => apiRequest(`/contacts/${id}`, { method: 'DELETE' })
};

// 导航管理API
const NavigationAPI = {
    getAll: () => apiRequest('/navigation'),
    getAllAdmin: () => apiRequest('/navigation/admin/all'),
    get: (id) => apiRequest(`/navigation/${id}`),
    create: (data) => apiRequest('/navigation', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/navigation/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/navigation/${id}`, { method: 'DELETE' })
};

// 首页特色模块API
const HomeFeaturesAPI = {
    getAll: () => apiRequest('/homeFeatures'), // 前台获取激活的特色模块
    getAllAdmin: () => apiRequest('/homeFeatures/admin'), // 后台获取所有特色模块
    get: (id) => apiRequest(`/homeFeatures/${id}`),
    create: (data) => apiRequest('/homeFeatures', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/homeFeatures/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/homeFeatures/${id}`, { method: 'DELETE' })
};

// 招贤纳士职位API
const CareersAPI = {
    // 前台：获取所有激活的职位
    getAll: () => apiRequest('/careers'),
    // 后台：获取全部职位（含未激活）
    getAllAdmin: () => apiRequest('/careers/admin/all'),
    // 后台：获取单个职位
    get: (id) => apiRequest(`/careers/${id}`),
    // 后台：创建职位
    create: (data) => apiRequest('/careers', { method: 'POST', body: JSON.stringify(data) }),
    // 后台：更新职位
    update: (id, data) => apiRequest(`/careers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    // 后台：删除职位
    delete: (id) => apiRequest(`/careers/${id}`, { method: 'DELETE' })
};

// 文件上传API
const UploadAPI = {
    // 单文件上传
    uploadSingle: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const token = localStorage.getItem('adminToken');
        if (!token) {
            throw new Error('未登录，请先登录');
        }
        
        // 注意：FormData上传时不要设置Content-Type，让浏览器自动设置
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/upload/single`, {
                method: 'POST',
                headers: headers,
                body: formData
            });
            
                const data = await response.json();
                
                if (!response.ok) {
                    if (response.status === 401) {
                        handleAuthExpired();
                        throw new Error(data.message || '登录已过期，请重新登录');
                    }
                    throw new Error(data.message || `上传失败 (${response.status})`);
                }
                
                return data;
        } catch (error) {
            console.error('上传请求错误:', error);
            throw error;
        }
    },
    
    // 多文件上传
    uploadMultiple: async (files) => {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });
        
        const token = localStorage.getItem('adminToken');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '上传失败');
        }
        
        return await response.json();
    }
};

// 导出API对象
window.API = {
    WebsiteInfo: WebsiteInfoAPI,
    Services: ServicesAPI,
    Projects: ProjectsAPI,
    News: NewsAPI,
    Testimonials: TestimonialsAPI,
    Partners: PartnersAPI,
    About: AboutAPI,
    AboutCompany: AboutCompanyAPI,
    Team: TeamAPI,
    Contacts: ContactsAPI,
    Navigation: NavigationAPI,
    HomeFeatures: HomeFeaturesAPI, // 注册新的首页特色模块API
    Careers: CareersAPI, // 招贤纳士职位API
    Upload: UploadAPI
};
