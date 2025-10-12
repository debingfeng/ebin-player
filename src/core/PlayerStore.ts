import { PlayerState, PlayerEventType, PlayerEvent } from "../types";
import type { Logger as LoggerType } from "../types";
import { Logger as CoreLogger } from "./Logger";

/**
 * PlayerStore 类 - 播放器状态管理器
 * 负责管理播放器状态、订阅/通知机制、状态历史记录等功能
 */
export class PlayerStore {
  // 私有属性：当前播放器状态
  private state: PlayerState;
  // 私有属性：状态订阅者映射表
  // 键为状态键名或'all'，值为回调函数集合
  private subscribers: Map<
    keyof PlayerState,
    Set<(state: PlayerState) => void>
  > = new Map();
  private globalSubscribers: Set<(state: PlayerState) => void> = new Set();
  // 私有属性：事件订阅者映射表
  // 键为事件类型或'all'，值为回调函数集合
  private eventSubscribers: Map<
    PlayerEventType | "all",
    Set<(event: PlayerEvent) => void>
  > = new Map();
  // 私有属性：日志记录器
  private logger: LoggerType;

  constructor(initialState: PlayerState, logger?: LoggerType) {
    this.state = { ...initialState };
    this.logger = logger || new CoreLogger("Store");
    this.logger.info("construct");
  }

  /**
   * 深拷贝工具，优先使用原生 structuredClone，回退到 JSON 序列化
   */
  private deepClone<T>(value: T): T {
    try {
      // @ts-ignore structuredClone 可能不存在于某些运行环境
      if (typeof structuredClone === "function") return structuredClone(value);
    } catch {}
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }

  /**
   * 获取当前状态
   */
  getState(): PlayerState {
    // 返回深拷贝，避免外部意外修改内部状态
    return this.deepClone(this.state);
  }

  /**
   * 设置状态
   */
  setState(newState: Partial<PlayerState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.logger.debug("setState", newState);

    // 通知订阅者
    this.notifySubscribers(prevState, this.state);
  }

  /**
   * 获取特定状态值
   */
  getStateValue<K extends keyof PlayerState>(key: K): PlayerState[K] {
    const value = this.state[key];
    if (value && typeof value === "object") {
      return this.deepClone(value);
    }
    return value;
  }

  /**
   * 设置特定状态值
   */
  setStateValue<K extends keyof PlayerState>(
    key: K,
    value: PlayerState[K],
  ): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, [key]: value };
    this.logger.debug("setStateValue", key, value);

    // 通知特定状态的订阅者
    this.notifySpecificSubscribers(key, prevState, this.state);
  }

  /**
   * 订阅状态变化
   */
  subscribe(
    callback: (state: PlayerState) => void,
    keys?: (keyof PlayerState)[],
  ): () => void {
    this.logger.debug("subscribe", keys);
    if (keys && keys.length > 0) {
      // 订阅特定状态键
      keys.forEach((key) => {
        if (!this.subscribers.has(key)) {
          this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key)!.add(callback);
      });
    } else {
      // 订阅所有状态变化
      this.globalSubscribers.add(callback);
    }

    // 返回取消订阅函数
    return () => {
      this.logger.debug("unsubscribe", keys);
      if (keys && keys.length > 0) {
        keys.forEach((key) => {
          const subscribers = this.subscribers.get(key);
          if (subscribers) {
            subscribers.delete(callback);
          }
        });
      } else {
        this.globalSubscribers.delete(callback);
      }
    };
  }

  /**
   * 订阅事件
   */
  subscribeEvent(
    eventType: PlayerEventType | "all",
    callback: (event: PlayerEvent) => void,
  ): () => void {
    this.logger.debug("subscribeEvent", eventType);
    if (!this.eventSubscribers.has(eventType)) {
      this.eventSubscribers.set(eventType, new Set());
    }
    this.eventSubscribers.get(eventType)!.add(callback);

    return () => {
      this.logger.debug("unsubscribeEvent", eventType);
      const subscribers = this.eventSubscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
      }
    };
  }

  /**
   * 通知订阅者
   */
  private notifySubscribers(
    prevState: PlayerState,
    currentState: PlayerState,
  ): void {
    // 通知所有状态订阅者
    this.globalSubscribers.forEach((callback) => {
      try {
        callback(currentState);
      } catch (error) {
        console.error("状态订阅者回调错误:", error);
        this.logger.error("subscriber error", error);
      }
    });

    // 通知特定状态订阅者
    Object.keys(currentState).forEach((key) => {
      const stateKey = key as keyof PlayerState;
      if (prevState[stateKey] !== currentState[stateKey]) {
        this.notifySpecificSubscribers(stateKey, prevState, currentState);
      }
    });
  }

  /**
   * 通知特定状态订阅者
   */
  private notifySpecificSubscribers(
    key: keyof PlayerState,
    prevState: PlayerState,
    currentState: PlayerState,
  ): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(currentState);
        } catch (error) {
          console.error(`状态订阅者回调错误 (${key}):`, error);
          this.logger.error("subscriber error", key, error);
        }
      });
    }
  }

  /**
   * 通知事件订阅者
   */
  notifyEvent(event: PlayerEvent): void {
    this.logger.debug("notifyEvent", event.type);
    const subscribers = this.eventSubscribers.get(event.type);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`事件订阅者回调错误 (${event.type}):`, error);
          this.logger.error("event subscriber error", event.type, error);
        }
      });
    }
    const allSubscribers = this.eventSubscribers.get("all");
    if (allSubscribers) {
      allSubscribers.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error(`事件订阅者回调错误 (all:${event.type}):`, error);
          this.logger.error("event subscriber error", "all", event.type, error);
        }
      });
    }
  }

  /**
   * 重置状态
   */
  resetState(newState?: Partial<PlayerState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };

    // 通知所有订阅者
    this.notifySubscribers(prevState, this.state);
  }

  /**
   * 批量更新状态
   */
  batchUpdate(updates: Partial<PlayerState> | Partial<PlayerState>[]): void {
    const prevState = { ...this.state };
    const list = Array.isArray(updates) ? updates : [updates];

    list.forEach((update) => {
      this.state = { ...this.state, ...update };
    });

    // 通知订阅者
    this.notifySubscribers(prevState, this.state);
  }

  /**
   * 清理订阅者
   */
  clearSubscribers(): void {
    this.subscribers.clear();
    this.eventSubscribers.clear();
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.logger.info("destroy");
    this.clearSubscribers();
  }
}
