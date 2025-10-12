import type { PlayerInstance as PlayerInstanceType } from "../types";

type Destroyable = { isDestroyed: boolean };

// 链式与守卫装饰器（同步方法）
export function chainable(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value as (...args: any[]) => any;
  descriptor.value = function (
    this: Destroyable & PlayerInstanceType,
    ...args: any[]
  ): PlayerInstanceType {
    if (this.isDestroyed) return this;
    original.apply(this, args);
    return this;
  } as any;
}

// 链式与守卫装饰器（异步方法）
export function chainableAsync(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const original = descriptor.value as (...args: any[]) => Promise<any> | any;
  descriptor.value = async function (
    this: Destroyable & PlayerInstanceType,
    ...args: any[]
  ): Promise<PlayerInstanceType> {
    if (this.isDestroyed) return this;
    await original.apply(this, args);
    return this;
  } as any;
}

type LogMethodOptions = {
  includeArgs?: boolean;
  includeResult?: boolean;
  time?: boolean;
  level?: "debug" | "info" | "warn" | "error";
  message?: string;
};

// 方法级日志装饰器（自动检测同步/异步）
export function logMethod(options: LogMethodOptions = {}) {
  const {
    includeArgs = true,
    includeResult = false,
    time = true,
    level = "debug",
    message,
  } = options;
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const logger = (this as any).logger as
        | { [k: string]: (...a: any[]) => void }
        | undefined;
      const enabled = !!logger && typeof logger[level] === "function";
      const label = message || propertyKey;
      const start = time
        ? typeof performance !== "undefined" && performance.now
          ? performance.now()
          : Date.now()
        : 0;

      try {
        const result = original.apply(this, args);
        if (result && typeof result.then === "function") {
          return (result as Promise<any>)
            .then((res) => {
              if (enabled) {
                const duration = time
                  ? (typeof performance !== "undefined" && performance.now
                      ? performance.now()
                      : Date.now()) - start
                  : undefined;
                logger![level](`${label} resolved`, {
                  args: includeArgs ? args : undefined,
                  result: includeResult ? res : undefined,
                  duration,
                });
              }
              return res;
            })
            .catch((err) => {
              if (logger && typeof logger.error === "function") {
                const duration = time
                  ? (typeof performance !== "undefined" && performance.now
                      ? performance.now()
                      : Date.now()) - start
                  : undefined;
                logger.error(`${label} rejected`, {
                  args: includeArgs ? args : undefined,
                  duration,
                  error: err,
                });
              }
              throw err;
            });
        }

        if (enabled) {
          const duration = time
            ? (typeof performance !== "undefined" && performance.now
                ? performance.now()
                : Date.now()) - start
            : undefined;
          logger[level](`${label} returned`, {
            args: includeArgs ? args : undefined,
            result: includeResult ? result : undefined,
            duration,
          });
        }
        return result;
      } catch (err) {
        if (logger && typeof logger.error === "function") {
          const duration = time
            ? (typeof performance !== "undefined" && performance.now
                ? performance.now()
                : Date.now()) - start
            : undefined;
          logger.error(`${label} threw`, {
            args: includeArgs ? args : undefined,
            duration,
            error: err,
          });
        }
        throw err;
      }
    };
  };
}
