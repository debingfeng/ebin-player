/**
 * 插件管理器
 * 负责插件的注册、卸载、数据通信和生命周期管理
 */
import type { PlayerInstance } from "../types";
import { Plugin, PlayerEventType, PlayerEvent, PluginDefinition, PluginContext, Logger as LoggerType, PlayerOptions } from "../types";
import { PlaybackRatePlugin } from './built-in/PlaybackRatePlugin';

export interface IPluginManager {
  use(plugin: Plugin): void;
  unuse(pluginName: string): void;
  getPlugin(name: string): Plugin | undefined;
  getPluginNames(): string[];
  destroy(): void;
}

export class PluginManager implements IPluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private player: PlayerInstance;
  private pluginEvents: Map<
    string,
    Map<PlayerEventType, Set<(event: PlayerEvent) => void>>
  > = new Map();
  private pluginData: Map<string, Map<string, any>> = new Map();
  private logger: LoggerType | Console = console;
  private anyEventListeners: Set<(payload: { plugin: string; event: PlayerEvent }) => void> = new Set();
  private anyPlayerEventListeners: Set<(event: PlayerEvent) => void> = new Set();
  private permissionCheck: (pluginId: string, perm: string) => boolean = () => true; // 占位：默认允许
  // 新架构：插件定义、配置、导出、命令、服务、插件间事件
  private pluginDefs: Map<string, PluginDefinition<any, any>> = new Map();
  private pluginExports: Map<string, any> = new Map();
  private pluginConfigs: Map<string, any> = new Map();
  private pluginConfigVersions: Map<string, number> = new Map();
  private services: Map<string, any> = new Map(); // 全局服务命名空间: "pluginId:name" 或全局名
  private commands: Map<string, Map<string, (args: any, ctx: PluginContext) => any>> = new Map();
  private interPluginEvents: Map<string, Map<string, Set<(data: any) => void>>> = new Map();

  constructor(player: PlayerInstance, logger?: LoggerType) {
    this.player = player;
    this.logger = logger || console;
  }

  /**
   * 根据播放器选项初始化内置与外部插件
   */
  initializeFromOptions(options: PlayerOptions): void {
    const builtins = options.builtinPlugins || {};
    // 内置：播放速率
    if (builtins.playbackRate) {
      this.use(PlaybackRatePlugin);
      const conf = typeof builtins.playbackRate === 'object' ? builtins.playbackRate : {};
      if (conf && Object.keys(conf).length > 0) {
        this.updatePluginConfig('builtin.playback-rate', conf as any);
      }
    }
    // 外部：预留 options.plugins（若存在基于 URL/模块名的动态导入，可在此实现）
  }

  /**
   * 更新时根据新的选项开关增删插件（占位，可扩展）
   */
  updateFromOptions(_options: PlayerOptions): void {
    // 可对比前后选项进行插件增删，目前留空
  }

  /**
   * 注册插件
   */
  // 兼容入口：既支持旧式 Plugin 也支持新式 PluginDefinition
  use(plugin: Plugin | PluginDefinition<any, any>): void {
    const isNewDef = (p: any): p is PluginDefinition => !!p && !!p.meta && typeof p.meta.id === 'string';
    if (isNewDef(plugin)) {
      this.useDefinition(plugin);
      return;
    }
    const legacy = plugin as Plugin;
    // 基础校验（旧接口）
    const validation = this.validatePlugin(legacy);
    if (!validation.valid) {
      this.logger.error?.(`插件 ${legacy.name || '<unknown>'} 无效:`, validation.errors);
      return;
    }

    // 冲突检查
    const conflicts = this.checkPluginConflicts(legacy.name);
    if (conflicts.length > 0) {
      this.logger.warn?.(`插件 ${legacy.name} 存在冲突:`, conflicts);
    }

    if (this.plugins.has(legacy.name)) {
      this.logger.warn?.(`插件 ${legacy.name} 已存在，将被替换`);
      this.unuse(legacy.name);
    }

    try {
      // 应用插件（与 PlayerInstance 类型对齐）
      legacy.apply(this.player);

      // 注册插件
      this.plugins.set(legacy.name, legacy);

      // 初始化插件数据存储
      this.pluginData.set(legacy.name, new Map());

      // 初始化插件事件存储
      this.pluginEvents.set(legacy.name, new Map());

      this.logger.info?.(`插件 ${legacy.name} 注册成功`);
    } catch (error) {
      // 隔离失败：不抛出到上层，记录错误并确保未注册任何残留
      this.logger.error?.(`插件 ${legacy.name} 注册失败:`, error);
      this.plugins.delete(legacy.name);
      this.pluginData.delete(legacy.name);
      this.pluginEvents.delete(legacy.name);
    }
  }

  // 新式定义安装流程：校验→依赖/冲突→注册→生命周期
  private useDefinition<C = any, E = any>(def: PluginDefinition<C, E>): void {
    const id = def.meta.id;
    if (this.pluginDefs.has(id)) {
      this.logger.warn?.(`插件 ${id} 已存在，将被替换`);
      this.unuse(id);
    }

    // 依赖/冲突检查（占位，可扩展 semver 校验）
    const conflicts = this.checkPluginConflicts(id);
    if (conflicts.length > 0) {
      this.logger.warn?.(`插件 ${id} 存在冲突:`, conflicts);
    }

    // 配置初始化与校验
    const initialConfig = def.defaultConfig ?? {} as C;
    const targetVersion = def.configVersion ?? 1;
    // 配置迁移（首次安装仅记录目标版本）
    if (def.validateConfig) {
      const res = def.validateConfig(initialConfig);
      if (!res.valid) {
        this.logger.error?.(`插件 ${id} 配置无效:`, res.errors);
        return;
      }
    }

    // 注册容器
    this.pluginDefs.set(id, def);
    this.pluginData.set(id, new Map());
    this.pluginEvents.set(id, new Map());
    this.interPluginEvents.set(id, new Map());
    this.pluginConfigs.set(id, initialConfig);
    this.pluginConfigVersions.set(id, targetVersion);
    this.commands.set(id, new Map());

    // 构建上下文
    const ctx = this.buildContext<C>(id);

    try {
      // onInit
      const exportsMaybe = def.onInit?.(ctx);
      if (exportsMaybe instanceof Promise) {
        exportsMaybe.then((exp) => this.pluginExports.set(id, exp)).catch((err) => {
          this.logger.error?.(`插件 ${id} onInit 异常:`, err);
        });
      } else if (exportsMaybe !== undefined) {
        this.pluginExports.set(id, exportsMaybe);
      }

      // onStart（立即调用；如需等待播放器 ready，可在外部时机再次触发）
      def.onStart?.(ctx);

      this.logger.info?.(`插件 ${id} 注册成功`);
    } catch (error) {
      this.logger.error?.(`插件 ${id} 注册失败:`, error);
      this.unuse(id);
    }
  }

  private buildContext<C = any>(id: string): PluginContext {
    const ctx: PluginContext = {
      player: this.player,
      logger: (this.player.getLogger?.() as LoggerType) || (this.logger as LoggerType),
      on: (event, cb) => this.player.on(event, cb as any),
      off: (event, cb) => this.player.off(event, cb as any),
      emit: (event, data) => { this.player.emit(event, data as any); },
      onAnyPlayerEvent: (cb) => {
        if (!this.permissionCheck(id, 'events:any')) {
          this.logger.warn?.(`插件 ${id} 无权限订阅所有播放器事件`);
          return () => {};
        }
        this.anyPlayerEventListeners.add(cb);
        return () => this.anyPlayerEventListeners.delete(cb);
      },
      onPluginEvent: (pluginId, type, cb) => {
        if (!this.interPluginEvents.has(pluginId)) this.interPluginEvents.set(pluginId, new Map());
        const map = this.interPluginEvents.get(pluginId)!;
        if (!map.has(type)) map.set(type, new Set());
        map.get(type)!.add(cb);
        return () => map.get(type)?.delete(cb);
      },
      emitPluginEvent: (pluginId, type, data) => {
        const map = this.interPluginEvents.get(pluginId);
        const set = map?.get(type);
        set?.forEach((cb) => {
          try { cb(data); } catch (e) { this.logger.error?.(`插件 ${pluginId} 事件 ${type} 回调异常:`, e); }
        });
      },
      registerService: (name, service) => {
        this.services.set(`${id}:${name}`, service);
      },
      getService: (name) => this.services.get(name) ?? this.services.get(`${id}:${name}`),
      getConfig: <T = unknown>() => this.pluginConfigs.get(id) as T,
      setConfig: <T = unknown>(partial: Partial<T>) => {
        const cur = this.pluginConfigs.get(id) || {};
        const next = { ...cur, ...(partial as object) };
        this.pluginConfigs.set(id, next);
        const def = this.pluginDefs.get(id);
        def?.onConfigChange?.(partial as any, ctx);
      },
      storage: {
        get: <T = unknown>(key: string) => {
          const v = this.pluginData.get(id)?.get(key);
          return this.deepClone(v) as T;
        },
        set: <T = unknown>(key: string, value: T) => {
          if (!this.permissionCheck(id, 'storage:write')) {
            this.logger.warn?.(`插件 ${id} 无权限写入存储`);
            return;
          }
          if (!this.pluginData.has(id)) this.pluginData.set(id, new Map());
          this.pluginData.get(id)!.set(key, this.deepClone(value));
        },
        delete: (key: string) => { this.pluginData.get(id)?.delete(key); },
        keys: () => Array.from(this.pluginData.get(id)?.keys() || []),
      },
      hasPermission: (perm: string) => this.permissionCheck(id, perm),
    };
    return ctx;
  }

  /**
   * 迁移插件配置到目标版本
   */
  migratePluginConfig(pluginId: string): void {
    const def = this.pluginDefs.get(pluginId);
    if (!def || !def.migrations || def.migrations.length === 0) return;
    const currentVersion = this.pluginConfigVersions.get(pluginId) ?? 1;
    const targetVersion = def.configVersion ?? 1;
    if (currentVersion >= targetVersion) return;
    let conf = this.pluginConfigs.get(pluginId) ?? {};
    const route = def.migrations
      .filter(m => m.from >= currentVersion && m.to <= targetVersion)
      .sort((a, b) => a.from - b.from);
    for (const step of route) {
      try { conf = step.migrate(conf); } catch (e) { this.logger.error?.(`迁移 ${pluginId} 配置 ${step.from}->${step.to} 失败:`, e); }
    }
    this.pluginConfigs.set(pluginId, conf);
    this.pluginConfigVersions.set(pluginId, targetVersion);
  }

  /**
   * 卸载插件
   */
  unuse(pluginName: string): void {
    const legacy = this.plugins.get(pluginName);
    const def = this.pluginDefs.get(pluginName);
    if (!legacy && !def) {
      this.logger.warn?.(`插件 ${pluginName} 不存在`);
      return;
    }

    try {
      // 旧接口销毁
      if (legacy?.destroy) legacy.destroy();
      // 新接口销毁
      def?.onDestroy?.(this.buildContext(pluginName));

      // 清理插件数据
      this.pluginData.delete(pluginName);

      // 清理插件事件
      this.pluginEvents.delete(pluginName);
      this.interPluginEvents.delete(pluginName);

      // 移除插件
      this.plugins.delete(pluginName);
      this.pluginDefs.delete(pluginName);
      this.pluginExports.delete(pluginName);
      this.pluginConfigs.delete(pluginName);
      this.commands.delete(pluginName);

      this.logger.info?.(`插件 ${pluginName} 卸载成功`);
    } catch (error) {
      // 隔离失败：卸载异常不影响管理器继续工作
      this.logger.error?.(`插件 ${pluginName} 卸载失败:`, error);
    }
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * 获取所有插件名称
   */
  getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * 插件间数据通信 - 设置数据
   */
  setPluginData(pluginName: string, key: string, value: any): void {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`插件 ${pluginName} 不存在`);
    }

    if (!this.pluginData.has(pluginName)) {
      this.pluginData.set(pluginName, new Map());
    }

    this.pluginData.get(pluginName)!.set(key, this.deepClone(value));
  }

  /**
   * 插件间数据通信 - 获取数据
   */
  getPluginData(pluginName: string, key: string): any {
    const pluginData = this.pluginData.get(pluginName);
    if (!pluginData) {
      return undefined;
    }
    const v = pluginData.get(key);
    return this.deepClone(v);
  }

  /**
   * 插件间数据通信 - 删除数据
   */
  deletePluginData(pluginName: string, key: string): boolean {
    const pluginData = this.pluginData.get(pluginName);
    if (!pluginData) {
      return false;
    }
    return pluginData.delete(key);
  }

  /**
   * 插件间数据通信 - 获取所有数据
   */
  getAllPluginData(pluginName: string): Map<string, any> {
    const original = this.pluginData.get(pluginName) || new Map();
    const copy = new Map<string, any>();
    original.forEach((v, k) => copy.set(k, this.deepClone(v)));
    return copy;
  }

  /**
   * 插件事件通信 - 监听事件
   */
  onPluginEvent(
    pluginName: string,
    eventType: PlayerEventType,
    callback: (event: PlayerEvent) => void
  ): () => void {
    if (!this.plugins.has(pluginName)) {
      throw new Error(`插件 ${pluginName} 不存在`);
    }

    if (!this.pluginEvents.has(pluginName)) {
      this.pluginEvents.set(pluginName, new Map());
    }

    const pluginEventMap = this.pluginEvents.get(pluginName)!;
    if (!pluginEventMap.has(eventType)) {
      pluginEventMap.set(eventType, new Set());
    }

    pluginEventMap.get(eventType)!.add(callback);

    // 返回取消监听函数
    return () => {
      const eventSet = pluginEventMap.get(eventType);
      if (eventSet) {
        eventSet.delete(callback);
      }
    };
  }

  /**
   * 解除插件事件监听（显式 API）
   */
  offPluginEvent(
    pluginName: string,
    eventType: PlayerEventType,
    callback: (event: PlayerEvent) => void
  ): void {
    const pluginEventMap = this.pluginEvents.get(pluginName);
    const eventSet = pluginEventMap?.get(eventType);
    eventSet?.delete(callback);
  }

  /**
   * 插件事件通信 - 触发事件
   */
  emitPluginEvent(
    pluginName: string,
    eventType: PlayerEventType,
    data?: any
  ): void {
    const pluginEventMap = this.pluginEvents.get(pluginName);
    if (!pluginEventMap) return;

    const eventSet = pluginEventMap.get(eventType);
    if (!eventSet) return;

    const event: PlayerEvent = {
      type: eventType,
      target: this.player,
      data,
      timestamp: Date.now(),
    };

    eventSet.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        this.logger.error?.(`插件 ${pluginName} 事件处理器错误:`, error);
      }
    });

    // 通知全局(any)事件监听器
    this.anyEventListeners.forEach((listener) => {
      try {
        listener({ plugin: pluginName, event });
      } catch (error) {
        this.logger.error?.(`插件 ${pluginName} any 事件处理器错误:`, error);
      }
    });
  }

  /**
   * 广播事件到所有插件
   */
  broadcastEvent(eventType: PlayerEventType, data?: any): void {
    this.pluginEvents.forEach((_, pluginName) => {
      try {
        this.emitPluginEvent(pluginName, eventType, data);
      } catch (error) {
        this.logger.error?.(`广播到插件 ${pluginName} 时出错:`, error);
      }
    });
  }

  /**
   * 更新插件配置（新接口）
   */
  updatePluginConfig<C = any>(pluginId: string, partial: Partial<C>): void {
    const def = this.pluginDefs.get(pluginId);
    if (!def) return;
    const ctx = this.buildContext<C>(pluginId);
    ctx.setConfig(partial);
  }

  /**
   * 命令注册与调用（新接口）
   */
  registerCommand(pluginId: string, name: string, fn: (args: any, ctx: PluginContext) => any): void {
    if (!this.commands.has(pluginId)) this.commands.set(pluginId, new Map());
    this.commands.get(pluginId)!.set(name, fn);
  }

  invokeCommand(pluginId: string, name: string, args?: any): any {
    const cmd = this.commands.get(pluginId)?.get(name);
    if (!cmd) {
      this.logger.warn?.(`命令未找到: ${pluginId}.${name}`);
      return undefined;
    }
    return cmd(args, this.buildContext(pluginId));
  }

  /**
   * 监听所有插件的所有事件
   */
  onAnyPluginEvent(callback: (payload: { plugin: string; event: PlayerEvent }) => void): () => void {
    this.anyEventListeners.add(callback);
    return () => {
      this.anyEventListeners.delete(callback);
    };
  }

  /**
   * 获取插件统计信息
   */
  getPluginStats(): {
    totalPlugins: number;
    pluginNames: string[];
    totalDataEntries: number;
    totalEventListeners: number;
  } {
    let totalDataEntries = 0;
    let totalEventListeners = 0;

    this.pluginData.forEach((dataMap) => {
      totalDataEntries += dataMap.size;
    });

    this.pluginEvents.forEach((eventMap) => {
      eventMap.forEach((eventSet) => {
        totalEventListeners += eventSet.size;
      });
    });

    return {
      totalPlugins: this.plugins.size,
      pluginNames: Array.from(this.plugins.keys()),
      totalDataEntries,
      totalEventListeners,
    };
  }

  /**
   * 验证插件兼容性
   */
  validatePlugin(plugin: Plugin): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!plugin.name || typeof plugin.name !== "string") {
      errors.push("插件必须有一个有效的名称");
    }

    if (!plugin.apply || typeof plugin.apply !== "function") {
      errors.push("插件必须有一个 apply 方法");
    }

    if (plugin.version && typeof plugin.version !== "string") {
      errors.push("插件版本必须是字符串");
    }

    if (plugin.destroy && typeof plugin.destroy !== "function") {
      errors.push("插件的 destroy 方法必须是函数");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取插件依赖关系（如果有的话）
   */
  getPluginDependencies(pluginName: string): string[] {
    // 这里可以实现插件依赖关系检查
    // 目前返回空数组，后续可以扩展
    return [];
  }

  /**
   * 检查插件冲突
   */
  checkPluginConflicts(pluginName: string): string[] {
    const conflicts: string[] = [];

    // 检查是否有同名插件
    if (this.plugins.has(pluginName)) {
      conflicts.push(`插件 ${pluginName} 已存在`);
    }

    // 这里可以添加更多冲突检查逻辑
    // 比如检查插件间的功能冲突等

    return conflicts;
  }

  /**
   * 销毁插件管理器
   */
  destroy(): void {
    // 销毁所有插件
    this.plugins.forEach((plugin, name) => {
      try {
        if (plugin.destroy) {
          plugin.destroy();
        }
      } catch (error) {
        this.logger.error?.(`销毁插件 ${name} 时出错:`, error);
      }
    });
    // 新接口销毁
    this.pluginDefs.forEach((def, id) => {
      try { def.onDestroy?.(this.buildContext(id)); } catch (e) { this.logger.error?.(`销毁插件 ${id} 时出错:`, e); }
    });

    // 清理所有数据
    this.plugins.clear();
    this.pluginData.forEach((m) => m.clear());
    this.pluginData.clear();
    this.pluginEvents.forEach((m) => m.forEach((s) => s.clear()));
    this.pluginEvents.clear();
    this.anyEventListeners.clear();
    this.pluginDefs.clear();
    this.pluginExports.clear();
    this.pluginConfigs.clear();
    this.commands.clear();
    this.services.clear();
    this.interPluginEvents.forEach((m) => m.forEach((s) => s.clear()));
    this.interPluginEvents.clear();
  }

  /**
   * 判断插件是否已注册
   */
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * 返回当前已注册插件列表
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 深拷贝工具
   */
  private deepClone<T>(value: T): T {
    try {
      // @ts-ignore structuredClone 兼容性处理
      if (typeof structuredClone === 'function') return structuredClone(value);
    } catch {}
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }
}
