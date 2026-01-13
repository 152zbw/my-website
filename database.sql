-- 创建数据库
CREATE DATABASE IF NOT EXISTS consulting_company;
USE consulting_company;

-- 网站基本信息表
CREATE TABLE IF NOT EXISTS website_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '网站标题',
    description TEXT COMMENT '网站描述',
    keywords VARCHAR(255) COMMENT '网站关键词',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '联系邮箱',
    address TEXT COMMENT '公司地址',
    logo VARCHAR(255) COMMENT 'logo路径',
    favicon VARCHAR(255) COMMENT 'favicon路径',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 服务项目表
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '服务标题',
    icon VARCHAR(50) COMMENT '服务图标',
    description TEXT COMMENT '服务描述',
    content TEXT COMMENT '服务详细内容',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 成功案例表
CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '案例标题',
    category VARCHAR(100) COMMENT '案例分类',
    image VARCHAR(255) COMMENT '案例图片',
    description TEXT COMMENT '案例描述',
    content TEXT COMMENT '案例详细内容',
    client VARCHAR(100) COMMENT '客户名称',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 新闻动态表
CREATE TABLE IF NOT EXISTS news (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '新闻标题',
    image VARCHAR(255) COMMENT '新闻图片',
    excerpt TEXT COMMENT '新闻摘要',
    content TEXT COMMENT '新闻内容',
    author VARCHAR(100) COMMENT '作者',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 客户评价表
CREATE TABLE IF NOT EXISTS testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '客户姓名',
    position VARCHAR(100) COMMENT '客户职位',
    company VARCHAR(100) COMMENT '客户公司',
    image VARCHAR(255) COMMENT '客户头像',
    content TEXT NOT NULL COMMENT '评价内容',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 合作伙伴表
CREATE TABLE IF NOT EXISTS partners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '合作伙伴名称',
    logo VARCHAR(255) COMMENT '合作伙伴logo',
    website VARCHAR(255) COMMENT '合作伙伴网站',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 关于我们表
CREATE TABLE IF NOT EXISTS about (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL COMMENT '标题',
    content TEXT COMMENT '内容',
    image VARCHAR(255) COMMENT '图片',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 团队成员表
CREATE TABLE IF NOT EXISTS team (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '成员姓名',
    position VARCHAR(100) COMMENT '成员职位',
    image VARCHAR(255) COMMENT '成员头像',
    bio TEXT COMMENT '成员简介',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 联系我们表
CREATE TABLE IF NOT EXISTS contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
    email VARCHAR(100) NOT NULL COMMENT '联系人邮箱',
    phone VARCHAR(20) COMMENT '联系人电话',
    subject VARCHAR(255) COMMENT '主题',
    message TEXT NOT NULL COMMENT '留言内容',
    status TINYINT DEFAULT 0 COMMENT '处理状态：0-未处理，1-已处理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 后台用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    name VARCHAR(100) COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    role VARCHAR(20) DEFAULT 'admin' COMMENT '角色：admin-管理员',
    is_active TINYINT DEFAULT 1 COMMENT '是否激活',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认管理员用户（密码：admin123）
INSERT INTO users (username, password, name, email) VALUES ('admin', '$2y$10$7e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5', '管理员', 'admin@example.com');

-- 插入默认网站信息
INSERT INTO website_info (title, description, keywords, phone, email, address) VALUES (
    '咨询公司官网 - 专业的商业咨询服务',
    '专业的商业咨询服务，包括战略规划、市场分析、管理咨询等，帮助企业实现可持续发展。',
    '咨询公司,商业咨询,战略规划,市场分析,管理咨询',
    '+86-400-123-4567',
    'info@consulting.com',
    '北京市朝阳区建国路88号'
);