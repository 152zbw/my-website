#!/bin/bash

# 启动脚本

echo "========================================="
echo "  咨询公司官网 - 启动脚本"
echo "========================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到Node.js，请先安装Node.js"
    echo "访问 https://nodejs.org/ 下载安装"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未检测到npm，请先安装npm"
    exit 1
fi

echo "✓ Node.js版本: $(node -v)"
echo "✓ npm版本: $(npm -v)"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo ""
    echo "正在安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
    echo "✓ 依赖安装完成"
fi

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo ""
    echo "创建.env配置文件..."
    cat > .env << EOF
# 服务器配置
PORT=3000
NODE_ENV=development

# JWT配置
JWT_SECRET=your-secret-key-change-this-in-production-$(date +%s)
JWT_EXPIRES_IN=24h
EOF
    echo "✓ .env文件已创建"
fi

# 初始化数据库
echo ""
echo "正在初始化数据库..."
node init-db.js
if [ $? -ne 0 ]; then
    echo "警告: 数据库初始化可能失败，但将继续启动服务器"
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



