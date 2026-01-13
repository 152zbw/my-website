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
            throw new Error(`服务器返回非JSON格式: ${text.substring(0, 100)}`);
        }
        
        if (!response.ok) {
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

// 导出API对象
window.API = {
    WebsiteInfo: WebsiteInfoAPI,
    Services: ServicesAPI,
    Projects: ProjectsAPI,
    News: NewsAPI,
    Testimonials: TestimonialsAPI,
    Partners: PartnersAPI,
    About: AboutAPI,
    Team: TeamAPI,
    Contacts: ContactsAPI,
    Navigation: NavigationAPI
};


