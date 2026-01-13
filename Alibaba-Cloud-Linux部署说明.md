# 🚀 Alibaba Cloud Linux 部署说明

> **重要**：如果你的服务器是 **Alibaba Cloud Linux**（不是 Ubuntu），请使用本指南！

---

## ⚠️ 重要区别

**Alibaba Cloud Linux** 和 **Ubuntu** 的区别：

| 项目 | Ubuntu | Alibaba Cloud Linux |
|------|--------|---------------------|
| **包管理器** | `apt` | `yum` |
| **系统类型** | Debian 系 | CentOS/RHEL 系 |
| **Node.js 安装** | 使用 NodeSource | 使用 NVM 或编译安装 |

---

## ✅ 好消息：不需要重新开服务器！

你的服务器**完全可以用**，只需要使用不同的命令即可。

---

## 📋 快速部署步骤（Alibaba Cloud Linux 版）

### 第一步：连接服务器

在 Mac 终端中：

```bash
ssh root@你的公网IP
```

输入密码，连接成功。

### 第二步：更新系统

```bash
# Alibaba Cloud Linux 使用 yum，不是 apt
yum update -y
```

### 第三步：安装 Node.js（使用 NVM，推荐）

#### 3.1 安装必要的工具

```bash
yum install -y curl wget git
```

#### 3.2 安装 NVM

```bash
# 下载并安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### 3.3 重新加载配置

```bash
source ~/.bashrc
```

#### 3.4 安装 Node.js 18

```bash
# 安装 Node.js 18
nvm install 18

# 使用 Node.js 18
nvm use 18

# 设置为默认版本
nvm alias default 18
```

#### 3.5 验证安装

```bash
node -v
npm -v
```

应该显示：
```
v18.x.x
9.x.x
```

✅ **如果看到版本号，说明安装成功！**

### 第四步：安装 PM2

```bash
npm install -g pm2
```

验证：
```bash
pm2 -v
```

### 第五步：上传项目文件

#### 方法一：使用 Git（推荐）

**在你的 Mac 上：**

1. 打开终端，进入项目目录：
   ```bash
   cd ~/Desktop/JW\ 2
   ```

2. 初始化 Git（如果还没做）：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. 上传到 GitHub（参考主文档的步骤）

**在服务器上：**

```bash
cd /root
git clone https://github.com/你的用户名/仓库名.git
cd 仓库名
```

#### 方法二：使用 FTP 工具

使用 FileZilla 或其他 FTP 工具上传文件到 `/root` 目录。

### 第六步：配置和启动项目

```bash
# 进入项目目录
cd /root/仓库名  # 或 cd /root/JW\ 2

# 安装依赖
npm install

# 创建 .env 文件
nano .env
```

**在 nano 编辑器中输入：**
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=你的随机密钥（至少32字符）
JWT_EXPIRES_IN=24h
DB_DIALECT=sqlite
```

**生成随机密钥：**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**保存文件：** `Ctrl + X` → `Y` → `Enter`

```bash
# 初始化数据库
DB_DIALECT=sqlite node init-db.js

# 使用 PM2 启动
DB_DIALECT=sqlite pm2 start app.js --name my-website

# 设置开机自启
pm2 save
pm2 startup
# 执行上面命令输出的那行命令（通常是 sudo env PATH=...）
```

### 第七步：配置防火墙

#### 7.1 服务器防火墙（firewalld）

```bash
# 检查防火墙状态
systemctl status firewalld

# 如果防火墙未运行，启动它
systemctl start firewalld
systemctl enable firewalld

# 开放 3000 端口
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# 查看开放的端口
firewall-cmd --list-ports
```

#### 7.2 阿里云安全组

在阿里云控制台：
1. 进入 **云服务器ECS** → **实例**
2. 点击你的服务器
3. 点击 **安全组** 标签
4. 点击安全组ID
5. 点击 **入方向** → **添加安全组规则**
6. 配置：
   - 端口范围：`3000/3000`
   - 授权对象：`0.0.0.0/0`
7. 保存

### 第八步：测试访问

在浏览器中访问：
- `http://你的公网IP:3000`
- `http://你的公网IP:3000/html/admin/index.html`

---

## 🔄 命令对照表

| Ubuntu 命令 | Alibaba Cloud Linux 命令 |
|-------------|-------------------------|
| `apt update` | `yum update -y` |
| `apt install` | `yum install -y` |
| `apt upgrade` | `yum update -y` |
| `ufw allow` | `firewall-cmd --permanent --add-port` |
| `ufw status` | `firewall-cmd --list-ports` |
| `systemctl` | `systemctl`（相同） |

---

## ⚠️ 关于服务器上已有 SaaS 系统

### ✅ 可以共用服务器！

你的服务器可以同时运行多个应用，但需要注意：

### 1. 端口冲突

**问题：** 如果 SaaS 系统也使用 3000 端口，会冲突。

**解决方法：** 修改你的网站端口

**步骤：**

1. **修改 .env 文件**
   ```bash
   nano .env
   ```
   
   把 `PORT=3000` 改成其他端口，例如：
   ```env
   PORT=3001
   ```
   
   保存：`Ctrl + X` → `Y` → `Enter`

2. **重启应用**
   ```bash
   pm2 restart my-website
   ```

3. **开放新端口**
   ```bash
   # 防火墙
   firewall-cmd --permanent --add-port=3001/tcp
   firewall-cmd --reload
   
   # 阿里云安全组也要添加 3001 端口
   ```

4. **访问新地址**
   - `http://你的IP:3001`

### 2. 资源占用

**检查服务器资源：**

```bash
# 查看 CPU 和内存使用
top

# 查看磁盘空间
df -h

# 查看内存使用
free -h
```

**建议：**
- 如果服务器是 1核1GB，可能不够用，建议升级
- 如果服务器是 1核2GB 或更高，通常够用

### 3. 进程管理

**查看所有运行的应用：**

```bash
pm2 list
```

**查看系统所有进程：**

```bash
ps aux
```

---

## 🔧 常见问题

### ❌ 问题1：yum 命令找不到

**错误：** `command not found: yum`

**解决方法：**

Alibaba Cloud Linux 3 可能使用 `dnf` 而不是 `yum`：

```bash
# 尝试使用 dnf
dnf update -y
dnf install -y curl wget git
```

或者安装 yum：

```bash
dnf install -y yum
```

### ❌ 问题2：NVM 安装后找不到命令

**错误：** `command not found: nvm`

**解决方法：**

```bash
# 重新加载配置
source ~/.bashrc

# 或者手动加载
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 验证
nvm --version
```

### ❌ 问题3：防火墙命令找不到

**错误：** `command not found: firewall-cmd`

**解决方法：**

```bash
# 安装 firewalld
yum install -y firewalld

# 启动防火墙
systemctl start firewalld
systemctl enable firewalld
```

### ❌ 问题4：端口被占用

**检查端口占用：**

```bash
# 查看 3000 端口是否被占用
netstat -tlnp | grep 3000

# 或者
lsof -i :3000
```

**解决方法：**
- 如果被占用，修改你的应用端口（见上方"端口冲突"部分）

---

## 📝 完整部署命令（一键复制）

```bash
# 1. 更新系统
yum update -y

# 2. 安装必要工具
yum install -y curl wget git

# 3. 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 4. 安装 Node.js
nvm install 18
nvm use 18
nvm alias default 18

# 5. 验证
node -v
npm -v

# 6. 安装 PM2
npm install -g pm2

# 7. 进入项目目录（根据你的实际情况修改）
cd /root/你的项目目录

# 8. 安装依赖
npm install

# 9. 创建 .env 文件（手动编辑）
nano .env
# 输入配置内容，保存

# 10. 初始化数据库
DB_DIALECT=sqlite node init-db.js

# 11. 启动应用
DB_DIALECT=sqlite pm2 start app.js --name my-website
pm2 save
pm2 startup
# 执行上面命令输出的那行命令

# 12. 配置防火墙
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload
```

---

## ✅ 总结

1. **不需要重新开服务器** ✅
2. **Alibaba Cloud Linux 完全可以用** ✅
3. **只需要使用 `yum` 而不是 `apt`** ✅
4. **使用 NVM 安装 Node.js** ✅
5. **可以和其他系统共用服务器** ✅（注意端口冲突）

---

**按照上面的步骤操作即可！** 🚀

