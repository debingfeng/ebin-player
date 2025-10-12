# Installation Guide

This guide will help you install and set up EbinPlayer in your project.

## Package Managers

### NPM

```bash
npm install ebin-player
```

### Yarn

```bash
yarn add ebin-player
```

### pnpm (Recommended)

```bash
pnpm add ebin-player
```

## Import Methods

### ES6 Module (Recommended)

```javascript
import EbinPlayer from 'ebin-player';
import 'ebin-player/dist/styles.css';

const player = new EbinPlayer(container, {
    src: 'video.mp4',
    autoplay: false,
    controls: true
});
```

### CommonJS

```javascript
const EbinPlayer = require('ebin-player');
require('ebin-player/dist/styles.css');

const player = new EbinPlayer(container, {
    src: 'video.mp4',
    autoplay: false,
    controls: true
});
```

### UMD Global Variable

```html
<script src="dist/ebin-player.umd.js"></script>
<script>
    const player = new EbinPlayer(container, options);
</script>
```

## TypeScript Support

EbinPlayer is written in TypeScript and provides full type definitions.

### TypeScript Configuration

```typescript
import { createPlayer, type PlayerOptions } from 'ebin-player';

const options: PlayerOptions = {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    autoplay: false,
    controls: true
};

const player = createPlayer(container, options);
```

### Type Definitions

The package includes comprehensive TypeScript definitions:

- `PlayerOptions`: Player configuration interface
- `PlayerState`: Player state interface
- `PlayerInstance`: Main player class
- `PluginDefinition`: Plugin interface
- `PlayerTheme`: Theme configuration interface

## CDN Usage

### Unpkg

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/ebin-player/dist/styles.css">
</head>
<body>
    <div id="player"></div>
    <script src="https://unpkg.com/ebin-player/dist/ebin-player.umd.js"></script>
    <script>
        console.log('EbinPlayer version:', EbinPlayer.version);
        const player = new EbinPlayer(document.getElementById('player'), {
            src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        });
    </script>
</body>
</html>
```

### jsDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/ebin-player/dist/ebin-player.umd.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ebin-player/dist/styles.css">
```

## Framework Integration

### React

```jsx
import React, { useEffect, useRef } from 'react';
import EbinPlayer from 'ebin-player';
import 'ebin-player/dist/styles.css';

function VideoPlayer({ src, options = {} }) {
    const containerRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            playerRef.current = new EbinPlayer(containerRef.current, {
                src,
                ...options
            });
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [src, options]);

    return <div ref={containerRef} />;
}
```

### Vue

```vue
<template>
    <div ref="playerContainer"></div>
</template>

<script>
import EbinPlayer from 'ebin-player';
import 'ebin-player/dist/styles.css';

export default {
    name: 'VideoPlayer',
    props: {
        src: String,
        options: Object
    },
    mounted() {
        this.player = new EbinPlayer(this.$refs.playerContainer, {
            src: this.src,
            ...this.options
        });
    },
    beforeDestroy() {
        if (this.player) {
            this.player.destroy();
        }
    }
};
</script>
```

### Angular

```typescript
import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import EbinPlayer from 'ebin-player';
import 'ebin-player/dist/styles.css';

@Component({
    selector: 'app-video-player',
    template: '<div #playerContainer></div>'
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
    @Input() src: string;
    @Input() options: any = {};
    
    private player: EbinPlayer;

    constructor(private elementRef: ElementRef) {}

    ngOnInit() {
        const container = this.elementRef.nativeElement.querySelector('#playerContainer');
        this.player = new EbinPlayer(container, {
            src: this.src,
            ...this.options
        });
    }

    ngOnDestroy() {
        if (this.player) {
            this.player.destroy();
        }
    }
}
```

## Browser Support

EbinPlayer supports all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Polyfills

For older browsers, you may need polyfills for:

- `Promise`
- `Object.assign`
- `Array.from`
- `Array.includes`

## Build Tools

### Webpack

```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
};
```

### Vite

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
    css: {
        preprocessorOptions: {
            css: {
                additionalData: `@import 'ebin-player/dist/styles.css';`
            }
        }
    }
});
```

### Rollup

```javascript
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    plugins: [
        nodeResolve(),
        commonjs()
    ]
};
```

## Troubleshooting

### Common Issues

1. **Styles not loading**: Make sure to import the CSS file
2. **TypeScript errors**: Ensure you have the latest version installed
3. **Build errors**: Check your bundler configuration

### Getting Help

- [GitHub Issues](https://github.com/debingfeng/ebin-player/issues)
- [Documentation](https://github.com/debingfeng/ebin-player#readme)
- [Examples](https://github.com/debingfeng/ebin-player/tree/main/examples)
