# 快速开始

本指南将帮助您在 5 分钟内上手 EbinPlayer。

## 5分钟上手

### 1. 创建HTML文件

创建一个基本的HTML文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EbinPlayer 快速开始</title>
    <link rel="stylesheet" href="node_modules/ebin-player/dist/styles.css">
</head>
<body>
    <div id="player-container"></div>
    <script src="node_modules/ebin-player/dist/ebin-player.umd.js"></script>
    <script>
        // 播放器代码将在这里
    </script>
</body>
</html>
```

### 2. 引入资源

确保正确引入了 EbinPlayer 的 CSS 和 JavaScript 文件：

```html
<!-- CSS 样式 -->
<link rel="stylesheet" href="node_modules/ebin-player/dist/styles.css">

<!-- JavaScript 库 -->
<script src="node_modules/ebin-player/dist/ebin-player.umd.js"></script>
```

### 3. 初始化播放器

在 `<script>` 标签中添加播放器初始化代码：

```javascript
// 获取容器元素
const container = document.getElementById('player-container');

// 创建播放器实例
const player = new EbinPlayer(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    width: 800,
    height: 450,
    autoplay: false,
    controls: true
});
```

### 4. 配置选项

EbinPlayer 提供了丰富的配置选项：

```javascript
const player = new EbinPlayer(container, {
    // 视频源
    src: 'video.mp4',
    
    // 播放器尺寸
    width: 800,
    height: 450,
    
    // 播放控制
    autoplay: false,
    muted: false,
    loop: false,
    preload: 'metadata',
    
    // 用户界面
    controls: true,
    showPlayButton: true,
    showProgressBar: true,
    showTimeDisplay: true,
    showVolumeControl: true,
    
    // 主题配置
    theme: {
        primaryColor: '#007bff',
        controlBarHeight: 50
    }
});
```

### 5. 监听事件

添加事件监听器来响应用户操作：

```javascript
// 播放事件
player.on('play', () => {
    console.log('视频开始播放');
});

player.on('pause', () => {
    console.log('视频暂停');
});

player.on('ended', () => {
    console.log('视频播放结束');
});

// 时间更新事件
player.on('timeupdate', () => {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    console.log(`播放进度: ${currentTime}/${duration}`);
});

// 错误处理
player.on('error', (event) => {
    console.error('播放错误:', event.error);
});
```

## 基础配置

### 视频源配置

```javascript
// 单个视频源
const player = new EbinPlayer(container, {
    src: 'video.mp4'
});

// 多个视频源（自动选择最佳格式）
const player = new EbinPlayer(container, {
    src: [
        { src: 'video.mp4', type: 'video/mp4' },
        { src: 'video.webm', type: 'video/webm' },
        { src: 'video.ogv', type: 'video/ogg' }
    ]
});
```

### 播放器选项

```javascript
const player = new EbinPlayer(container, {
    // 基础配置
    src: 'video.mp4',
    width: 800,
    height: 450,
    
    // 播放行为
    autoplay: false,        // 自动播放
    muted: false,          // 静音
    loop: false,           // 循环播放
    preload: 'metadata',   // 预加载策略
    
    // 用户界面
    controls: true,        // 显示控制栏
    showPlayButton: true,  // 显示播放按钮
    showProgressBar: true, // 显示进度条
    showTimeDisplay: true, // 显示时间显示
    showVolumeControl: true, // 显示音量控制
    
    // 响应式
    responsive: true,      // 启用响应式
    aspectRatio: '16:9',   // 宽高比
    
    // 主题
    theme: {
        primaryColor: '#007bff',
        controlBarHeight: 50,
        borderRadius: 4
    }
});
```

## 播放控制

### 基础控制方法

```javascript
// 播放控制
player.play();           // 播放
player.pause();          // 暂停
player.togglePlay();     // 切换播放/暂停

// 音量控制
player.setVolume(0.5);   // 设置音量为50%
player.getVolume();      // 获取当前音量
player.setMuted(true);   // 静音
player.getMuted();       // 获取静音状态

// 进度控制
player.setCurrentTime(30); // 跳转到30秒
player.getCurrentTime();   // 获取当前播放时间
player.getDuration();      // 获取视频总时长

// 播放速度
player.setPlaybackRate(1.5); // 设置播放速度为1.5倍
player.getPlaybackRate();     // 获取当前播放速度
```

### 全屏控制

```javascript
// 全屏
player.requestFullscreen();

// 退出全屏
player.exitFullscreen();

// 检查是否全屏
player.isFullscreen();
```

### 画中画

```javascript
// 进入画中画
player.requestPictureInPicture();

// 退出画中画
player.exitPictureInPicture();

// 检查是否画中画
player.isPictureInPicture();
```

## 事件系统

### 常用事件

```javascript
// 播放状态事件
player.on('loadstart', () => console.log('开始加载'));
player.on('loadedmetadata', () => console.log('元数据加载完成'));
player.on('loadeddata', () => console.log('数据加载完成'));
player.on('canplay', () => console.log('可以开始播放'));
player.on('play', () => console.log('开始播放'));
player.on('pause', () => console.log('暂停播放'));
player.on('ended', () => console.log('播放结束'));

// 进度事件
player.on('timeupdate', () => {
    const current = player.getCurrentTime();
    const duration = player.getDuration();
    console.log(`进度: ${current}/${duration}`);
});

// 音量事件
player.on('volumechange', () => {
    console.log(`音量: ${player.getVolume()}`);
});

// 错误事件
player.on('error', (event) => {
    console.error('播放错误:', event.error);
});
```

### 移除事件监听

```javascript
// 添加事件监听
const removeListener = player.on('play', () => {
    console.log('播放事件');
});

// 移除事件监听
removeListener();
// 或者
player.off('play', callback);
```

## 常见问题

### Q: 视频无法播放？
A: 检查视频文件路径是否正确，确保视频格式被浏览器支持。

### Q: 样式不生效？
A: 确保已正确引入 CSS 文件，检查文件路径。

### Q: 控制栏不显示？
A: 检查 `controls` 选项是否设置为 `true`。

### Q: 移动端触摸不响应？
A: 确保容器元素有足够的触摸区域，检查 CSS 样式。

## 下一步

现在您已经掌握了 EbinPlayer 的基础用法，可以：

1. 查看 [API 文档](../api/) 了解所有可用方法
2. 学习 [自定义UI](../examples/custom-ui.md) 创建个性化界面
3. 了解 [插件开发](../examples/plugin-development.md) 扩展功能
4. 探索 [主题定制](../examples/theming.md) 美化播放器
