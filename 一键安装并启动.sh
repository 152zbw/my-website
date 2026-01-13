#!/bin/bash

echo "========================================="
echo "  一键安装并启动项目"
echo "========================================="
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "检测到未安装 Node.js，开始安装..."
    echo ""
    
    # 运行安装脚本
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    bash "$SCRIPT_DIR/install-node.sh"
    
    if [ $? -ne 0 ]; then
        echo "Node.js 安装失败，请手动安装后重试"
        exit 1
    fi
    
    echo ""
    echo "等待3秒后继续..."
    sleep 3
fi

# 进入项目目录
cd "$(dirname "$0")"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo ""
    echo "正在安装项目依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "依赖安装失败"
        exit 1
    fi
    echo "✓ 依赖安装完成"
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo ""
    echo "创建 .env 配置文件..."
    cat > .env << EOF
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production-$(date +%s)
JWT_EXPIRES_IN=24h
EOF
    echo "✓ .env 文件已创建"
fi

# 初始化数据库
echo ""
echo "正在初始化数据库..."
node init-db.js
if [ $? -ne 0 ]; then
    echo "警告: 数据库初始化可能失败，但将继续启动"
fi

# 启动服务器
echo ""
echo "========================================="
echo "  正在启动服务器..."
echo "========================================="
echo ""
echo "访问地址: http://localhost:3000"
echo "API地址: http://localhost:3000/api"
echo "后台管理: http://localhost:3000/html/admin/dashboard.html"
echo ""
echo "默认管理员账号:"
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm start



