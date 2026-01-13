# 咨询公司官网详细部署指南

## 1. 服务器准备

### 1.1 操作系统选择

推荐使用 **Ubuntu 22.04 LTS**，这是一个稳定、安全且长期支持的操作系统版本。

### 1.2 服务器基础配置

#### 1.2.1 登录服务器

使用 SSH 工具登录服务器（如 PuTTY、Xshell 或终端）：

```bash
# 替换为你的服务器 IP 地址
ssh root@your_server_ip
```

#### 1.2.2 更新系统

```bash
# 更新系统包列表
sudo apt update

# 更新系统软件包
sudo apt upgrade -y

# 安装必要的基础软件
sudo apt install -y curl wget git unzip vim
```

#### 1.2.3 创建新用户

为了安全起见，建议创建一个新用户来运行应用，而不是使用 root 用户：

```bash
# 创建新用户
sudo adduser consulting_user

# 添加到 sudo 组
sudo usermod -aG sudo consulting_user

# 切换到新用户
su - consulting_user
```

#### 1.2.4 配置防火墙

```bash
# 查看当前防火墙状态
sudo ufw status

# 启用防火墙
sudo ufw enable

# 允许 SSH 访问
sudo ufw allow ssh

# 允许 HTTP 访问
sudo ufw allow http

# 允许 HTTPS 访问
sudo ufw allow https

# 允许应用端口访问
sudo ufw allow 3000

# 查看防火墙规则
sudo ufw status verbose
```

## 2. 安装必要软件

### 2.1 安装 Node.js

使用 NVM（Node Version Manager）安装 Node.js，这是管理 Node.js 版本的推荐方式：

```bash
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc

# 安装 Node.js 18（LTS 版本）
nvm install 18

# 设置默认 Node.js 版本
nvm alias default 18

# 验证 Node.js 和 npm 版本
node -v
npm -v
```

### 2.2 安装 MySQL

```bash
# 安装 MySQL
sudo apt install -y mysql-server

# 启动 MySQL 服务
sudo systemctl start mysql

# 设置 MySQL 开机自启
sudo systemctl enable mysql

# 运行 MySQL 安全脚本
sudo mysql_secure_installation
```

在安全脚本中，你需要：
1. 设置 root 密码
2. 删除匿名用户
3. 禁止 root 远程登录
4. 删除测试数据库
5. 重新加载权限表

### 2.3 安装 Nginx

```bash
# 安装 Nginx
sudo apt install -y nginx

# 启动 Nginx 服务
sudo systemctl start nginx

# 设置 Nginx 开机自启
sudo systemctl enable nginx

# 验证 Nginx 服务状态
sudo systemctl status nginx
```

### 2.4 安装 PM2

```bash
# 安装 PM2 全局工具
npm install -g pm2

# 设置 PM2 开机自启
pm2 startup systemd
```

## 3. 应用代码部署

### 3.1 克隆代码

```bash
# 进入家目录
cd ~

# 克隆代码（替换为你的仓库地址）
git clone https://github.com/your_username/consulting-company.git

# 进入项目目录
cd consulting-company
```

### 3.2 安装依赖

```bash
# 安装项目依赖
npm install
```

## 4. 数据库配置

### 4.1 登录 MySQL

```bash
# 登录 MySQL
sudo mysql -u root -p
```

### 4.2 创建数据库和用户

```sql
-- 创建数据库
CREATE DATABASE consulting_company CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建数据库用户并授权
CREATE USER 'consulting_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON consulting_company.* TO 'consulting_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出 MySQL
EXIT;
```

### 4.3 导入数据库脚本

```bash
# 导入数据库初始化脚本
mysql -u consulting_user -p consulting_company < database.sql
```

## 5. 应用配置

### 5.1 配置环境变量

```bash
# 复制环境变量示例文件
cp .env .env.production

# 使用 vim 编辑环境变量文件
vim .env.production
```

在 vim 中，按 `i` 进入编辑模式，修改以下配置：

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

按 `Esc` 退出编辑模式，输入 `:wq` 保存并退出。

### 5.2 创建上传目录

```bash
# 创建上传目录
mkdir -p uploads

# 设置目录权限
chmod -R 755 uploads
```

## 6. 启动应用

### 6.1 使用 PM2 启动应用

```bash
# 启动应用
npm run start:pm2

# 查看应用状态
npm run status:pm2

# 查看应用日志
npm run logs:pm2
```

### 6.2 验证应用运行

```bash
# 检查应用是否在监听端口 3000
sudo netstat -tuln | grep 3000

# 或使用 ss 命令
ss -tuln | grep 3000

# 测试应用是否正常响应
curl http://localhost:3000/health
```

## 7. 配置 Nginx 反向代理

### 7.1 创建 Nginx 配置文件

```bash
# 创建配置文件
sudo vim /etc/nginx/sites-available/consulting-company
```

在 vim 中，按 `i` 进入编辑模式，添加以下配置：

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # 前端页面
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 路由
    location /api {
        proxy_pass http://localhost:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态文件
    location /uploads {
        alias /home/consulting_user/consulting-company/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /html {
        alias /home/consulting_user/consulting-company/html;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 404 页面
    error_page 404 /404.html;
    location = /404.html {
        root /home/consulting_user/consulting-company/html;
        internal;
    }

    # 500 错误页面
    error_page 500 502 503 504 /500.html;
    location = /500.html {
        root /home/consulting_user/consulting-company/html;
        internal;
    }
}
```

按 `Esc` 退出编辑模式，输入 `:wq` 保存并退出。

### 7.2 启用 Nginx 配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/consulting-company /etc/nginx/sites-enabled/

# 测试 Nginx 配置
sudo nginx -t

# 重新加载 Nginx 配置
sudo systemctl reload nginx
```

## 8. 配置 HTTPS

### 8.1 安装 Certbot

```bash
# 安装 Certbot 和 Nginx 插件
sudo apt install -y certbot python3-certbot-nginx
```

### 8.2 获取 SSL 证书

```bash
# 获取 SSL 证书
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

在提示中，你需要：
1. 输入你的邮箱地址
2. 同意服务条款
3. 是否加入邮件列表
4. 是否将 HTTP 重定向到 HTTPS（推荐选择 Yes）

### 8.3 验证 SSL 证书

访问你的网站（https://your_domain.com），检查是否有绿色的锁图标。

### 8.4 自动续期 SSL 证书

```bash
# 测试自动续期
sudo certbot renew --dry-run

# 查看 crontab 任务
ls -la /etc/cron.d/
```

Certbot 会自动创建一个 crontab 任务来定期检查和续期证书。

## 9. 配置定期备份

### 9.1 创建备份脚本

```bash
# 创建备份目录
mkdir -p ~/backup

# 创建备份脚本
vim ~/backup/backup.sh
```

在 vim 中，按 `i` 进入编辑模式，添加以下内容：

```bash
#!/bin/bash

# 备份目录
BACKUP_DIR="/home/consulting_user/backup"

# 数据库配置
DB_USER="consulting_user"
DB_PASSWORD="your_strong_password"
DB_NAME="consulting_company"

# 应用目录
APP_DIR="/home/consulting_user/consulting-company"

# 备份文件名
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="${BACKUP_DIR}/db_backup_${DATE}.sql"
APP_BACKUP_FILE="${BACKUP_DIR}/app_backup_${DATE}.tar.gz"

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 备份数据库
echo "开始备份数据库..."
mysqldump -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} > ${DB_BACKUP_FILE}

# 备份应用代码
echo "开始备份应用代码..."
tar -czf ${APP_BACKUP_FILE} ${APP_DIR} --exclude="${APP_DIR}/node_modules" --exclude="${APP_DIR}/.git" --exclude="${APP_DIR}/uploads"

# 删除 7 天前的备份
echo "删除 7 天前的备份..."
find ${BACKUP_DIR} -name "*.sql" -mtime +7 -delete
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +7 -delete

echo "备份完成！"
echo "数据库备份文件：${DB_BACKUP_FILE}"
echo "应用备份文件：${APP_BACKUP_FILE}"
```

按 `Esc` 退出编辑模式，输入 `:wq` 保存并退出。

### 9.2 设置脚本执行权限

```bash
chmod +x ~/backup/backup.sh
```

### 9.3 添加到 crontab

```bash
# 编辑 crontab
crontab -e
```

在 vim 中，按 `i` 进入编辑模式，添加以下内容（每天凌晨 2 点执行备份）：

```
0 2 * * * /home/consulting_user/backup/backup.sh > /home/consulting_user/backup/backup.log 2>&1
```

按 `Esc` 退出编辑模式，输入 `:wq` 保存并退出。

## 10. 监控和维护

### 10.1 查看应用日志

```bash
# 查看 PM2 日志
npm run logs:pm2

# 查看 Nginx 访问日志
sudo tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看系统日志
sudo tail -f /var/log/syslog
```

### 10.2 监控服务器资源

```bash
# 查看 CPU 和内存使用情况
top

# 或使用 htop（更友好的界面）
sudo apt install -y htop
htop

# 查看磁盘使用情况
df -h

# 查看磁盘 I/O
iotop
```

### 10.3 更新应用代码

```bash
# 进入项目目录
cd ~/consulting-company

# 拉取最新代码
git pull

# 安装新依赖
npm install

# 重启应用
npm run restart:pm2
```

### 10.4 定期更新系统和依赖

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 更新 Node.js 依赖
cd ~/consulting-company
npm update

# 重启应用
npm run restart:pm2
```

## 11. 常见问题排查

### 11.1 应用无法启动

```bash
# 检查应用日志
npm run logs:pm2

# 检查 Node.js 版本
node -v

# 检查端口是否被占用
sudo netstat -tuln | grep 3000
```

### 11.2 数据库连接失败

```bash
# 检查 MySQL 服务状态
sudo systemctl status mysql

# 检查数据库连接
mysql -u consulting_user -p consulting_company

# 检查环境变量配置
cat .env.production
```

### 11.3 Nginx 502 错误

```bash
# 检查应用是否在运行
npm run status:pm2

# 检查 Nginx 配置
sudo nginx -t

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 11.4 SSL 证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 手动续期证书
sudo certbot renew
```

## 12. 安全建议

1. **使用强密码**：为所有用户和服务设置强密码
2. **定期更新**：定期更新系统、软件包和依赖
3. **禁用不必要的服务**：只运行必要的服务
4. **启用防火墙**：配置严格的防火墙规则
5. **使用 HTTPS**：确保所有流量都通过 HTTPS
6. **定期备份**：定期备份数据和代码
7. **使用密钥认证**：禁用密码登录，使用 SSH 密钥
8. **限制登录尝试**：安装 fail2ban 限制登录尝试
9. **监控日志**：定期检查系统和应用日志
10. **使用容器化部署**：考虑使用 Docker 部署应用

## 13. 附录

### 13.1 常用命令

| 命令 | 描述 |
|------|------|
| `npm run start:pm2` | 启动应用 |
| `npm run stop:pm2` | 停止应用 |
| `npm run restart:pm2` | 重启应用 |
| `npm run logs:pm2` | 查看应用日志 |
| `npm run status:pm2` | 查看应用状态 |
| `sudo systemctl restart nginx` | 重启 Nginx |
| `sudo systemctl restart mysql` | 重启 MySQL |
| `sudo nginx -t` | 测试 Nginx 配置 |
| `sudo certbot certificates` | 查看 SSL 证书 |

### 13.2 配置文件路径

| 文件 | 路径 |
|------|------|
| Nginx 配置 | `/etc/nginx/sites-available/consulting-company` |
| 应用环境变量 | `~/consulting-company/.env.production` |
| MySQL 配置 | `/etc/mysql/mysql.conf.d/mysqld.cnf` |
| 备份脚本 | `~/backup/backup.sh` |

### 13.3 端口说明

| 端口 | 用途 |
|------|------|
| 80 | HTTP 访问 |
| 443 | HTTPS 访问 |
| 22 | SSH 访问 |
| 3306 | MySQL 访问 |
| 3000 | 应用访问 |

---

本指南提供了从服务器准备到应用部署的详细步骤，包括必要软件安装、数据库配置、应用配置、Nginx 配置、SSL 证书配置、定期备份和监控维护等内容。按照本指南操作，你可以成功部署咨询公司官网，并确保应用稳定运行。