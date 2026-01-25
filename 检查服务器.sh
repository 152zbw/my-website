#!/bin/bash

# 服务器诊断脚本

echo "================================"
echo "服务器诊断工具"
echo "================================"
echo ""

# 检查Node.js
echo "1. 检查Node.js..."
if command -v node &> /dev/null; then
    echo "   ✓ Node.js已安装: $(node --version)"
else
    echo "   ✗ Node.js未安装，请先安装Node.js"
    exit 1
fi
echo ""

# 检查依赖
echo "2. 检查依赖..."
if [ -d "node_modules" ]; then
    echo "   ✓ 依赖已安装"
else
    echo "   ✗ 依赖未安装，正在安装..."
    npm install
fi
echo ""

# 检查端口占用
echo "3. 检查端口3000..."
if lsof -ti:3000 &> /dev/null; then
    echo "   ⚠ 端口3000被占用"
    echo "   占用进程:"
    lsof -ti:3000 | xargs ps -p
    echo ""
    read -p "   是否要终止占用端口的进程？(y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9
        echo "   ✓ 已终止占用端口的进程"
    fi
else
    echo "   ✓ 端口3000可用"
fi
echo ""

# 检查上传目录
echo "4. 检查上传目录..."
if [ -d "uploads" ]; then
    echo "   ✓ 上传目录存在"
else
    echo "   ⚠ 上传目录不存在，正在创建..."
    mkdir -p uploads
    echo "   ✓ 上传目录已创建"
fi
echo ""

# 检查数据库
echo "5. 检查数据库..."
if [ -f "config/database.sqlite" ]; then
    echo "   ✓ 数据库文件存在"
else
    echo "   ⚠ 数据库文件不存在，需要初始化"
    echo "   运行: npm run init-db"
fi
echo ""

# 测试代码语法
echo "6. 检查代码语法..."
if node -c app.js 2>/dev/null; then
    echo "   ✓ app.js 语法正确"
else
    echo "   ✗ app.js 有语法错误"
    exit 1
fi

if node -c routes/upload.js 2>/dev/null; then
    echo "   ✓ routes/upload.js 语法正确"
else
    echo "   ✗ routes/upload.js 有语法错误"
    exit 1
fi
echo ""

echo "================================"
echo "诊断完成！"
echo "================================"
echo ""
echo "如果所有检查都通过，可以启动服务器："
echo "  DB_DIALECT=sqlite node app.js"
echo ""
