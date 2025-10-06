export default {
  uiFeatures: {
    basic: [
      {
        key: "playPause",
        displayName: {
          en: "Play / Pause",
          zh: "播放 / 暂停",
        },
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          keyboard: "Space / Enter",
          ariaLabel: true,
        },
      },
      {
        key: "progressBar",
        displayName: {
          en: "Progress Bar",
          zh: "进度条",
        },
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          keyboard: "Arrow keys to seek",
          ariaLabel: true,
        },
      },
      {
        key: "currentTimeTotalTime",
        displayName: {
          en: "Current / Total Time",
          zh: "当前 / 总时长",
        },
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          ariaLive: "polite",
        },
      },
      {
        key: "volumeSlider",
        displayName: {
          en: "Volume Slider",
          zh: "音量滑块",
        },
        platforms: ["desktop", "tv"],
        a11y: {
          keyboard: "Up / Down arrows",
          ariaLabel: true,
        },
      },
      {
        key: "muteToggle",
        displayName: {
          en: "Mute Toggle",
          zh: "静音开关",
        },
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          keyboard: "M key",
          ariaLabel: true,
        },
      },
      {
        key: "fullscreenToggle",
        displayName: {
          en: "Fullscreen Toggle",
          zh: "全屏切换",
        },
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          keyboard: "F key",
          ariaLabel: true,
        },
      },
      {
        key: "autoHideControls",
        displayName: {
          en: "Auto-hide Controls",
          zh: "控件自动隐藏",
        },
        platforms: ["mobile", "desktop"],
        a11y: {
          note: "Should be disableable for motor-impaired users",
        },
      },
      {
        key: "loadingIndicator",
        displayName: {
          en: "Loading / Buffering Indicator",
          zh: "加载 / 缓冲提示",
        },
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          ariaLive: "polite",
        },
      },
    ],
    advanced: [
      {
        key: "playbackRate",
        displayName: {
          en: "Playback Speed",
          zh: "播放速度",
        },
        platforms: ["desktop", "mobile"],
        a11y: {
          keyboard: "Shift + < / >",
          ariaLabel: true,
        },
      },
      {
        key: "qualitySelector",
        displayName: {
          en: "Video Quality",
          zh: "画质选择",
        },
        platforms: ["desktop", "mobile"],
        a11y: {
          ariaLabel: true,
        },
      },
      {
        key: "subtitleToggle",
        displayName: {
          en: "Subtitles / Captions",
          zh: "字幕开关",
        },
        platforms: ["mobile", "desktop", "tv"],
        a11y: {
          keyboard: "C key",
          ariaLabel: true,
          essentialFor: "hearing-impaired",
        },
      },
      {
        key: "aspectRatio",
        displayName: {
          en: "Aspect Ratio / Fit Mode",
          zh: "画面比例 / 适配模式",
        },
        platforms: ["desktop", "tv"],
        a11y: {
          ariaLabel: true,
        },
      },
      {
        key: "pictureInPicture",
        displayName: {
          en: "Picture-in-Picture",
          zh: "画中画",
        },
        platforms: ["desktop", "mobile"],
        a11y: {
          ariaLabel: true,
        },
      },
    //   {
    //     key: "nextPrevious",
    //     displayName: {
    //       en: "Next / Previous",
    //       zh: "上一集 / 下一集",
    //     },
    //     platforms: ["mobile", "desktop"],
    //     a11y: {
    //       keyboard: "N / P keys",
    //       ariaLabel: true,
    //     },
    //   },
    //   {
    //     key: "playlistPanel",
    //     displayName: {
    //       en: "Playlist Panel",
    //       zh: "播放列表面板",
    //     },
    //     platforms: ["desktop"],
    //     a11y: {
    //       keyboard: "Tab navigation",
    //       ariaLabel: true,
    //     },
    //   },
      {
        key: "screenshot",
        displayName: {
          en: "Screenshot",
          zh: "截图",
        },
        platforms: ["desktop"],
        a11y: {
          ariaLabel: true,
        },
      },
      {
        key: "skipButtons",
        displayName: {
          en: "Skip Back / Forward (e.g., ±10s)",
          zh: "快退 / 快进（如 ±10 秒）",
        },
        platforms: ["mobile", "desktop"],
        a11y: {
          keyboard: "J / L keys",
          ariaLabel: true,
        },
      },
    ],
    special: [
    //   {
    //     key: "360Controls",
    //     displayName: {
    //       en: "360° Video Controls",
    //       zh: "360° 视频控制",
    //     },
    //     platforms: ["mobile", "desktop"],
    //     a11y: {
    //       note: "Limited accessibility; provide alternative description",
    //     },
    //   },
    //   {
    //     key: "vrMode",
    //     displayName: {
    //       en: "VR Mode",
    //       zh: "VR 模式",
    //     },
    //     platforms: ["desktop"],
    //     a11y: {
    //       note: "Not accessible to most users with disabilities",
    //     },
    //   },
      {
        key: "audioTrackSelector",
        displayName: {
          en: "Audio Track Selector",
          zh: "音轨选择",
        },
        platforms: ["desktop", "mobile"],
        a11y: {
          ariaLabel: true,
        },
      },
      {
        key: "equalizer",
        displayName: {
          en: "Audio Equalizer",
          zh: "音频均衡器",
        },
        platforms: ["desktop"],
        a11y: {
          keyboard: "Tab + arrow keys",
          ariaLabel: true,
        },
      },
      {
        key: "abLoop",
        displayName: {
          en: "A-B Loop Playback",
          zh: "AB 循环播放",
        },
        platforms: ["desktop"],
        a11y: {
          ariaLabel: true,
        },
      },
      {
        key: "bookmarks",
        displayName: {
          en: "Time Bookmarks",
          zh: "时间戳书签",
        },
        platforms: ["desktop", "mobile"],
        a11y: {
          ariaLabel: true,
        },
      },
    //   {
    //     key: "liveTimeshift",
    //     displayName: {
    //       en: "Live Time-Shift",
    //       zh: "直播时移",
    //     },
    //     platforms: ["mobile", "desktop"],
    //     a11y: {
    //       ariaLabel: true,
    //     },
    //   },
      {
        key: "danmaku",
        displayName: {
          en: "Danmaku (Scrolling Comments)",
          zh: "弹幕",
        },
        platforms: ["mobile", "desktop"],
        a11y: {
          note: "Can interfere with screen readers; must be toggleable",
        },
      },
    //   {
    //     key: "accessibilityMode",
    //     displayName: {
    //       en: "Accessibility Mode",
    //       zh: "无障碍模式",
    //     },
    //     platforms: ["mobile", "desktop"],
    //     a11y: {
    //       essentialFor: "motor / visual impaired",
    //       note: "Larger buttons, no auto-hide, high contrast",
    //     },
    //   },
    //   {
    //     key: "castToDevice",
    //     displayName: {
    //       en: "Cast to Device",
    //       zh: "投屏到设备",
    //     },
    //     platforms: ["mobile", "desktop"],
    //     a11y: {
    //       ariaLabel: true,
    //     },
    //   },
    //   {
    //     key: "skipAd",
    //     displayName: {
    //       en: "Skip Ad",
    //       zh: "跳过广告",
    //     },
    //     platforms: ["mobile", "desktop"],
    //     a11y: {
    //       ariaLive: "assertive",
    //       ariaLabel: true,
    //     },
    //   },
    ],
  },
};
