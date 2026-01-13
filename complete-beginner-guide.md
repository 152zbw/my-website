# 咨询公司官网 - 完全小白部署指南

## 前提条件

- 一台运行 Ubuntu 22.04 LTS 的服务器（可以从云服务商购买，如阿里云、腾讯云、华为云等）
- 一个域名（可以从域名服务商购买，如阿里云、腾讯云、Namecheap 等）

## 工具准备

### 1. 远程连接工具 - PuTTY

**用途**：连接到您的服务器

**下载地址**：[PuTTY 官方网站](https://www.putty.org/)

**安装步骤**：
1. 打开下载页面，点击 "putty.exe" 下载
2. 下载后直接双击运行，无需安装

### 2. 文件编辑工具 - Notepad++

**用途**：编辑配置文件

**下载地址**：[Notepad++ 官方网站](https://notepad-plus-plus.org/downloads/)

**安装步骤**：
1. 打开下载页面，点击 "Download" 按钮
2. 下载后双击安装，一路点击 "Next" 即可

### 3. FTP 工具 - FileZilla

**用途**：上传和下载文件（可选）

**下载地址**：[FileZilla 官方网站](https://filezilla-project.org/download.php?type=client)

**安装步骤**：
1. 打开下载页面，点击 "Download FileZilla Client" 按钮
2. 下载后双击安装，一路点击 "Next" 即可

## 操作步骤

### 1. 连接到服务器

#### 1.1 打开 PuTTY

1. 双击运行 `putty.exe`
2. 在 "Host Name (or IP address)" 输入框中输入您的服务器 IP 地址
3. 在 "Port" 输入框中输入 `22`
4. 在 "Connection type" 中选择 `SSH`
5. 点击 "Open" 按钮

#### 1.2 登录服务器

1. 首次连接会弹出一个安全提示，点击 "Yes" 保存服务器密钥
2. 在 "login as:" 提示符后输入 `root`，按回车键
3. 在 "Password:" 提示符后输入您的服务器密码（输入时不会显示，输完直接按回车键）

如果登录成功，您会看到类似这样的提示符：
```
root@your-server:~#
```

### 2. 服务器初始化

#### 2.1 更新系统

在 PuTTY 窗口中，输入以下命令，每行命令输入后按回车键执行：

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git unzip vim
```

#### 2.2 创建新用户

继续在 PuTTY 窗口中输入：

```bash
sudo adduser consulting_user
sudo usermod -aG sudo consulting_user
su - consulting_user
```

在创建用户过程中，需要：
1. 输入新用户密码（输完按回车键）
2. 再次输入密码确认（输完按回车键）
3. 按回车键跳过其他信息（姓名、电话等）
4. 最后输入 `Y` 确认

#### 2.3 配置防火墙

继续在 PuTTY 窗口中输入：

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw allow 3000
sudo ufw status verbose
```

### 3. 安装必要软件

#### 3.1 安装 Node.js

继续在 PuTTY 窗口中输入：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18
nvm alias default 18
node -v
npm -v
```

#### 3.2 安装 MySQL

继续在 PuTTY 窗口中输入：

```bash
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

在安全脚本中，按照提示操作：
1. 输入 `Y` 开启密码验证插件
2. 设置 MySQL root 密码（输完按回车键）
3. 再次输入密码确认（输完按回车键）
4. 输入 `Y` 删除匿名用户
5. 输入 `Y` 禁止 root 远程登录
6. 输入 `Y` 删除测试数据库
7. 输入 `Y` 重新加载权限表

#### 3.3 安装 Nginx

继续在 PuTTY 窗口中输入：

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

#### 3.4 安装 PM2

继续在 PuTTY 窗口中输入：

```bash
npm install -g pm2
pm2 startup systemd
```

### 4. 部署应用代码

#### 4.1 克隆代码

继续在 PuTTY 窗口中输入：

```bash
cd ~
git clone https://github.com/your_username/consulting-company.git
cd consulting-company
```

**注意**：请将 `your_username` 替换为您的 GitHub 用户名，如果您没有 GitHub 仓库，可以使用 `wget` 下载代码包并解压。

#### 4.2 安装依赖

继续在 PuTTY 窗口中输入：

```bash
npm install
```

### 5. 配置数据库

#### 5.1 登录 MySQL

继续在 PuTTY 窗口中输入：

```bash
sudo mysql -u root -p
```

输入您之前设置的 MySQL root 密码，按回车键。

#### 5.2 创建数据库和用户

在 MySQL 提示符下输入：

```sql
CREATE DATABASE consulting_company CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'consulting_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON consulting_company.* TO 'consulting_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**注意**：请将 `your_strong_password` 替换为您自己的密码。

#### 5.3 导入数据库脚本

继续在 PuTTY 窗口中输入：

```bash
mysql -u consulting_user -p consulting_company < database.sql
```

输入您刚刚设置的 `consulting_user` 密码，按回车键。

### 6. 配置应用

#### 6.1 编辑环境变量文件

继续在 PuTTY 窗口中输入：

```bash
cp .env .env.production
vim .env.production
```

在 Vim 编辑器中，按 `i` 进入编辑模式，修改以下配置：

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=consulting_user
DB_PASSWORD=your_strong_password
DB_NAME=consulting_company
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

**注意**：请将 `your_strong_password` 和 `your_jwt_secret_key` 替换为您自己的值。

编辑完成后，按 `Esc` 退出编辑模式，输入 `:wq` 保存并退出。

#### 6.2 创建上传目录

继续在 PuTTY 窗口中输入：

```bash
mkdir -p uploads
chmod -R 755 uploads
```

### 7. 启动应用

继续在 PuTTY 窗口中输入：

```bash
npm run start:pm2
npm run status:pm2
```

如果显示应用状态为 `online`，说明启动成功。

### 8. 配置域名和 Nginx

#### 8.1 域名解析

登录您的域名服务商控制台，将域名解析到您的服务器 IP 地址：
1. 添加一条 A 记录，主机记录为 `@`，记录值为您的服务器 IP 地址
2. 添加一条 A 记录，主机记录为 `www`，记录值为您的服务器 IP 地址

#### 8.2 配置 Nginx

继续在 PuTTY 窗口中输入：

```bash
sudo vim /etc/nginx/sites-available/consulting-company
```

在 Vim 编辑器中，按 `i` 进入编辑模式，输入以下内容：

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

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
        alias /home/consulting_user/consulting-company/uploads;
        expires 30d;
    }

    location /html {
        alias /home/consulting_user/consulting-company/html;
        expires 30d;
    }
}
```

**注意**：请将 `your_domain.com` 替换为您的域名。

编辑完成后，按 `Esc` 退出编辑模式，输入 `:wq` 保存并退出。

#### 8.3 启用 Nginx 配置

继续在 PuTTY 窗口中输入：

```bash
sudo ln -s /etc/nginx/sites-available/consulting-company /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. 配置 HTTPS

继续在 PuTTY 窗口中输入：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

**注意**：请将 `your_domain.com` 替换为您的域名。

在提示中，按照以下步骤操作：
1. 输入您的邮箱地址（输完按回车键）
2. 输入 `A` 同意服务条款
3. 输入 `N` 不加入邮件列表
4. 输入 `1` 将 HTTP 重定向到 HTTPS

### 10. 验证部署

打开您的浏览器，访问 https://your_domain.com，如果能看到您的网站，说明部署成功！

## 常见问题解决

### 1. PuTTY 连接失败

**问题**：无法连接到服务器，提示 "Connection refused"
**解决**：
- 检查服务器 IP 地址和端口是否正确
- 检查服务器防火墙是否允许 SSH 连接
- 检查服务器是否正常运行

### 2. 应用启动失败

**问题**：使用 `npm run start:pm2` 启动应用失败
**解决**：
- 查看应用日志：`npm run logs:pm2`
- 检查 Node.js 版本：`node -v`
- 检查端口是否被占用：`sudo netstat -tuln | grep 3000`

### 3. 网站无法访问

**问题**：浏览器访问域名时显示 "无法访问此网站"
**解决**：
- 检查服务器是否正常运行
- 检查 Nginx 状态：`sudo systemctl status nginx`
- 检查域名解析是否正确
- 检查防火墙规则：`sudo ufw status verbose`

### 4. 数据库连接失败

**问题**：应用无法连接到数据库
**解决**：
- 检查 MySQL 服务状态：`sudo systemctl status mysql`
- 检查数据库连接：`mysql -u consulting_user -p consulting_company`
- 检查环境变量配置：`cat .env.production`

## 日常维护

### 1. 查看应用日志

在 PuTTY 窗口中输入：

```bash
npm run logs:pm2
```

### 2. 重启应用

在 PuTTY 窗口中输入：

```bash
npm run restart:pm2
```

### 3. 更新应用代码

在 PuTTY 窗口中输入：

```bash
cd ~/consulting-company
git pull
npm install
npm run restart:pm2
```

### 4. 更新系统和依赖

在 PuTTY 窗口中输入：

```bash
sudo apt update && sudo apt upgrade -y
cd ~/consulting-company
npm update
npm run restart:pm2
```

## 联系技术支持

如果您在部署过程中遇到问题，可以联系：
- 邮箱：support@example.com
- 电话：+86-400-123-4567

---

恭喜您完成了咨询公司官网的部署！如果您有任何问题，可以随时参考本指南或联系技术支持。