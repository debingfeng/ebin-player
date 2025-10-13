/**
 * 插件体系相关类型
 */
import type { Logger } from "./common";
import type { PlayerInstance } from "./core-player";
import type { PlayerEventType, PlayerEventBase, PlayerEvent, EventPayloadMap } from "./core-events";

export type SemverRange = string;

export interface PluginMeta {
  id: string;
  version: string;
  displayName?: string;
  description?: string;
  requires?: Record<string, SemverRange>;
  optional?: Record<string, SemverRange>;
  capabilities?: string[];
  permissions?: string[];
}

export type PluginPermission =
  | "ui:inject"
  | "player:control"
  | "storage:write"
  | "metrics:write"
  | "network"
  | "events:any";

export interface PluginContext {
  player: PlayerInstance;
  logger: Logger;
  on<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): () => void;
  off<T extends PlayerEventType>(event: T, callback: (event: PlayerEventBase<T>) => void): void;
  emit<T extends PlayerEventType>(event: T, data?: EventPayloadMap[T]): void;
  onAnyPlayerEvent(callback: (event: PlayerEvent) => void): () => void;
  onPluginEvent(pluginId: string, type: string, callback: (data: unknown) => void): () => void;
  emitPluginEvent(pluginId: string, type: string, data?: unknown): void;
  registerService<T>(name: string, service: T): void;
  getService<T>(name: string): T | undefined;
  getConfig<T = unknown>(): T;
  setConfig<T = unknown>(partial: Partial<T>): void;
  storage: {
    get<T = unknown>(key: string): T | undefined;
    set<T = unknown>(key: string, value: T): void;
    delete(key: string): void;
    keys(): string[];
  };
  hasPermission?(perm: PluginPermission): boolean;
}

export interface PluginHooks<Config = unknown, Exports = unknown> {
  onInit?(ctx: PluginContext): Promise<Exports> | Exports | void;
  onStart?(ctx: PluginContext): Promise<void> | void;
  onEvent?<T extends PlayerEventType>(event: PlayerEventBase<T>, ctx: PluginContext): void;
  onConfigChange?(newConfig: Partial<Config>, ctx: PluginContext): void;
  onDestroy?(ctx: PluginContext): Promise<void> | void;
}

export interface PluginDefinition<Config = unknown, Exports = unknown>
  extends PluginHooks<Config, Exports> {
  meta: PluginMeta;
  defaultConfig?: Config;
  validateConfig?(config: unknown): { valid: boolean; errors?: string[] };
  commands?: Record<string, (args: unknown, ctx: PluginContext) => unknown>;
  configVersion?: number;
  migrations?: Array<{
    from: number;
    to: number;
    migrate: (oldConfig: unknown) => unknown;
  }>;
}


