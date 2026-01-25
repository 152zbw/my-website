#!/bin/bash

# 启动服务器脚本
cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════════════"
echo "  正在启动服务器..."
echo "═══════════════════════════════════════════════════════"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "✓ Node.js已安装: $(node --version)"
echo ""

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi

echo "✓ 依赖已检查"
echo ""

# 确保上传目录存在
mkdir -p uploads
echo "✓ 上传目录已准备"
echo ""

# 检查端口是否被占用
if lsof -ti:3000 &> /dev/null; then
    echo "⚠ 警告: 端口3000被占用，正在清理..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✓ 端口3000可用"
echo ""

# 启动服务器
echo "═══════════════════════════════════════════════════════"
echo "  服务器启动中..."
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  访问地址: http://localhost:3000"
echo "  后台管理: http://localhost:3000/html/admin/dashboard-new.html"
echo ""
echo "  按 Ctrl+C 停止服务器"
echo "═══════════════════════════════════════════════════════"
echo ""

DB_DIALECT=sqlite node app.js

