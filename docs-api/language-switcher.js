/**
 * Language Switcher for EbinPlayer Documentation
 * Provides seamless switching between Chinese and English documentation
 */

class LanguageSwitcher {
    constructor() {
        this.currentLang = this.getStoredLanguage() || this.detectLanguage();
        this.init();
    }

    init() {
        this.createSwitcher();
        this.updateContent();
        this.bindEvents();
    }

    getStoredLanguage() {
        return localStorage.getItem('ebin-player-lang');
    }

    setStoredLanguage(lang) {
        localStorage.setItem('ebin-player-lang', lang);
    }

    detectLanguage() {
        const path = window.location.pathname;
        if (path.includes('/en/')) {
            return 'en';
        }
        return 'zh';
    }

    createSwitcher() {
        // Create language switcher HTML
        const switcherHTML = `
            <div class="language-switcher">
                <div class="switcher-container">
                    <button class="lang-btn ${this.currentLang === 'zh' ? 'active' : ''}" data-lang="zh">
                        <span class="flag">🇨🇳</span>
                        <span class="text">中文</span>
                    </button>
                    <button class="lang-btn ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">
                        <span class="flag">🇺🇸</span>
                        <span class="text">English</span>
                    </button>
                </div>
            </div>
        `;

        // Add CSS styles
        const styles = `
            <style>
                .language-switcher {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .switcher-container {
                    display: flex;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border: 1px solid #e1e5e9;
                }
                
                .lang-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    color: #666;
                }
                
                .lang-btn:hover {
                    background: #f8f9fa;
                }
                
                .lang-btn.active {
                    background: #007bff;
                    color: white;
                }
                
                .lang-btn .flag {
                    font-size: 16px;
                }
                
                .lang-btn .text {
                    font-weight: 500;
                }
                
                @media (max-width: 768px) {
                    .language-switcher {
                        top: 10px;
                        right: 10px;
                    }
                    
                    .lang-btn {
                        padding: 6px 8px;
                        font-size: 12px;
                    }
                    
                    .lang-btn .text {
                        display: none;
                    }
                }
            </style>
        `;

        // Insert styles and switcher
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.insertAdjacentHTML('afterbegin', switcherHTML);
    }

    bindEvents() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                this.switchLanguage(lang);
            });
        });
    }

    switchLanguage(lang) {
        if (lang === this.currentLang) return;

        this.currentLang = lang;
        this.setStoredLanguage(lang);
        this.updateContent();
        this.updateSwitcherUI();
    }

    updateSwitcherUI() {
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });
    }

    updateContent() {
        const path = window.location.pathname;
        const isEnglish = this.currentLang === 'en';
        
        // Update page title
        this.updatePageTitle(isEnglish);
        
        // Update navigation
        this.updateNavigation(isEnglish);
        
        // Update content based on current page
        this.updatePageContent(path, isEnglish);
    }

    updatePageTitle(isEnglish) {
        const titles = {
            zh: {
                'README.md': 'EbinPlayer 文档',
                'installation.md': '安装指南',
                'quick-start.md': '快速开始',
                'basic-player.md': '基础播放器示例'
            },
            en: {
                'README.md': 'EbinPlayer Documentation',
                'installation.md': 'Installation Guide',
                'quick-start.md': 'Quick Start Guide',
                'basic-player.md': 'Basic Player Example'
            }
        };

        const currentFile = this.getCurrentFileName();
        const titleMap = titles[isEnglish ? 'en' : 'zh'];
        
        if (titleMap[currentFile]) {
            document.title = titleMap[currentFile];
        }
    }

    updateNavigation(isEnglish) {
        // Update any navigation elements
        const navElements = document.querySelectorAll('[data-lang]');
        navElements.forEach(el => {
            const key = el.dataset.lang;
            const text = isEnglish ? this.getEnglishText(key) : this.getChineseText(key);
            if (text) {
                el.textContent = text;
            }
        });
    }

    updatePageContent(path, isEnglish) {
        // If we're on a Chinese page and switching to English, redirect
        if (!isEnglish && path.includes('/en/')) {
            const newPath = path.replace('/en/', '/');
            window.location.href = newPath;
            return;
        }
        
        // If we're on a Chinese page and switching to English, redirect
        if (isEnglish && !path.includes('/en/') && !path.includes('/api/')) {
            const newPath = path.replace('/docs/', '/docs/en/');
            window.location.href = newPath;
            return;
        }

        // Update dynamic content
        this.updateDynamicContent(isEnglish);
    }

    updateDynamicContent(isEnglish) {
        const contentMap = {
            'page-title': {
                zh: 'EbinPlayer 文档',
                en: 'EbinPlayer Documentation'
            },
            'nav-home': {
                zh: '首页',
                en: 'Home'
            },
            'nav-examples': {
                zh: '示例',
                en: 'Examples'
            },
            'nav-api': {
                zh: 'API 参考',
                en: 'API Reference'
            },
            'nav-guides': {
                zh: '指南',
                en: 'Guides'
            }
        };

        Object.keys(contentMap).forEach(key => {
            const elements = document.querySelectorAll(`[data-key="${key}"]`);
            elements.forEach(el => {
                el.textContent = contentMap[key][isEnglish ? 'en' : 'zh'];
            });
        });
    }

    getCurrentFileName() {
        const path = window.location.pathname;
        const parts = path.split('/');
        return parts[parts.length - 1] || 'README.md';
    }

    getEnglishText(key) {
        const texts = {
            'home': 'Home',
            'examples': 'Examples',
            'api': 'API Reference',
            'guides': 'Guides',
            'installation': 'Installation',
            'quick-start': 'Quick Start',
            'basic-player': 'Basic Player',
            'play': 'Play',
            'pause': 'Pause',
            'mute': 'Mute',
            'unmute': 'Unmute',
            'fullscreen': 'Fullscreen',
            'volume': 'Volume',
            'status': 'Status',
            'current-time': 'Current Time',
            'duration': 'Duration',
            'playback-rate': 'Playback Rate'
        };
        return texts[key] || key;
    }

    getChineseText(key) {
        const texts = {
            'home': '首页',
            'examples': '示例',
            'api': 'API 参考',
            'guides': '指南',
            'installation': '安装指南',
            'quick-start': '快速开始',
            'basic-player': '基础播放器',
            'play': '播放',
            'pause': '暂停',
            'mute': '静音',
            'unmute': '取消静音',
            'fullscreen': '全屏',
            'volume': '音量',
            'status': '状态',
            'current-time': '当前时间',
            'duration': '总时长',
            'playback-rate': '播放速度'
        };
        return texts[key] || key;
    }
}

// Initialize language switcher when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LanguageSwitcher();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
}
