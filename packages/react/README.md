# ebin-player-react

React 适配层：将 `ebin-player` 以 React 组件方式提供，支持自动/手动样式注入、SSR 安全、插件直通与命令式控制。

## 安装

```bash
pnpm add ebin-player-react ebin-player
# 或 npm/yarn
```

> 注意：样式默认自动注入；也可手动引入 `import 'ebin-player/styles'`。

## 快速开始

```tsx
import { EbinPlayer } from 'ebin-player-react';

export default function Demo() {
  return (
    <EbinPlayer src="/video.mp4" uiMode="advanced" />
  );
}
```

## 样式策略
- 默认：`styleInjection='auto'`，客户端挂载时注入一次样式，幂等不重复
- 手动：`styleInjection='manual'`，由你自行引入样式
- 可选参数：`stylesheetUrl`、`nonce`、`injectOnceKey`

## SSR/Next.js
- 组件仅在客户端实例化；SSR 阶段只渲染容器
- Next 推荐在全局 CSS 手动引入样式以保证首屏稳定

## 事件与 Ref
- 事件：`onReady/onPlay/onPause/onTimeUpdate/...`
- ref：`getInstance()` 获取底层实例以执行命令式控制

## 版本与兼容
- peer 依赖：`react`、`react-dom`
- 依赖：`ebin-player`，将对常用版本区间进行兼容性验证
