# 🚀 Mac电脑阿里云部署超详细指南（完全小白版 - Alibaba Cloud Linux）

> **适合人群**：Mac电脑用户，完全不懂编程的小白  
> **适合系统**：Alibaba Cloud Linux 3（阿里云专用系统）  
> **预计时间**：90-120分钟（跟着步骤慢慢来）  
> **难度**：⭐️⭐️（每一步都有详细说明）

⚠️ **重要说明**：本指南专门针对 **Alibaba Cloud Linux** 系统。如果你的服务器是 Ubuntu，请使用其他文档。

---

## 📋 目录

1. [准备工作](#准备工作)
2. [第一步：注册并购买阿里云服务器](#第一步注册并购买阿里云服务器)
3. [第二步：在Mac上连接服务器](#第二步在mac上连接服务器)
4. [第三步：在服务器上安装环境](#第三步在服务器上安装环境)
5. [第四步：上传项目文件到服务器](#第四步上传项目文件到服务器)
6. [第五步：配置和启动项目](#第五步配置和启动项目)
7. [第六步：配置防火墙和安全组](#第六步配置防火墙和安全组)
8. [第七步：测试访问](#第七步测试访问)
9. [常见问题解决](#常见问题解决)
10. [日常维护](#日常维护)

---

## ⚠️ 重要说明：关于已有 SaaS 系统

### ✅ 可以共用服务器！

如果你的服务器上已经有 SaaS 系统或其他应用，**完全可以使用同一个服务器**，只需要注意以下几点：

### 1. 端口冲突处理

**问题：** 如果 SaaS 系统已经使用了 3000 端口，你的网站就不能再用 3000 端口了。

**解决方法：**
- 修改你的网站端口（例如：3001、8080、8000 等）
- 在 `.env` 文件中设置 `PORT=3001`（或其他端口）
- 在防火墙和安全组中开放新端口

**详细步骤见"第八步：处理端口冲突"**

### 2. 资源占用

**检查服务器配置：**
- 1核1GB：可能不够用，建议升级
- 1核2GB：通常够用（推荐）
- 2核4GB：性能更好

**查看资源使用：**
```bash
# CPU 和内存
top

# 磁盘空间
df -h
```

### 3. 进程管理

**查看所有运行的应用：**
```bash
pm2 list
```

**每个应用使用不同的名称：**
- SaaS 系统：`pm2 start app.js --name saas-system`
- 你的网站：`pm2 start app.js --name my-website`

---

## 准备工作

### ✅ 你需要准备的东西

1. **一台Mac电脑** ✅（你已经有啦）
2. **一个邮箱**（用于注册账号）
3. **一个手机号**（用于接收验证码）
4. **支付宝或银行卡**（用于支付）
5. **身份证**（用于实名认证）
6. **已有的阿里云服务器**（如果有）✅

### 📱 在Mac上需要做的事情

#### 1. 找到"终端"应用

**方法一：使用Spotlight搜索（最简单）**

1. 按键盘上的 `Command + 空格键`（同时按）
2. 会出现一个搜索框
3. 输入：`终端` 或 `Terminal`
4. 看到"终端"应用，点击打开

**方法二：在应用程序中找**

1. 打开"访达"（Finder）
2. 点击左侧的"应用程序"
3. 找到"实用工具"文件夹，打开
4. 找到"终端"应用，双击打开

**验证：**
- 如果看到一个黑色或白色的窗口，里面有 `用户名@电脑名 %` 这样的文字
- 说明你成功打开了终端！🎉

#### 2. 了解一下终端

终端是一个命令行工具，你可以通过输入命令来控制电脑。

- **提示符**：`zade@MacBook %` 这样的文字（你的可能不一样）
- **光标**：一个闪动的竖线，表示你可以在这里输入
- **输入命令**：在光标位置输入文字，按回车执行

#### 3. 测试一下终端

在终端中输入以下内容（直接输入，不用复制中文）：

```
echo "Hello, World!"
```

然后按 `回车键`。

如果终端显示：
```
Hello, World!
```

说明终端工作正常！✅

---

## 第一步：注册并购买阿里云服务器

### 1.1 打开浏览器

1. 在Mac上找到"Safari"浏览器（苹果自带的浏览器）
   - 或者在"应用程序"中找到你常用的浏览器（Chrome、Firefox等）
2. 双击打开浏览器

### 1.2 访问阿里云官网

1. 在浏览器地址栏输入（最上面那个输入框）：
   ```
   https://www.aliyun.com
   ```
2. 按 `回车键`
3. 等待页面加载完成

### 1.3 注册账号

1. **点击"免费注册"**
   - 在页面右上角，找到"免费注册"按钮
   - 点击它

2. **填写注册信息**
   - **手机号**：输入你的手机号
   - **验证码**：输入收到的短信验证码
   - **密码**：设置一个密码（8-20位，包含大小写字母和数字）
   - **同意协议**：勾选"我已阅读并同意..."
   - 点击"立即注册"

3. **完成注册**
   - 等待验证完成
   - 注册成功后会自动登录

### 1.4 实名认证（必须）

⚠️ **重要**：必须完成实名认证才能购买服务器！

1. **进入实名认证页面**
   - 登录后，页面会提示你进行实名认证
   - 点击"立即认证"或"去认证"

2. **选择认证方式**
   - **个人认证**：选择"个人认证"（如果你是个人用户）
   - **企业认证**：如果是公司，选择"企业认证"

3. **填写认证信息（个人认证）**
   - **姓名**：输入你的真实姓名
   - **身份证号**：输入身份证号码
   - **上传身份证照片**：
     - 点击"上传身份证正面"
     - 选择"拍照"或"从文件中选择"
     - 按照提示拍摄或选择身份证正面照片
     - 同样上传身份证反面照片
   - 点击"提交审核"

4. **等待审核**
   - 通常几分钟内完成审核
   - 审核通过后，页面会提示"认证成功"

### 1.5 购买云服务器

#### 1.5.1 进入云服务器页面

1. **找到"产品"菜单**
   - 在页面顶部，找到"产品"或"Products"
   - 鼠标悬停或点击

2. **选择"云服务器ECS"**
   - 在产品列表中，找到"云服务器ECS"
   - 点击进入

3. **或者直接搜索**
   - 在页面顶部搜索框输入"云服务器ECS"
   - 按回车搜索
   - 点击搜索结果中的"云服务器ECS"

#### 1.5.2 开始购买

1. **点击"立即购买"或"创建实例"**
   - 在云服务器ECS页面
   - 找到右上角的"立即购买"或"创建实例"按钮
   - 点击它

#### 1.5.3 选择配置（重要）

现在会出现一个配置页面，需要选择以下选项：

**① 付费方式**
- **包年包月**：按月或按年付费（推荐新手选择）
- **按量付费**：按小时付费（适合测试）
- ✅ **选择：包年包月**

**② 地域**
- 选择离你最近的地区
- **华东1（杭州）**：适合华东地区用户
- **华北2（北京）**：适合华北地区用户
- **华南1（深圳）**：适合华南地区用户
- ✅ **选择：离你最近的地区**

**③ 实例规格（最重要）**

点击"选择实例规格"，会出现一个列表，选择：

| 配置 | 适合人群 | 价格（约） |
|------|---------|-----------|
| **ecs.t6-c1m1.large** | 测试用（1核1GB） | ¥30-50/月 |
| **ecs.t6-c1m2.large** | 推荐（1核2GB） | ¥50-80/月 |
| **ecs.t6-c2m4.large** | 性能好（2核4GB） | ¥100-150/月 |

✅ **推荐选择：ecs.t6-c1m2.large（1核2GB）**（够用且不贵）

**④ 镜像（操作系统）**

⚠️ **重要**：如果你已经有服务器且是 **Alibaba Cloud Linux**，可以跳过这一步，直接使用现有服务器！

如果你是新购买服务器，点击"选择镜像"，选择：

- **Alibaba Cloud Linux 3.2104 64位**（推荐，阿里云优化）✅
- 或 **Ubuntu 22.04 64位**（如果喜欢 Ubuntu）
- 或 **CentOS 7.9 64位**（稳定，但命令稍有不同）

✅ **推荐选择：Alibaba Cloud Linux 3.2104 64位**（本指南针对此系统）

**⑤ 存储**

- **系统盘**：选择 **40GB**（默认即可，够用）
- **云盘类型**：选择 **高效云盘**（够用，便宜）

✅ **保持默认即可**

**⑥ 网络**

- **专有网络VPC**：选择默认即可
- **公网IP**：✅ **必须勾选"分配公网IPv4地址"**（重要！）
- **带宽**：选择 **1Mbps**（够用，约¥23/月）
  - 如果访问量大，可以选择 2Mbps 或 3Mbps

✅ **勾选"分配公网IPv4地址"，带宽选择 1Mbps**

**⑦ 登录凭证（非常重要！）**

⚠️ **非常重要！记住这些信息！**

选择 **自定义密码**，然后：

- **用户名**：默认是 `root`（不要改）
- **密码**：设置一个强密码
  - 要求：8-30个字符
  - 必须包含：大写字母、小写字母、数字
  - 建议也包含：特殊字符（!@#$%等）
  - 📝 **一定要记住这个密码！**（建议写在纸上或保存到安全的地方）

✅ **设置密码并记录在安全的地方**

**⑧ 购买时长**

- **1个月**：¥50-80（适合测试）
- **3个月**：有折扣
- **1年**：最大折扣（推荐长期使用）

✅ **选择你想要的时长**

#### 1.5.4 确认订单并支付

1. **检查配置**
   - 确认所有配置都正确
   - 特别是：公网IP已勾选、密码已设置

2. **点击"确认订单"或"立即购买"**
   - 页面会显示总价格
   - 确认无误后，点击按钮

3. **支付**
   - 选择支付方式（支付宝、微信、银行卡等）
   - 按照提示完成支付

4. **等待创建完成**
   - 支付成功后，服务器开始创建
   - 通常 1-3 分钟完成

### 1.6 获取服务器信息

#### 1.6.1 进入控制台

1. **返回控制台**
   - 支付成功后，点击"返回控制台"或"管理控制台"

2. **进入云服务器ECS**
   - 在控制台首页，找到"云服务器ECS"
   - 点击进入

#### 1.6.2 找到你的服务器

1. **查看实例列表**
   - 在左侧菜单，点击"实例"
   - 你会看到一个列表，显示你的服务器

2. **记录重要信息**

📝 **请记录下来以下信息**（非常重要！）：

在服务器列表中，找到你的服务器，记录：

- **公网IP地址**：例如 `47.xxx.xxx.xxx`
  - 在列表中显示为"公网IP"列
  - 📝 **记录下这个IP地址！**

- **状态**：应该是"运行中"（绿色）
  - 如果不是"运行中"，点击"启动"

- **密码**：就是你刚才设置的密码
  - 📝 **确认密码已记录**

**示例：**
```
公网IP地址：47.108.123.45
用户名：root
密码：MyPassword123!
状态：运行中
```

---

## 第二步：在Mac上连接服务器

### 2.1 打开终端

按照"准备工作"中的方法，打开终端应用。

### 2.2 测试网络连接

在终端中，先测试一下能否连接到服务器：

输入以下命令（把 `47.xxx.xxx.xxx` 替换成你的公网IP）：

```bash
ping 47.xxx.xxx.xxx
```

例如：
```bash
ping 47.108.123.45
```

然后按 `回车键`。

**预期结果：**
- 如果看到类似 `64 bytes from 47.xxx.xxx.xxx` 这样的信息
- 说明网络连接正常！✅
- 按 `Control + C` 停止（同时按这两个键）

**如果出现错误：**
- 检查公网IP是否正确
- 检查服务器状态是否为"运行中"

### 2.3 连接服务器（SSH）

#### 2.3.1 输入连接命令

在终端中输入以下命令（把 `47.xxx.xxx.xxx` 替换成你的公网IP）：

```bash
ssh root@47.xxx.xxx.xxx
```

例如：
```bash
ssh root@47.108.123.45
```

然后按 `回车键`。

#### 2.3.2 第一次连接的提示

第一次连接时，终端会显示：

```
The authenticity of host '47.xxx.xxx.xxx (47.xxx.xxx.xxx)' can't be established.
ECDSA key fingerprint is SHA256:xxxxx.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

这是正常的，表示服务器是第一次连接。

**操作：**
1. 输入 `yes`（小写）
2. 按 `回车键`

#### 2.3.3 输入密码

接下来，终端会显示：

```
root@47.xxx.xxx.xxx's password:
```

**操作：**
1. 输入你之前设置的服务器密码
2. ⚠️ **注意**：输入密码时，屏幕上**不会显示任何字符**（这是正常的，为了安全）
3. 直接输入密码，然后按 `回车键`

#### 2.3.4 连接成功

如果密码正确，你会看到类似这样的提示：

```
Welcome to Alibaba Cloud Linux 3

root@iZxxx:~#
```

或者：

```
[root@iZxxx ~]#
```

**说明：**
- `root@iZxxx:~#` 或 `[root@iZxxx ~]#` 是服务器的提示符
- 表示你已经成功连接到服务器了！🎉
- 现在你可以输入命令来控制服务器了

💡 **提示**：Alibaba Cloud Linux 的提示符可能和 Ubuntu 略有不同，这是正常的。

#### 2.3.5 如果连接失败

**错误1：连接超时**

```
ssh: connect to host 47.xxx.xxx.xxx port 22: Operation timed out
```

**解决方法：**
- 检查公网IP是否正确
- 检查服务器状态是否为"运行中"
- 等待几分钟后重试（服务器可能还在创建中）

**错误2：权限被拒绝**

```
Permission denied (publickey,password).
```

**解决方法：**
- 检查密码是否正确（注意大小写）
- 检查用户名是否为 `root`
- 如果忘记密码，可以在阿里云控制台重置：
  - 实例 → 更多 → 密码/密钥 → 重置实例密码

**错误3：主机密钥验证失败**

如果之前连接过，但现在IP变了，可能需要清除旧的密钥：

在终端中输入（在Mac上，不是服务器上）：
```bash
ssh-keygen -R 47.xxx.xxx.xxx
```

然后重新连接。

---

## 第三步：在服务器上安装环境

现在你已经连接到服务器了，需要在服务器上安装运行网站所需的软件。

⚠️ **重要**：Alibaba Cloud Linux 使用 `yum` 命令，不是 `apt`！如果你看到 `apt` 命令，那是 Ubuntu 的，不要用！

⚠️ **注意**：以下所有命令都是在**服务器终端**中输入的（就是你刚才连接的窗口）。

### 3.1 更新系统软件（必须第一步）

#### 3.1.1 输入更新命令

在服务器终端中（确保看到 `root@iZxxx:~#` 或 `[root@iZxxx ~]#` 提示符），输入：

```bash
yum update -y
```

然后按 `回车键`。

**说明：**
- `yum` 是 Alibaba Cloud Linux 的包管理器（类似 Ubuntu 的 `apt`）
- `-y` 表示自动确认，不需要手动输入 `Y`
- 这会更新所有系统软件包
- 可能需要 5-10 分钟
- 等待看到提示符再次出现

💡 **提示**：如果提示 `yum: command not found`，尝试使用 `dnf`：
```bash
dnf update -y
```

#### 3.1.2 验证更新完成

等待命令执行完成后，你会再次看到提示符，说明更新完成。

### 3.2 安装必要的工具

在安装 Node.js 之前，先安装一些必要的工具：

#### 3.2.1 安装必要工具

输入：

```bash
yum install -y curl wget git
```

然后按 `回车键`。

**说明：**
- `curl`：用于下载文件
- `wget`：也是用于下载文件
- `git`：用于代码版本控制
- 可能需要 1-2 分钟

#### 3.2.2 验证安装

输入：

```bash
git --version
```

然后按 `回车键`。

**预期结果：**
```
git version 2.x.x
```

✅ **如果看到版本号，说明工具安装成功！**

### 3.3 安装 Node.js（使用 NVM）

⚠️ **重要**：Alibaba Cloud Linux 不能使用 NodeSource 脚本（那是给 Ubuntu/Debian 用的），必须使用 NVM！

#### 3.3.1 安装 NVM

⚠️ **重要**：如果遇到网络连接问题（如"连接超时"、"Failed to connect"），请使用下面的"方法二：使用国内镜像"！

**方法一：直接安装（如果网络正常）**

输入：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

然后按 `回车键`。

**说明：**
- 这会下载并安装 NVM（Node Version Manager）
- NVM 可以让你轻松安装和管理 Node.js 版本
- 可能需要 1-2 分钟
- 如果看到很多输出信息，这是正常的
- 等待看到提示符

**如果出现错误：** `Failed to connect to github.com` 或 `连接超时`

**方法二：使用国内镜像（推荐，解决网络问题）**

如果方法一失败，使用以下方法：

**步骤1：手动下载安装脚本**

输入：

```bash
curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash
```

然后按 `回车键`。

**说明：**
- 这是使用 Gitee（码云）镜像，国内访问更快
- 如果这个也失败，继续看下面的方法

**如果 Gitee 也失败，使用方法三：**

**方法三：手动安装 NVM（最可靠）**

**步骤1：创建 NVM 目录**

输入：

```bash
mkdir -p ~/.nvm
```

然后按 `回车键`。

**步骤2：下载 NVM**

输入：

```bash
cd ~/.nvm
git clone https://gitee.com/mirrors/nvm.git .
```

然后按 `回车键`。

**如果 Gitee 也失败，使用备用方法：**

```bash
# 先安装 git（如果还没安装）
yum install -y git

# 尝试使用 GitHub（如果网络允许）
cd ~/.nvm
git clone https://github.com/nvm-sh/nvm.git .

# 或者使用代理（如果你有代理）
# 设置代理（替换为你的代理地址）
export http_proxy=http://你的代理地址:端口
export https_proxy=http://你的代理地址:端口
git clone https://github.com/nvm-sh/nvm.git .
```

**步骤3：切换到指定版本**

输入：

```bash
cd ~/.nvm
git checkout v0.39.0
```

然后按 `回车键`。

**步骤4：配置环境变量**

输入：

```bash
cat >> ~/.bashrc << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
```

然后按 `回车键`。

**步骤5：重新加载配置**

输入：

```bash
source ~/.bashrc
```

然后按 `回车键`。

**步骤6：验证安装**

输入：

```bash
nvm --version
```

然后按 `回车键`。

✅ **如果看到版本号（如 0.39.0），说明安装成功！**

**方法四：使用 Node.js 官方二进制包（如果 NVM 都失败）**

如果所有 NVM 安装方法都失败，可以直接下载 Node.js 二进制包：

**步骤1：下载 Node.js**

输入：

```bash
cd /tmp
wget https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz
```

**如果 wget 也失败，尝试：**

```bash
# 使用国内镜像
wget https://npmmirror.com/mirrors/node/v18.19.0/node-v18.19.0-linux-x64.tar.xz
```

**步骤2：解压**

输入：

```bash
tar -xJf node-v18.19.0-linux-x64.tar.xz
```

然后按 `回车键`。

**步骤3：移动到系统目录**

输入：

```bash
mv node-v18.19.0-linux-x64 /usr/local/nodejs
```

然后按 `回车键`。

**步骤4：创建软链接**

输入：

```bash
ln -s /usr/local/nodejs/bin/node /usr/local/bin/node
ln -s /usr/local/nodejs/bin/npm /usr/local/bin/npm
```

然后按 `回车键`。

**步骤5：验证**

输入：

```bash
node -v
npm -v
```

✅ **如果看到版本号，说明安装成功！**

⚠️ **注意**：使用这种方法后，后续的 `nvm` 命令就不能用了，但 `node` 和 `npm` 可以直接使用。

#### 3.3.2 重新加载配置

输入：

```bash
source ~/.bashrc
```

然后按 `回车键`。

**说明：**
- 这会让 NVM 的配置生效
- 必须执行这一步，否则 `nvm` 命令会找不到

#### 3.3.3 验证 NVM 安装

输入：

```bash
nvm --version
```

然后按 `回车键`。

**预期结果：**
```
0.39.0
```

或类似的版本号。

✅ **如果看到版本号，说明 NVM 安装成功！**

**如果显示 `command not found`：**

再次执行：
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm --version
```

#### 3.3.4 安装 Node.js 18

输入：

```bash
nvm install 18
```

然后按 `回车键`。

**说明：**
- 这会下载并安装 Node.js 18 版本
- 可能需要 2-3 分钟
- 等待看到提示符

#### 3.3.5 使用 Node.js 18

输入：

```bash
nvm use 18
```

然后按 `回车键`。

**说明：**
- 这会让系统使用 Node.js 18

#### 3.3.6 设置为默认版本

输入：

```bash
nvm alias default 18
```

然后按 `回车键`。

**说明：**
- 这会让 Node.js 18 成为默认版本
- 即使重新连接服务器，也会自动使用 Node.js 18

#### 3.3.7 验证安装

输入：

```bash
node -v
```

然后按 `回车键`。

**预期结果：**
```
v18.x.x
```

例如：
```
v18.19.0
```

✅ **如果看到版本号（v18或更高），说明安装成功！**

**再验证 npm：**

输入：

```bash
npm -v
```

然后按 `回车键`。

**预期结果：**
```
9.x.x
```

例如：
```
9.2.0
```

✅ **如果看到版本号（9或更高），说明npm也安装成功！**

#### 3.3.8 如果安装失败

**问题1：NVM 命令找不到**

解决方法：
```bash
# 手动加载 NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 验证
nvm --version
```

**问题2：网络连接失败（GitHub 连接超时）**

这是最常见的问题！解决方法：

**方法A：使用 Gitee 镜像（推荐）**

```bash
# 使用 Gitee 镜像安装
curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash
source ~/.bashrc
```

**方法B：手动克隆（如果方法A也失败）**

```bash
# 创建目录
mkdir -p ~/.nvm

# 使用 Gitee 镜像克隆
cd ~/.nvm
git clone https://gitee.com/mirrors/nvm.git .

# 切换到指定版本
git checkout v0.39.0

# 配置环境变量
cat >> ~/.bashrc << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF

# 重新加载
source ~/.bashrc

# 验证
nvm --version
```

**方法C：直接下载 Node.js 二进制包（如果 NVM 都失败）**

```bash
# 下载 Node.js（使用国内镜像）
cd /tmp
wget https://npmmirror.com/mirrors/node/v18.19.0/node-v18.19.0-linux-x64.tar.xz

# 解压
tar -xJf node-v18.19.0-linux-x64.tar.xz

# 移动到系统目录
mv node-v18.19.0-linux-x64 /usr/local/nodejs

# 创建软链接
ln -s /usr/local/nodejs/bin/node /usr/local/bin/node
ln -s /usr/local/nodejs/bin/npm /usr/local/bin/npm

# 验证
node -v
npm -v
```

**问题3：git clone 失败**

如果 `git clone` 也失败，尝试：

```bash
# 检查网络连接
ping github.com
ping gitee.com

# 如果 GitHub 不通，使用 Gitee
git clone https://gitee.com/mirrors/nvm.git ~/.nvm

# 或者配置代理（如果你有代理）
export http_proxy=http://你的代理地址:端口
export https_proxy=http://你的代理地址:端口
git clone https://github.com/nvm-sh/nvm.git ~/.nvm
```

### 3.4 安装 PM2（进程管理工具）

#### 3.4.1 安装 PM2

输入：

```bash
npm install -g pm2
```

然后按 `回车键`。

**说明：**
- `-g` 表示全局安装，可以在任何地方使用
- 可能需要 1-2 分钟

#### 3.4.2 验证安装

输入：

```bash
pm2 -v
```

然后按 `回车键`。

**预期结果：**
```
5.x.x
```

例如：
```
5.3.0
```

✅ **如果看到版本号，说明PM2安装成功！**

---

## 第四步：上传项目文件到服务器

现在需要把你Mac上的项目文件上传到服务器。有两种方法：

### 方法一：使用 Git（推荐，最简单）

#### 4.1 在你的Mac上准备代码

⚠️ **注意**：这一步是在**你的Mac上**操作，不是在服务器上！

##### 4.1.1 打开Mac的终端

按照"准备工作"中的方法，在你的Mac上打开终端。

##### 4.1.2 进入项目文件夹

在Mac终端中输入：

```bash
cd ~/Desktop/JW\ 2
```

然后按 `回车键`。

**说明：**
- `cd` 是"进入目录"的意思
- `~/Desktop/JW\ 2` 是你的项目文件夹路径
- 如果你的项目在其他位置，修改路径

**验证：**
- 如果路径正确，提示符会改变
- 输入 `pwd` 查看当前路径

##### 4.1.3 初始化 Git 仓库

输入：

```bash
git init
```

然后按 `回车键`。

**说明：**
- 这会在项目文件夹中创建一个 Git 仓库

##### 4.1.4 添加文件到 Git

输入：

```bash
git add .
```

然后按 `回车键`。

**说明：**
- `.` 表示当前文件夹的所有文件
- 这会把所有文件添加到 Git

##### 4.1.5 提交文件

输入：

```bash
git commit -m "Initial commit"
```

然后按 `回车键`。

**说明：**
- 这会把文件提交到本地 Git 仓库

##### 4.1.6 注册 GitHub 账号（如果没有）

1. **打开浏览器**
   - 在Safari或其他浏览器中

2. **访问 GitHub**
   - 输入：`https://github.com`
   - 按回车

3. **注册账号**
   - 点击右上角"Sign up"
   - 输入用户名、邮箱、密码
   - 完成注册验证

##### 4.1.7 创建 GitHub 仓库

1. **登录 GitHub**
   - 用刚才注册的账号登录

2. **创建新仓库**
   - 点击右上角的 `+` 号
   - 选择 "New repository"

3. **填写仓库信息**
   - **Repository name**：输入名称（如：`my-website`）
   - **Description**：可填可不填
   - **Public / Private**：选择 Public（免费）
   - ⚠️ **重要**：**不要勾选** "Initialize this repository with a README"
   - 点击 "Create repository"

4. **记录仓库地址**
   - 创建成功后，会显示仓库地址
   - 格式：`https://github.com/你的用户名/仓库名.git`
   - 📝 **记录下这个地址！**

##### 4.1.8 上传代码到 GitHub

回到 Mac 终端，输入以下命令（替换为你的仓库地址）：

```bash
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

例如：
```bash
git branch -M main
git remote add origin https://github.com/zhangsan/my-website.git
git push -u origin main
```

**说明：**
- 每行输入后按回车
- 如果提示输入用户名和密码：
  - **用户名**：你的 GitHub 用户名
  - **密码**：需要使用 **Personal Access Token**（不是登录密码）
    - 生成 Token：
      - GitHub → 右上角头像 → Settings
      - 左侧菜单 → Developer settings
      - Personal access tokens → Tokens (classic)
      - Generate new token (classic)
      - 勾选 `repo` 权限
      - 点击 "Generate token"
      - 复制生成的 Token，作为密码使用

**验证：**
- 如果看到类似 `Writing objects: 100%` 的信息
- 说明上传成功！✅

#### 4.2 在服务器上克隆代码

⚠️ **注意**：这一步是在**服务器终端**中操作！

回到服务器终端窗口（确保看到 `root@iZxxx:~#` 提示符），执行：

##### 4.2.1 进入用户目录

输入：

```bash
cd /root
```

然后按 `回车键`。

##### 4.2.2 克隆项目

输入以下命令（替换为你的GitHub仓库地址）：

```bash
git clone https://github.com/你的用户名/仓库名.git
```

例如：
```bash
git clone https://github.com/zhangsan/my-website.git
```

然后按 `回车键`。

**说明：**
- 这会把 GitHub 上的代码下载到服务器
- 可能需要 1-2 分钟

##### 4.2.3 进入项目目录

输入：

```bash
cd 仓库名
```

例如：
```bash
cd my-website
```

然后按 `回车键`。

**验证：**
- 提示符会变成 `root@iZxxx:~/仓库名#`
- 输入 `ls` 查看文件列表
- 应该能看到你的项目文件

### 方法二：使用 FTP 工具（如果Git太复杂）

如果觉得 Git 太复杂，可以使用 FTP 工具上传文件。

#### 4.2.1 下载 FileZilla

1. **访问 FileZilla 官网**
   - 在浏览器中输入：`https://filezilla-project.org`
   - 点击 "Download FileZilla Client"
   - 选择 "Mac OS X" 版本
   - 下载并安装

#### 4.2.2 连接服务器

1. **打开 FileZilla**
   - 在"应用程序"中找到并打开

2. **填写连接信息**
   - **主机**：`sftp://47.xxx.xxx.xxx`（你的公网IP，前面加 `sftp://`）
   - **用户名**：`root`
   - **密码**：你的服务器密码
   - **端口**：`22`
   - 点击 "快速连接"

3. **连接成功**
   - 左侧窗口：你的Mac文件
   - 右侧窗口：服务器的文件

#### 4.2.3 上传文件

1. **左侧**：找到你的项目文件夹（`JW 2`）
2. **右侧**：进入 `/root` 目录
3. **拖拽**：把整个项目文件夹拖到右侧
4. **等待**：等待上传完成（可能需要几分钟）

#### 4.2.4 进入项目目录

回到服务器终端，输入：

```bash
cd /root/JW\ 2
```

然后按 `回车键`。

---

## 第五步：配置和启动项目

⚠️ **注意**：以下所有操作都在**服务器终端**中！

### 5.1 确认在项目目录

输入：

```bash
pwd
```

然后按 `回车键`。

**预期结果：**
```
/root/仓库名
```

或：
```
/root/JW 2
```

如果不是，输入 `cd /root/仓库名` 进入项目目录。

### 5.2 安装项目依赖

输入：

```bash
npm install
```

然后按 `回车键`。

**说明：**
- 这会安装项目所需的所有依赖包
- 可能需要 2-5 分钟
- 如果看到很多输出信息，这是正常的
- 等待看到提示符再次出现

**如果看到错误：**
- 检查网络连接
- 稍后重试

### 5.3 创建环境变量文件

#### 5.3.1 打开编辑器

输入：

```bash
nano .env
```

然后按 `回车键`。

**说明：**
- `nano` 是一个简单的文本编辑器
- 会打开一个编辑窗口

#### 5.3.2 输入配置内容

在编辑器中，输入以下内容（一行一行输入）：

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=你的随机密钥至少32个字符建议用强密码
JWT_EXPIRES_IN=24h
DB_DIALECT=sqlite
```

**生成随机密钥：**

打开另一个终端窗口（保持 nano 打开），输入：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的字符串，替换 `你的随机密钥至少32个字符建议用强密码`。

**完整示例：**
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRES_IN=24h
DB_DIALECT=sqlite
```

#### 5.3.3 保存文件

在 nano 编辑器中：

1. 按 `Control + X`（同时按这两个键）
2. 按 `Y`（询问是否保存，输入 Y）
3. 按 `回车键`（确认文件名）

**说明：**
- 底部有提示：`^X Exit` 表示按 `Control + X` 退出
- 保存成功后，你会回到命令行

### 5.4 初始化数据库

输入：

```bash
DB_DIALECT=sqlite node init-db.js
```

然后按 `回车键`。

**说明：**
- 这会创建数据库表并插入初始数据
- 可能需要 10-30 秒
- 如果看到 "数据库初始化完成！" 说明成功

**预期输出：**
```
开始初始化数据库...
数据库模型同步成功
默认管理员用户创建成功
用户名: admin
密码: admin123
示例导航项创建成功
...
数据库初始化完成！
```

✅ **如果看到这些信息，说明数据库初始化成功！**

### 5.5 测试启动（验证是否正常）

输入：

```bash
node app.js
```

然后按 `回车键`。

**预期输出：**
```
使用 SQLite 数据库: /root/仓库名/data/database.sqlite
数据库连接成功！
服务器正在运行，端口: 3000
访问地址: http://localhost:3000
API地址: http://localhost:3000/api
```

✅ **如果看到这些信息，说明启动成功！**

⚠️ **注意**：
- 现在服务器在运行，但你不能关闭这个窗口
- 如果关闭，服务器会停止
- 下一步我们会用 PM2 让它在后台一直运行

**停止服务器：**
- 按 `Control + C`（同时按这两个键）
- 服务器会停止

---

## 第六步：使用PM2保持运行

现在需要用 PM2 让服务器在后台一直运行，即使你关闭终端也不会停止。

### 6.1 使用 PM2 启动

输入：

```bash
DB_DIALECT=sqlite pm2 start app.js --name my-website
```

然后按 `回车键`。

**说明：**
- `my-website` 是应用的名称，可以改成你喜欢的名字
- 启动后，服务器会在后台运行

**预期输出：**
```
[PM2] Starting in fork_mode...
[PM2] Successfully started
```

### 6.2 查看状态

输入：

```bash
pm2 status
```

然后按 `回车键`。

**预期输出：**
```
┌─────┬──────────────┬─────────┬─────────┬──────────┬─────────┐
│ id  │ name         │ mode    │ ↺       │ status   │ cpu     │
├─────┼──────────────┼─────────┼─────────┼──────────┼─────────┤
│ 0   │ my-website   │ cluster │ 0       │ online   │ 0%      │
└─────┴──────────────┴─────────┴─────────┴──────────┴─────────┘
```

✅ **如果 status 是 `online`，说明运行正常！**

### 6.3 设置开机自启

输入：

```bash
pm2 startup
```

然后按 `回车键`。

**预期输出：**
```
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

**说明：**
- 会输出一行命令，**复制这行命令**
- 然后输入这行命令（直接复制粘贴）
- 例如：`sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root`

**保存进程列表：**

输入：

```bash
pm2 save
```

然后按 `回车键`。

✅ **完成！现在服务器会在后台一直运行，即使重启也不会停止。**

---

## 第七步：配置防火墙和安全组

现在需要开放端口，让外网可以访问你的网站。

### 7.1 在服务器上配置防火墙

⚠️ **注意**：这一步在**服务器终端**中操作！

⚠️ **重要**：Alibaba Cloud Linux 使用 `firewalld`，不是 `ufw`！如果你看到 `ufw` 命令，那是 Ubuntu 的，不要用！

#### 7.1.1 检查防火墙状态

输入：

```bash
systemctl status firewalld
```

然后按 `回车键`。

**预期结果：**
- 如果看到 `active (running)`，说明防火墙正在运行
- 如果看到 `inactive (dead)`，说明防火墙未运行

#### 7.1.2 如果防火墙未运行，启动它

如果防火墙未运行，输入：

```bash
systemctl start firewalld
```

然后按 `回车键`。

**设置开机自启：**

输入：

```bash
systemctl enable firewalld
```

然后按 `回车键`。

**说明：**
- `start`：启动防火墙
- `enable`：设置开机自启
- 这样即使服务器重启，防火墙也会自动启动

#### 7.1.3 开放 3000 端口

输入：

```bash
firewall-cmd --permanent --add-port=3000/tcp
```

然后按 `回车键`。

**说明：**
- `--permanent`：永久生效（即使重启也有效）
- `--add-port=3000/tcp`：添加 3000 端口的 TCP 协议

#### 7.1.4 重新加载防火墙配置

输入：

```bash
firewall-cmd --reload
```

然后按 `回车键`。

**说明：**
- 这会让刚才的配置生效

#### 7.1.5 确认规则已添加

输入：

```bash
firewall-cmd --list-ports
```

然后按 `回车键`。

**预期输出：**
```
3000/tcp
```

✅ **如果看到 3000/tcp，说明端口已开放！**

**或者查看所有规则：**

输入：

```bash
firewall-cmd --list-all
```

然后按 `回车键`。

这会显示所有防火墙规则，你应该能看到 `ports: 3000/tcp`。

#### 7.1.6 如果 firewalld 未安装

如果提示 `command not found: firewall-cmd`，需要先安装：

输入：

```bash
yum install -y firewalld
```

然后按 `回车键`。

安装完成后，再执行上面的步骤。

### 7.2 在阿里云控制台配置安全组

⚠️ **注意**：这一步在**浏览器**中操作！

#### 7.2.1 进入阿里云控制台

1. **打开浏览器**
   - 访问：`https://www.aliyun.com`
   - 登录你的账号

2. **进入云服务器ECS**
   - 在控制台首页，找到"云服务器ECS"
   - 点击进入

#### 7.2.2 找到你的服务器

1. **查看实例列表**
   - 在左侧菜单，点击"实例"
   - 找到你的服务器，点击服务器名称或ID

#### 7.2.3 配置安全组

1. **进入安全组设置**
   - 在服务器详情页面，找到"安全组"标签
   - 点击安全组ID（例如：`sg-xxx`）

2. **添加安全组规则**
   - 点击"入方向"标签
   - 点击"添加安全组规则"按钮

3. **配置规则**
   - **端口范围**：`3000/3000`
   - **授权对象**：`0.0.0.0/0`
   - **描述**：`允许访问网站端口`
   - 点击"保存"

✅ **完成！现在外网可以访问你的网站了！**

---

## 第八步：处理端口冲突（如果服务器上已有其他系统）

⚠️ **重要**：如果你的服务器上已经有 SaaS 系统或其他应用，需要处理端口冲突！

### 8.1 检查端口占用

在服务器终端输入：

```bash
netstat -tlnp | grep 3000
```

或者：

```bash
lsof -i :3000
```

**说明：**
- 如果看到输出，说明 3000 端口已被占用
- 如果没有任何输出，说明 3000 端口可用

### 8.2 如果端口被占用，修改你的网站端口

#### 8.2.1 选择一个新端口

常用的可用端口：
- `3001`、`3002`、`8080`、`8000`、`8888` 等

#### 8.2.2 修改 .env 文件

输入：

```bash
nano .env
```

然后按 `回车键`。

**修改 PORT 值：**

把：
```env
PORT=3000
```

改成：
```env
PORT=3001
```

（或你选择的其他端口）

**保存文件：**
1. 按 `Control + X`
2. 按 `Y`
3. 按 `回车键`

#### 8.2.3 开放新端口

输入：

```bash
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload
```

然后按 `回车键`。

#### 8.2.4 在阿里云安全组也添加新端口

在阿里云控制台：
1. 进入安全组设置
2. 添加规则：
   - 端口范围：`3001/3001`（或你选择的其他端口）
   - 授权对象：`0.0.0.0/0`
3. 保存

#### 8.2.5 重启应用

输入：

```bash
pm2 restart my-website
```

然后按 `回车键`。

### 8.3 关于共用服务器

✅ **可以共用服务器！** 但需要注意：

1. **端口冲突**
   - 每个应用使用不同的端口
   - 你的网站可以用 3001，SaaS 系统用 3000

2. **资源占用**
   - 检查服务器配置（1核2GB 通常够用）
   - 如果资源紧张，考虑升级配置

3. **进程管理**
   - 使用 `pm2 list` 查看所有应用
   - 每个应用用不同的名称

**查看所有运行的应用：**

```bash
pm2 list
```

**查看服务器资源使用：**

```bash
# CPU 和内存
top

# 磁盘空间
df -h

# 内存使用
free -h
```

---

## 第九步：测试访问

### 9.1 在浏览器中访问

1. **打开浏览器**
   - 在Mac上打开Safari或其他浏览器

2. **访问网站**
   - 在地址栏输入：`http://你的公网IP:端口号`
   - 例如：`http://47.108.123.45:3000`（如果使用 3000 端口）
   - 或：`http://47.108.123.45:3001`（如果使用 3001 端口）
   - 按回车

3. **查看结果**
   - 如果能看到你的网站首页，说明部署成功！🎉

### 9.2 访问后台管理

1. **访问后台**
   - 在地址栏输入：`http://你的公网IP:端口号/html/admin/index.html`
   - 例如：`http://47.108.123.45:3000/html/admin/index.html`
   - 或：`http://47.108.123.45:3001/html/admin/index.html`
   - 按回车

2. **登录**
   - **用户名**：`admin`
   - **密码**：`admin123`
   - 点击"登录"

3. **测试功能**
   - 登录后，尝试添加一个导航项
   - 如果能正常添加，说明一切正常！✅

⚠️ **重要提醒**：登录后台后，**立即修改默认密码**！默认密码 `admin123` 不安全！

---

## 常见问题解决

### ❌ 问题1：网站打不开

**检查步骤：**

1. **检查服务是否运行**
   
   在服务器终端输入：
   ```bash
   pm2 status
   ```
   
   如果 status 不是 `online`，重启：
   ```bash
   pm2 restart my-website
   ```

2. **检查端口是否开放**
   
   在服务器终端输入：
   ```bash
   netstat -tlnp | grep 3000
   ```
   
   如果看到 `3000`，说明端口在监听

3. **检查防火墙**
   
   在服务器终端输入：
   ```bash
   firewall-cmd --list-ports
   ```
   
   确认 3000 端口（或你使用的端口）在列表中

4. **检查安全组**
   - 在阿里云控制台检查安全组规则
   - 确认已添加对应端口规则

5. **查看日志**
   
   在服务器终端输入：
   ```bash
   pm2 logs my-website
   ```
   
   查看是否有错误信息

### ❌ 问题5：yum 命令找不到

**错误信息：** `command not found: yum`

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

### ❌ 问题6：firewall-cmd 命令找不到

**错误信息：** `command not found: firewall-cmd`

**解决方法：**

```bash
# 安装 firewalld
yum install -y firewalld

# 启动防火墙
systemctl start firewalld
systemctl enable firewalld
```

### ❌ 问题7：NVM 命令找不到

**错误信息：** `command not found: nvm`

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

### ❌ 问题8：GitHub 连接超时（NVM 安装失败）

**错误信息：** `Failed to connect to github.com` 或 `连接超时`

**解决方法（按顺序尝试）：**

**方法1：使用 Gitee 镜像（最简单）**

```bash
curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash
source ~/.bashrc
nvm --version
```

**方法2：手动克隆 Gitee 镜像**

```bash
mkdir -p ~/.nvm
cd ~/.nvm
git clone https://gitee.com/mirrors/nvm.git .
git checkout v0.39.0
cat >> ~/.bashrc << 'EOF'
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
EOF
source ~/.bashrc
nvm --version
```

**方法3：直接下载 Node.js（如果 NVM 都失败）**

```bash
# 使用国内镜像下载 Node.js
cd /tmp
wget https://npmmirror.com/mirrors/node/v18.19.0/node-v18.19.0-linux-x64.tar.xz
tar -xJf node-v18.19.0-linux-x64.tar.xz
mv node-v18.19.0-linux-x64 /usr/local/nodejs
ln -s /usr/local/nodejs/bin/node /usr/local/bin/node
ln -s /usr/local/nodejs/bin/npm /usr/local/bin/npm
node -v
npm -v
```

**方法4：配置代理（如果你有代理服务器）**

```bash
# 设置代理（替换为你的代理地址和端口）
export http_proxy=http://代理地址:端口
export https_proxy=http://代理地址:端口

# 然后重新尝试安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### ❌ 问题2：数据库错误

**错误信息：** `数据库连接失败`

**解决方法：**

在服务器终端输入：
```bash
# 检查数据库文件是否存在
ls -la data/database.sqlite

# 如果不存在，重新初始化
cd /root/仓库名
DB_DIALECT=sqlite node init-db.js

# 检查文件权限
chmod 644 data/database.sqlite
```

### ❌ 问题3：端口被占用

**错误信息：** `EADDRINUSE: address already in use`

**解决方法：**

在服务器终端输入：
```bash
# 查找占用端口的进程
lsof -i :3000

# 或者
netstat -tlnp | grep 3000

# 如果找到了进程，杀死它（替换 PID 为实际进程号）
kill -9 PID

# 或者重启应用
pm2 restart my-website
```

### ❌ 问题4：内存不足

**错误信息：** `JavaScript heap out of memory`

**解决方法：**

在服务器终端输入：
```bash
pm2 restart my-website --update-env --node-args="--max-old-space-size=2048"
```

---

## 日常维护

### 📅 定期检查

#### 每周
- [ ] 检查网站是否正常运行：`pm2 status`
- [ ] 查看错误日志：`pm2 logs my-website`
- [ ] 备份数据库（见下方）

#### 每月
- [ ] 更新系统软件：`yum update -y`（Alibaba Cloud Linux）
- [ ] 更新项目依赖：`cd /root/仓库名 && npm update`
- [ ] 检查服务器资源使用情况

### 💾 备份数据库

在服务器终端输入：
```bash
# 进入项目目录
cd /root/仓库名

# 备份数据库
cp data/database.sqlite data/database.sqlite.backup.$(date +%Y%m%d)

# 或者备份到其他位置
cp data/database.sqlite /root/backup/database.sqlite.backup.$(date +%Y%m%d)
```

### 🔄 更新代码

如果你修改了代码：

```bash
# 进入项目目录
cd /root/仓库名

# 如果使用 Git
git pull

# 安装新的依赖（如果有）
npm install

# 重启应用
pm2 restart my-website
```

---

## 🎉 完成！

恭喜！你的网站已经成功部署到阿里云了！

### ✅ 检查清单

- [ ] 网站能正常访问（`http://你的IP:3000`）
- [ ] 后台能正常登录
- [ ] PM2 状态是 `online`
- [ ] 数据库文件存在
- [ ] 安全组规则已配置
- [ ] 防火墙已开放端口

### 🔐 重要提醒

1. **立即修改默认密码**
   - 登录后台后，修改 `admin` 用户的密码
   - 默认密码 `admin123` 不安全！

2. **定期备份数据库**
   - 建议每周备份一次
   - 备份文件保存在安全的位置

3. **监控服务器状态**
   - 定期检查 PM2 状态：`pm2 status`
   - 定期查看日志：`pm2 logs my-website`

---

**祝你部署顺利！** 🚀

遇到问题？查看文档中的"常见问题解决"部分，或随时提问！

---

## 📚 附录：命令对照表

### Alibaba Cloud Linux vs Ubuntu

| 操作 | Ubuntu 命令 | Alibaba Cloud Linux 命令 |
|------|------------|-------------------------|
| **更新系统** | `apt update` | `yum update -y` |
| **安装软件** | `apt install 软件名` | `yum install -y 软件名` |
| **升级软件** | `apt upgrade -y` | `yum update -y` |
| **查看防火墙** | `ufw status` | `firewall-cmd --list-ports` |
| **开放端口** | `ufw allow 3000/tcp` | `firewall-cmd --permanent --add-port=3000/tcp` |
| **重启防火墙** | `ufw reload` | `firewall-cmd --reload` |
| **安装 Node.js** | NodeSource 脚本 | NVM（必须） |

### 常用命令速查

#### 系统管理
```bash
# 更新系统
yum update -y

# 查看系统信息
cat /etc/os-release

# 查看资源使用
top
df -h
free -h
```

#### 防火墙管理
```bash
# 查看防火墙状态
systemctl status firewalld

# 启动防火墙
systemctl start firewalld

# 设置开机自启
systemctl enable firewalld

# 查看开放的端口
firewall-cmd --list-ports

# 开放端口
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload
```

#### Node.js 和 NVM
```bash
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 安装 Node.js
nvm install 18
nvm use 18
nvm alias default 18

# 验证
node -v
npm -v
```

#### PM2 管理
```bash
# 启动应用
pm2 start app.js --name my-website

# 查看状态
pm2 status

# 查看日志
pm2 logs my-website

# 重启应用
pm2 restart my-website

# 停止应用
pm2 stop my-website

# 删除应用
pm2 delete my-website

# 设置开机自启
pm2 save
pm2 startup
```

#### 端口检查
```bash
# 查看端口占用
netstat -tlnp | grep 3000

# 或
lsof -i :3000
```

---

## 🎯 快速参考：完整部署命令（Alibaba Cloud Linux）

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

# 7. 进入项目目录
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

