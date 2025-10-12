# Ebin Player 架构概览

## 系统架构

Ebin Player 采用现代化的分层架构设计，主要包含以下层次：

### 1. 用户接口层
- **PlayerInstance API** - 对外提供的主要接口

### 2. 核心业务层
- **PlayerCore** - 播放器核心功能
- **PlayerStore** - 状态管理系统
- **PluginManager** - 插件管理系统

### 3. UI表现层
- **UIManager** - UI管理器
- **ThemeManager** - 主题管理
- **ResponsiveManager** - 响应式管理

### 4. 组件层
- **BaseComponent** - 基础组件类
- **具体组件** - PlayButton、ProgressBar、VolumeControl等

### 5. 插件层
- **BasePlugin** - 插件基类
- **内置插件** - PlaybackRatePlugin等
- **自定义插件** - 用户开发的插件

### 6. 基础设施层
- **Logger** - 日志系统
- **HTMLVideoElement** - 视频元素

## 核心设计原则

### 1. 分层架构
- 清晰的职责分离
- 低耦合高内聚
- 易于维护和扩展

### 2. 事件驱动
- 基于事件的松耦合设计
- 响应式状态管理
- 异步处理机制

### 3. 插件化设计
- 现代插件架构
- 服务定位模式
- 命令系统

### 4. 组件化UI
- 可复用的UI组件
- 统一的主题系统
- 响应式设计

## 数据流

```
用户操作 → PlayerInstance → PlayerCore → HTMLVideoElement
    ↓
UI组件 ← UIManager ← PlayerStore ← 状态更新
    ↓
插件系统 ← PluginManager ← 事件系统
```

## 技术栈

- **TypeScript** - 类型安全
- **Rollup** - 模块打包
- **Tailwind CSS** - 样式框架
- **现代ES6+** - JavaScript特性
