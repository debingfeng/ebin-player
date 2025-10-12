# 测试文档

本目录包含了 Ebin Player 的所有测试文件，采用 Jest 作为测试框架。

## 📁 目录结构

```
tests/
├── README.md                 # 测试文档
├── index.ts                  # 测试入口文件
├── setup.ts                  # 测试环境设置
├── utils.ts                  # 测试工具函数
├── core/                     # 核心模块测试
│   ├── PlayerCore.test.ts    # 播放器核心测试
│   └── PlayerStore.test.ts   # 状态管理测试
├── ui/                       # UI组件测试
│   └── components/
│       └── PlayButton.test.ts # 播放按钮组件测试
├── plugin/                   # 插件系统测试
│   └── BasePlugin.test.ts    # 插件基类测试
└── integration/              # 集成测试
    └── PlayerIntegration.test.ts # 播放器集成测试
```

## 🚀 运行测试

### 基础命令

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# CI环境运行测试
npm run test:ci
```

### 运行特定测试

```bash
# 运行核心模块测试
npm test tests/core

# 运行UI组件测试
npm test tests/ui

# 运行插件测试
npm test tests/plugin

# 运行集成测试
npm test tests/integration

# 运行特定文件测试
npm test PlayerCore.test.ts
```

## 📝 测试编写指南

### 测试文件命名

- 测试文件必须以 `.test.ts` 或 `.spec.ts` 结尾
- 测试文件应该与被测试的文件同名
- 例如：`PlayerCore.ts` 对应 `PlayerCore.test.ts`

### 测试结构

```typescript
describe('组件名称', () => {
  describe('功能分组', () => {
    it('应该能够执行特定功能', () => {
      // 测试代码
    });
  });
});
```

### 测试工具使用

```typescript
import { 
  createTestContainer, 
  cleanupTestContainer, 
  createMockLogger,
  createTestData 
} from '../utils';

// 创建测试容器
const container = createTestContainer();

// 创建模拟数据
const playerOptions = createTestData.playerOptions({
  src: 'custom-video.mp4'
});

// 清理测试环境
cleanupTestContainer();
```

## 🔧 测试配置

### Jest 配置

测试配置位于项目根目录的 `jest.config.js` 文件中，主要配置包括：

- **测试环境**: jsdom (模拟浏览器环境)
- **TypeScript支持**: 使用 ts-jest 预设
- **覆盖率阈值**: 50% (可调整)
- **模块映射**: 支持路径别名和CSS模块

### 测试环境设置

`setup.ts` 文件包含了测试环境的全局设置：

- 模拟浏览器API (matchMedia, ResizeObserver等)
- 模拟HTMLVideoElement方法
- 控制台输出控制
- DOM清理

## 📊 覆盖率报告

测试运行后会生成覆盖率报告，包括：

- **文本报告**: 在终端中显示
- **HTML报告**: 在 `coverage/lcov-report/index.html` 中查看
- **LCOV报告**: 用于CI/CD集成

### 覆盖率指标

- **Statements**: 语句覆盖率
- **Branches**: 分支覆盖率  
- **Functions**: 函数覆盖率
- **Lines**: 行覆盖率

## 🐛 调试测试

### 调试单个测试

```bash
# 运行特定测试并显示详细输出
npm test -- --verbose PlayerCore.test.ts

# 运行测试并保持监听
npm test -- --watch PlayerCore.test.ts
```

### 调试技巧

1. **使用 console.log**: 在测试中添加日志输出
2. **使用 debugger**: 在代码中设置断点
3. **使用 --no-cache**: 清除Jest缓存
4. **使用 --detectOpenHandles**: 检测未关闭的句柄

## 📋 测试最佳实践

### 1. 测试隔离

- 每个测试应该独立运行
- 使用 `beforeEach` 和 `afterEach` 清理状态
- 避免测试间的依赖

### 2. 测试命名

- 使用描述性的测试名称
- 遵循 "应该能够..." 的命名模式
- 分组相关的测试用例

### 3. 断言清晰

- 使用具体的断言而不是通用的 `toBeTruthy()`
- 提供有意义的错误消息
- 测试边界条件和错误情况

### 4. 模拟外部依赖

- 模拟网络请求和API调用
- 模拟DOM操作和浏览器事件
- 使用 Jest 的模拟功能

### 5. 性能考虑

- 避免在测试中执行耗时操作
- 使用 `jest.setTimeout()` 设置合理的超时时间
- 清理定时器和事件监听器

## 🔄 持续集成

测试配置支持CI/CD环境：

- 使用 `npm run test:ci` 在CI中运行
- 生成LCOV覆盖率报告
- 设置覆盖率阈值检查
- 支持并行测试执行

## 📚 相关资源

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Library 文档](https://testing-library.com/docs/)
- [TypeScript 测试指南](https://jestjs.io/docs/getting-started#using-typescript)
