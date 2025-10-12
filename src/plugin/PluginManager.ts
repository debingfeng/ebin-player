/**
 * 插件管理器
 * 负责插件的注册、卸载、数据通信和生命周期管理
 */
import type { PlayerInstance } from "../types";
import { PlayerEventType, PlayerEvent, PluginDefinition, PluginContext, Logger as LoggerType, PlayerOptions } from "../types";
import { PlaybackRatePlugin } from './built-in/PlaybackRatePlugin';

export interface IPluginManager {
  use(plugin: PluginDefinition): void;
  unuse(pluginId: string): void;
  getPlugin(pluginId: string): PluginDefinition | undefined;
  getPluginIds(): string[];
  destroy(): void;
}

export class PluginManager implements IPluginManager {
  private player: PlayerInstance;
  private logger: LoggerType | Console = console;
  private anyPlayerEventListeners: Set<(event: PlayerEvent) => void> = new Set();
  private permissionCheck: (pluginId: string, perm: string) => boolean = () => true; // 占位：默认允许
  
  // 现代插件架构：插件定义、配置、导出、命令、服务、插件间事件
  private pluginDefs: Map<string, PluginDefinition<unknown, unknown>> = new Map();
  private pluginExports: Map<string, unknown> = new Map();
  private pluginConfigs: Map<string, unknown> = new Map();
  private pluginConfigVersions: Map<string, number> = new Map();
  private services: Map<string, unknown> = new Map(); // 全局服务命名空间: "pluginId:name" 或全局名
  private commands: Map<string, Map<string, (args: unknown, ctx: PluginContext) => unknown>> = new Map();
  private interPluginEvents: Map<string, Map<string, Set<(data: unknown) => void>>> = new Map();
  private pluginData: Map<string, Map<string, unknown>> = new Map();

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
  use(plugin: PluginDefinition<unknown, unknown>): void {
    const id = plugin.meta.id;
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
    const initialConfig = plugin.defaultConfig ?? {} as Record<string, unknown>;
    const targetVersion = plugin.configVersion ?? 1;
    // 配置迁移（首次安装仅记录目标版本）
    if (plugin.validateConfig) {
      const res = plugin.validateConfig(initialConfig);
      if (!res.valid) {
        this.logger.error?.(`插件 ${id} 配置无效:`, res.errors);
        return;
      }
    }

    // 注册容器
    this.pluginDefs.set(id, plugin);
    this.pluginData.set(id, new Map());
    this.interPluginEvents.set(id, new Map());
    this.pluginConfigs.set(id, initialConfig);
    this.pluginConfigVersions.set(id, targetVersion);
    this.commands.set(id, new Map());

    // 构建上下文
    const ctx = this.buildContext(id);

    try {
      // onInit
      const exportsMaybe = plugin.onInit?.(ctx);
      if (exportsMaybe instanceof Promise) {
        exportsMaybe.then((exp) => this.pluginExports.set(id, exp)).catch((err) => {
          this.logger.error?.(`插件 ${id} onInit 异常:`, err);
        });
      } else if (exportsMaybe !== undefined) {
        this.pluginExports.set(id, exportsMaybe);
      }

      // onStart（立即调用；如需等待播放器 ready，可在外部时机再次触发）
      plugin.onStart?.(ctx);

      this.logger.info?.(`插件 ${id} 注册成功`);
    } catch (error) {
      this.logger.error?.(`插件 ${id} 注册失败:`, error);
      this.unuse(id);
    }
  }

  private buildContext(id: string): PluginContext {
    const ctx: PluginContext = {
      player: this.player,
      logger: (this.player.getLogger?.() as LoggerType) || (this.logger as LoggerType),
      on: (event, cb) => this.player.on(event, cb),
      off: (event, cb) => this.player.off(event, cb),
      emit: (event, data) => { this.player.emit(event, data); },
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
      getService: <T>(name: string) => (this.services.get(name) ?? this.services.get(`${id}:${name}`)) as T | undefined,
      getConfig: <T = unknown>() => this.pluginConfigs.get(id) as T,
      setConfig: <T = unknown>(partial: Partial<T>) => {
        const cur = this.pluginConfigs.get(id) || {};
        const next = { ...cur, ...(partial as object) };
        this.pluginConfigs.set(id, next);
        const def = this.pluginDefs.get(id);
        def?.onConfigChange?.(partial as Record<string, unknown>, ctx);
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
      try { conf = step.migrate(conf) as Record<string, unknown>; } catch (e) { this.logger.error?.(`迁移 ${pluginId} 配置 ${step.from}->${step.to} 失败:`, e); }
    }
    this.pluginConfigs.set(pluginId, conf);
    this.pluginConfigVersions.set(pluginId, targetVersion);
  }

  /**
   * 卸载插件
   */
  unuse(pluginId: string): void {
    const def = this.pluginDefs.get(pluginId);
    if (!def) {
      this.logger.warn?.(`插件 ${pluginId} 不存在`);
      return;
    }

    try {
      // 新接口销毁
      def?.onDestroy?.(this.buildContext(pluginId));

      // 清理插件数据
      this.pluginData.delete(pluginId);
      this.interPluginEvents.delete(pluginId);

      // 移除插件
      this.pluginDefs.delete(pluginId);
      this.pluginExports.delete(pluginId);
      this.pluginConfigs.delete(pluginId);
      this.commands.delete(pluginId);

      this.logger.info?.(`插件 ${pluginId} 卸载成功`);
    } catch (error) {
      // 隔离失败：卸载异常不影响管理器继续工作
      this.logger.error?.(`插件 ${pluginId} 卸载失败:`, error);
    }
  }

  /**
   * 获取插件
   */
  getPlugin(pluginId: string): PluginDefinition | undefined {
    return this.pluginDefs.get(pluginId);
  }

  /**
   * 获取所有插件ID
   */
  getPluginIds(): string[] {
    return Array.from(this.pluginDefs.keys());
  }


  /**
   * 更新插件配置
   */
  updatePluginConfig<C = unknown>(pluginId: string, partial: Partial<C>): void {
    const def = this.pluginDefs.get(pluginId);
    if (!def) return;
    const ctx = this.buildContext(pluginId);
    ctx.setConfig(partial);
  }

  /**
   * 命令注册与调用
   */
  registerCommand(pluginId: string, name: string, fn: (args: unknown, ctx: PluginContext) => unknown): void {
    if (!this.commands.has(pluginId)) this.commands.set(pluginId, new Map());
    this.commands.get(pluginId)!.set(name, fn);
  }

  invokeCommand(pluginId: string, name: string, args?: unknown): unknown {
    const cmd = this.commands.get(pluginId)?.get(name);
    if (!cmd) {
      this.logger.warn?.(`命令未找到: ${pluginId}.${name}`);
      return undefined;
    }
    return cmd(args, this.buildContext(pluginId));
  }

  /**
   * 获取插件统计信息
   */
  getPluginStats(): {
    totalPlugins: number;
    pluginIds: string[];
    totalDataEntries: number;
    totalEventListeners: number;
  } {
    let totalDataEntries = 0;
    let totalEventListeners = 0;

    this.pluginData.forEach((dataMap) => {
      totalDataEntries += dataMap.size;
    });

    this.interPluginEvents.forEach((eventMap) => {
      eventMap.forEach((eventSet) => {
        totalEventListeners += eventSet.size;
      });
    });

    return {
      totalPlugins: this.pluginDefs.size,
      pluginIds: Array.from(this.pluginDefs.keys()),
      totalDataEntries,
      totalEventListeners,
    };
  }


  /**
   * 检查插件冲突
   */
  checkPluginConflicts(pluginId: string): string[] {
    const conflicts: string[] = [];

    // 检查是否有同名插件
    if (this.pluginDefs.has(pluginId)) {
      conflicts.push(`插件 ${pluginId} 已存在`);
    }

    // 这里可以添加更多冲突检查逻辑
    // 比如检查插件间的功能冲突等

    return conflicts;
  }

  /**
   * 销毁插件管理器
   */
  destroy(): void {
    // 新接口销毁
    this.pluginDefs.forEach((def, id) => {
      try { def.onDestroy?.(this.buildContext(id)); } catch (e) { this.logger.error?.(`销毁插件 ${id} 时出错:`, e); }
    });

    // 清理所有数据
    this.pluginData.forEach((m) => m.clear());
    this.pluginData.clear();
    this.anyPlayerEventListeners.clear();
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
  hasPlugin(pluginId: string): boolean {
    return this.pluginDefs.has(pluginId);
  }

  /**
   * 返回当前已注册插件列表
   */
  getPlugins(): PluginDefinition[] {
    return Array.from(this.pluginDefs.values());
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
