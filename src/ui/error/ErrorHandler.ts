/**
 * 错误处理器
 * 提供统一的错误处理和恢复机制
 */
import { Logger } from '../../types';

export interface ErrorInfo {
  id: string;
  type: 'component' | 'ui' | 'config' | 'theme' | 'responsive';
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
  recoverable: boolean;
}

export interface ErrorRecoveryStrategy {
  type: 'retry' | 'fallback' | 'disable' | 'reset';
  maxRetries?: number;
  retryDelay?: number;
  fallbackComponent?: string;
  resetToDefault?: boolean;
}

export class ErrorHandler {
  private logger: Logger;
  private errors: Map<string, ErrorInfo> = new Map();
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map();
  private retryCounts: Map<string, number> = new Map();
  private listeners: Array<(error: ErrorInfo) => void> = [];

  constructor(logger: Logger) {
    this.logger = logger.child('ErrorHandler');
    this.setupDefaultRecoveryStrategies();
  }

  /**
   * 处理错误
   */
  handleError(
    error: Error,
    type: ErrorInfo['type'],
    context: Record<string, any> = {},
    recoverable = true
  ): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      type,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context,
      recoverable,
    };

    this.logger.error('Error occurred', errorInfo);
    this.errors.set(errorInfo.id, errorInfo);

    // 尝试恢复
    if (recoverable) {
      this.attemptRecovery(errorInfo);
    }

    // 通知监听器
    this.notifyListeners(errorInfo);
  }

  /**
   * 尝试恢复错误
   */
  private attemptRecovery(errorInfo: ErrorInfo): void {
    const strategy = this.getRecoveryStrategy(errorInfo.type);
    if (!strategy) {
      this.logger.warn('No recovery strategy found', { type: errorInfo.type });
      return;
    }

    const retryCount = this.retryCounts.get(errorInfo.id) || 0;
    
    switch (strategy.type) {
      case 'retry':
        this.handleRetryStrategy(errorInfo, strategy, retryCount);
        break;
      case 'fallback':
        this.handleFallbackStrategy(errorInfo, strategy);
        break;
      case 'disable':
        this.handleDisableStrategy(errorInfo, strategy);
        break;
      case 'reset':
        this.handleResetStrategy(errorInfo, strategy);
        break;
    }
  }

  /**
   * 处理重试策略
   */
  private handleRetryStrategy(
    errorInfo: ErrorInfo,
    strategy: ErrorRecoveryStrategy,
    retryCount: number
  ): void {
    const maxRetries = strategy.maxRetries || 3;
    
    if (retryCount < maxRetries) {
      this.retryCounts.set(errorInfo.id, retryCount + 1);
      
      const delay = strategy.retryDelay || 1000;
      setTimeout(() => {
        this.logger.debug('Retrying after error', { 
          errorId: errorInfo.id, 
          retryCount: retryCount + 1 
        });
        this.retryError(errorInfo);
      }, delay);
    } else {
      this.logger.error('Max retries exceeded', { errorId: errorInfo.id });
      this.handleFallbackStrategy(errorInfo, strategy);
    }
  }

  /**
   * 处理降级策略
   */
  private handleFallbackStrategy(
    errorInfo: ErrorInfo,
    strategy: ErrorRecoveryStrategy
  ): void {
    this.logger.info('Applying fallback strategy', { 
      errorId: errorInfo.id,
      fallbackComponent: strategy.fallbackComponent 
    });
    
    // 这里可以触发降级到备用组件
    this.triggerFallback(errorInfo, strategy.fallbackComponent);
  }

  /**
   * 处理禁用策略
   */
  private handleDisableStrategy(
    errorInfo: ErrorInfo,
    strategy: ErrorRecoveryStrategy
  ): void {
    this.logger.info('Disabling component due to error', { errorId: errorInfo.id });
    
    // 这里可以禁用出错的组件
    this.triggerDisable(errorInfo);
  }

  /**
   * 处理重置策略
   */
  private handleResetStrategy(
    errorInfo: ErrorInfo,
    strategy: ErrorRecoveryStrategy
  ): void {
    this.logger.info('Resetting to default due to error', { errorId: errorInfo.id });
    
    // 这里可以重置到默认状态
    this.triggerReset(errorInfo, strategy.resetToDefault);
  }

  /**
   * 设置恢复策略
   */
  setRecoveryStrategy(type: ErrorInfo['type'], strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(type, strategy);
    this.logger.debug('Recovery strategy set', { type, strategy });
  }

  /**
   * 获取恢复策略
   */
  private getRecoveryStrategy(type: ErrorInfo['type']): ErrorRecoveryStrategy | undefined {
    return this.recoveryStrategies.get(type);
  }

  /**
   * 设置默认恢复策略
   */
  private setupDefaultRecoveryStrategies(): void {
    // 组件错误：重试3次，然后降级
    this.setRecoveryStrategy('component', {
      type: 'retry',
      maxRetries: 3,
      retryDelay: 1000,
      fallbackComponent: 'fallback',
    });

    // UI错误：重试2次，然后重置
    this.setRecoveryStrategy('ui', {
      type: 'retry',
      maxRetries: 2,
      retryDelay: 500,
      resetToDefault: true,
    });

    // 配置错误：直接重置
    this.setRecoveryStrategy('config', {
      type: 'reset',
      resetToDefault: true,
    });

    // 主题错误：降级到默认主题
    this.setRecoveryStrategy('theme', {
      type: 'fallback',
      fallbackComponent: 'defaultTheme',
    });

    // 响应式错误：禁用响应式功能
    this.setRecoveryStrategy('responsive', {
      type: 'disable',
    });
  }

  /**
   * 重试错误
   */
  private retryError(errorInfo: ErrorInfo): void {
    // 这里应该重新执行导致错误的操作
    this.logger.debug('Retrying error', { errorId: errorInfo.id });
    
    // 触发重试事件
    this.triggerRetry(errorInfo);
  }

  /**
   * 触发降级
   */
  private triggerFallback(errorInfo: ErrorInfo, fallbackComponent?: string): void {
    // 这里应该实现具体的降级逻辑
    this.logger.debug('Triggering fallback', { 
      errorId: errorInfo.id, 
      fallbackComponent 
    });
  }

  /**
   * 触发禁用
   */
  private triggerDisable(errorInfo: ErrorInfo): void {
    // 这里应该实现具体的禁用逻辑
    this.logger.debug('Triggering disable', { errorId: errorInfo.id });
  }

  /**
   * 触发重置
   */
  private triggerReset(errorInfo: ErrorInfo, resetToDefault?: boolean): void {
    // 这里应该实现具体的重置逻辑
    this.logger.debug('Triggering reset', { 
      errorId: errorInfo.id, 
      resetToDefault 
    });
  }

  /**
   * 触发重试
   */
  private triggerRetry(errorInfo: ErrorInfo): void {
    // 这里应该实现具体的重试逻辑
    this.logger.debug('Triggering retry', { errorId: errorInfo.id });
  }

  /**
   * 获取错误信息
   */
  getError(errorId: string): ErrorInfo | undefined {
    return this.errors.get(errorId);
  }

  /**
   * 获取所有错误
   */
  getAllErrors(): ErrorInfo[] {
    return Array.from(this.errors.values());
  }

  /**
   * 清除错误
   */
  clearError(errorId: string): void {
    this.errors.delete(errorId);
    this.retryCounts.delete(errorId);
    this.logger.debug('Error cleared', { errorId });
  }

  /**
   * 清除所有错误
   */
  clearAllErrors(): void {
    this.errors.clear();
    this.retryCounts.clear();
    this.logger.debug('All errors cleared');
  }

  /**
   * 监听错误
   */
  onError(listener: (error: ErrorInfo) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 通知监听器
   */
  private notifyListeners(errorInfo: ErrorInfo): void {
    this.listeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (error) {
        this.logger.error('Error in error listener', error);
      }
    });
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查是否有未恢复的错误
   */
  hasUnrecoveredErrors(): boolean {
    return Array.from(this.errors.values()).some(error => error.recoverable);
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    recoverable: number;
    unrecoverable: number;
  } {
    const errors = Array.from(this.errors.values());
    const byType: Record<string, number> = {};
    
    errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
    });

    return {
      total: errors.length,
      byType,
      recoverable: errors.filter(e => e.recoverable).length,
      unrecoverable: errors.filter(e => !e.recoverable).length,
    };
  }
}
