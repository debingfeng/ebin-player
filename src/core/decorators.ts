import type { PlayerInstance as PlayerInstanceType } from '../types';

type Destroyable = { isDestroyed: boolean };

// 链式与守卫装饰器（同步方法）
export function chainable(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value as (...args: any[]) => any;
  descriptor.value = function (this: Destroyable & PlayerInstanceType, ...args: any[]): PlayerInstanceType {
    if (this.isDestroyed) return this;
    original.apply(this, args);
    return this;
  } as any;
}

// 链式与守卫装饰器（异步方法）
export function chainableAsync(
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value as (...args: any[]) => Promise<any> | any;
  descriptor.value = (async function (this: Destroyable & PlayerInstanceType, ...args: any[]): Promise<PlayerInstanceType> {
    if (this.isDestroyed) return this;
    await original.apply(this, args);
    return this;
  }) as any;
}

