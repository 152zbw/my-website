#!/bin/bash

echo "========================================="
echo "  Node.js 自动安装脚本"
echo "========================================="
echo ""

# 检查是否已安装Node.js
if command -v node &> /dev/null; then
    echo "✓ Node.js 已安装"
    node --version
    npm --version
    echo ""
    echo "可以直接运行项目了！"
    exit 0
fi

echo "检测到系统未安装 Node.js，开始安装..."
echo ""

# 检查是否有Homebrew
if ! command -v brew &> /dev/null; then
    echo "正在安装 Homebrew（包管理器）..."
    echo "这可能需要几分钟时间，请耐心等待..."
    echo ""
    
    # 安装Homebrew
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # 将Homebrew添加到PATH（针对Apple Silicon Mac）
    if [ -f "/opt/homebrew/bin/brew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    # 针对Intel Mac
    elif [ -f "/usr/local/bin/brew" ]; then
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/usr/local/bin/brew shellenv)"
    fi
    
    echo "✓ Homebrew 安装完成"
    echo ""
fi

# 使用Homebrew安装Node.js
echo "正在使用 Homebrew 安装 Node.js..."
echo "这可能需要几分钟时间..."
echo ""

brew install node

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  ✓ Node.js 安装成功！"
    echo "========================================="
    echo ""
    echo "Node.js 版本:"
    node --version
    echo ""
    echo "npm 版本:"
    npm --version
    echo ""
    echo "现在可以启动项目了！"
    echo "运行: ./start.sh"
else
    echo ""
    echo "安装失败，请尝试手动安装："
    echo "1. 访问 https://nodejs.org/"
    echo "2. 下载并安装 LTS 版本"
    exit 1
fi



