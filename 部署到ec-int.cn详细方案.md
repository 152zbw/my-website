# 部署到 ec-int.cn（阿里云 ECS）超详细操作指南（新手版）

适用场景：
- 云服务器：**阿里云 ECS**
- 系统：**Alibaba Cloud Linux 3.2104 64位**
- 域名主站：**www.ec-int.cn**
- 前台对公网开放，后台仅允许固定 IP 访问（方案A）
- 你的固定公网 IP：`47.104.69.36`
- 项目形态：Node.js（Express）+ 静态页面在 `html/`，默认端口 `3000`

> 目标：外网访问 `https://www.ec-int.cn` 正常；访问 `https://www.ec-int.cn/html/admin/` 只有 `47.104.69.36` 能进。

---

## 0. 你需要准备什么

- **阿里云账号**（已购买 ECS）
- **已备案的域名**（国内服务器必须备案，否则 80/443 访问会受影响）
- 你的 ECS **公网 IP**
- 你本地的固定公网 IP：`47.104.69.36`
- 一个 SSH 工具（任选一个）
  - **Mac**：终端（Terminal）
  - **Windows**：FinalShell / Xshell
  - 或阿里云控制台自带的“远程连接”

---

## 1. 在阿里云控制台设置 DNS 解析（把域名指向服务器）

1. 登录阿里云控制台
2. 顶部搜索：**域名**
3. 进入 **域名列表**
4. 找到 `ec-int.cn`，点击右侧 **解析**
5. 点击 **添加记录**，添加两条 **A 记录**：

### 1.1 添加 www
- **记录类型**：A
- **主机记录**：`www`
- **记录值**：填你的 ECS 公网 IP
- **TTL**：默认

### 1.2 添加 @（裸域）
- **记录类型**：A
- **主机记录**：`@`
- **记录值**：同样填 ECS 公网 IP
- **TTL**：默认

保存后等待 1～10 分钟生效。

---

## 2. 配置 ECS 安全组（非常关键）

这是最重要的第一层安全防护：**只对公网开放 80/443**，并限制 SSH。

1. 控制台顶部搜索：**云服务器 ECS**
2. 左侧：**实例**
3. 点击你的那台 ECS
4. 找到 **安全组**（或“本实例安全组”）进入
5. 进入 **入方向规则**（Inbound）

### 2.1 必须放行的端口
- **80/TCP**：授权对象 `0.0.0.0/0`
- **443/TCP**：授权对象 `0.0.0.0/0`

### 2.2 SSH 端口只允许你自己 IP
- **22/TCP**：授权对象 `47.104.69.36/32`

### 2.3 不要放行
- **3000/TCP**：不要对公网开放（Node 端口只给 Nginx 在本机转发）

> 如果你之前误把 22 或 3000 放开了 `0.0.0.0/0`，请删除或改成仅你的 IP。

---

## 3. 用 SSH 连接服务器

### 3.1 Mac 终端连接（示例）
打开终端执行（把 `root` 和公网 IP 换成你的）：

```bash
ssh root@你的ECS公网IP
```

首次连接会问是否继续，输入 `yes` 回车，然后输入密码。

---

## 4. 安装 Nginx、Node.js、PM2

> 以下命令都在服务器 SSH 里执行。

### 4.1 更新系统
```bash
sudo yum -y update
```

### 4.2 安装并启动 Nginx
```bash
sudo yum -y install nginx
sudo systemctl enable nginx
sudo systemctl start nginx
systemctl status nginx
```

### 4.3 安装 Node.js（推荐 20 LTS）
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum -y install nodejs
node -v
npm -v
```

### 4.4 安装 PM2（让 Node 常驻运行）
```bash
sudo npm i -g pm2
pm2 -v
```

---

## 5. 把代码放到服务器

推荐放在：`/var/www/ec-int`

### 5.1 创建目录
```bash
sudo mkdir -p /var/www/ec-int
sudo chown -R $USER:$USER /var/www/ec-int
cd /var/www/ec-int
```

### 5.2 拉取代码（推荐 git）
```bash
git clone https://github.com/152zbw/my-website.git .
```

以后更新代码：
```bash
cd /var/www/ec-int
git pull
```

---

## 6. 安装依赖、创建 .env、初始化数据库

### 6.1 安装依赖
```bash
cd /var/www/ec-int
npm install
```

### 6.2 创建生产环境 .env
生成一个随机 JWT_SECRET：
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

复制输出值后，创建 `.env`：
```bash
cat > .env <<'EOF'
NODE_ENV=production
DB_DIALECT=sqlite
SQLITE_PATH=/var/www/ec-int/data/database.sqlite
JWT_SECRET=把你刚才生成的随机字符串粘贴到这里
EOF
```

> **一定要改掉 JWT_SECRET**，不要用默认/短字符串。

### 6.3 初始化数据库
```bash
npm run init-db
```

---

## 7. 启动 Node（PM2）并设置开机自启

### 7.1 启动
```bash
cd /var/www/ec-int
pm2 start app.js --name ec-int
pm2 list
```

### 7.2 保存并开机自启
```bash
pm2 save
pm2 startup
```

`pm2 startup` 会输出一条命令（以 `sudo` 开头），复制出来再执行一次即可。

---

## 8. 配置 Nginx（反向代理 + 后台 IP 白名单）

> 先配置 **HTTP** 版本，用于后面申请证书验证。

创建配置文件：
```bash
sudo tee /etc/nginx/conf.d/ec-int.cn.conf > /dev/null <<'EOF'
server {
  listen 80;
  server_name ec-int.cn www.ec-int.cn;

  # certbot 验证目录（申请证书会用到）
  location /.well-known/acme-challenge/ {
    root /var/www/html;
  }

  # 前台：所有人可访问
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # 后台：对所有网络开放（安全依赖“登录鉴权”）
  # 如果你仍想加强防护，可以改回“固定 IP allow/deny”，或加 Nginx BasicAuth（见下方可选项）
  location ^~ /html/admin/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
```

检查并重载：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

现在你应该可以：
- 打开 `http://www.ec-int.cn/html/index.html`
- 访问 `http://www.ec-int.cn/html/admin/`：任何网络都能进（会进入后台登录）

---

## 9. 申请 HTTPS 证书（Let’s Encrypt，certbot）

### 9.1 安装 certbot
```bash
sudo yum -y install certbot
```

### 9.2 申请证书（包含 ec-int.cn 和 www.ec-int.cn）
```bash
sudo certbot certonly --webroot -w /var/www/html -d ec-int.cn -d www.ec-int.cn
```

成功后证书通常在：
- `/etc/letsencrypt/live/www.ec-int.cn/fullchain.pem`
- `/etc/letsencrypt/live/www.ec-int.cn/privkey.pem`

---

## 10. 开启 HTTPS，并强制跳转到 www + https

编辑 Nginx 配置：
```bash
sudo vi /etc/nginx/conf.d/ec-int.cn.conf
```

把内容替换成：
```nginx
server {
  listen 80;
  server_name ec-int.cn www.ec-int.cn;
  return 301 https://www.ec-int.cn$request_uri;
}

server {
  listen 443 ssl http2;
  server_name www.ec-int.cn;

  ssl_certificate     /etc/letsencrypt/live/www.ec-int.cn/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/www.ec-int.cn/privkey.pem;

  add_header X-Frame-Options SAMEORIGIN always;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # 后台：对所有网络开放（安全依赖“登录鉴权”）
  # 如果你仍想加强防护，可以改回“固定 IP allow/deny”，或加 Nginx BasicAuth（见下方可选项）
  location ^~ /html/admin/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

检查并重载：
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 11. 证书自动续期

```bash
sudo systemctl enable --now certbot-renew.timer
sudo systemctl status certbot-renew.timer
```

---

## 12. 最终验收清单（照着逐条检查）

1. `https://www.ec-int.cn/html/index.html` 能打开
2. `http://www.ec-int.cn` 自动跳到 `https://www.ec-int.cn`
3. `https://www.ec-int.cn/html/admin/`
   - 你从 `47.104.69.36` 访问：能打开
   - 别人访问：403（被拒绝）
4. 服务器上：
   - `pm2 list` 能看到 `ec-int` 在线
   - `sudo nginx -t` 没有报错

---

## 13. 常见问题（新手最容易卡住）

### 13.1 后台突然进不去了（403）
原因：你的公网 IP 变了。
- 解决：把 Nginx 配置中 `allow 47.104.69.36;` 改成你新 IP，然后 `sudo systemctl reload nginx`

### 13.2 域名访问不了（超时）
常见原因：
- DNS 解析还没生效
- 安全组没开 80/443
- Nginx 没启动

### 13.3 证书申请失败
常见原因：
- 80 没开放
- Nginx 配置没包含 `/.well-known/acme-challenge/`
- 域名没解析到这台 ECS

---

## 14. 安全建议（上线前务必做）

- 修改后台默认账号密码（不要用 admin/admin123）
- `.env` 的 `JWT_SECRET` 必须是强随机字符串
- 安全组不要开放 3000 到公网
- SSH 22 只放行你自己的 IP（`47.104.69.36/32`）

