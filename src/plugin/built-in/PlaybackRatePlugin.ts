/**
 * 播放速度控制插件（基于 BasePlugin 的实现）
 */
import { PluginDefinition, PluginContext } from '../../types';
import { BasePlugin } from '../BasePlugin';

type RateOption = { value: number; label: string };
type RateConfig = { defaultRate: number; options: RateOption[] };
type RateExports = { setRate: (rate: number) => void; getOptions: () => RateOption[] };

function createContainer(): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'ebin-player-playback-rate';
  div.style.cssText = `
    display: flex;
    align-items: center;
    gap: 5px;
  `;
  return div;
}

function createSelect(): HTMLSelectElement {
  const sel = document.createElement('select');
  sel.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    padding: 4px 6px;
    font-size: 12px;
    outline: none;
    cursor: pointer;
    min-width: 60px;
  `;
  return sel;
}

class PlaybackRatePluginImpl extends BasePlugin<RateConfig, RateExports> {
  meta = {
    id: 'builtin.playback-rate',
    version: '2.0.0',
    displayName: 'Playback Rate',
    description: '提供播放速度调节与 UI 控件',
    capabilities: ['rate', 'ui:inject'],
    permissions: ['player:control', 'ui:inject']
  } as PluginDefinition<RateConfig, RateExports>['meta'];

  configVersion = 1;
  defaultConfig: RateConfig = {
    defaultRate: 1,
    options: [
      { value: 0.25, label: '0.25x' },
      { value: 0.5, label: '0.5x' },
      { value: 0.75, label: '0.75x' },
      { value: 1, label: '1x' },
      { value: 1.25, label: '1.25x' },
      { value: 1.5, label: '1.5x' },
      { value: 1.75, label: '1.75x' },
      { value: 2, label: '2x' }
    ]
  };

  validateConfig = (config: unknown) => {
    const c = config as Partial<RateConfig>;
    const validRate = typeof c.defaultRate === 'number';
    const validOptions = Array.isArray(c.options) && c.options.every(o => typeof o?.value === 'number' && typeof o?.label === 'string');
    const valid = (!!c && validRate && validOptions) || config === undefined;
    return { valid, errors: valid ? [] : ['配置不合法: defaultRate 必须为 number, options 必须为 {value,label}[]'] };
  }

  commands = {
    bump: (_args: unknown, _ctx: PluginContext) => {
      const cur = this.ctx.player.getPlaybackRate();
      const config = this.ctx.getConfig<RateConfig>();
      const maxRate = Math.max(...config.options.map(o => o.value));
      this.ctx.player.setPlaybackRate(Math.min(cur + 0.25, maxRate));
    }
  } as PluginDefinition<RateConfig, RateExports>['commands'];

  async onInit(ctx: PluginContext) {
    await super.onInit(ctx);
    const conf = this.ctx.getConfig<RateConfig>();
    const container = createContainer();
    const select = createSelect();

    const populate = (options: RateOption[]) => {
      select.innerHTML = '';
      options.forEach(opt => {
        const el = document.createElement('option');
        el.value = String(opt.value);
        el.textContent = opt.label;
        select.appendChild(el);
      });
    };

    const updateRateUI = () => {
      const current = this.ctx.player.getPlaybackRate();
      select.value = String(current);
    };

    populate(conf.options);
    container.appendChild(select);
    
    // 添加到主控制栏而不是独立悬浮
    const controlBar = this.ctx.player.getContainer().querySelector('.ebin-player-control-bar');
    if (controlBar) {
      controlBar.appendChild(container);
    } else {
      // 如果控制栏不存在，回退到原来的方式
      this.ctx.player.getContainer().appendChild(container);
    }

    const onChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      const rate = parseFloat(target.value);
      this.ctx.player.setPlaybackRate(rate);
    };
    select.addEventListener('change', onChange);
    this.addDisposer(() => select.removeEventListener('change', onChange));

    this.on('ratechange', () => updateRateUI());
    updateRateUI();

    const setRate = (rate: number) => {
      const allowed = this.ctx.getConfig<RateConfig>().options.some(o => o.value === rate);
      if (allowed) this.ctx.player.setPlaybackRate(rate);
      else this.ctx.logger.warn(`播放速度 ${rate} 不在预定义选项中`);
    };
    this.registerService('playbackRate.set', setRate);

    return {
      setRate,
      getOptions: () => this.ctx.getConfig<RateConfig>().options
    } as RateExports;
  }

  onStart() {
    const conf = this.ctx.getConfig<RateConfig>();
    if (typeof conf.defaultRate === 'number') {
      this.ctx.player.setPlaybackRate(conf.defaultRate);
    }
  }

  onConfigChange(newConf: Partial<RateConfig>) {
    const host = this.ctx.player.getContainer();
    const container = host.querySelector('.ebin-player-playback-rate') as HTMLDivElement | null;
    if (!container) return;
    const select = container.querySelector('select') as HTMLSelectElement | null;
    if (!select) return;
    if (newConf.options) {
      select.innerHTML = '';
      newConf.options.forEach((opt) => {
        const el = document.createElement('option');
        el.value = String(opt.value);
        el.textContent = opt.label;
        select.appendChild(el);
      });
    }
    if (typeof newConf.defaultRate === 'number') {
      this.ctx.player.setPlaybackRate(newConf.defaultRate);
      select.value = String(newConf.defaultRate);
    }
  }

  onDestroy() {
    const host = this.ctx.player.getContainer();
    const container = host.querySelector('.ebin-player-playback-rate');
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    super.onDestroy(this.ctx);
  }
}

export const PlaybackRatePlugin: PluginDefinition<RateConfig, RateExports> = new PlaybackRatePluginImpl();
