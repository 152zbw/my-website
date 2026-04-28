# 部署到 ec-int.cn（阿里云 ECS）超详细操作指南（新手版）

适用场景：
- 云服务器：**阿里云 ECS**
- 系统：**Alibaba Cloud Linux 3.2104 64位**
- 域名主站：**www.ec-int.cn**
- 前台对公网开放，**后台也对公网开放，但通过后台登录权限控制安全**
- 项目形态：Node.js（Express）+ 静态页面在 `html/`，默认端口 `3000`

> 目标：外网访问 `https://www.ec-int.cn` 正常；访问 `https://www.ec-int.cn/html/admin/` 任何网络都能打开登录页，但只有有账号密码的人才能登录后台。

---

## 0. 你需要准备什么

- **阿里云账号**（已购买 ECS）
- **已备案的域名**（国内服务器必须备案，否则 80/443 访问会受影响）
- 你的 ECS **公网 IP**
- 你本地的固定公网 IP（用于限制 SSH 登录，例如：`47.104.69.36`）
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
- **22/TCP**：授权对象 `你的固定公网IP/32`（例如：`47.104.69.36/32`）

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
JWT_SECRET=42899c9abbbaa0e2b02ce99c8f0a60dc96c6c8b4b58016725ffb4d5bb4831e0e5f515aa1055ce5770038a5770fbb4a1e
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

## 8. 配置 Nginx（反向代理，前台+后台都可公网访问）

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
  # 如果你仍想加强防护，可以自行改回“固定 IP allow/deny”，或加 Nginx BasicAuth（二次密码）
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
- 访问 `http://www.ec-int.cn/sitemap.xml`：能看到自动生成的网站地图（给搜索引擎用）
- 访问 `http://www.ec-int.cn/robots.txt`：能看到 robots 配置，并指向 sitemap

---

## 9. 申请 HTTPS 证书（Let’s Encrypt，certbot）

> 重要说明：你这台机器使用的是宝塔/自定义 Nginx，站点配置不在标准的 `/etc/nginx/conf.d/`，而是在 `/www/server/panel/vhost/nginx/`。下面所有命令都按这台机器的实际路径写。

### 9.1 先确认网站已经能正常访问

在服务器 SSH 里先执行：

```bash
pm2 list
/www/server/nginx/sbin/nginx -t
curl -I http://www.ec-int.cn
```

如果看到：
- `ec-int` 是 `online`
- `nginx -t` 通过
- `curl -I http://www.ec-int.cn` 返回 `200 OK`

就可以继续。

### 9.2 安装 certbot
```bash
sudo yum -y install certbot
```

如果系统源里没有这个包，再用 `yum search certbot` 检查一下，必要时启用 EPEL 源后重试。

### 9.3 申请证书（包含 ec-int.cn 和 www.ec-int.cn）

先确保挑战目录存在：

```bash
sudo mkdir -p /var/www/html/.well-known/acme-challenge
```

然后申请证书：

```bash
sudo certbot certonly --webroot -w /var/www/html -d ec-int.cn -d www.ec-int.cn
```

执行过程中会依次询问：
- 邮箱地址：填写一个能收信的邮箱
- Terms of Service：输入 `Y`
- 是否把邮箱共享给 EFF：建议输入 `N`

成功后先查看证书目录：

```bash
sudo ls -l /etc/letsencrypt/live/
```

当前这台机器生成的证书目录是：
- `/etc/letsencrypt/live/ec-int.cn/fullchain.pem`
- `/etc/letsencrypt/live/ec-int.cn/privkey.pem`

所以下面的 Nginx 配置要使用 `ec-int.cn` 这个目录名，不要写成 `www.ec-int.cn`。

---

## 10. 开启 HTTPS，并强制跳转到 www + https

编辑宝塔站点配置文件：

```bash
sudo cp /www/server/panel/vhost/nginx/ec-int.cn.conf /www/server/panel/vhost/nginx/ec-int.cn.conf.bak
sudo tee /www/server/panel/vhost/nginx/ec-int.cn.conf > /dev/null <<'EOF'
server {
  listen 80;
  server_name ec-int.cn www.ec-int.cn;
  return 301 https://www.ec-int.cn$request_uri;
}

server {
  listen 443 ssl http2;
  server_name www.ec-int.cn;

  ssl_certificate     /etc/letsencrypt/live/ec-int.cn/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/ec-int.cn/privkey.pem;

  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;

  add_header X-Frame-Options SAMEORIGIN always;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;

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
sudo /www/server/nginx/sbin/nginx -t
sudo /www/server/nginx/sbin/nginx -s reload
```

如果重载后仍出现 `conflicting server name` 警告，说明机器里还有其它站点配置也在监听同一个域名或 IP；这类 warning 不影响当前站点正常访问，但后续建议清理重复配置。

---

## 11. 证书自动续期

先测试自动续期是否正常：

```bash
sudo certbot renew --dry-run
```

如果没有报错，再检查系统里是否已有定时任务：

```bash
sudo systemctl list-timers | grep certbot
```

如果没有 timer，再后续手动补一个定时任务也可以。

---

## 12. 最终验收清单（照着逐条检查）

1. `https://www.ec-int.cn/html/index.html` 能打开（前台网站）
2. `http://www.ec-int.cn` 自动跳到 `https://www.ec-int.cn`
3. `https://www.ec-int.cn/html/admin/index.html` 能打开后台登录页（任何网络都可以访问，但需要账号密码）
4. `https://www.ec-int.cn/sitemap.xml` 能正常返回 XML 网站地图
5. `https://www.ec-int.cn/robots.txt` 能打开，并且里面有一行 `Sitemap: https://www.ec-int.cn/sitemap.xml`
6. 服务器上：
   - `pm2 list` 能看到 `ec-int` 在线
   - `sudo /www/server/nginx/sbin/nginx -t` 没有报错

---

## 13. 常见问题（新手最容易卡住）

### 13.1 后台登录不了 / 一直跳回登录页
常见原因：
- 浏览器没带上最新的后台登录 token（比如你改过域名/协议后，老的 token 失效）
- 后台接口返回 401（未授权）

排查方法：
1. 打开后台登录页 `https://www.ec-int.cn/html/admin/index.html`
2. 按 F12 打开浏览器开发者工具 → 切到 **Network/网络**
3. 输入正确账号密码登录，看 `/api/auth/login` 是否返回 200
4. 登录成功后，再点击后台页面，看接口请求是否都带上了 `Authorization: Bearer xxx` 头

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

### 13.4 执行 `yum install nginx` 报错“没有任何匹配: nginx”，但 `systemctl status nginx` 显示在运行
这是**正常现象之一**，说明你的机器上已经有一个“非系统仓库安装”的 Nginx（常见于宝塔/自编译安装）。

你日志里这句很关键：
- `Loaded: loaded (/etc/rc.d/init.d/nginx; generated)`
- 主进程路径是 `/www/server/nginx/sbin/nginx`

这通常表示：
1. 这个 Nginx 不是通过 `yum` 安装的官方包，所以 `yum` 找不到 `nginx` 包
2. systemd 是通过旧的 init 脚本托管它（所以会看到 `LSB` / `generated`）
3. 你看到 `active (running)` 就代表服务本身已启动

这时不要纠结“yum 安装失败”，而是按下面做：

1. **先确认配置文件路径**（很重要）
```bash
ps -ef | grep nginx
```
看 `-c` 后面的路径。你当前大概率是：
- `/www/server/nginx/conf/nginx.conf`

2. **后续所有 Nginx 配置都写到这套路径下**（不要和 `/etc/nginx` 混用）
- 例如站点配置目录常见是：`/www/server/panel/vhost/nginx/`
- 或 include 到的其他 conf 目录（以你 `nginx.conf` 里的 `include` 为准）

3. **每次改完配置后，必须用对应二进制测试并重载**
```bash
/www/server/nginx/sbin/nginx -t
systemctl reload nginx
```

4. 如果你想统一成系统包版 Nginx（可选），需要规划迁移窗口，不建议在当前可用状态下直接切换。

> 简单结论：你现在不是“没装 Nginx”，而是“装了另一套 Nginx”。继续用当前这套即可，关键是后续配置路径要统一。

---

## 14. 安全建议（上线前务必做）

- 修改后台默认账号密码（不要用 admin/admin123）  
  - 后台“用户管理”页已经接上真实数据库，你可以在那里面新增/修改管理员账号和密码
- `.env` 的 `JWT_SECRET` 必须是强随机字符串
- 安全组不要开放 3000 到公网
- SSH 22 只放行你自己的 IP（例如：`47.104.69.36/32`）


---

## 15. 让别人搜索“笠偲 / 笠偲咨询”能找到你

这部分不是一次性动作，而是一个“先配置好 → 等搜索引擎慢慢收录”的过程。你可以按下面顺序来：

### 15.1 在网站里加上“笠偲 / 笠偲咨询”的品牌信息

1. 打开后台：`https://www.ec-int.cn/html/admin/website-info.html`
2. 把这些地方改成包含你的品牌词：
   - 网站标题：例如 `笠偲咨询 - CE International Group Co.,LTD`
   - 网站描述：例如 `笠偲咨询（CE International Group）专注于……`
   - 公司名称：改成你希望别人搜索的名称（如“笠偲咨询有限公司”）
3. 在“关于我们 / 公司简介 / 联系我们”等页面的正文里，自然地写上几次：
   - “笠偲”
   - “笠偲咨询”
   - “笠偲咨询 CE International Group Co.,LTD”

> 原则：像正常介绍自己公司那样写，不要无意义地堆砌关键词。

### 15.2 确保 sitemap 和 robots 配置正确

1. 确认下面两个地址能正常打开（如果打不开，先回到前面的部署步骤排查）：
   - `https://www.ec-int.cn/sitemap.xml`
   - `https://www.ec-int.cn/robots.txt`
2. `robots.txt` 里应该有类似这一行：
   - `Sitemap: https://www.ec-int.cn/sitemap.xml`

这两个东西是给搜索引擎看的“网站地图”和“抓取说明”，前面的步骤已经帮你自动生成了，这里只需要检查一下即可。

### 15.3 在百度搜索资源平台添加站点并提交 sitemap

> 以百度为例（国内最主要的搜索引擎），其它搜索引擎（360、搜狗等）可以用类似方式操作。

1. 在浏览器打开：`https://ziyuan.baidu.com/`（百度搜索资源平台）
2. 用你的百度账号登录（没有就注册一个）
3. 进入后台后，点击左侧 **站点管理 → 添加网站**
4. 在“站点 URL”里填：
   - `https://www.ec-int.cn`
5. 选择“网站类型”（企业网站），点击下一步
6. 按页面提示做 **站点验证**（常见有三种方式，任选其一即可）：
   - 上传一个验证文件到网站根目录
   - 在首页 `<head>` 里加一段 `<meta>` 标签
   - DNS 解析里加一条 TXT 记录
7. 你可以选 **HTML 文件验证**（相对简单）：
   - 百度会给你一个 `.html` 文件下载
   - 通过 SSH 把这个文件传到服务器的 `/var/www/ec-int/html/` 目录下
   - 确认浏览器能访问：`https://www.ec-int.cn/那个文件名.html`
   - 回到百度后台点“验证”
8. 站点验证成功后，在左侧找到 **链接提交 → sitemaps**
9. 在“提交 sitemaps 地址”里填：
   - `https://www.ec-int.cn/sitemap.xml`
10. 点击提交。

> 百度收录需要时间（几天到几周不等），你可以隔一段时间在“数据统计 → 索引量”里查看收录情况。

### 15.4 其它搜索引擎（可选）

如果你希望在更多搜索引擎里都能搜到“笠偲 / 笠偲咨询”，可以按下面的顺序继续：

- 360 站长平台：`https://zhanzhang.so.com/`
- 必应站长平台：`https://www.bing.com/webmasters/`

操作思路都类似：

1. 注册 / 登录站长平台账号
2. 添加站点（用 `https://www.ec-int.cn`）
3. 根据提示完成站点验证（上传文件或加 meta 标签）
4. 提交 `https://www.ec-int.cn/sitemap.xml`

### 15.5 大致时间线预期

- **第 1 天**：完成部署、改好标题/描述、提交 sitemap
- **1～7 天**：搜索“site:ec-int.cn”时，开始能看到部分页面被收录
- **1～4 周**：搜索“笠偲咨询”时，一般就可以看到你的网站出现在结果里（具体时间取决于搜索引擎抓取频率和网站内容质量）

你需要做的就是：

1. 确保网站能稳定访问（不要频繁宕机）
2. 在“关于我们 / 新闻 / 案例”等地方写一些真实、有价值的中文内容，多次自然出现“笠偲 / 笠偲咨询”
3. 偶尔登录各搜索引擎的站长平台看看是否有报错（例如 robots 配置问题、抓取失败等）

---

## 16. 上线前“5分钟体检清单”（建议每次发布前都做）

在服务器执行以下命令，确认全绿再上线：

```bash
# 1) 进项目目录
cd /var/www/ec-int

# 2) 看 Node / npm 版本
node -v
npm -v

# 3) 看 .env 是否存在（不要输出敏感值）
ls -l .env

# 4) 看数据库文件是否存在
ls -l /var/www/ec-int/data/database.sqlite

# 5) 看 PM2 进程
pm2 list

# 6) 看 Nginx 配置语法
sudo nginx -t

# 7) 看 80/443 监听
sudo ss -lntp | grep -E ':80|:443|:3000'
```

预期结果：
- `pm2 list` 里 `ec-int` 是 `online`
- `nginx -t` 显示 `syntax is ok` + `test is successful`
- 80/443 有 Nginx 监听，3000 仅本机进程监听（不暴露公网）

---

## 17. 标准发布流程（更新代码不慌版）

下面是一套你以后每次更新网站都能复用的流程。

### 17.1 备份当前版本（非常推荐）

```bash
cd /var/www/ec-int
mkdir -p /var/backups/ec-int

# 备份代码（不含 node_modules 更轻）
tar --exclude='node_modules' -czf /var/backups/ec-int/code-$(date +%F-%H%M%S).tar.gz .

# 备份数据库
cp /var/www/ec-int/data/database.sqlite /var/backups/ec-int/database-$(date +%F-%H%M%S).sqlite
```

### 17.2 拉最新代码并安装依赖

```bash
cd /var/www/ec-int
git fetch --all
git pull
npm install
```

### 17.3 若有数据库变更，先执行初始化/迁移

```bash
cd /var/www/ec-int
npm run init-db
```

> 如果你的项目后续引入了真正的 migration 脚本，改成运行 migration 命令，不要一直用 init。

### 17.4 重启服务并快速验收

```bash
pm2 restart ec-int
pm2 logs ec-int --lines 80
```

浏览器验证：
- `https://www.ec-int.cn/html/index.html`
- `https://www.ec-int.cn/html/admin/index.html`
- 后台登录 + 任意一项后台功能（如新增一条内容）

---

## 18. 回滚方案（更新后出问题时）

如果新版本有问题，按下面方式快速恢复：

### 18.1 回滚代码（Git方式）

```bash
cd /var/www/ec-int
git log --oneline -n 5
# 选一个上一个稳定版本 commit-id
git reset --hard 选中的commit-id
npm install
pm2 restart ec-int
```

### 18.2 回滚数据库（如数据结构被破坏）

```bash
# 先停服务，避免写入
pm2 stop ec-int

# 恢复最近一个可用数据库备份
cp /var/backups/ec-int/database-YYYY-MM-DD-HHMMSS.sqlite /var/www/ec-int/data/database.sqlite

# 启动服务
pm2 start ec-int
```

> 回滚后第一时间复测前台页面、后台登录、后台核心功能。

---

## 19. 日志与排障（建议收藏）

### 19.1 应用日志（PM2）

```bash
pm2 logs ec-int
pm2 logs ec-int --lines 200
pm2 monit
```

常见报错定位关键词：
- `EADDRINUSE`：端口被占用
- `SQLITE_CANTOPEN`：数据库路径或权限问题
- `JWT` / `token`：登录凭证问题

### 19.2 Nginx 日志

```bash
# 访问日志
sudo tail -n 100 /var/log/nginx/access.log

# 错误日志
sudo tail -n 100 /var/log/nginx/error.log
```

如果是 502/504：
- 大概率 Node 进程没起来，或 `proxy_pass` 目标端口错了
- 先看 `pm2 list`，再看 `pm2 logs ec-int`

### 19.3 系统资源查看

```bash
# CPU/内存
free -h

# 磁盘
df -h

# 最耗资源进程
top
```

如果磁盘满了，优先清理：
- 历史备份包
- 过大的日志文件
- 无用临时文件

---

## 20. 安全加固（可选但强烈建议）

### 20.1 禁止密码登录，仅允许 SSH 密钥（推荐）

编辑 SSH 配置：

```bash
sudo vi /etc/ssh/sshd_config
```

建议至少改这两项：

```text
PasswordAuthentication no
PermitRootLogin prohibit-password
```

重启 SSH：

```bash
sudo systemctl restart sshd
```

> 注意：先确认你的 SSH 密钥登录可用，再关闭密码登录，避免把自己锁在门外。

### 20.2 安装 Fail2ban（防爆破）

```bash
sudo yum -y install fail2ban
sudo systemctl enable --now fail2ban
sudo systemctl status fail2ban
```

### 20.3 最小权限原则

- 生产环境尽量不要长期用 `root` 运行应用
- 后续可创建专门用户（如 `www`）运行 Node/PM2
- `.env` 设置权限为仅所有者可读：

```bash
chmod 600 /var/www/ec-int/.env
```

### 20.4 基础健康检查脚本（可做成定时任务）

```bash
#!/usr/bin/env bash
set -e
curl -I https://www.ec-int.cn/html/index.html | head -n 1
curl -I https://www.ec-int.cn/html/admin/index.html | head -n 1
pm2 list | grep ec-int
```

你可以把它保存为 `/usr/local/bin/ec-int-healthcheck.sh`，然后配合 crontab 每 5～10 分钟执行一次并把结果写日志。

---

## 21. 推荐的长期运维习惯

1. **每周一次**检查：`pm2 list`、磁盘空间、证书续期状态
2. **每次发布前**先备份数据库
3. **每次发布后**至少做一次后台登录+核心功能回归
4. 把账号权限分级，不要多人共享超级管理员
5. 保持系统安全更新（每月一次窗口维护）

这样做可以把“能跑”变成“稳定长期可用”。
