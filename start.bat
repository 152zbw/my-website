@echo off
chcp 65001 >nul
echo =========================================
echo   咨询公司官网 - 启动脚本
echo =========================================

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    echo 访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

REM 检查npm是否安装
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: 未检测到npm，请先安装npm
    pause
    exit /b 1
)

echo ✓ Node.js版本:
node -v
echo ✓ npm版本:
npm -v

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo.
    echo 正在安装依赖包...
    call npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
    echo ✓ 依赖安装完成
)

REM 检查.env文件是否存在
if not exist ".env" (
    echo.
    echo 创建.env配置文件...
    (
        echo # 服务器配置
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # JWT配置
        echo JWT_SECRET=your-secret-key-change-this-in-production-%RANDOM%
        echo JWT_EXPIRES_IN=24h
    ) > .env
    echo ✓ .env文件已创建
)

REM 初始化数据库
echo.
echo 正在初始化数据库...
node init-db.js
if %errorlevel% neq 0 (
    echo 警告: 数据库初始化可能失败，但将继续启动服务器
)

REM 启动服务器
echo.
echo =========================================
echo   正在启动服务器...
echo =========================================
echo.
echo 访问地址: http://localhost:3000
echo API地址: http://localhost:3000/api
echo 后台管理: http://localhost:3000/html/admin/dashboard.html
echo.
echo 默认管理员账号:
echo   用户名: admin
echo   密码: admin123
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm start



