/**
 * 插件管理器
 * 负责插件的注册、卸载、数据通信和生命周期管理
 */
import type { PlayerInstance } from "../types";
import { Plugin, PlayerEventType, PlayerEvent } from "../types";
import type { Logger as LoggerType } from "../types";

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

  constructor(player: PlayerInstance, logger?: LoggerType) {
    this.player = player;
    this.logger = logger || console;
  }

  /**
   * 注册插件
   */
  use(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      this.logger.warn?.(`插件 ${plugin.name} 已存在，将被替换`);
      this.unuse(plugin.name);
    }

    try {
      // 应用插件
      plugin.apply(this.player as any);

      // 注册插件
      this.plugins.set(plugin.name, plugin);

      // 初始化插件数据存储
      this.pluginData.set(plugin.name, new Map());

      // 初始化插件事件存储
      this.pluginEvents.set(plugin.name, new Map());

      this.logger.info?.(`插件 ${plugin.name} 注册成功`);
    } catch (error) {
      // 隔离失败：不抛出到上层，记录错误并确保未注册任何残留
      this.logger.error?.(`插件 ${plugin.name} 注册失败:`, error);
      this.plugins.delete(plugin.name);
      this.pluginData.delete(plugin.name);
      this.pluginEvents.delete(plugin.name);
    }
  }

  /**
   * 卸载插件
   */
  unuse(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      this.logger.warn?.(`插件 ${pluginName} 不存在`);
      return;
    }

    try {
      // 调用插件的销毁方法
      if (plugin.destroy) {
        plugin.destroy();
      }

      // 清理插件数据
      this.pluginData.delete(pluginName);

      // 清理插件事件
      this.pluginEvents.delete(pluginName);

      // 移除插件
      this.plugins.delete(pluginName);

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

    this.pluginData.get(pluginName)!.set(key, value);
  }

  /**
   * 插件间数据通信 - 获取数据
   */
  getPluginData(pluginName: string, key: string): any {
    const pluginData = this.pluginData.get(pluginName);
    if (!pluginData) {
      return undefined;
    }
    return pluginData.get(key);
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
    return this.pluginData.get(pluginName) || new Map();
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
      target: this.player as any,
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
  }

  /**
   * 广播事件到所有插件
   */
  broadcastEvent(eventType: PlayerEventType, data?: any): void {
    this.pluginEvents.forEach((pluginEventMap, pluginName) => {
      this.emitPluginEvent(pluginName, eventType, data);
    });
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

    // 清理所有数据
    this.plugins.clear();
    this.pluginData.clear();
    this.pluginEvents.clear();
  }
}
