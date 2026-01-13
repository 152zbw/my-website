# 咨询公司官网部署指南

## 项目结构

```
consulting-company/
├── app.js                 # 后端主入口文件
├── config/                # 配置文件目录
│   ├── db.js              # 数据库配置
├── html/                  # 前端页面目录
│   ├── admin/             # 后台管理页面
│   ├── index.html         # 首页
│   ├── services.html      # 服务项目
│   └── ...                 # 其他前端页面
├── middleware/            # 中间件目录
├── models/                # 数据库模型目录
├── routes/                # 路由目录
├── uploads/               # 文件上传目录
├── .env                   # 环境变量配置
├── database.sql           # 数据库初始化脚本
├── deploy.md              # 部署指南（本文件）
└── package.json           # 项目依赖
```

## 部署准备

### 1. 服务器环境

- 操作系统：Ubuntu 20.04 或更高版本
- Node.js：v16 或更高版本
- MySQL：v8.0 或更高版本
- Nginx：v1.18 或更高版本（可选，用于反向代理）

### 2. 依赖安装

```bash
# 安装项目依赖
npm install

# 安装全局依赖（可选）
npm install -g pm2
```

## 部署步骤

### 1. 数据库配置

1. 创建数据库：
   ```sql
   CREATE DATABASE consulting_company CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. 创建数据库用户并授权：
   ```sql
   CREATE USER 'consulting_user'@'localhost' IDENTIFIED BY 'your_strong_password';
   GRANT ALL PRIVILEGES ON consulting_company.* TO 'consulting_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. 导入数据库初始化脚本：
   ```bash
   mysql -u consulting_user -p consulting_company < database.sql
   ```

### 2. 环境变量配置

1. 复制 `.env` 文件并修改配置：
   ```bash
   cp .env .env.production
   ```

2. 编辑 `.env.production` 文件，修改以下配置：
   ```
   # 数据库配置
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=consulting_user
   DB_PASSWORD=your_strong_password
   DB_NAME=consulting_company

   # 服务器配置
   PORT=3000
   HOST=0.0.0.0

   # JWT配置
   JWT_SECRET=your_jwt_secret_key

   # 环境配置
   NODE_ENV=production
   ```

### 3. 启动应用

#### 使用 Node.js 直接启动

```bash
# 设置环境变量
export NODE_ENV=production

# 启动应用
node app.js
```

#### 使用 PM2 管理进程

```bash
# 设置环境变量
export NODE_ENV=production

# 启动应用
npm start

# 或者使用 PM2 直接启动
npm install -g pm2
npm run start:pm2
```

### 4. 配置 Nginx 反向代理（可选）

1. 安装 Nginx：
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. 创建 Nginx 配置文件：
   ```bash
   sudo nano /etc/nginx/sites-available/consulting-company
   ```

3. 添加以下配置：
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:3000/api;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /uploads {
           alias /path/to/your/project/uploads;
           expires 30d;
       }

       location /html {
           alias /path/to/your/project/html;
           expires 30d;
       }
   }
   ```

4. 启用配置并重启 Nginx：
   ```bash
   sudo ln -s /etc/nginx/sites-available/consulting-company /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 5. 配置 HTTPS（可选）

推荐使用 Let's Encrypt 免费 SSL 证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your_domain.com

# 自动续期配置
sudo certbot renew --dry-run
```

## 环境变量说明

| 变量名 | 描述 | 默认值 |
|-------|------|-------|
| `DB_HOST` | 数据库主机地址 | `localhost` |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | `root` |
| `DB_NAME` | 数据库名称 | `consulting_company` |
| `PORT` | 服务器端口 | `3000` |
| `HOST` | 服务器主机地址 | `localhost` |
| `JWT_SECRET` | JWT 密钥 | `consulting_company_jwt_secret_key_2023` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `UPLOAD_DIR` | 文件上传目录 | `uploads` |
| `MAX_FILE_SIZE` | 最大文件上传大小 | `5242880`（5MB） |
| `NODE_ENV` | 运行环境 | `development` |

## 项目启动脚本

在 `package.json` 中添加以下脚本，方便启动和管理应用：

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "start:pm2": "pm2 start app.js --name consulting-company",
    "stop:pm2": "pm2 stop consulting-company",
    "restart:pm2": "pm2 restart consulting-company",
    "logs:pm2": "pm2 logs consulting-company",
    "status:pm2": "pm2 status consulting-company"
  }
}
```

## 前端配置

确保前端页面能够正确访问后端 API，需要检查以下配置：

1. 前端页面中的 API 请求地址是否正确
2. 确保 CORS 配置正确，允许前端页面访问后端 API
3. 确保静态文件服务配置正确，前端页面能够正确加载

## 数据库备份与恢复

### 备份数据库

```bash
# 备份数据库
date=$(date +%Y%m%d_%H%M%S)
mysqldump -u consulting_user -p consulting_company > backup_${date}.sql
```

### 恢复数据库

```bash
# 恢复数据库
mysql -u consulting_user -p consulting_company < backup_${date}.sql
```

## 监控与日志

### 查看应用日志

```bash
# 使用 PM2 查看日志
npm run logs:pm2

# 或者直接查看 PM2 日志
pm2 logs consulting-company
```

### 查看 Nginx 日志

```bash
# 查看访问日志
tail -f /var/log/nginx/access.log

# 查看错误日志
tail -f /var/log/nginx/error.log
```

## 常见问题

### 1. 数据库连接失败

检查以下配置：
- 数据库主机地址、端口、用户名、密码是否正确
- 数据库用户是否有足够的权限
- 数据库服务是否正常运行
- 防火墙是否允许数据库端口访问

### 2. 前端页面无法访问

检查以下配置：
- 前端页面文件是否存在
- 静态文件服务配置是否正确
- Nginx 配置是否正确
- 防火墙是否允许 HTTP/HTTPS 端口访问

### 3. API 请求失败

检查以下配置：
- API 路由是否正确
- 后端服务是否正常运行
- CORS 配置是否正确
- 前端 API 请求地址是否正确

## 性能优化

1. **启用 gzip 压缩**：在 Nginx 配置中添加 gzip 压缩配置，减少传输数据量
2. **启用缓存**：为静态文件添加缓存策略，提高页面加载速度
3. **优化数据库查询**：添加适当的索引，优化查询语句
4. **使用 CDN**：将静态资源部署到 CDN 上，提高资源加载速度
5. **启用 HTTPS**：提高网站安全性和搜索引擎排名

## 安全建议

1. **使用强密码**：为数据库用户、管理员账号设置强密码
2. **定期更新依赖**：定期更新项目依赖，修复安全漏洞
3. **限制访问权限**：仅允许必要的 IP 访问管理后台
4. **启用防火墙**：配置防火墙，仅允许必要的端口访问
5. **定期备份数据**：定期备份数据库和重要文件
6. **使用 HTTPS**：保护数据传输安全

## 部署检查清单

- [ ] 数据库已创建并初始化
- [ ] 环境变量配置正确
- [ ] 应用能够正常启动
- [ ] 前端页面能够正常访问
- [ ] API 请求能够正常响应
- [ ] 静态资源能够正常加载
- [ ] 防火墙配置正确
- [ ] HTTPS 已配置（可选）
- [ ] 监控和日志配置正确

## 后续维护

1. 定期更新项目依赖
2. 定期备份数据库和重要文件
3. 监控服务器性能和日志
4. 定期检查网站安全性
5. 根据需求进行功能扩展和优化

---

以上是咨询公司官网的部署指南，希望对您有所帮助。如果在部署过程中遇到问题，请随时参考本指南或联系技术支持。