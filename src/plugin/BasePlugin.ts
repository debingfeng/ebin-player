import type {
  PluginDefinition,
  PluginContext,
  PlayerEventType,
  PlayerEventBase,
  PlayerEvent,
} from "../types";

type Disposer = () => void;

export abstract class BasePlugin<Config = unknown, Exports = unknown>
  implements PluginDefinition<Config, Exports>
{
  abstract meta: PluginDefinition<Config, Exports>["meta"];
  defaultConfig?: Config;
  configVersion?: number;
  migrations?: PluginDefinition<Config, Exports>["migrations"];
  commands?: PluginDefinition<Config, Exports>["commands"];
  validateConfig?: PluginDefinition<Config, Exports>["validateConfig"];

  protected ctx!: PluginContext;
  private disposers: Disposer[] = [];

  protected addDisposer(d: Disposer) {
    this.disposers.push(d);
  }

  protected onAny(cb: (e: PlayerEvent) => void) {
    const off = this.ctx.onAnyPlayerEvent?.(cb) || (() => {});
    this.addDisposer(off);
    return off;
  }

  protected on<T extends PlayerEventType>(
    event: T,
    cb: (e: PlayerEventBase<T>) => void,
  ) {
    const off = this.ctx.on(event, cb as any);
    this.addDisposer(off);
    return off;
  }

  protected registerService<T>(name: string, service: T) {
    this.ctx.registerService(name, service);
  }

  protected getService<T>(name: string) {
    return this.ctx.getService<T>(name);
  }

  onInit(ctx: PluginContext): Exports | void | Promise<Exports> {
    this.ctx = ctx;
    return undefined;
  }

  onStart(_ctx: PluginContext): void | Promise<void> {}

  onConfigChange(_newConfig: Partial<Config>, _ctx: PluginContext): void {}

  onDestroy(_ctx: PluginContext): void | Promise<void> {
    // 统一执行资源清理
    for (const d of this.disposers.splice(0)) {
      try {
        d();
      } catch {}
    }
  }
}
