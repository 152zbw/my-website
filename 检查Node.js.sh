#!/bin/bash

echo "========================================="
echo "  检查 Node.js 安装状态"
echo "========================================="
echo ""

# 检查多个可能的路径
PATHS=(
    "/usr/local/bin/node"
    "/opt/homebrew/bin/node"
    "$HOME/.nvm/versions/node/*/bin/node"
    "/usr/bin/node"
)

FOUND=false

for path in "${PATHS[@]}"; do
    if [ -f "$path" ] || command -v node >/dev/null 2>&1; then
        echo "✓ 找到 Node.js！"
        node --version
        npm --version
        FOUND=true
        break
    fi
done

if [ "$FOUND" = false ]; then
    echo "✗ 未找到 Node.js"
    echo ""
    echo "请按照以下步骤安装："
    echo "1. 访问 https://nodejs.org/zh-cn/"
    echo "2. 下载 LTS 版本"
    echo "3. 双击安装包完成安装"
    echo "4. 重新打开终端"
    echo "5. 运行此脚本再次检查"
    exit 1
fi

echo ""
echo "Node.js 已就绪，可以启动项目了！"
echo "运行: ./start.sh"



