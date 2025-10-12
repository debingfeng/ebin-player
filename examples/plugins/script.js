// 插件开发示例
document.addEventListener('DOMContentLoaded', function() {
    // 自定义插件示例
    class CustomPlugin extends EbinPlayer.BasePlugin {
        meta = {
            id: 'custom-plugin',
            name: '自定义插件',
            version: '1.0.0',
            description: '演示如何创建自定义插件',
            author: 'EbinPlayer Team'
        };
        
        defaultConfig = {
            enabled: true,
            showNotifications: true,
            customMessage: 'Hello from Custom Plugin!'
        };
        
        onInit(ctx) {
            this.ctx = ctx;
            this.logger = ctx.logger;
            this.logger.info('自定义插件初始化');
            
            // 注册服务
            ctx.registerService('customService', {
                getMessage: () => this.config.customMessage,
                showNotification: (message) => {
                    if (this.config.showNotifications) {
                        this.showNotification(message);
                    }
                }
            });
            
            // 监听播放器事件
            this.on('play', () => {
                this.logger.info('播放器开始播放');
                this.showNotification('视频开始播放');
            });
            
            this.on('pause', () => {
                this.logger.info('播放器暂停');
                this.showNotification('视频暂停');
            });
            
            return {
                message: 'Custom Plugin initialized',
                version: this.meta.version
            };
        }
        
        onStart(ctx) {
            this.logger.info('自定义插件启动');
            this.updatePluginStatus('active');
        }
        
        onConfigChange(newConfig, ctx) {
            this.logger.info('插件配置变更:', newConfig);
            this.config = { ...this.config, ...newConfig };
        }
        
        onDestroy(ctx) {
            this.logger.info('自定义插件销毁');
            this.updatePluginStatus('inactive');
        }
        
        showNotification(message) {
            // 创建通知元素
            const notification = document.createElement('div');
            notification.className = 'plugin-notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #007bff;
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
            `;
            
            document.body.appendChild(notification);
            
            // 3秒后移除
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
        
        updatePluginStatus(status) {
            const statusElement = document.getElementById('plugin-status');
            if (statusElement) {
                const indicator = statusElement.querySelector('.plugin-status-indicator');
                if (indicator) {
                    indicator.className = `plugin-status-indicator ${status}`;
                }
            }
        }
    }
    
    // 初始化播放器
    const player = new PlayerInstance(document.getElementById('plugin-player'), {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        width: 800,
        height: 450,
        autoplay: false,
        controls: true,
        preload: 'metadata',
        plugins: {
            playbackRate: {
                rates: [0.5, 0.75, 1, 1.25, 1.5, 2]
            }
        }
    });
    
    // 获取DOM元素
    const playbackRateSelect = document.getElementById('playback-rate');
    const toggleCustomPluginBtn = document.getElementById('toggle-custom-plugin');
    const customPluginActionBtn = document.getElementById('custom-plugin-action');
    const loadedPluginsSpan = document.getElementById('loaded-plugins');
    const activePluginsSpan = document.getElementById('active-plugins');
    
    // 插件状态
    let customPlugin = null;
    let customPluginEnabled = false;
    
    // 播放速度控制
    playbackRateSelect.addEventListener('change', (e) => {
        const rate = parseFloat(e.target.value);
        player.setPlaybackRate(rate);
    });
    
    // 自定义插件控制
    toggleCustomPluginBtn.addEventListener('click', () => {
        if (!customPluginEnabled) {
            // 启用自定义插件
            customPlugin = new CustomPlugin();
            player.use(customPlugin, {
                enabled: true,
                showNotifications: true,
                customMessage: '自定义插件已启用！'
            });
            customPluginEnabled = true;
            toggleCustomPluginBtn.textContent = '禁用自定义插件';
            toggleCustomPluginBtn.style.background = '#dc3545';
        } else {
            // 禁用自定义插件
            if (customPlugin) {
                player.unuse('custom-plugin');
                customPlugin = null;
            }
            customPluginEnabled = false;
            toggleCustomPluginBtn.textContent = '启用自定义插件';
            toggleCustomPluginBtn.style.background = '#007bff';
        }
        updatePluginCounts();
    });
    
    // 自定义插件操作
    customPluginActionBtn.addEventListener('click', () => {
        if (customPlugin) {
            const service = player.pluginManager.getService('customService');
            if (service) {
                service.showNotification('这是来自自定义插件的通知！');
            }
        } else {
            alert('请先启用自定义插件');
        }
    });
    
    // 更新插件计数
    function updatePluginCounts() {
        const loadedPlugins = player.pluginManager.getPluginIds();
        loadedPluginsSpan.textContent = loadedPlugins.length;
        
        // 计算活跃插件（这里简化处理）
        const activeCount = loadedPlugins.filter(id => {
            const plugin = player.pluginManager.getPlugin(id);
            return plugin && plugin.meta;
        }).length;
        activePluginsSpan.textContent = activeCount;
    }
    
    // 代码示例
    const customPluginCode = `class CustomPlugin extends EbinPlayer.BasePlugin {
    meta = {
        id: 'custom-plugin',
        name: '自定义插件',
        version: '1.0.0',
        description: '演示如何创建自定义插件',
        author: 'EbinPlayer Team'
    };
    
    defaultConfig = {
        enabled: true,
        showNotifications: true,
        customMessage: 'Hello from Custom Plugin!'
    };
    
    onInit(ctx) {
        this.ctx = ctx;
        this.logger = ctx.logger;
        
        // 注册服务
        ctx.registerService('customService', {
            getMessage: () => this.config.customMessage,
            showNotification: (message) => {
                if (this.config.showNotifications) {
                    this.showNotification(message);
                }
            }
        });
        
        // 监听播放器事件
        this.on('play', () => {
            this.logger.info('播放器开始播放');
            this.showNotification('视频开始播放');
        });
        
        return {
            message: 'Custom Plugin initialized',
            version: this.meta.version
        };
    }
    
    onStart(ctx) {
        this.logger.info('自定义插件启动');
    }
    
    onConfigChange(newConfig, ctx) {
        this.config = { ...this.config, ...newConfig };
    }
    
    onDestroy(ctx) {
        this.logger.info('自定义插件销毁');
    }
}`;

    const pluginUsageCode = `// 使用插件
const player = new PlayerInstance(container, {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    plugins: {
        // 内置插件
        playbackRate: {
            rates: [0.5, 1, 1.25, 1.5, 2]
        },
        // 自定义插件
        'custom-plugin': {
            enabled: true,
            showNotifications: true,
            customMessage: 'Hello World!'
        }
    }
});

// 动态添加插件
const customPlugin = new CustomPlugin();
player.use(customPlugin, {
    enabled: true,
    showNotifications: true
});

// 移除插件
player.unuse('custom-plugin');

// 获取插件
const plugin = player.getPlugin('custom-plugin');

// 获取插件服务
const service = player.pluginManager.getService('customService');
if (service) {
    service.showNotification('Hello from service!');
}`;

    const pluginApiCode = `// 插件上下文 API
class MyPlugin extends EbinPlayer.BasePlugin {
    onInit(ctx) {
        // 播放器实例
        const player = ctx.player;
        
        // 日志记录器
        const logger = ctx.logger;
        
        // 事件监听
        const removeListener = ctx.on('play', (event) => {
            logger.info('播放事件:', event);
        });
        
        // 移除事件监听
        removeListener();
        
        // 插件事件
        ctx.onPluginEvent('other-plugin', 'custom-event', (data) => {
            logger.info('收到插件事件:', data);
        });
        
        ctx.emitPluginEvent('my-plugin', 'my-event', { message: 'Hello' });
        
        // 服务注册和获取
        ctx.registerService('myService', {
            doSomething: () => 'Hello from service'
        });
        
        const service = ctx.getService('myService');
        
        // 配置管理
        const config = ctx.getConfig();
        ctx.setConfig({ newOption: 'value' });
        
        // 数据存储
        ctx.storage.set('key', 'value');
        const value = ctx.storage.get('key');
        ctx.storage.delete('key');
        const keys = ctx.storage.keys();
        
        // 权限检查
        if (ctx.hasPermission('video-control')) {
            // 执行需要权限的操作
        }
    }
}`;

    // 设置代码内容
    document.getElementById('custom-plugin-code').textContent = customPluginCode;
    document.getElementById('plugin-usage-code').textContent = pluginUsageCode;
    document.getElementById('plugin-api-code').textContent = pluginApiCode;
    
    // 标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // 移除所有active类
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // 添加active类
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .plugin-notification {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);
    
    // 初始化插件计数
    updatePluginCounts();
    
    // 播放器事件监听
    player.on('play', () => {
        console.log('播放器开始播放');
    });
    
    player.on('pause', () => {
        console.log('播放器暂停');
    });
    
    player.on('error', (event) => {
        console.error('播放器错误:', event.error);
    });
    
    // 导出到全局，方便调试
    window.player = player;
    window.CustomPlugin = CustomPlugin;
    console.log('插件开发示例已初始化，可通过 window.player 和 window.CustomPlugin 访问');
});
