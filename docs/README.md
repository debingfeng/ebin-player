# Ebin Player 架构文档

本目录包含了 Ebin Player 的完整架构文档和图表，帮助开发者理解系统的设计原理和实现细节。

## 📁 文档结构

### 架构图表
- **[architecture-diagrams.md](./architecture-diagrams.md)** - 完整的架构图表集合
- **[architecture-overview.md](./architecture-overview.md)** - 架构概览和简化图表
- **[detailed-class-diagram.md](./detailed-class-diagram.md)** - 详细的类图

## 🏗️ 架构概览

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

## 🎯 核心设计原则

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

## 📊 图表说明

### 整体架构图
展示了系统的整体结构和各组件间的关系，包括：
- 分层架构设计
- 组件依赖关系
- 数据流向

### 类关系图
展示了主要类之间的继承和依赖关系，包括：
- 核心类的详细结构
- 接口和类型定义
- 方法调用关系

### 数据流图
展示了用户操作到系统响应的完整流程，包括：
- 用户交互处理
- 状态更新机制
- UI更新流程

### 插件系统架构图
展示了现代插件系统的设计，包括：
- 插件管理器
- 插件上下文
- 生命周期管理

## 🚀 快速开始

1. **查看架构概览** - 从 `architecture-overview.md` 开始
2. **理解类关系** - 查看 `detailed-class-diagram.md`
3. **深入了解** - 阅读 `architecture-diagrams.md`

## 🔧 开发指南

### 添加新组件
1. 继承 `BaseComponent` 类
2. 实现必要的抽象方法
3. 在 `UIManager` 中注册

### 开发插件
1. 继承 `BasePlugin` 类
2. 实现插件元数据
3. 使用插件上下文API

### 自定义主题
1. 使用 `ThemeManager` 管理主题
2. 定义 `ComponentTheme` 接口
3. 应用到具体组件

## 📝 贡献指南

欢迎贡献架构文档和图表！

1. Fork 项目
2. 创建功能分支
3. 更新相关文档
4. 提交 Pull Request

## 📄 许可证

MIT License - 详见项目根目录的 LICENSE 文件
