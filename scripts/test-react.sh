#!/bin/bash

# EbinPlayer React 测试脚本

echo "🚀 启动 EbinPlayer React 测试应用..."

# 检查是否在正确的目录
if [ ! -f "packages/react/package.json" ]; then
    echo "❌ 错误: 请在 ebin-player 根目录运行此脚本"
    exit 1
fi

# 构建 React 包
echo "📦 构建 React 包..."
cd packages/react
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ React 包构建失败"
    exit 1
fi

# 回到根目录
cd ../..

# 检查测试应用是否存在
if [ ! -d "test-react-app" ]; then
    echo "❌ 错误: 测试应用目录不存在"
    exit 1
fi

# 进入测试应用目录
cd test-react-app

# 安装依赖
echo "📥 安装测试应用依赖..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "测试应用将在 http://localhost:3000 打开"
echo "按 Ctrl+C 停止服务器"
echo ""

pnpm run dev
