# @ebin-player/angular

Angular bindings for Ebin Player.

## Installation

```bash
npm install @ebin-player/angular @ebin-player/core
# or
pnpm add @ebin-player/angular @ebin-player/core
# or
yarn add @ebin-player/angular @ebin-player/core
```

## Quick Start

```ts
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EbinPlayerModule } from '@ebin-player/angular';
import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, EbinPlayerModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<ebin-player
  [src]="'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'"
  [uiMode]="'custom'"
  (ready)="onReady()"
  (play)="onPlay()"
  (pause)="onPause()"
></ebin-player>
```

```ts
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  onReady() { console.log('Player ready'); }
  onPlay() { console.log('Play'); }
  onPause() { console.log('Pause'); }
}
```

## Styling

- Auto injection (default): styles are injected automatically by the component.
- Manual injection:

```ts
// main.ts (or styles.scss via CSS import)
import '@ebin-player/core/styles';
```

Or set `[styleInjection]="'manual'"` on the component and import styles yourself.

## Inputs (partial)
- `src: string | MediaSource` (required)
- `uiMode: 'native' | 'custom' | 'none'`
- `autoplay?: boolean`, `muted?: boolean`, `volume?: number`, `playbackRate?: number`
- `width?: number | string`, `height?: number | string`
- `uiConfig?: ControlBarConfig`, `theme?: PlayerTheme`
- `plugins?: Array<PluginDefinition | () => PluginDefinition>`
- `styleInjection?: 'auto' | 'manual'`

## Outputs (events)
- `ready`, `play`, `pause`, `timeupdate(number)`, `ended`, `error(any)`
- `loadedmetadata`, `seeking`, `seeked`, `volumechange({ volume, muted })`, `ratechange(number)`, `fullscreenchange(boolean)`

## SSR
This component defers DOM operations, it is safe to use in Angular Universal. Styles are only injected on client.

## TypeScript
Full type support via `@ebin-player/core` types (e.g. `PlayerOptions`, `PlayerTheme`).
