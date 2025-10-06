/**
 * 播放器状态管理
 * 负责内部组件间的状态数据管理和通信
 */
import { PlayerState, PlayerEventType, PlayerEvent } from '../types';
import type { Logger as LoggerType } from '../types';
import { Logger as CoreLogger } from './Logger';

export class PlayerStore {
  private state: PlayerState;
  private subscribers: Map<keyof PlayerState | 'all', Set<(state: PlayerState) => void>> = new Map();
  private eventSubscribers: Map<PlayerEventType, Set<(event: PlayerEvent) => void>> = new Map();
  private stateHistory: PlayerState[] = [];
  private maxHistorySize = 50;
  private logger: LoggerType;

  constructor(initialState: PlayerState, logger?: LoggerType) {
    this.state = { ...initialState };
    this.stateHistory.push({ ...this.state });
    this.logger = logger || new CoreLogger('Store');
    this.logger.info('construct');
  }

  /**
   * 获取当前状态
   */
  getState(): PlayerState {
    return { ...this.state };
  }

  /**
   * 设置状态
   */
  setState(newState: Partial<PlayerState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.logger.debug('setState', newState);
    
    // 保存状态历史
    this.stateHistory.push({ ...this.state });
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
    
    // 通知订阅者
    this.notifySubscribers(prevState, this.state);
  }

  /**
   * 获取特定状态值
   */
  getStateValue<K extends keyof PlayerState>(key: K): PlayerState[K] {
    return this.state[key];
  }

  /**
   * 设置特定状态值
   */
  setStateValue<K extends keyof PlayerState>(key: K, value: PlayerState[K]): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, [key]: value };
    this.logger.debug('setStateValue', key, value);
    
    // 保存状态历史
    this.stateHistory.push({ ...this.state });
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
    
    // 通知特定状态的订阅者
    this.notifySpecificSubscribers(key, prevState, this.state);
  }

  /**
   * 订阅状态变化
   */
  subscribe(
    callback: (state: PlayerState) => void,
    keys?: (keyof PlayerState)[]
  ): () => void {
    this.logger.debug('subscribe', keys);
    if (keys && keys.length > 0) {
      // 订阅特定状态键
      keys.forEach(key => {
        if (!this.subscribers.has(key)) {
          this.subscribers.set(key, new Set());
        }
        this.subscribers.get(key)!.add(callback);
      });
    } else {
      // 订阅所有状态变化
      if (!this.subscribers.has('all')) {
        this.subscribers.set('all', new Set());
      }
      this.subscribers.get('all')!.add(callback);
    }

    // 返回取消订阅函数
    return () => {
      this.logger.debug('unsubscribe', keys);
      if (keys && keys.length > 0) {
        keys.forEach(key => {
          const subscribers = this.subscribers.get(key);
          if (subscribers) {
            subscribers.delete(callback);
          }
        });
      } else {
        const allSubscribers = this.subscribers.get('all');
        if (allSubscribers) {
          allSubscribers.delete(callback);
        }
      }
    };
  }

  /**
   * 订阅事件
   */
  subscribeEvent(
    eventType: PlayerEventType,
    callback: (event: PlayerEvent) => void
  ): () => void {
    this.logger.debug('subscribeEvent', eventType);
    if (!this.eventSubscribers.has(eventType)) {
      this.eventSubscribers.set(eventType, new Set());
    }
    this.eventSubscribers.get(eventType)!.add(callback);

    return () => {
      this.logger.debug('unsubscribeEvent', eventType);
      const subscribers = this.eventSubscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
      }
    };
  }

  /**
   * 通知订阅者
   */
  private notifySubscribers(prevState: PlayerState, currentState: PlayerState): void {
    // 通知所有状态订阅者
    const allSubscribers = this.subscribers.get('all');
    if (allSubscribers) {
      allSubscribers.forEach(callback => {
        try {
          callback(currentState);
        } catch (error) {
          console.error('状态订阅者回调错误:', error);
          this.logger.error('subscriber error', error);
        }
      });
    }

    // 通知特定状态订阅者
    Object.keys(currentState).forEach(key => {
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
    currentState: PlayerState
  ): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(currentState);
        } catch (error) {
          console.error(`状态订阅者回调错误 (${key}):`, error);
          this.logger.error('subscriber error', key, error);
        }
      });
    }
  }

  /**
   * 通知事件订阅者
   */
  notifyEvent(event: PlayerEvent): void {
    this.logger.debug('notifyEvent', event.type);
    const subscribers = this.eventSubscribers.get(event.type);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`事件订阅者回调错误 (${event.type}):`, error);
          this.logger.error('event subscriber error', event.type, error);
        }
      });
    }
  }

  /**
   * 获取状态历史
   */
  getStateHistory(): PlayerState[] {
    return [...this.stateHistory];
  }

  /**
   * 获取状态变化历史
   */
  getStateChanges(): Array<{
    timestamp: number;
    key: keyof PlayerState;
    prevValue: any;
    newValue: any;
  }> {
    const changes: Array<{
      timestamp: number;
      key: keyof PlayerState;
      prevValue: any;
      newValue: any;
    }> = [];

    for (let i = 1; i < this.stateHistory.length; i++) {
      const prevState = this.stateHistory[i - 1];
      const currentState = this.stateHistory[i];
      
      Object.keys(currentState).forEach(key => {
        const stateKey = key as keyof PlayerState;
        if (prevState[stateKey] !== currentState[stateKey]) {
          changes.push({
            timestamp: Date.now(),
            key: stateKey,
            prevValue: prevState[stateKey],
            newValue: currentState[stateKey]
          });
        }
      });
    }

    return changes;
  }

  /**
   * 重置状态
   */
  resetState(newState?: Partial<PlayerState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    // 清空历史
    this.stateHistory = [{ ...this.state }];
    
    // 通知所有订阅者
    this.notifySubscribers(prevState, this.state);
  }

  /**
   * 批量更新状态
   */
  batchUpdate(updates: Partial<PlayerState>[]): void {
    const prevState = { ...this.state };
    
    updates.forEach(update => {
      this.state = { ...this.state, ...update };
    });
    
    // 保存状态历史
    this.stateHistory.push({ ...this.state });
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
    
    // 通知订阅者
    this.notifySubscribers(prevState, this.state);
  }

  /**
   * 获取状态统计信息
   */
  getStateStats(): {
    totalChanges: number;
    mostChangedKey: keyof PlayerState | null;
    changeFrequency: Record<keyof PlayerState, number>;
  } {
    const changes = this.getStateChanges();
    const changeFrequency: Record<keyof PlayerState, number> = {} as any;
    
    changes.forEach(change => {
      changeFrequency[change.key] = (changeFrequency[change.key] || 0) + 1;
    });
    
    const mostChangedKey = Object.keys(changeFrequency).reduce((a, b) => 
      changeFrequency[a as keyof PlayerState] > changeFrequency[b as keyof PlayerState] ? a : b
    ) as keyof PlayerState | null;
    
    return {
      totalChanges: changes.length,
      mostChangedKey,
      changeFrequency
    };
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
    this.logger.info('destroy');
    this.clearSubscribers();
    this.stateHistory = [];
  }
}
