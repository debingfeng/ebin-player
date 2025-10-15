# @ebin-player/vue2

Vue 2 bindings for ebin-player video player.

## 安装

```bash
npm install @ebin-player/vue2 @ebin-player/core
# 或
pnpm add @ebin-player/vue2 @ebin-player/core
# 或
yarn add @ebin-player/vue2 @ebin-player/core
```

## 基础使用

```vue
<template>
  <div>
    <EbinPlayer
      :src="videoSrc"
      :ui-mode="uiMode"
      :autoplay="false"
      :width="800"
      :height="450"
      @ready="onReady"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUpdate"
    />
  </div>
</template>

<script>
import { EbinPlayer } from '@ebin-player/vue2';
import '@ebin-player/core/styles';

export default {
  name: 'VideoPlayer',
  components: {
    EbinPlayer,
  },
  data() {
    return {
      videoSrc: 'https://example.com/video.mp4',
      uiMode: 'advanced',
    };
  },
  methods: {
    onReady() {
      console.log('播放器准备就绪');
    },
    onPlay() {
      console.log('开始播放');
    },
    onPause() {
      console.log('暂停播放');
    },
    onTimeUpdate(time) {
      console.log('当前时间:', time);
    },
  },
};
</script>
```

## 高级使用

### 使用 ref 获取播放器实例

```vue
<template>
  <div>
    <EbinPlayer
      ref="player"
      :src="videoSrc"
      :ui-mode="'custom'"
      @ready="onReady"
    />
    <button @click="play">播放</button>
    <button @click="pause">暂停</button>
  </div>
</template>

<script>
import { EbinPlayer } from '@ebin-player/vue2';

export default {
  components: {
    EbinPlayer,
  },
  methods: {
    onReady() {
      console.log('播放器准备就绪');
    },
    play() {
      const player = this.$refs.player.getInstance();
      if (player) {
        player.play();
      }
    },
    pause() {
      const player = this.$refs.player.getInstance();
      if (player) {
        player.pause();
      }
    },
  },
};
</script>
```

### 自定义主题

```vue
<template>
  <EbinPlayer
    :src="videoSrc"
    :ui-mode="'custom'"
    :theme="customTheme"
    :ui-config="uiConfig"
  />
</template>

<script>
import { EbinPlayer } from '@ebin-player/vue2';

export default {
  components: {
    EbinPlayer,
  },
  data() {
    return {
      videoSrc: 'https://example.com/video.mp4',
      customTheme: {
        primaryColor: '#ff6b6b',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        textColor: '#ffffff',
        controlBarHeight: 60,
        borderRadius: 8,
      },
      uiConfig: {
        playButton: true,
        progressBar: true,
        timeDisplay: true,
        volumeControl: true,
        fullscreenButton: true,
        playbackRateControl: true,
      },
    };
  },
};
</script>
```

### 使用插件

```vue
<template>
  <EbinPlayer
    :src="videoSrc"
    :plugins="plugins"
    @ready="onReady"
  />
</template>

<script>
import { EbinPlayer } from '@ebin-player/vue2';
import { PlaybackRatePlugin } from '@ebin-player/core';

export default {
  components: {
    EbinPlayer,
  },
  data() {
    return {
      videoSrc: 'https://example.com/video.mp4',
      plugins: [
        PlaybackRatePlugin,
        // 自定义插件
        () => ({
          meta: {
            id: 'custom-plugin',
            version: '1.0.0',
          },
          onInit: (ctx) => {
            console.log('自定义插件初始化');
          },
        }),
      ],
    };
  },
  methods: {
    onReady() {
      console.log('播放器准备就绪');
    },
  },
};
</script>
```

## Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `src` | `string \| object` | - | 视频源（必需） |
| `autoplay` | `boolean` | `false` | 自动播放 |
| `muted` | `boolean` | `false` | 静音 |
| `volume` | `number` | `1` | 音量 (0-1) |
| `playbackRate` | `number` | `1` | 播放速度 |
| `poster` | `string` | - | 封面图片 |
| `width` | `number \| string` | - | 宽度 |
| `height` | `number \| string` | - | 高度 |
| `loop` | `boolean` | `false` | 循环播放 |
| `preload` | `string` | `'metadata'` | 预加载策略 |
| `uiMode` | `string` | `'advanced'` | UI模式 |
| `uiConfig` | `object` | - | UI配置 |
| `theme` | `object` | - | 主题配置 |
| `plugins` | `array` | - | 插件列表 |
| `debug` | `boolean` | `false` | 调试模式 |
| `containerStyle` | `object` | - | 容器样式 |
| `containerClassName` | `string` | - | 容器类名 |
| `containerProps` | `object` | - | 容器属性 |
| `reinitializeOn` | `array` | `['src', 'uiMode']` | 重新初始化触发条件 |
| `ssr` | `boolean` | `true` | 服务端渲染支持 |
| `styleInjection` | `string` | `'auto'` | 样式注入模式 |
| `stylesheetUrl` | `string` | - | 自定义样式表URL |
| `nonce` | `string` | - | 样式表nonce |
| `injectOnceKey` | `string` | - | 注入唯一标识 |

## Events

| 事件 | 参数 | 描述 |
|------|------|------|
| `ready` | - | 播放器准备就绪 |
| `play` | - | 开始播放 |
| `pause` | - | 暂停播放 |
| `timeupdate` | `time: number` | 时间更新 |
| `ended` | - | 播放结束 |
| `error` | `error: any` | 播放错误 |
| `loadedmetadata` | - | 元数据加载完成 |
| `seeking` | - | 开始跳转 |
| `seeked` | - | 跳转完成 |
| `volumechange` | `volume: number, muted: boolean` | 音量变化 |
| `ratechange` | `rate: number` | 播放速度变化 |
| `fullscreenchange` | `isFullscreen: boolean` | 全屏状态变化 |
| `pictureinpicturechange` | `isPip: boolean` | 画中画状态变化 |

## 方法

通过 ref 可以访问以下方法：

| 方法 | 描述 |
|------|------|
| `getInstance()` | 获取播放器实例 |

## 样式注入

组件默认会自动注入样式，你也可以手动控制：

```vue
<template>
  <EbinPlayer
    :src="videoSrc"
    :style-injection="'manual'"
  />
</template>

<script>
import { EbinPlayer } from '@ebin-player/vue2';
import '@ebin-player/core/styles'; // 手动引入样式

export default {
  components: {
    EbinPlayer,
  },
};
</script>
```

## 服务端渲染 (SSR)

组件支持服务端渲染，默认启用：

```vue
<template>
  <EbinPlayer
    :src="videoSrc"
    :ssr="true"
  />
</template>
```

## 许可证

MIT
