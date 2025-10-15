# EbinPlayer React 测试应用

这是一个用于测试 `@ebin-player/react` 包的示例应用。

## 快速开始

### 1. 安装依赖

```bash
cd test-react-app
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm run dev
```

应用将在 http://localhost:3000 打开。

## 功能测试

这个测试应用包含以下功能：

- ✅ 基础播放/暂停控制
- ✅ 时间显示和进度跟踪
- ✅ 音量控制和静音
- ✅ 全屏切换
- ✅ 事件监听和状态管理
- ✅ Ref 命令式控制 API
- ✅ 样式注入测试

## 测试场景

1. **基础播放**: 点击播放按钮测试播放/暂停
2. **音量控制**: 测试音量调节和静音功能
3. **全屏模式**: 测试全屏进入和退出
4. **事件监听**: 查看控制台输出的事件日志
5. **状态同步**: 观察 UI 状态与播放器状态的同步

## 开发模式

如果你在开发 `@ebin-player/react` 包：

1. 修改 `packages/react` 中的源码
2. 运行 `pnpm run build` 重新构建
3. 测试应用会自动使用新构建的版本

## 故障排除

### 样式问题
确保在 `main.tsx` 中引入了样式：
```tsx
import '@ebin-player/core/styles'
```

### 类型错误
确保安装了正确的 TypeScript 类型：
```bash
pnpm add -D @types/react @types/react-dom
```

### 包链接问题
如果遇到模块找不到的错误，尝试：
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```
