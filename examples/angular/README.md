# Angular Example (Usage Guide)

Minimal usage with @ebin-player/angular.

## Install

```bash
npm install @ebin-player/angular @ebin-player/core
```

## AppModule

```ts
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

## Component

```html
<ebin-player
  [src]="'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'"
  [uiMode]="'custom'"
  (ready)="onReady()"
></ebin-player>
```

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  onReady() { console.log('Player ready'); }
}
```
