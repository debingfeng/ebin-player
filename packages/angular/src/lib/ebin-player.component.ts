import { Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { createPlayer, type PlayerOptions, type ControlBarConfig, type PlayerTheme, type PluginDefinition, version as coreVersion } from '@ebin-player/core';
import { ensureStylesInjected, type StyleInjectionMode } from './style-injection';

@Component({
  selector: 'ebin-player',
  template: '<div class="ebin-player-container"></div>',
  standalone: false,
})
export class EbinPlayerComponent implements OnInit, OnDestroy {
  @Input() src!: PlayerOptions['src'];
  @Input() autoplay?: PlayerOptions['autoplay'];
  @Input() muted?: PlayerOptions['muted'];
  @Input() volume?: PlayerOptions['volume'];
  @Input() playbackRate?: PlayerOptions['playbackRate'];
  @Input() poster?: PlayerOptions['poster'];
  @Input() width?: PlayerOptions['width'];
  @Input() height?: PlayerOptions['height'];
  @Input() loop?: PlayerOptions['loop'];
  @Input() preload?: PlayerOptions['preload'];
  @Input() crossOrigin?: PlayerOptions['crossOrigin'];
  @Input() playsInline?: PlayerOptions['playsInline'];
  @Input() uiMode?: PlayerOptions['uiMode'];
  @Input() uiConfig?: ControlBarConfig;
  @Input() theme?: PlayerTheme;
  @Input() builtinPlugins?: PlayerOptions['builtinPlugins'];
  @Input() debug?: PlayerOptions['debug'];
  @Input() logger?: PlayerOptions['logger'];
  @Input() plugins?: Array<PluginDefinition | (() => PluginDefinition)>;
  @Input() styleInjection: StyleInjectionMode = 'auto';
  @Input() stylesheetUrl?: string;
  @Input() nonce?: string;
  @Input() injectOnceKey?: string;

  @Output() ready = new EventEmitter<void>();
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() timeupdate = new EventEmitter<number>();
  @Output() ended = new EventEmitter<void>();
  @Output() error = new EventEmitter<unknown>();
  @Output() loadedmetadata = new EventEmitter<void>();
  @Output() seeking = new EventEmitter<void>();
  @Output() seeked = new EventEmitter<void>();
  @Output() volumechange = new EventEmitter<{ volume: number; muted: boolean }>();
  @Output() ratechange = new EventEmitter<number>();
  @Output() fullscreenchange = new EventEmitter<boolean>();

  private player: any | null = null;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => this.initializePlayer());
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }

  private initializePlayer(): void {
    const container = this.host.nativeElement.querySelector('.ebin-player-container') as HTMLElement | null;
    if (!container) return;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      ensureStylesInjected({
        mode: this.styleInjection,
        stylesheetUrl: this.stylesheetUrl,
        nonce: this.nonce,
        injectOnceKey: this.injectOnceKey,
        packageVersion: coreVersion,
      });
    }

    try {
      const options: PlayerOptions = {
        src: this.src,
        autoplay: this.autoplay,
        muted: this.muted,
        volume: this.volume,
        playbackRate: this.playbackRate,
        poster: this.poster,
        width: this.width,
        height: this.height,
        loop: this.loop,
        preload: this.preload,
        crossOrigin: this.crossOrigin,
        playsInline: this.playsInline,
        uiMode: this.uiMode,
        uiConfig: this.uiConfig,
        theme: this.theme,
        builtinPlugins: this.builtinPlugins,
        debug: this.debug,
        logger: this.logger,
      } as PlayerOptions;

      const instance = createPlayer(container, options);
      this.player = instance;

      if (Array.isArray(this.plugins) && this.plugins.length > 0) {
        this.plugins.forEach((p) => {
          try {
            const def = typeof p === 'function' ? p() : p;
            if (def) instance.use(def as any);
          } catch (e) {
            this.zone.run(() => this.error.emit(e));
          }
        });
      }

      instance.on('play', () => this.zone.run(() => this.play.emit()));
      instance.on('pause', () => this.zone.run(() => this.pause.emit()));
      instance.on('timeupdate', () => this.zone.run(() => this.timeupdate.emit(instance.getCurrentTime())));
      instance.on('ended', () => this.zone.run(() => this.ended.emit()));
      instance.on('error', (e: any) => this.zone.run(() => this.error.emit(e)));
      instance.on('loadedmetadata', () => this.zone.run(() => this.loadedmetadata.emit()));
      instance.on('seeking', () => this.zone.run(() => this.seeking.emit()));
      instance.on('seeked', () => this.zone.run(() => this.seeked.emit()));
      instance.on('volumechange', () => this.zone.run(() => this.volumechange.emit({ volume: instance.getVolume(), muted: instance.getMuted() })));
      instance.on('ratechange', () => this.zone.run(() => this.ratechange.emit(instance.getPlaybackRate())));
      instance.on('fullscreenchange', () => this.zone.run(() => this.fullscreenchange.emit(instance.isFullscreen())));

      this.zone.run(() => this.ready.emit());
    } catch (e) {
      this.zone.run(() => this.error.emit(e));
    }
  }

  getInstance(): any | null {
    return this.player;
  }

  private destroyPlayer(): void {
    if (this.player) {
      try {
        this.player.destroy?.();
      } catch {}
      this.player = null;
    }
  }
}
