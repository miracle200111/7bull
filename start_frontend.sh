#!/bin/bash

echo "🎭 AI角色扮演前端启动器"
echo "========================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
    exit 1
fi

echo "✅ Node.js版本: $(node --version)"

# 进入前端目录
cd frontend || {
    echo "❌ 未找到frontend目录"
    exit 1
}

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖包安装失败"
        exit 1
    fi
fi

echo "✅ 依赖包检查完成"

# 启动开发服务器
echo "🚀 启动前端开发服务器..."
echo "📱 前端地址: http://localhost:3000"
echo "🔗 后端地址: http://localhost:8000"
echo ""
echo "按Ctrl+C停止服务器"

npm start
