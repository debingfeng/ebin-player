#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始构建文档...');

try {
    // 1. 构建API文档
    console.log('📚 构建API文档...');
    execSync('npx typedoc', { stdio: 'inherit' });
    
    // 2. 复制示例到API文档目录
    console.log('📁 复制示例文件...');
    if (fs.existsSync('examples')) {
        execSync('cp -r examples docs-api/', { stdio: 'inherit' });
    }
    
    if (fs.existsSync('demos')) {
        execSync('cp -r demos docs-api/', { stdio: 'inherit' });
    }
    
    // 3. 生成示例索引
    console.log('📝 生成示例索引...');
    const examplesIndex = generateExamplesIndex();
    fs.writeFileSync('docs-api/examples/index.html', examplesIndex);
    
    // 4. 生成演示索引
    console.log('🎬 生成演示索引...');
    const demosIndex = generateDemosIndex();
    fs.writeFileSync('docs-api/demos/index.html', demosIndex);
    
    // 5. 生成主页面
    console.log('🏠 生成主页面...');
    const mainIndex = generateMainIndex();
    fs.writeFileSync('docs-api/index.html', mainIndex);
    
    console.log('✅ 文档构建完成！');
    console.log('📂 文档位置: docs-api/');
    console.log('🌐 本地预览: npm run docs:serve');
    
} catch (error) {
    console.error('❌ 文档构建失败:', error.message);
    process.exit(1);
}

function generateExamplesIndex() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EbinPlayer 示例</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; text-align: center; margin-bottom: 40px; }
        .examples-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .example-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .example-card h3 { color: #007bff; margin-bottom: 10px; }
        .example-card p { color: #666; margin-bottom: 15px; }
        .example-card a { display: inline-block; padding: 8px 16px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
        .example-card a:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>EbinPlayer 示例</h1>
        <div class="examples-grid">
            <div class="example-card">
                <h3>基础播放器</h3>
                <p>展示EbinPlayer的基本功能，包括播放控制、音量调节、进度控制等。</p>
                <a href="basic/index.html">查看示例</a>
            </div>
            <div class="example-card">
                <h3>自定义UI</h3>
                <p>演示如何自定义播放器的外观和主题，包括颜色、尺寸、样式等。</p>
                <a href="custom-ui/index.html">查看示例</a>
            </div>
            <div class="example-card">
                <h3>插件开发</h3>
                <p>展示如何开发和使用插件，扩展播放器功能。</p>
                <a href="plugins/index.html">查看示例</a>
            </div>
            <div class="example-card">
                <h3>主题定制</h3>
                <p>演示主题定制功能，包括预设主题和自定义主题。</p>
                <a href="themes/index.html">查看示例</a>
            </div>
        </div>
    </div>
</body>
</html>`;
}

function generateDemosIndex() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EbinPlayer 在线演示</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: white; text-align: center; margin-bottom: 40px; font-size: 3rem; }
        .demo-card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; }
        .demo-card h2 { color: #333; margin-bottom: 15px; }
        .demo-card p { color: #666; margin-bottom: 20px; }
        .demo-card a { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .demo-card a:hover { background: #0056b3; transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <h1>EbinPlayer 在线演示</h1>
        <div class="demo-card">
            <h2>🎬 完整功能演示</h2>
            <p>体验EbinPlayer的所有功能，包括基础播放、自定义UI、插件系统、主题定制和高级功能。</p>
            <a href="index.html">开始体验</a>
        </div>
    </div>
</body>
</html>`;
}

function generateMainIndex() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EbinPlayer 文档</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; text-align: center; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .nav-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
        .nav-card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; transition: transform 0.2s; }
        .nav-card:hover { transform: translateY(-5px); }
        .nav-card h3 { color: #333; margin-bottom: 15px; font-size: 1.5rem; }
        .nav-card p { color: #666; margin-bottom: 20px; }
        .nav-card a { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
        .nav-card a:hover { background: #0056b3; }
        .footer { background: #333; color: white; text-align: center; padding: 30px 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>EbinPlayer</h1>
        <p>现代化的Web视频播放器</p>
    </div>
    
    <div class="container">
        <div class="nav-grid">
            <div class="nav-card">
                <h3>📚 API 文档</h3>
                <p>完整的API参考文档，包含所有类、方法和属性的详细说明。</p>
                <a href="modules.html">查看API文档</a>
            </div>
            <div class="nav-card">
                <h3>🎬 在线演示</h3>
                <p>体验EbinPlayer的所有功能，包括基础播放、自定义UI、插件系统等。</p>
                <a href="demos/index.html">开始体验</a>
            </div>
            <div class="nav-card">
                <h3>💻 代码示例</h3>
                <p>查看各种使用场景的代码示例，快速上手EbinPlayer。</p>
                <a href="examples/index.html">查看示例</a>
            </div>
            <div class="nav-card">
                <h3>🚀 快速开始</h3>
                <p>5分钟快速上手EbinPlayer，从安装到第一个播放器。</p>
                <a href="https://github.com/your-username/ebin-player#quick-start">开始使用</a>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>EbinPlayer - 现代化的Web视频播放器</p>
        <p>© 2024 EbinPlayer Team. All rights reserved.</p>
    </div>
</body>
</html>`;
}
