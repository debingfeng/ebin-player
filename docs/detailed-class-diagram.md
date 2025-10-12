# Ebin Player 详细类图

## 核心类关系

### PlayerInstance (主入口类)
```typescript
class PlayerInstance {
  + core: PlayerCore
  + store: PlayerStore
  + pluginManager: PluginManager
  + logger: Logger
  
  + play(): Promise<PlayerInstance>
  + pause(): PlayerInstance
  + destroy(): void
  + on<T>(event: T, callback: Function): () => void
  + use(plugin: PluginDefinition): PlayerInstance
  + getUIMode(): UIMode
  + updateUIMode(uiMode: UIMode): PlayerInstance
}
```

### PlayerCore (核心功能类)
```typescript
class PlayerCore {
  - videoElement: HTMLVideoElement
  - container: HTMLElement
  - options: PlayerOptions
  - state: PlayerState
  - uiMode: UIMode
  - logger: Logger
  
  + play(): Promise<void>
  + pause(): void
  + setVolume(volume: number): void
  + getCurrentTime(): number
  + setCurrentTime(time: number): void
  - initializeUI(): void
  - determineUIMode(): UIMode
}
```

### PlayerStore (状态管理类)
```typescript
class PlayerStore {
  - state: PlayerState
  - subscribers: Set<Function>
  
  + getState(): PlayerState
  + setState(state: Partial<PlayerState>): void
  + subscribe(callback: Function, keys?: string[]): () => void
  + notifySubscribers(): void
}
```

### PluginManager (插件管理类)
```typescript
class PluginManager {
  - plugins: Map<string, PluginDefinition>
  - contexts: Map<string, PluginContext>
  
  + register(plugin: PluginDefinition): void
  + unregister(pluginId: string): void
  + getPlugin(pluginId: string): PluginDefinition | undefined
  + getPluginIds(): string[]
}
```

## UI系统类关系

### UIManager (UI管理器)
```typescript
class UIManager {
  - player: PlayerInstance
  - container: HTMLElement
  - configManager: UIConfigManager
  - components: Map<string, BaseComponent>
  
  + render(): void
  + destroy(): void
  + updateComponent(componentId: string): void
}
```

### BaseComponent (基础组件类)
```typescript
abstract class BaseComponent {
  + id: string
  + name: string
  + enabled: boolean
  
  + render(container: HTMLElement): HTMLElement
  + destroy(): void
  + update(state: PlayerState): void
}
```

### 具体UI组件
```typescript
class PlayButton extends BaseComponent {
  + render(container: HTMLElement): HTMLElement
  + handleClick(): void
}

class ProgressBar extends BaseComponent {
  + render(container: HTMLElement): HTMLElement
  + updateProgress(currentTime: number, duration: number): void
}

class VolumeControl extends BaseComponent {
  + render(container: HTMLElement): HTMLElement
  + updateVolume(volume: number): void
}
```

## 插件系统类关系

### BasePlugin (插件基类)
```typescript
abstract class BasePlugin {
  + meta: PluginMeta
  
  + onInit?(ctx: PluginContext): void
  + onStart?(ctx: PluginContext): void
  + onEvent?(event: PlayerEvent, ctx: PluginContext): void
  + onDestroy?(ctx: PluginContext): void
}
```

### PluginContext (插件上下文)
```typescript
interface PluginContext {
  + player: PlayerInstance
  + logger: Logger
  + on<T>(event: T, callback: Function): () => void
  + emit<T>(event: T, data?: any): void
  + storage: Storage
  + getConfig<T>(): T
  + setConfig<T>(config: Partial<T>): void
}
```

## 类型定义

### 核心类型
```typescript
enum UIMode {
  NATIVE = 'native'
  CUSTOM = 'custom'
  NONE = 'none'
}

interface PlayerOptions {
  src: string
  autoplay?: boolean
  uiMode?: UIMode
  uiConfig?: ControlBarConfig
  theme?: PlayerTheme
}

interface PlayerState {
  src: string
  currentTime: number
  duration: number
  paused: boolean
  volume: number
  // ... 其他状态属性
}
```

## 继承关系图

```
PlayerInstance
├── PlayerCore
├── PlayerStore
└── PluginManager

BaseComponent
├── PlayButton
├── ProgressBar
├── TimeDisplay
└── VolumeControl

BasePlugin
└── PlaybackRatePlugin

UIManager
├── ThemeManager
└── ResponsiveManager
```
