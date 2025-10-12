/**
 * ErrorHandler 单元测试
 */
import { ErrorHandler } from '../../../src/ui/error/ErrorHandler';
import { 
  createMockLogger, 
  createTestContainer,
  cleanupTestContainer,
  waitFor
} from '../../utils';

describe('ErrorHandler', () => {
  let container: HTMLElement;
  let logger: any;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    container = createTestContainer();
    logger = createMockLogger();
    errorHandler = new ErrorHandler(logger);
  });

  afterEach(() => {
    errorHandler.destroy();
    cleanupTestContainer();
  });

  describe('错误处理', () => {
    it('应该能够处理一般错误', () => {
      const error = new Error('Test error');
      
      errorHandler.handleError(error);
      
      expect(logger.error).toHaveBeenCalledWith('UI Error', error);
    });

    it('应该能够处理不同类型的错误', () => {
      const jsError = new Error('JavaScript error');
      const typeError = new TypeError('Type error');
      const referenceError = new ReferenceError('Reference error');
      
      errorHandler.handleError(jsError);
      errorHandler.handleError(typeError);
      errorHandler.handleError(referenceError);
      
      expect(logger.error).toHaveBeenCalledTimes(3);
    });

    it('应该能够记录错误信息', () => {
      const error = new Error('Test error');
      error.message = 'Custom error message';
      
      errorHandler.handleError(error);
      
      const errors = errorHandler.getAllErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Custom error message');
    });

    it('应该能够分类错误类型', () => {
      const error = new Error('Test error');
      error.name = 'CustomError';
      
      errorHandler.handleError(error);
      
      const errors = errorHandler.getAllErrors();
      expect(errors[0].type).toBe('CustomError');
    });
  });

  describe('恢复策略', () => {
    it('应该能够设置重试策略', () => {
      const retryStrategy = {
        type: 'retry' as const,
        maxRetries: 3,
        retryDelay: 1000
      };
      
      errorHandler.setRecoveryStrategy('test-component', retryStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Retrying component test-component', expect.any(Object));
    });

    it('应该能够设置降级策略', () => {
      const fallbackStrategy = {
        type: 'fallback' as const,
        fallbackComponent: 'fallback-component'
      };
      
      errorHandler.setRecoveryStrategy('test-component', fallbackStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Falling back to fallback-component for test-component', expect.any(Object));
    });

    it('应该能够设置禁用策略', () => {
      const disableStrategy = {
        type: 'disable' as const
      };
      
      errorHandler.setRecoveryStrategy('test-component', disableStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Disabling component test-component', expect.any(Object));
    });

    it('应该能够设置重置策略', () => {
      const resetStrategy = {
        type: 'reset' as const
      };
      
      errorHandler.setRecoveryStrategy('test-component', resetStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Resetting component test-component', expect.any(Object));
    });
  });

  describe('策略执行', () => {
    it('应该能够执行重试策略', async () => {
      const retryStrategy = {
        type: 'retry' as const,
        maxRetries: 2,
        retryDelay: 100
      };
      
      errorHandler.setRecoveryStrategy('test-component', retryStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      // 等待重试完成
      await waitFor(300);
      
      expect(logger.info).toHaveBeenCalledWith('Retrying component test-component', expect.any(Object));
    });

    it('应该能够执行降级策略', () => {
      const fallbackStrategy = {
        type: 'fallback' as const,
        fallbackComponent: 'fallback-component'
      };
      
      errorHandler.setRecoveryStrategy('test-component', fallbackStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Falling back to fallback-component for test-component', expect.any(Object));
    });

    it('应该能够执行禁用策略', () => {
      const disableStrategy = {
        type: 'disable' as const
      };
      
      errorHandler.setRecoveryStrategy('test-component', disableStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Disabling component test-component', expect.any(Object));
    });

    it('应该能够执行重置策略', () => {
      const resetStrategy = {
        type: 'reset' as const
      };
      
      errorHandler.setRecoveryStrategy('test-component', resetStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Resetting component test-component', expect.any(Object));
    });
  });

  describe('重试机制', () => {
    it('应该能够限制重试次数', async () => {
      const retryStrategy = {
        type: 'retry' as const,
        maxRetries: 2,
        retryDelay: 50
      };
      
      errorHandler.setRecoveryStrategy('test-component', retryStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      // 等待重试完成
      await waitFor(200);
      
      // 应该重试2次
      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    it('应该能够设置重试延迟', async () => {
      const retryStrategy = {
        type: 'retry' as const,
        maxRetries: 1,
        retryDelay: 100
      };
      
      errorHandler.setRecoveryStrategy('test-component', retryStrategy);
      
      const startTime = performance.now();
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      await waitFor(150);
      const endTime = performance.now();
      
      // 应该至少延迟100ms
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    it('应该能够跟踪重试计数', () => {
      const retryStrategy = {
        type: 'retry' as const,
        maxRetries: 3,
        retryDelay: 50
      };
      
      errorHandler.setRecoveryStrategy('test-component', retryStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      // 检查重试计数
      const errors = errorHandler.getAllErrors();
      expect(errors[0].retryCount).toBeDefined();
    });
  });

  describe('错误查询', () => {
    it('应该能够查询特定错误', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      const retrievedError = errorHandler.getError('test-component');
      expect(retrievedError).toBeDefined();
      expect(retrievedError?.message).toBe('Test error');
    });

    it('应该能够获取所有错误', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      errorHandler.handleError(error1, 'component1');
      errorHandler.handleError(error2, 'component2');
      
      const allErrors = errorHandler.getAllErrors();
      expect(allErrors).toHaveLength(2);
    });

    it('应该能够获取错误统计', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const error3 = new Error('Error 3');
      
      errorHandler.handleError(error1, 'component1');
      errorHandler.handleError(error2, 'component1');
      errorHandler.handleError(error3, 'component2');
      
      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorCountByComponent).toBeDefined();
    });
  });

  describe('错误清理', () => {
    it('应该能够清除特定错误', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      errorHandler.clearError('test-component');
      
      const retrievedError = errorHandler.getError('test-component');
      expect(retrievedError).toBeUndefined();
    });

    it('应该能够清除所有错误', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      
      errorHandler.handleError(error1, 'component1');
      errorHandler.handleError(error2, 'component2');
      
      errorHandler.clearAllErrors();
      
      const allErrors = errorHandler.getAllErrors();
      expect(allErrors).toHaveLength(0);
    });
  });

  describe('监听系统', () => {
    it('应该能够监听错误', () => {
      const errorCallback = jest.fn();
      const unsubscribe = errorHandler.onError(errorCallback);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(errorCallback).toHaveBeenCalledWith(error, 'test-component');
      
      unsubscribe();
    });

    it('应该能够通知监听器', () => {
      const errorCallback1 = jest.fn();
      const errorCallback2 = jest.fn();
      
      errorHandler.onError(errorCallback1);
      errorHandler.onError(errorCallback2);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(errorCallback1).toHaveBeenCalled();
      expect(errorCallback2).toHaveBeenCalled();
    });
  });

  describe('触发器', () => {
    it('应该能够触发重试', () => {
      const retryStrategy = {
        type: 'retry' as const,
        maxRetries: 1,
        retryDelay: 50
      };
      
      errorHandler.setRecoveryStrategy('test-component', retryStrategy);
      
      errorHandler.triggerRetry('test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Retrying component test-component', expect.any(Object));
    });

    it('应该能够触发降级', () => {
      const fallbackStrategy = {
        type: 'fallback' as const,
        fallbackComponent: 'fallback-component'
      };
      
      errorHandler.setRecoveryStrategy('test-component', fallbackStrategy);
      
      errorHandler.triggerFallback('test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Falling back to fallback-component for test-component', expect.any(Object));
    });

    it('应该能够触发禁用', () => {
      const disableStrategy = {
        type: 'disable' as const
      };
      
      errorHandler.setRecoveryStrategy('test-component', disableStrategy);
      
      errorHandler.triggerDisable('test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Disabling component test-component', expect.any(Object));
    });

    it('应该能够触发重置', () => {
      const resetStrategy = {
        type: 'reset' as const
      };
      
      errorHandler.setRecoveryStrategy('test-component', resetStrategy);
      
      errorHandler.triggerReset('test-component');
      
      expect(logger.info).toHaveBeenCalledWith('Resetting component test-component', expect.any(Object));
    });
  });

  describe('边界情况', () => {
    it('应该能够处理空错误', () => {
      errorHandler.handleError(null as any);
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理空组件ID', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error, '');
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });

    it('应该能够处理无效策略', () => {
      const invalidStrategy = {
        type: 'invalid' as any
      };
      
      errorHandler.setRecoveryStrategy('test-component', invalidStrategy);
      
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大量错误', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const error = new Error(`Error ${i}`);
        errorHandler.handleError(error, `component-${i}`);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该能够处理频繁的策略设置', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const strategy = {
          type: 'retry' as const,
          maxRetries: 1,
          retryDelay: 10
        };
        errorHandler.setRecoveryStrategy(`component-${i}`, strategy);
      }
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
    });
  });

  describe('销毁', () => {
    it('应该能够销毁错误处理器', () => {
      const errorCallback = jest.fn();
      errorHandler.onError(errorCallback);
      
      errorHandler.destroy();
      
      // 销毁后应该不响应错误
      const error = new Error('Test error');
      errorHandler.handleError(error, 'test-component');
      
      expect(errorCallback).not.toHaveBeenCalled();
    });

    it('应该能够处理重复销毁', () => {
      errorHandler.destroy();
      errorHandler.destroy();
      
      // 应该不抛出错误
      expect(true).toBe(true);
    });
  });
});
