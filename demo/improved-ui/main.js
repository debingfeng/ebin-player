/**
 * 改进版UI架构验证Demo
 * 测试组件化架构、主题系统、响应式设计等功能
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('player-container');
  const statusDisplay = document.getElementById('status-display');
  const screenTypeDisplay = document.getElementById('screen-type');
  
  let player = null;
  let ui = null;
  let debugMode = true;

  // 初始化播放器
  function initPlayer() {
    try {
      const { PlayerInstance } = window.EbinPlayer;
      
      // 创建Logger实例
      const logger = {
        setEnabled: (enabled) => { debugMode = enabled; },
        child: (suffix) => logger,
        debug: (...args) => debugMode && console.debug('[Player]', ...args),
        info: (...args) => console.info('[Player]', ...args),
        warn: (...args) => console.warn('[Player]', ...args),
        error: (...args) => console.error('[Player]', ...args),
      };

      // 创建PlayerInstance，添加getLogger方法
      player = new PlayerInstance(container, {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        uiMode: 'none', // 使用全新UI架构
        autoplay: false,
        muted: false,
        volume: 1,
        width: '100%',
        height: 'auto',
        debug: true
      });

      // 添加getLogger方法到player实例
      player.getLogger = () => logger;

      // 使用改进版UI
      ui = new window.EbinPlayer.ImprovedDefaultUI(
        player,
        container,
        {
          playButton: true,
          progressBar: true,
          timeDisplay: true,
          volumeControl: true,
          playbackRateControl: true,
          fullscreenButton: true,
        },
        {
          primaryColor: '#3b82f6',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          textColor: '#ffffff',
          controlBarHeight: 50,
          borderRadius: 4,
        }
      );

      updateStatus('✅ 播放器和UI初始化成功');
      updateScreenType();
      
      // 监听播放器事件
      setupPlayerEventListeners();
      
    } catch (error) {
      updateStatus('❌ 初始化失败: ' + error.message);
      console.error('初始化失败:', error);
    }
  }

  // 设置播放器事件监听
  function setupPlayerEventListeners() {
    if (!player) return;

    const events = ['loadstart', 'loadedmetadata', 'canplay', 'play', 'pause', 'timeupdate', 'volumechange', 'error'];
    
    events.forEach(event => {
      player.on(event, (e) => {
        if (debugMode) {
          console.log(`[Event] ${event}:`, e);
        }
      });
    });
  }

  // 更新状态显示
  function updateStatus(message) {
    const timestamp = new Date().toLocaleTimeString();
    statusDisplay.textContent = `[${timestamp}] ${message}`;
  }

  // 更新屏幕类型显示
  function updateScreenType() {
    if (!ui) return;
    
    try {
      const responsiveManager = ui.getResponsiveManager();
      const screenType = responsiveManager.getCurrentScreenType();
      screenTypeDisplay.value = screenType;
    } catch (error) {
      screenTypeDisplay.value = '未知';
    }
  }

  // 主题控制
  function setupThemeControls() {
    const themeSelect = document.getElementById('theme-select');
    const primaryColorInput = document.getElementById('primary-color');
    const backgroundColorInput = document.getElementById('background-color');
    const textColorInput = document.getElementById('text-color');
    const applyThemeBtn = document.getElementById('apply-theme');
    const resetThemeBtn = document.getElementById('reset-theme');

    // 预设主题切换
    themeSelect.addEventListener('change', () => {
      if (!ui) return;
      
      try {
        const themeManager = ui.getThemeManager();
        themeManager.setTheme(themeSelect.value);
        
        // 同时更新UI组件的主题
        ui.updateTheme({});
        
        updateStatus(`🎨 切换到${themeSelect.options[themeSelect.selectedIndex].text}主题`);
      } catch (error) {
        updateStatus('❌ 主题切换失败: ' + error.message);
      }
    });

    // 自定义主题颜色
    applyThemeBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        const themeConfig = {
          primaryColor: primaryColorInput.value,
          backgroundColor: backgroundColorInput.value,
          textColor: textColorInput.value,
        };
        
        console.log('Applying theme:', themeConfig);
        ui.updateTheme(themeConfig);
        updateStatus('🎨 自定义主题已应用');
      } catch (error) {
        console.error('Theme application error:', error);
        updateStatus('❌ 主题应用失败: ' + error.message);
      }
    });

    // 重置主题
    resetThemeBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        ui.updateTheme({
          primaryColor: '#3b82f6',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          textColor: '#ffffff',
        });
        primaryColorInput.value = '#3b82f6';
        backgroundColorInput.value = '#000000';
        textColorInput.value = '#ffffff';
        updateStatus('🔄 主题已重置');
      } catch (error) {
        updateStatus('❌ 主题重置失败: ' + error.message);
      }
    });

    // 主题颜色预览
    document.querySelectorAll('.theme-color').forEach(colorEl => {
      colorEl.addEventListener('click', () => {
        const color = colorEl.dataset.color;
        primaryColorInput.value = color;
        updateStatus(`🎨 选择主题颜色: ${color}`);
      });
    });
  }

  // 组件控制
  function setupComponentControls() {
    const updateBtn = document.getElementById('update-components');
    const resetBtn = document.getElementById('reset-components');

    updateBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        const config = {
          playButton: document.getElementById('play-button').checked,
          progressBar: document.getElementById('progress-bar').checked,
          timeDisplay: document.getElementById('time-display').checked,
          volumeControl: document.getElementById('volume-control').checked,
          playbackRateControl: document.getElementById('playback-rate').checked,
          fullscreenButton: document.getElementById('fullscreen-button').checked,
        };

        console.log('Updating config:', config);
        ui.updateConfig(config);
        updateStatus('⚙️ 组件配置已更新');
      } catch (error) {
        console.error('Config update error:', error);
        updateStatus('❌ 组件更新失败: ' + error.message);
      }
    });

    resetBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        document.getElementById('play-button').checked = true;
        document.getElementById('progress-bar').checked = true;
        document.getElementById('time-display').checked = true;
        document.getElementById('volume-control').checked = true;
        document.getElementById('playback-rate').checked = true;
        document.getElementById('fullscreen-button').checked = true;

        ui.updateConfig({
          playButton: true,
          progressBar: true,
          timeDisplay: true,
          volumeControl: true,
          playbackRateControl: true,
          fullscreenButton: true,
        });
        updateStatus('🔄 组件配置已重置');
      } catch (error) {
        updateStatus('❌ 组件重置失败: ' + error.message);
      }
    });
  }

  // 响应式测试
  function setupResponsiveControls() {
    const detectBtn = document.getElementById('detect-screen');
    const responsiveButtons = document.querySelectorAll('.responsive-test button');

    detectBtn.addEventListener('click', () => {
      updateScreenType();
      updateStatus('📱 屏幕类型已检测');
    });

    responsiveButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const width = parseInt(btn.dataset.width);
        const height = parseInt(btn.dataset.height);
        
        // 模拟屏幕尺寸变化
        container.style.width = `${Math.min(width, 800)}px`;
        container.style.height = `${Math.min(height * 0.6, 450)}px`;
        
        // 触发resize事件
        window.dispatchEvent(new Event('resize'));
        
        setTimeout(() => {
          updateScreenType();
          updateStatus(`📱 模拟屏幕尺寸: ${width}x${height}`);
        }, 100);
      });
    });
  }

  // 功能测试
  function setupFunctionControls() {
    const showLoadingBtn = document.getElementById('show-loading');
    const hideLoadingBtn = document.getElementById('hide-loading');
    const toggleDebugBtn = document.getElementById('toggle-debug');
    const getStatusBtn = document.getElementById('get-status');
    const clearLogsBtn = document.getElementById('clear-logs');

    showLoadingBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        const uiManager = ui.getUIManager();
        uiManager.showLoading();
        updateStatus('⏳ 显示加载指示器');
      } catch (error) {
        updateStatus('❌ 显示加载失败: ' + error.message);
      }
    });

    hideLoadingBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        const uiManager = ui.getUIManager();
        uiManager.hideLoading();
        updateStatus('✅ 隐藏加载指示器');
      } catch (error) {
        updateStatus('❌ 隐藏加载失败: ' + error.message);
      }
    });

    toggleDebugBtn.addEventListener('click', () => {
      debugMode = !debugMode;
      updateStatus(`🐛 调试模式: ${debugMode ? '开启' : '关闭'}`);
    });

    getStatusBtn.addEventListener('click', () => {
      if (!ui || !player) return;
      
      try {
        const state = player.getState();
        const uiManager = ui.getUIManager();
        const themeManager = ui.getThemeManager();
        const responsiveManager = ui.getResponsiveManager();
        
        const status = {
          player: {
            currentTime: state.currentTime,
            duration: state.duration,
            paused: state.paused,
            volume: state.volume,
            muted: state.muted,
          },
          ui: {
            components: Array.from(uiManager.components?.keys() || []),
            theme: themeManager.getCurrentTheme().name,
            screenType: responsiveManager.getCurrentScreenType(),
          }
        };
        
        statusDisplay.textContent = JSON.stringify(status, null, 2);
        updateStatus('📊 状态信息已获取');
      } catch (error) {
        updateStatus('❌ 获取状态失败: ' + error.message);
      }
    });

    clearLogsBtn.addEventListener('click', () => {
      console.clear();
      updateStatus('🧹 控制台日志已清除');
    });
  }

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    setTimeout(updateScreenType, 100);
  });

  // 初始化所有功能
  // UI调试功能
  function setupDebugControls() {
    const testPlayOverlayBtn = document.getElementById('test-play-overlay');
    const testProgressThumbBtn = document.getElementById('test-progress-thumb');
    const testProgressDragBtn = document.getElementById('test-progress-drag');
    const testProgressClickBtn = document.getElementById('test-progress-click');
    const testVolumeDragBtn = document.getElementById('test-volume-drag');
    const testVolumeMuteBtn = document.getElementById('test-volume-mute');
    const inspectElementsBtn = document.getElementById('inspect-elements');
    const forceUpdateUIBtn = document.getElementById('force-update-ui');

    // 测试播放覆盖层
    testPlayOverlayBtn.addEventListener('click', () => {
      if (!ui || !player) return;
      
      try {
        updateStatus('🎬 测试播放覆盖层...');
        
        // 播放视频
        player.play().then(() => {
          updateStatus('视频开始播放');
          
          setTimeout(() => {
            player.pause();
            updateStatus('视频已暂停，检查覆盖层显示');
            
            // 检查覆盖层
            const overlay = document.querySelector('.ebin-play-overlay');
            if (overlay) {
              const rect = overlay.getBoundingClientRect();
              const containerRect = document.getElementById('player-container').getBoundingClientRect();
              
              const centerX = containerRect.left + containerRect.width / 2;
              const centerY = containerRect.top + containerRect.height / 2;
              const overlayX = rect.left + rect.width / 2;
              const overlayY = rect.top + rect.height / 2;
              
              const distance = Math.sqrt(Math.pow(centerX - overlayX, 2) + Math.pow(centerY - overlayY, 2));
              const isCentered = distance < 50;
              
              updateStatus(`覆盖层位置: 距离中心${Math.round(distance)}px, 是否居中: ${isCentered ? '是' : '否'}`);
              updateStatus(`覆盖层样式: opacity=${overlay.style.opacity}, display=${overlay.style.display}`);
              
              if (isCentered && overlay.style.opacity === '1') {
                updateStatus('✅ 播放覆盖层测试通过');
              } else {
                updateStatus('❌ 播放覆盖层测试失败');
              }
            } else {
              updateStatus('❌ 未找到覆盖层元素');
            }
          }, 1000);
        }).catch(error => {
          updateStatus('❌ 播放失败: ' + error.message);
        });
      } catch (error) {
        updateStatus('❌ 测试异常: ' + error.message);
      }
    });

    // 测试进度条thumb
    testProgressThumbBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        updateStatus('🎯 测试进度条thumb显示...');
        
        const progressContainer = document.querySelector('.ebin-progress-container');
        const thumb = document.querySelector('.ebin-progress-thumb');
        
        if (!progressContainer) {
          updateStatus('❌ 未找到进度条容器');
          return;
        }
        
        if (!thumb) {
          updateStatus('❌ 未找到thumb元素');
          return;
        }
        
        updateStatus(`thumb初始状态: opacity=${thumb.style.opacity}, pointerEvents=${thumb.style.pointerEvents}`);
        
        // 模拟鼠标悬停
        const mouseEnterEvent = new MouseEvent('mouseenter', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        progressContainer.dispatchEvent(mouseEnterEvent);
        
        setTimeout(() => {
          const opacity = thumb.style.opacity;
          const pointerEvents = thumb.style.pointerEvents;
          
          updateStatus(`悬停后状态: opacity=${opacity}, pointerEvents=${pointerEvents}`);
          
          if (opacity === '1' && pointerEvents === 'auto') {
            updateStatus('✅ 进度条thumb显示测试通过');
          } else {
            updateStatus('❌ 进度条thumb显示测试失败');
          }
        }, 100);
        
      } catch (error) {
        updateStatus('❌ 测试异常: ' + error.message);
      }
    });

    // 测试进度条拖动
    testProgressDragBtn.addEventListener('click', () => {
      if (!ui || !player) return;
      
      try {
        updateStatus('🖱️ 测试进度条拖动...');
        
        const progressContainer = document.querySelector('.ebin-progress-container');
        const thumb = document.querySelector('.ebin-progress-thumb');
        
        if (!progressContainer || !thumb) {
          updateStatus('❌ 未找到进度条或thumb元素');
          return;
        }
        
        const rect = progressContainer.getBoundingClientRect();
        const startX = rect.left + rect.width * 0.3;
        const endX = rect.left + rect.width * 0.7;
        
        const currentTime = player.getCurrentTime();
        updateStatus(`拖动前时间: ${Math.round(currentTime)}s`);
        
        // 模拟拖拽
        const mouseDownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: startX,
          clientY: rect.top + rect.height / 2
        });
        
        const mouseMoveEvent = new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX: endX,
          clientY: rect.top + rect.height / 2
        });
        
        const mouseUpEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: endX,
          clientY: rect.top + rect.height / 2
        });
        
        thumb.dispatchEvent(mouseDownEvent);
        setTimeout(() => {
          thumb.dispatchEvent(mouseMoveEvent);
          setTimeout(() => {
            thumb.dispatchEvent(mouseUpEvent);
            
            setTimeout(() => {
              const newTime = player.getCurrentTime();
              updateStatus(`拖动后时间: ${Math.round(newTime)}s`);
              
              if (Math.abs(newTime - currentTime) > 1) {
                updateStatus('✅ 进度条拖动测试通过');
              } else {
                updateStatus('❌ 进度条拖动测试失败 - 时间未改变');
              }
            }, 100);
          }, 50);
        }, 50);
        
      } catch (error) {
        updateStatus('❌ 测试异常: ' + error.message);
      }
    });

    // 测试进度条点击
    testProgressClickBtn.addEventListener('click', () => {
      if (!ui || !player) return;
      
      try {
        updateStatus('👆 测试进度条点击...');
        
        const progressContainer = document.querySelector('.ebin-progress-container');
        
        if (!progressContainer) {
          updateStatus('❌ 未找到进度条容器');
          return;
        }
        
        const rect = progressContainer.getBoundingClientRect();
        const clickX = rect.left + rect.width * 0.5;
        const clickY = rect.top + rect.height / 2;
        
        const currentTime = player.getCurrentTime();
        updateStatus(`点击前时间: ${Math.round(currentTime)}s`);
        
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: clickX,
          clientY: clickY
        });
        
        progressContainer.dispatchEvent(clickEvent);
        
        setTimeout(() => {
          const newTime = player.getCurrentTime();
          updateStatus(`点击后时间: ${Math.round(newTime)}s`);
          
          if (Math.abs(newTime - currentTime) > 1) {
            updateStatus('✅ 进度条点击测试通过');
          } else {
            updateStatus('❌ 进度条点击测试失败 - 时间未改变');
          }
        }, 100);
        
      } catch (error) {
        updateStatus('❌ 测试异常: ' + error.message);
      }
    });

    // 测试音量拖动
    testVolumeDragBtn.addEventListener('click', () => {
      if (!ui || !player) return;
      
      try {
        updateStatus('🔊 测试音量拖动...');
        
        const volumeSlider = document.querySelector('.ebin-volume-slider');
        const volumeButton = document.querySelector('.ebin-volume-button');
        
        if (!volumeSlider || !volumeButton) {
          updateStatus('❌ 未找到音量控制元素');
          return;
        }
        
        const currentVolume = player.getVolume();
        updateStatus(`当前音量: ${Math.round(currentVolume * 100)}%`);
        
        // 模拟鼠标悬停显示滑块
        const mouseEnterEvent = new MouseEvent('mouseenter', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        volumeButton.dispatchEvent(mouseEnterEvent);
        
        setTimeout(() => {
          const opacity = volumeSlider.style.opacity;
          updateStatus(`滑块显示状态: opacity=${opacity}`);
          
          if (opacity === '1') {
            // 检查滑块位置
            const buttonRect = volumeButton.getBoundingClientRect();
            const sliderRect = volumeSlider.getBoundingClientRect();
            
            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            const sliderCenterX = sliderRect.left + sliderRect.width / 2;
            const positionDiff = Math.abs(buttonCenterX - sliderCenterX);
            
            updateStatus(`按钮中心X: ${Math.round(buttonCenterX)}px`);
            updateStatus(`滑块中心X: ${Math.round(sliderCenterX)}px`);
            updateStatus(`位置偏差: ${Math.round(positionDiff)}px`);
            
            if (positionDiff < 10) {
              updateStatus('✅ 音量滑块位置正确');
            } else {
              updateStatus('⚠️ 音量滑块位置可能有偏差');
            }
            
            updateStatus('✅ 音量滑块显示测试通过');
            updateStatus('💡 现在可以手动拖动滑块测试音量调节');
          } else {
            updateStatus('❌ 音量滑块显示测试失败');
          }
        }, 100);
        
      } catch (error) {
        updateStatus('❌ 测试异常: ' + error.message);
      }
    });

    // 测试音量静音
    testVolumeMuteBtn.addEventListener('click', () => {
      if (!ui || !player) return;
      
      try {
        updateStatus('🔇 测试音量静音...');
        
        const volumeButton = document.querySelector('.ebin-volume-button');
        
        if (!volumeButton) {
          updateStatus('❌ 未找到音量按钮');
          return;
        }
        
        const currentVolume = player.getVolume();
        const isMuted = player.getMuted();
        
        updateStatus(`静音前: 音量=${Math.round(currentVolume * 100)}%, 静音=${isMuted}`);
        
        // 模拟点击静音按钮
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        volumeButton.dispatchEvent(clickEvent);
        
        setTimeout(() => {
          const newVolume = player.getVolume();
          const newMuted = player.getMuted();
          
          updateStatus(`静音后: 音量=${Math.round(newVolume * 100)}%, 静音=${newMuted}`);
          
          if (newMuted && newVolume === 0) {
            updateStatus('✅ 静音功能测试通过');
            
            // 再次点击测试取消静音
            setTimeout(() => {
              volumeButton.dispatchEvent(clickEvent);
              
              setTimeout(() => {
                const restoredVolume = player.getVolume();
                const restoredMuted = player.getMuted();
                
                updateStatus(`取消静音后: 音量=${Math.round(restoredVolume * 100)}%, 静音=${restoredMuted}`);
                
                if (!restoredMuted && restoredVolume > 0) {
                  updateStatus('✅ 取消静音功能测试通过');
                } else {
                  updateStatus('❌ 取消静音功能测试失败');
                }
              }, 100);
            }, 1000);
          } else {
            updateStatus('❌ 静音功能测试失败');
          }
        }, 100);
        
      } catch (error) {
        updateStatus('❌ 测试异常: ' + error.message);
      }
    });

    // 检查UI元素
    inspectElementsBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        updateStatus('🔍 检查UI元素...');
        
        const elements = {
          '播放按钮': document.querySelector('.ebin-play-button'),
          '播放覆盖层': document.querySelector('.ebin-play-overlay'),
          '进度条容器': document.querySelector('.ebin-progress-container'),
          '进度条thumb': document.querySelector('.ebin-progress-thumb'),
          '进度条': document.querySelector('.ebin-progress-bar'),
          '时间显示': document.querySelector('.ebin-time-display'),
          '音量控制': document.querySelector('.ebin-volume-control'),
          '音量按钮': document.querySelector('.ebin-volume-button'),
          '音量滑块': document.querySelector('.ebin-volume-slider'),
          '全屏按钮': document.querySelector('.ebin-fullscreen-button'),
        };
        
        let report = 'UI元素检查报告:\n';
        Object.entries(elements).forEach(([name, element]) => {
          if (element) {
            const rect = element.getBoundingClientRect();
            const styles = window.getComputedStyle(element);
            report += `✅ ${name}: 存在, 位置(${Math.round(rect.left)}, ${Math.round(rect.top)}), 大小(${Math.round(rect.width)}x${Math.round(rect.height)}), opacity=${styles.opacity}\n`;
          } else {
            report += `❌ ${name}: 不存在\n`;
          }
        });
        
        updateStatus(report);
        
      } catch (error) {
        updateStatus('❌ 检查异常: ' + error.message);
      }
    });

    // 强制更新UI
    forceUpdateUIBtn.addEventListener('click', () => {
      if (!ui) return;
      
      try {
        updateStatus('🔄 强制更新UI...');
        
        // 重新创建UI
        ui.destroy();
        
        setTimeout(() => {
          ui = new window.EbinPlayer.ImprovedDefaultUI(
            player,
            document.getElementById('player-container'),
            {
              playButton: true,
              progressBar: true,
              timeDisplay: true,
              volumeControl: true,
              fullscreenButton: true,
            },
            {
              primaryColor: '#3b82f6',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              textColor: '#ffffff',
            }
          );
          
          window.ui = ui;
          updateStatus('✅ UI已重新创建');
        }, 100);
        
      } catch (error) {
        updateStatus('❌ 更新异常: ' + error.message);
      }
    });
  }

  function init() {
    try {
      initPlayer();
      setupThemeControls();
      setupComponentControls();
      setupResponsiveControls();
      setupFunctionControls();
      setupDebugControls();
      
      updateStatus('🚀 Demo初始化完成，可以开始测试各种功能');
    } catch (error) {
      updateStatus('❌ Demo初始化失败: ' + error.message);
      console.error('Demo初始化失败:', error);
    }
  }

  // 启动
  init();

  // 暴露到全局，方便调试
  window.player = player;
  window.ui = ui;
  window.debugMode = () => debugMode;
});
