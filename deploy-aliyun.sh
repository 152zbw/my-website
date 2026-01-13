#!/bin/bash

# 阿里云服务器一键部署脚本
# 使用方法：在服务器上运行此脚本即可自动完成部署

echo "=========================================="
echo "  阿里云服务器一键部署脚本"
echo "=========================================="
echo ""

# 检查是否以 root 用户运行
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  请使用 root 用户运行此脚本"
    echo "   使用方法: sudo bash deploy-aliyun.sh"
    exit 1
fi

# 步骤1：更新系统
echo "📦 步骤1/8: 更新系统软件包..."
apt update && apt upgrade -y

# 步骤2：安装 Node.js
echo ""
echo "📦 步骤2/8: 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js 已安装，版本: $(node -v)"
fi

# 验证 Node.js 安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 安装失败，尝试使用 NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18
    nvm use 18
fi

echo "✅ Node.js 安装完成，版本: $(node -v)"
echo "✅ npm 安装完成，版本: $(npm -v)"

# 步骤3：安装 PM2
echo ""
echo "📦 步骤3/8: 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo "✅ PM2 已安装，版本: $(pm2 -v)"
fi

# 步骤4：安装 Git（如果还没安装）
echo ""
echo "📦 步骤4/8: 安装 Git..."
if ! command -v git &> /dev/null; then
    apt install git -y
else
    echo "✅ Git 已安装，版本: $(git --version)"
fi

# 步骤5：询问是否使用 Git 克隆项目
echo ""
echo "📝 步骤5/8: 准备项目文件..."
read -p "是否使用 Git 克隆项目？(y/n，如果选择 n，请手动上传项目文件): " use_git

if [ "$use_git" = "y" ] || [ "$use_git" = "Y" ]; then
    read -p "请输入 GitHub 仓库地址 (例如: https://github.com/username/repo.git): " git_url
    read -p "请输入项目目录名 (例如: my-website): " project_dir
    
    if [ -d "/root/$project_dir" ]; then
        echo "⚠️  目录 /root/$project_dir 已存在，是否删除？(y/n)"
        read -p "> " confirm_delete
        if [ "$confirm_delete" = "y" ] || [ "$confirm_delete" = "Y" ]; then
            rm -rf "/root/$project_dir"
        else
            echo "❌ 部署取消"
            exit 1
        fi
    fi
    
    cd /root
    git clone "$git_url" "$project_dir"
    cd "$project_dir"
else
    read -p "请输入项目目录路径 (例如: /root/my-website): " project_dir
    if [ ! -d "$project_dir" ]; then
        echo "❌ 目录不存在: $project_dir"
        exit 1
    fi
    cd "$project_dir"
fi

PROJECT_DIR=$(pwd)
echo "✅ 项目目录: $PROJECT_DIR"

# 步骤6：安装项目依赖
echo ""
echo "📦 步骤6/8: 安装项目依赖..."
npm install

# 步骤7：配置环境变量
echo ""
echo "📝 步骤7/8: 配置环境变量..."
if [ ! -f ".env" ]; then
    echo "创建 .env 文件..."
    
    # 生成随机 JWT Secret
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    cat > .env << EOF
PORT=3000
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
DB_DIALECT=sqlite
EOF
    
    echo "✅ .env 文件已创建"
    echo "⚠️  请妥善保管 JWT_SECRET: $JWT_SECRET"
else
    echo "⚠️  .env 文件已存在，跳过创建"
    read -p "是否重新生成 JWT_SECRET? (y/n): " regenerate
    if [ "$regenerate" = "y" ] || [ "$regenerate" = "Y" ]; then
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        echo "✅ JWT_SECRET 已更新: $JWT_SECRET"
    fi
fi

# 步骤8：初始化数据库
echo ""
echo "📦 步骤8/8: 初始化数据库..."
if [ -f "init-db.js" ]; then
    DB_DIALECT=sqlite node init-db.js
    echo "✅ 数据库初始化完成"
else
    echo "⚠️  未找到 init-db.js，跳过数据库初始化"
fi

# 步骤9：创建上传目录
echo ""
echo "📁 创建必要目录..."
mkdir -p uploads
mkdir -p data
chmod 755 uploads
chmod 755 data
echo "✅ 目录创建完成"

# 步骤10：配置防火墙
echo ""
echo "🔥 配置防火墙..."
if command -v ufw &> /dev/null; then
    ufw allow 3000/tcp
    echo "✅ 已开放 3000 端口"
else
    echo "⚠️  ufw 未安装，请手动配置防火墙"
fi

# 步骤11：启动应用
echo ""
echo "🚀 启动应用..."
if pm2 list | grep -q "my-website"; then
    echo "⚠️  应用已在运行，是否重启？(y/n)"
    read -p "> " restart
    if [ "$restart" = "y" ] || [ "$restart" = "Y" ]; then
        pm2 delete my-website
    else
        echo "✅ 应用已在运行"
        pm2 status
        exit 0
    fi
fi

DB_DIALECT=sqlite pm2 start app.js --name my-website

# 设置开机自启
pm2 save
pm2 startup

echo ""
echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "📊 应用状态："
pm2 status

echo ""
echo "📝 重要信息："
echo "   - 项目目录: $PROJECT_DIR"
echo "   - 访问地址: http://你的IP:3000"
echo "   - 后台地址: http://你的IP:3000/html/admin/index.html"
echo "   - 查看日志: pm2 logs my-website"
echo "   - 重启应用: pm2 restart my-website"
echo "   - 查看状态: pm2 status"
echo ""
echo "⚠️  下一步："
echo "   1. 在阿里云控制台配置安全组，开放 3000 端口"
echo "   2. 访问后台，修改默认密码（admin/admin123）"
echo "   3. 配置域名（可选）"
echo ""

