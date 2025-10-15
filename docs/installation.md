# 安装指南

## 环境要求

- **Node.js**: >= 16.0.0
- **浏览器支持**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **TypeScript**: >= 4.5.0 (可选，用于TypeScript项目)

## 安装方式

### 1. PNPM 安装 (推荐)

```bash
pnpm add ebin-player
```

### 2. NPM 安装

```bash
npm install @ebin/player
```

### 3. Yarn 安装

```bash
yarn add ebin-player
```

### 4. CDN 引入

```html
<!-- CSS 样式 -->
<link rel="stylesheet" href="https://unpkg.com/ebin-player@latest/dist/styles.css">

<!-- JavaScript 库 -->
<script src="https://unpkg.com/ebin-player@latest/dist/ebin-player.umd.js"></script>
```

## 版本选择

### 稳定版 (推荐)
```bash
npm install @ebin/player@latest
```

### 开发版
```bash
npm install @ebin/player@beta
```

### 预发布版
```bash
npm install @ebin/player@alpha
```

## 导入方式

### ES6 模块导入

```typescript
// 完整导入
import { createPlayer, PlayerInstance } from '@ebin/player';

// 按需导入
import { createPlayer } from '@ebin/player';
import type { PlayerOptions } from '@ebin/player';
```

### CommonJS 导入

```javascript
const { createPlayer, PlayerInstance } = require('ebin-player');
```

### UMD 全局变量

```html
<script src="dist/ebin-player.umd.js"></script>
<script>
    const player = new EbinPlayer(container, options);
</script>
```

## 样式文件

### 引入默认样式

```html
<link rel="stylesheet" href="node_modules/ebin-player/dist/styles.css">
```

### 在构建工具中引入

```typescript
// 在入口文件中引入
import 'ebin-player/dist/styles.css';
```

## TypeScript 支持

EbinPlayer 提供完整的 TypeScript 类型定义，无需额外安装类型包。

```typescript
import { createPlayer, type PlayerOptions } from '@ebin/player';

const options: PlayerOptions = {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    autoplay: false,
    controls: true
};

const player = createPlayer(container, options);
```

## 验证安装

创建一个简单的测试文件来验证安装是否成功：

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="node_modules/ebin-player/dist/styles.css">
</head>
<body>
    <div id="player"></div>
    <script src="node_modules/ebin-player/dist/ebin-player.umd.js"></script>
    <script>
        console.log('EbinPlayer version:', EbinPlayer.version);
        const player = new EbinPlayer(document.getElementById('player'), {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        });
    </script>
</body>
</html>
```

## 常见问题

### Q: 安装后无法找到模块？
A: 确保已正确安装依赖，并检查 `node_modules` 目录中是否存在 `ebin-player` 文件夹。

### Q: TypeScript 类型错误？
A: 确保安装了正确版本的 TypeScript，并检查 `tsconfig.json` 配置。

### Q: 样式不生效？
A: 确保已正确引入 CSS 文件，检查文件路径是否正确。

### Q: 浏览器兼容性问题？
A: 检查浏览器版本是否满足最低要求，考虑使用 polyfill 或降级方案。

## 下一步

安装完成后，您可以：

1. 查看 [快速开始指南](./quick-start.md)
2. 浏览 [API 文档](../api/)
3. 查看 [使用示例](../examples/)
4. 了解 [插件开发](../examples/plugin-development.md)
