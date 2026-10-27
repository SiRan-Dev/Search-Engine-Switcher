// ==UserScript==
// @name         Search Engine Switcher
// @namespace    https://github.com/EchoRan6319/Search-Engine-Switcher
// @version      2.6.0
// @description  快捷搜索引擎切换器：支持新增、删除、排序、位置自定义
// @author       EchoRan6319
// @license      MIT
// @homepageURL  https://github.com/SiRan-Dev/Search-Engine-Switcher
// @supportURL   https://github.com/SiRan-Dev/Search-Engine-Switcher/issues
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @noframes
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  if (window !== window.top) return;

  const STORAGE_KEY = 'search_engine_switcher_config_v1';
  const VERSION_KEY = 'search_engine_switcher_version';
  const CURRENT_VERSION = '2.6.0';
  const PRESET_VERSION = 2;
  const STYLE_ID = 'search-engine-switcher-style';
  const ROOT_ID = 'search-engine-switcher-root';
  const PANEL_ID = 'search-engine-switcher-panel';

  const DEFAULT_CONFIG = {
    presetVersion: PRESET_VERSION,
    engines: [
      // ========== 国外传统搜索引擎 ==========
      {
        id: 'google',
        name: 'Google',
        searchUrl: 'https://www.google.com/search?q={q}',
        hosts: ['google.', 'www.google.'],
        hidden: false
      },
      {
        id: 'bing',
        name: 'Bing',
        searchUrl: 'https://www.bing.com/search?q={q}',
        hosts: ['bing.com', 'www.bing.com', 'cn.bing.com'],
        hidden: false
      },
      {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        searchUrl: 'https://duckduckgo.com/?q={q}',
        hosts: ['duckduckgo.com'],
        hidden: false
      },
      {
        id: 'brave',
        name: 'Brave',
        searchUrl: 'https://search.brave.com/search?q={q}',
        hosts: ['search.brave.com'],
        hidden: false
      },
      {
        id: 'yandex',
        name: 'Yandex',
        searchUrl: 'https://yandex.com/search/?text={q}&from=browser',
        hosts: ['yandex.'],
        hidden: false
      },
      // ========== 国内传统搜索引擎 ==========
      {
        id: 'baidu',
        name: '百度',
        searchUrl: 'https://www.baidu.com/s?wd={q}',
        hosts: ['baidu.com', 'www.baidu.com'],
        hidden: false
      },
      {
        id: 'sogou',
        name: '搜狗',
        searchUrl: 'https://www.sogou.com/web?query={q}',
        hosts: ['sogou.com'],
        hidden: true
      },
      {
        id: '360',
        name: '360搜索',
        searchUrl: 'https://www.so.com/s?q={q}',
        hosts: ['so.com'],
        hidden: true
      },
      // ========== 国外AI大模型 ==========
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        searchUrl: 'https://chatgpt.com/?hints=search&q={q}',
        hosts: ['chatgpt.com', 'chat.openai.com'],
        hidden: true
      },
      {
        id: 'gemini',
        name: 'Gemini',
        searchUrl: 'https://gemini.google.com/app?q={q}',
        hosts: ['gemini.google.com'],
        hidden: true
      },
      {
        id: 'perplexity',
        name: 'Perplexity',
        searchUrl: 'https://www.perplexity.ai/search?q={q}',
        hosts: ['perplexity.ai'],
        hidden: true
      },
      // ========== 国内AI大模型 ==========
      {
        id: 'qianwen',
        name: '千问',
        searchUrl: 'https://www.qianwen.com/?q={q}',
        hosts: ['qianwen.com', 'www.qianwen.com'],
        hidden: true
      },
      {
        id: 'doubao',
        name: '豆包',
        searchUrl: 'https://www.doubao.com/chat/?q={q}',
        hosts: ['doubao.com'],
        hidden: true
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        searchUrl: 'https://chat.deepseek.com/?q={q}&autosend=1&search=1',
        hosts: ['chat.deepseek.com'],
        hidden: true
      },
      {
        id: 'kimi',
        name: 'Kimi',
        searchUrl: 'https://www.kimi.com/?q={q}',
        hosts: ['kimi.com', 'www.kimi.com', 'kimi.moonshot.cn', 'kimi.ai', 'www.kimi.ai'],
        hidden: true
      },
      {
        id: 'metaso',
        name: '秘塔AI',
        searchUrl: 'https://metaso.cn/?q={q}',
        hosts: ['metaso.cn'],
        // 秘塔提交时用 q，但结果页会重定向为 /search/<id>?question=xxx
        queryKeys: ['question'],
        hidden: true
      },
      // ========== 国外社交/社区 ==========
      {
        id: 'youtube',
        name: 'YouTube',
        searchUrl: 'https://www.youtube.com/results?search_query={q}',
        hosts: ['youtube.com', 'm.youtube.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'github',
        name: 'GitHub',
        searchUrl: 'https://github.com/search?q={q}&type=repositories',
        hosts: ['github.com'],
        hidden: true,
        disableWidget: true
      },
      // ========== 国内社交/社区 ==========
      {
        id: 'bilibili',
        name: '哔哩哔哩',
        searchUrl: 'https://search.bilibili.com/all?keyword={q}',
        hosts: ['search.bilibili.com', 'bilibili.com', 'www.bilibili.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'zhihu',
        name: '知乎',
        searchUrl: 'https://www.zhihu.com/search?type=content&q={q}',
        hosts: ['zhihu.com', 'www.zhihu.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'xiaohongshu',
        name: '小红书',
        searchUrl: 'https://www.xiaohongshu.com/search_result/?keyword={q}',
        hosts: ['xiaohongshu.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'douyin',
        name: '抖音',
        searchUrl: 'https://www.douyin.com/search/{q}',
        hosts: ['douyin.com', 'www.douyin.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'weixin',
        name: '微信',
        searchUrl: 'https://weixin.sogou.com/weixin?type=2&s_from=input&query={q}',
        hosts: ['weixin.sogou.com'],
        hidden: true,
        disableWidget: true
      }
    ],
    ui: {
      enabled: true,
      vertical: 'bottom',
      align: 'center',
      offsetX: 16,
      offsetY: 16,
      useCustomXY: false,
      customX: 16,
      customY: 16,
      showWhenNoQuery: false,
      selectionTrigger: 'engine',
      openInNewTab: false,
      theme: 'auto'
    }
  };

  const safeGMGet = (key, fallback) => {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(key, fallback);
      const v = localStorage.getItem(key);
      return v == null ? fallback : v;
    } catch (_) {
      return fallback;
    }
  };

  const safeGMSet = (key, value) => {
    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (_) {
      // ignore
    }
  };

  const uid = () => `se_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const toNumber = (value, fallback) => {
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  // 旧版预设值 → 新版预设值的迁移表。
  // 只有用户配置里的值“完全等于某个历史默认值”时才迁移，用户手动改过的 URL/域名不会被覆盖。
  const PRESET_MIGRATIONS = {
    // v2.6.0：Kimi 域名迁移（kimi.moonshot.cn → kimi.com / kimi.ai）
    kimi: {
      urls: ['https://kimi.moonshot.cn/?q={q}'],
      hosts: [['kimi.moonshot.cn']]
    },
    // v2.6.0：DeepSeek 原生支持自动发送/联网参数
    deepseek: {
      urls: ['https://chat.deepseek.com/?q={q}']
    },
    // v2.6.0：Perplexity 直接进入结果页
    perplexity: {
      urls: ['https://www.perplexity.ai/?q={q}']
    },
    // v2.6.0：GitHub 显式指定仓库搜索
    github: {
      urls: ['https://github.com/search?q={q}']
    },
    // v2.6.0：知乎默认落到“综合”标签页
    zhihu: {
      urls: ['https://www.zhihu.com/search?q={q}']
    },
    // v2.6.0：小红书规范化带尾斜杠，省一次 301
    xiaohongshu: {
      urls: ['https://www.xiaohongshu.com/search_result?keyword={q}']
    },
    // v2.6.0：ChatGPT 补充旧域名
    chatgpt: {
      hosts: [['chatgpt.com']]
    },
    // v2.4.0 之前的历史值：通义千问已迁移为 qianwen.com
    qianwen: {
      urls: ['https://tongyi.aliyun.com/qianwen/?q={q}', 'https://tongyi.aliyun.com/qianwen?q={q}'],
      hosts: [['tongyi.aliyun.com']]
    }
  };

  function migratePresets(cfg) {
    const storedVersion = toNumber(cfg.presetVersion, 0);
    if (storedVersion >= PRESET_VERSION) return false;

    const presets = new Map(DEFAULT_CONFIG.engines.map((engine) => [engine.id, engine]));
    for (const engine of cfg.engines) {
      const preset = presets.get(engine.id);
      if (!preset) continue;
      const migration = PRESET_MIGRATIONS[engine.id];

      if (migration) {
        if (Array.isArray(migration.urls) && migration.urls.includes(engine.searchUrl)) {
          engine.searchUrl = preset.searchUrl;
        }
        if (
          Array.isArray(migration.hosts) &&
          migration.hosts.some(
            (hosts) => hosts.length === engine.hosts.length && hosts.every((host, i) => host === engine.hosts[i])
          )
        ) {
          engine.hosts = preset.hosts.slice();
        }
      }

      // 旧版本没有 queryKeys 字段，用户不可能自定义过，可安全补全（见预设引擎的结果页参数差异，如秘塔 q → question）
      if (
        Array.isArray(preset.queryKeys) &&
        preset.queryKeys.length &&
        (!Array.isArray(engine.queryKeys) || engine.queryKeys.length === 0)
      ) {
        engine.queryKeys = preset.queryKeys.slice();
      }
    }
    cfg.presetVersion = PRESET_VERSION;
    return true;
  }

  function mergeConfig(raw) {
    const cfg = deepClone(DEFAULT_CONFIG);
    if (!raw || typeof raw !== 'object') return cfg;

    if (Array.isArray(raw.engines) && raw.engines.length > 0) {
      cfg.engines = raw.engines
        .map((e) => ({
          id: String(e.id || uid()),
          name: String(e.name || '').trim(),
          searchUrl: String(e.searchUrl || '').trim(),
          hosts: Array.isArray(e.hosts) ? e.hosts.map((h) => String(h).trim()).filter(Boolean) : [],
          queryKeys: Array.isArray(e.queryKeys)
            ? e.queryKeys.map((key) => String(key).trim()).filter(Boolean)
            : [],
          hidden: !!e.hidden,
          disableWidget: !!e.disableWidget
        }))
        .filter((e) => e.name && e.searchUrl.includes('{q}'));
      if (cfg.engines.length === 0) cfg.engines = deepClone(DEFAULT_CONFIG.engines);
    }

    if (raw.ui && typeof raw.ui === 'object') {
      cfg.ui.enabled = raw.ui.enabled !== false;
      cfg.ui.vertical = raw.ui.vertical === 'top' ? 'top' : 'bottom';
      cfg.ui.align = ['left', 'center', 'right'].includes(raw.ui.align) ? raw.ui.align : 'center';
      cfg.ui.offsetX = toNumber(raw.ui.offsetX, cfg.ui.offsetX);
      cfg.ui.offsetY = toNumber(raw.ui.offsetY, cfg.ui.offsetY);
      cfg.ui.useCustomXY = !!raw.ui.useCustomXY;
      cfg.ui.customX = toNumber(raw.ui.customX, cfg.ui.customX);
      cfg.ui.customY = toNumber(raw.ui.customY, cfg.ui.customY);
      cfg.ui.showWhenNoQuery = raw.ui.showWhenNoQuery === true;
      cfg.ui.selectionTrigger = ['off', 'engine', 'global'].includes(raw.ui.selectionTrigger)
        ? raw.ui.selectionTrigger
        : cfg.ui.selectionTrigger;
      cfg.ui.openInNewTab = !!raw.ui.openInNewTab;
      cfg.ui.theme = ['light', 'dark'].includes(raw.ui.theme) ? raw.ui.theme : 'auto';
    }

    cfg.presetVersion = toNumber(raw.presetVersion, 0);
    return cfg;
  }

  function loadConfig() {
    const raw = safeGMGet(STORAGE_KEY, '');
    if (!raw) return deepClone(DEFAULT_CONFIG);
    try {
      const cfg = mergeConfig(JSON.parse(raw));
      if (migratePresets(cfg)) saveConfig(cfg);
      return cfg;
    } catch (_) {
      return deepClone(DEFAULT_CONFIG);
    }
  }

  function saveConfig(cfg) {
    safeGMSet(STORAGE_KEY, JSON.stringify(cfg));
  }

  const config = loadConfig();

  function getEffectiveTheme() {
    const theme = config.ui.theme || 'auto';
    if (theme === 'light' || theme === 'dark') return theme;
    try {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch (_) {
      return 'dark';
    }
  }

  function applyThemeTo(element) {
    if (!element) return;
    element.setAttribute('data-theme', getEffectiveTheme());
  }

  // 只给本脚本自己的节点设置主题，不再向页面 <html> 写 data-theme / 全局变量，避免污染宿主站点
  function applyTheme() {
    applyThemeTo(document.getElementById(ROOT_ID));
    applyThemeTo(document.getElementById(PANEL_ID));
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID},
      #${PANEL_ID} {
        color-scheme: dark;
        --ses-bg-primary: rgba(16, 16, 16, 0.92);
        --ses-bg-secondary: #101114;
        --ses-bg-input: #151820;
        --ses-bg-button: #4a4a4a;
        --ses-text-primary: #fff;
        --ses-text-secondary: #f3f3f3;
        --ses-text-muted: #9fa6b2;
        --ses-text-label: #aeb6c2;
        --ses-border-color: rgba(255, 255, 255, 0.12);
        --ses-border-light: rgba(255, 255, 255, 0.14);
        --ses-border-medium: rgba(255, 255, 255, 0.16);
        --ses-border-pill: rgba(255, 255, 255, 0.2);
        --ses-shadow: rgba(0, 0, 0, 0.32);
        --ses-shadow-panel: rgba(0, 0, 0, 0.35);
        --ses-overlay: rgba(0, 0, 0, 0.45);
        --ses-active-border: #7ea1ff;
        --ses-active-shadow: rgba(126, 161, 255, 0.35);
        --ses-primary-bg: #2e5fff;
        --ses-danger-bg: #6b2026;
        --ses-danger-border: #9f3540;
      }
      #${ROOT_ID}[data-theme="light"],
      #${PANEL_ID}[data-theme="light"] {
        color-scheme: light;
        --ses-bg-primary: rgba(255, 255, 255, 0.95);
        --ses-bg-secondary: #f5f5f7;
        --ses-bg-input: #ffffff;
        --ses-bg-button: #e8e8ed;
        --ses-text-primary: #1c1c1e;
        --ses-text-secondary: #2c2c2e;
        --ses-text-muted: #6c6c70;
        --ses-text-label: #3a3a3c;
        --ses-border-color: rgba(0, 0, 0, 0.1);
        --ses-border-light: rgba(0, 0, 0, 0.12);
        --ses-border-medium: rgba(0, 0, 0, 0.15);
        --ses-border-pill: rgba(0, 0, 0, 0.15);
        --ses-shadow: rgba(0, 0, 0, 0.15);
        --ses-shadow-panel: rgba(0, 0, 0, 0.2);
        --ses-overlay: rgba(0, 0, 0, 0.35);
        --ses-active-border: #007aff;
        --ses-active-shadow: rgba(0, 122, 255, 0.3);
        --ses-primary-bg: #007aff;
        --ses-danger-bg: #ff3b30;
        --ses-danger-border: #ff3b30;
      }
      #${ROOT_ID} {
        position: fixed;
        z-index: 2147483646;
        max-width: min(96vw, 860px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        user-select: none;
        box-sizing: border-box;
        forced-color-adjust: none;
      }
      #${ROOT_ID}.hidden {
        display: none;
      }
      #${ROOT_ID} .ses-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--ses-bg-primary);
        border: 1px solid var(--ses-border-color);
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 8px 26px var(--ses-shadow);
        backdrop-filter: blur(6px);
        width: 100%;
        box-sizing: border-box;
      }
      #${ROOT_ID} .ses-list {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        mask-image: linear-gradient(to right, transparent 0%, #000 10px, #000 calc(100% - 10px), transparent 100%);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 10px, #000 calc(100% - 10px), transparent 100%);
        padding-right: 10px;
        padding-left: 10px;
      }
      #${ROOT_ID} .ses-list::-webkit-scrollbar {
        display: none;
      }
      #${ROOT_ID} .ses-pill,
      #${ROOT_ID} .ses-btn {
        border: 1px solid var(--ses-border-pill);
        background: var(--ses-bg-button);
        color: var(--ses-text-primary);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
      }
      #${ROOT_ID} .ses-pill.active {
        /* 激活描边由 JS inline style 控制，以防止 Dark Reader 篡改 */
      }
      #${ROOT_ID} .ses-btn {
        width: 34px;
        min-width: 34px;
        height: 30px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      #${PANEL_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: var(--ses-overlay);
        display: none;
        align-items: center;
        justify-content: center;
      }
      #${PANEL_ID}.show {
        display: flex;
      }
      #${PANEL_ID} .panel {
        width: min(96vw, 720px);
        max-height: 90vh;
        overflow: auto;
        overscroll-behavior: contain;
        background: var(--ses-bg-secondary);
        color: var(--ses-text-secondary);
        border-radius: 14px;
        border: 1px solid var(--ses-border-light);
        box-shadow: 0 18px 48px var(--ses-shadow-panel);
        padding: 14px;
        font-size: 14px;
      }
      #${PANEL_ID} .panel h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      #${PANEL_ID} .sub {
        margin: 12px 0 8px;
        font-weight: 600;
      }
      #${PANEL_ID} .engine-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        padding: 8px;
        border: 1px solid var(--ses-border-color);
        border-radius: 10px;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .engine-row.hidden-engine {
        opacity: 0.6;
        background: var(--ses-bg-button);
      }
      #${PANEL_ID} .muted {
        color: var(--ses-text-muted);
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${PANEL_ID} .ops {
        display: flex;
        gap: 6px;
      }
      #${PANEL_ID} button,
      #${PANEL_ID} input,
      #${PANEL_ID} select,
      #${PANEL_ID} textarea {
        font: inherit;
      }
      #${PANEL_ID} .op,
      #${PANEL_ID} .primary,
      #${PANEL_ID} .danger,
      #${PANEL_ID} .ghost {
        border-radius: 8px;
        border: 1px solid var(--ses-border-medium);
        background: var(--ses-bg-button);
        color: var(--ses-text-primary);
        padding: 6px 10px;
        cursor: pointer;
      }
      #${PANEL_ID} .primary {
        background: var(--ses-primary-bg);
        border-color: var(--ses-primary-bg);
        color: #fff;
      }
      #${PANEL_ID} .danger {
        background: var(--ses-danger-bg);
        border-color: var(--ses-danger-border);
        color: #fff;
      }
      #${PANEL_ID} .ghost {
        background: transparent;
      }
      #${PANEL_ID} .grid2 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px;
      }
      #${PANEL_ID} .form {
        border: 1px solid var(--ses-border-color);
        border-radius: 10px;
        padding: 10px;
        margin-top: 8px;
      }
      #${PANEL_ID} label {
        display: block;
        font-size: 12px;
        margin-bottom: 4px;
        color: var(--ses-text-label);
      }
      #${PANEL_ID} input,
      #${PANEL_ID} select {
        width: 100%;
        box-sizing: border-box;
        background: var(--ses-bg-input);
        border: 1px solid var(--ses-border-light);
        color: var(--ses-text-primary);
        border-radius: 8px;
        padding: 6px 8px;
      }
      #${PANEL_ID} .panel-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 14px;
      }
      @media (max-width: 560px) {
        #${ROOT_ID} {
          max-width: 98vw;
        }
        #${ROOT_ID} .ses-pill {
          font-size: 12px;
          padding: 6px 10px;
        }
        #${PANEL_ID} .engine-row {
          display: flex;
          flex-direction: column;
        }
        #${PANEL_ID} .ops {
          justify-content: flex-start;
        }
        #${PANEL_ID} .op,
        #${PANEL_ID} .danger {
          padding: 7px 10px;
          min-width: 52px;
          text-align: center;
        }
        #${PANEL_ID} .grid2 {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.documentElement.appendChild(style);
  }

  // ==================== 查询词提取 ====================

  // 划词/输入框最大保留长度，避免把整页文本塞进搜索 URL
  const QUERY_MAX_LENGTH = 500;
  const LEGACY_QUERY_KEYS = ['q', 'wd', 'word', 'query', 'text', 'keyword', 'search', 'search_query', 'p', 'k'];

  let lastSelectedText = '';
  let currentWidgetMode = 'hidden';
  let renderedSignature = '';
  let dragModeActive = false;
  let actionBusy = false;
  let selectionTimer = null;
  let resizeTimer = null;
  let renderQueued = false;

  function cleanQuery(value) {
    if (value == null) return '';
    const text = String(value).replace(/\s+/g, ' ').trim();
    return text.length > QUERY_MAX_LENGTH ? text.slice(0, QUERY_MAX_LENGTH) : text;
  }

  function decodeUriSafe(value) {
    try {
      return decodeURIComponent(value);
    } catch (_) {
      return value;
    }
  }

  function normalizePath(pathname) {
    const path = String(pathname || '/').replace(/\/+$/, '');
    return path === '' ? '/' : path;
  }

  // ==================== 域名匹配 ====================

  // 精确匹配；带尾部点号的模式（如 google.）匹配其所有子域，用于跨国家/地区域名
  function isMatchHost(host, pattern) {
    if (!host || !pattern) return false;
    const h = String(host).toLowerCase();
    const p = String(pattern).toLowerCase();
    if (p.endsWith('.')) {
      const base = p.slice(0, -1);
      return h === base || h.startsWith(`${base}.`) || h.includes(`.${base}.`);
    }
    return h === p || h.endsWith(`.${p}`);
  }

  function hostMatchScore(host, pattern) {
    if (!isMatchHost(host, pattern)) return -1;
    const h = String(host).toLowerCase();
    const p = String(pattern).toLowerCase();
    if (p.endsWith('.')) return p.length - 1;
    return h === p ? 10000 + p.length : p.length;
  }

  // 同一域名被多个引擎命中时，取“最具体”的那个（如 weixin.sogou.com 优先于 sogou.com）
  function findEngineByHost(host) {
    let matched = null;
    let bestScore = -1;
    for (const engine of config.engines) {
      for (const pattern of engine.hosts || []) {
        const score = hostMatchScore(host, pattern);
        if (score > bestScore) {
          bestScore = score;
          matched = engine;
        }
      }
    }
    return matched;
  }

  // ==================== 搜索 URL 模板解析 ====================

  const templateCache = new Map();

  function getTemplate(searchUrl) {
    if (!searchUrl || !searchUrl.includes('{q}')) return null;
    if (templateCache.has(searchUrl)) return templateCache.get(searchUrl);
    if (templateCache.size > 256) templateCache.clear();

    const marker = 'SESQUERYTOKEN';
    const filled = searchUrl.split('{q}').join(marker);
    let url;
    try {
      url = new URL(filled);
    } catch (_) {
      templateCache.set(searchUrl, null);
      return null;
    }

    const pathname = normalizePath(url.pathname);
    const host = url.hostname.toLowerCase();
    let template = null;

    for (const [name, value] of url.searchParams) {
      if (value.indexOf(marker) !== -1) {
        template = { host, pathname, mode: 'query', param: name };
        break;
      }
    }
    if (!template && url.pathname.indexOf(marker) !== -1) {
      const parts = url.pathname.split(marker);
      template = { host, pathname, mode: 'path', prefix: parts[0], suffix: parts[1] || '' };
    }
    if (!template && url.hash.indexOf(marker) !== -1) {
      const hash = url.hash.slice(1);
      for (const [name, value] of new URLSearchParams(hash)) {
        if (value.indexOf(marker) !== -1) {
          template = { host, pathname, mode: 'hash', param: name };
          break;
        }
      }
      if (!template) {
        const parts = url.hash.split(marker);
        template = { host, pathname, mode: 'hashPath', prefix: parts[0], suffix: parts[1] || '' };
      }
    }

    templateCache.set(searchUrl, template);
    return template;
  }

  // 去掉常见的站点前缀（www./m./wap.），让移动版首页也能被识别为“引擎首页”
  function stripHostPrefix(host) {
    const h = String(host).toLowerCase();
    for (const prefix of ['www.', 'm.', 'wap.']) {
      if (h.startsWith(prefix)) return h.slice(prefix.length);
    }
    return h;
  }

  // 判断当前 host 是否就是模板里的搜索引擎站点（含国家/地区域名变体，排除 mail/docs 等子域）
  function isTemplateHost(host, templateHost) {
    if (!host || !templateHost) return false;
    const h = stripHostPrefix(host);
    const t = stripHostPrefix(templateHost);
    if (h === t || h.startsWith(`${t}.`)) return true;
    // 国家/地区域名变体：www.google.com.hk / google.co.uk 对应模板 www.google.com
    const hostParts = h.split('.');
    const templateParts = t.split('.');
    if (templateParts.length === 2 && hostParts.length >= 2 && hostParts[0] === templateParts[0]) return true;
    return false;
  }

  function pathMatchesTemplate(templatePath, path) {
    if (templatePath === '/') return true;
    // 兼容各引擎的图片/视频等垂直搜索：/images/search、/video/search 等仍属搜索页
    return (
      path === templatePath ||
      path.startsWith(`${templatePath}/`) ||
      path.endsWith(templatePath) ||
      path.includes(`${templatePath}/`)
    );
  }

  // 是否为该引擎的搜索结果页：模板里的 host + path + 查询参数同时匹配
  function isSearchTemplateMatch(template, url) {
    if (!template) return false;
    const path = normalizePath(url.pathname);
    if (template.mode === 'query') {
      if (!url.searchParams.get(template.param)) return false;
      return pathMatchesTemplate(template.pathname, path);
    }
    if (template.mode === 'path') {
      if (!url.pathname.startsWith(template.prefix)) return false;
      return url.pathname.length > template.prefix.length;
    }
    if (template.mode === 'hash') {
      const params = new URLSearchParams(url.hash.replace(/^#/, ''));
      if (!params.get(template.param)) return false;
      return pathMatchesTemplate(template.pathname, path);
    }
    if (template.mode === 'hashPath') {
      if (!url.hash.startsWith(template.prefix)) return false;
      return url.hash.length > template.prefix.length;
    }
    return false;
  }

  function extractTemplateQuery(template, url) {
    if (!template) return '';
    if (template.mode === 'query') {
      return cleanQuery(url.searchParams.get(template.param) || '');
    }
    if (template.mode === 'path') {
      if (!url.pathname.startsWith(template.prefix)) return '';
      let rest = url.pathname.slice(template.prefix.length);
      if (template.suffix && rest.endsWith(template.suffix)) rest = rest.slice(0, -template.suffix.length);
      return cleanQuery(decodeUriSafe(rest));
    }
    if (template.mode === 'hash') {
      const params = new URLSearchParams(url.hash.replace(/^#/, ''));
      return cleanQuery(params.get(template.param) || '');
    }
    if (template.mode === 'hashPath') {
      if (!url.hash.startsWith(template.prefix)) return '';
      let rest = url.hash.slice(template.prefix.length);
      if (template.suffix && rest.endsWith(template.suffix)) rest = rest.slice(0, -template.suffix.length);
      return cleanQuery(decodeUriSafe(rest));
    }
    return '';
  }

  // 兼容旧配置/自定义引擎：无法从模板定位关键词时，回退到常见查询参数
  function extractGenericQuery(url) {
    for (const key of LEGACY_QUERY_KEYS) {
      const value = url.searchParams.get(key);
      if (value && value.trim()) return cleanQuery(value);
    }
    const hash = url.hash.replace(/^#/, '');
    if (hash.includes('=')) {
      let hashQuery = hash;
      const questionMark = hashQuery.indexOf('?');
      if (questionMark !== -1) hashQuery = hashQuery.slice(questionMark + 1);
      try {
        const params = new URLSearchParams(hashQuery);
        for (const key of LEGACY_QUERY_KEYS) {
          const value = params.get(key);
          if (value && value.trim()) return cleanQuery(value);
        }
      } catch (_) {
        // ignore
      }
    }
    return '';
  }

  // 结果页参数与提交参数不一致的引擎（如秘塔提交 q、结果页 question），由引擎配置的 queryKeys 兜底
  function findParamValue(url, keys) {
    for (const key of keys || []) {
      if (!key) continue;
      const value = url.searchParams.get(key);
      if (value && value.trim()) return cleanQuery(value);
    }
    return '';
  }

  function extractQuery(url, engine) {
    if (engine) {
      const fromTemplate = extractTemplateQuery(getTemplate(engine.searchUrl), url);
      if (fromTemplate) return fromTemplate;
      const fromKeys = findParamValue(url, engine.queryKeys);
      if (fromKeys) return fromKeys;
    }
    return extractGenericQuery(url);
  }

  // 是否为“该引擎自己的站点页面”（而不是 Gmail / 百度百科 / Google 翻译这类同域其他产品）。
  // 模板 path 为 '/' 的站点型引擎（ChatGPT/DeepSeek/Kimi 等）视为站内任意页面都属于引擎页；
  // 搜索型引擎（Google/Bing/百度等）只认首页、搜索路径及其子路径。
  function isEngineHome(engine, url) {
    const template = getTemplate(engine.searchUrl);
    if (!template) return false;

    const host = url.hostname.toLowerCase();
    const hostIsEngineSite =
      isTemplateHost(host, template.host) ||
      (engine.hosts || []).some((pattern) => !pattern.endsWith('.') && pattern.toLowerCase() === host);
    if (!hostIsEngineSite) return false;

    const path = normalizePath(url.pathname);
    if (template.mode === 'path') {
      const prefix = normalizePath(template.prefix);
      return path === '/' || path === prefix || path.startsWith(`${prefix}/`);
    }
    if (template.pathname === '/') return true; // 站点型引擎：整站都是问答/搜索界面
    return path === '/' || path === template.pathname || path.startsWith(`${template.pathname}/`);
  }

  // ==================== 选区 / 输入框 ====================

  function readSelection() {
    try {
      const selection = window.getSelection && window.getSelection();
      return cleanQuery(selection ? String(selection) : '');
    } catch (_) {
      return '';
    }
  }

  function readFocusedInput() {
    const element = document.activeElement;
    if (!element || !element.tagName) return '';
    const tag = element.tagName.toUpperCase();
    if (tag === 'INPUT') {
      const type = String(element.getAttribute('type') || 'text').toLowerCase();
      if (!['text', 'search', 'url', 'email', 'tel', 'number'].includes(type)) return '';
      return cleanQuery(element.value || '');
    }
    if (tag === 'TEXTAREA' || element.isContentEditable) {
      return cleanQuery(typeof element.value === 'string' ? element.value : element.textContent || '');
    }
    return '';
  }

  // ==================== 显示状态机 ====================

  // 悬浮窗只在三种情况下出现：
  // 1) 当前页面是该引擎的搜索结果页（由 searchUrl 模板推导 host + path + 查询参数，URL 里能取到关键词）
  // 2) 用户开启了划词，且在允许的页面（默认：引擎自己的站点/首页）选中了文字
  // 3) 用户显式开启了“无关键词时仍然显示”，且当前在引擎站点上
  // 注意：选中文字 / 输入框内容 不再作为显示条件，这是旧版在 Gmail、百度百科、Google 翻译等页面乱弹的根因
  function computeWidgetState() {
    const url = new URL(location.href);
    const engine = findEngineByHost(url.hostname);
    const disabledByUser = engine && engine.disableWidget;
    if (!config.ui.enabled || disabledByUser) {
      return { visible: false, mode: 'hidden', activeId: engine ? engine.id : '', query: '' };
    }

    if (engine) {
      const template = getTemplate(engine.searchUrl);
      const searchPage = isSearchTemplateMatch(template, url);
      let searchQuery = searchPage ? extractTemplateQuery(template, url) : '';
      if (!searchQuery) searchQuery = findParamValue(url, engine.queryKeys);
      if (searchQuery) {
        return { visible: true, mode: 'search', activeId: engine.id, query: searchQuery };
      }
      // 自定义引擎 URL 可能无法解析成模板（如相对路径）：此时用常见参数兜底识别搜索页
      if (!template) {
        const genericQuery = extractGenericQuery(url);
        if (genericQuery) {
          return { visible: true, mode: 'search', activeId: engine.id, query: genericQuery };
        }
      }

      const engineHome = isEngineHome(engine, url);
      const selection = readSelection();
      const trigger = config.ui.selectionTrigger;
      if (selection && trigger !== 'off' && (trigger === 'global' || engineHome)) {
        return { visible: true, mode: 'selection', activeId: engine.id, query: selection };
      }
      if (config.ui.showWhenNoQuery && (engineHome || searchPage)) {
        return { visible: true, mode: 'noquery', activeId: engine.id, query: '' };
      }
      return { visible: false, mode: 'hidden', activeId: engine.id, query: '' };
    }

    if (config.ui.selectionTrigger === 'global') {
      const selection = readSelection();
      if (selection) {
        return { visible: true, mode: 'selection', activeId: '', query: selection };
      }
    }
    return { visible: false, mode: 'hidden', activeId: '', query: '' };
  }

  // ==================== 动作 ====================

  function buildSearchUrl(engine, query) {
    return engine.searchUrl.split('{q}').join(encodeURIComponent(query));
  }

  function openTargetUrl(targetUrl, forceNewTab) {
    const useNewTab = typeof forceNewTab === 'boolean' ? forceNewTab : !!config.ui.openInNewTab;
    if (!useNewTab) {
      window.location.assign(targetUrl);
      return;
    }
    let opened = null;
    try {
      opened = window.open(targetUrl, '_blank');
    } catch (_) {
      opened = null;
    }
    if (opened) {
      try {
        opened.opener = null;
      } catch (_) {
        // ignore
      }
      return;
    }
    // 弹窗被拦截时降级为当前页打开，避免点击后毫无反应
    window.location.assign(targetUrl);
  }

  async function handleAction(engine, forceNewTab) {
    if (actionBusy) return;
    actionBusy = true;
    try {
      let query = '';
      if (currentWidgetMode === 'selection' && lastSelectedText) query = lastSelectedText;
      if (!query) query = extractQuery(new URL(location.href), findEngineByHost(location.hostname));
      if (!query) query = readSelection();
      if (!query) query = readFocusedInput();
      if (!query) {
        const input = prompt('输入搜索关键词');
        query = cleanQuery(input);
      }
      if (!query) return;
      openTargetUrl(buildSearchUrl(engine, query), forceNewTab);
    } finally {
      actionBusy = false;
    }
  }

  // ==================== 悬浮窗 DOM ====================

  function applyRootPosition(root) {
    if (!root) root = createRoot();
    const ui = config.ui;
    root.style.left = '';
    root.style.right = '';
    root.style.top = '';
    root.style.bottom = '';
    root.style.transform = '';

    if (ui.useCustomXY) {
      const maxX = Math.max(0, window.innerWidth - (root.offsetWidth || 0));
      const maxY = Math.max(0, window.innerHeight - (root.offsetHeight || 0));
      const x = Math.min(Math.max(0, toNumber(ui.customX, 0)), maxX);
      const y = Math.min(Math.max(0, toNumber(ui.customY, 0)), maxY);
      root.style.left = `${x}px`;
      root.style.top = `${y}px`;
      return;
    }

    if (ui.vertical === 'top') {
      root.style.top = `${Math.max(0, toNumber(ui.offsetY, 0))}px`;
    } else {
      root.style.bottom = `${Math.max(0, toNumber(ui.offsetY, 0))}px`;
    }

    if (ui.align === 'left') {
      root.style.left = `${Math.max(0, toNumber(ui.offsetX, 0))}px`;
    } else if (ui.align === 'right') {
      root.style.right = `${Math.max(0, toNumber(ui.offsetX, 0))}px`;
    } else {
      root.style.left = '50%';
      root.style.transform = 'translateX(-50%)';
    }
  }

  function createRoot() {
    const existing = document.getElementById(ROOT_ID);
    if (existing) return existing;

    const root = document.createElement('div');
    root.id = ROOT_ID;
    root.innerHTML = `
      <div class="ses-wrap">
        <div class="ses-list" id="${ROOT_ID}-list"></div>
        <button type="button" class="ses-btn" id="${ROOT_ID}-settings" title="设置（也可长按切换器或使用脚本管理器菜单）" aria-label="打开设置">⚙</button>
      </div>
    `;
    document.documentElement.appendChild(root);
    root.classList.add('hidden');
    applyThemeTo(root);
    applyRootPosition(root);
    renderedSignature = '';

    const list = root.querySelector(`#${ROOT_ID}-list`);
    // 支持鼠标滚轮横向滚动（针对桌面端）；列表不可滚动时不拦截页面滚动
    list.addEventListener(
      'wheel',
      (e) => {
        if (e.deltaY === 0) return;
        const maxScroll = list.scrollWidth - list.clientWidth;
        if (maxScroll <= 0) return;
        const next = Math.min(maxScroll, Math.max(0, list.scrollLeft + e.deltaY));
        if (next === list.scrollLeft) return;
        e.preventDefault();
        list.scrollLeft = next;
      },
      { passive: false }
    );

    let holdTimer = null;
    const cancelHold = () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    };

    root.querySelector(`#${ROOT_ID}-settings`).addEventListener('click', () => {
      cancelHold();
      openPanel();
    });

    root.addEventListener('pointerdown', (e) => {
      if (dragModeActive) return;
      if (e.button != null && e.button !== 0) return;
      const target = e.target;
      if (target && target.closest && target.closest('.ses-pill')) return;
      cancelHold();
      holdTimer = setTimeout(() => {
        holdTimer = null;
        openPanel();
      }, 500);
    });
    root.addEventListener('pointerup', cancelHold);
    root.addEventListener('pointercancel', cancelHold);
    root.addEventListener('pointerleave', cancelHold);

    return root;
  }

  function rebuildPills(activeId) {
    const root = createRoot();
    const list = root.querySelector(`#${ROOT_ID}-list`);
    if (!list) return;
    list.innerHTML = '';

    const light = getEffectiveTheme() === 'light';
    for (const engine of config.engines) {
      if (engine.hidden) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ses-pill';
      button.dataset.engineId = engine.id;
      button.textContent = engine.name;
      button.title = `${engine.name}\n${engine.searchUrl}`;
      if (engine.id === activeId) {
        button.classList.add('active');
        // 用 inline style 强制设置描边，绕过 Dark Reader 对 CSS 规则的修改
        button.style.setProperty('border-color', light ? '#007aff' : '#7ea1ff', 'important');
        button.style.setProperty(
          'box-shadow',
          `0 0 0 1px ${light ? 'rgba(0, 122, 255, 0.3)' : 'rgba(126, 161, 255, 0.35)'} inset`,
          'important'
        );
      }
      button.addEventListener('click', (e) => {
        if (e.button !== 0) return;
        void handleAction(engine);
      });
      button.addEventListener('mousedown', (e) => {
        if (e.button === 1) e.preventDefault();
      });
      button.addEventListener('auxclick', (e) => {
        if (e.button !== 1) return;
        e.preventDefault();
        void handleAction(engine, true);
      });
      list.appendChild(button);
    }
  }

  function renderWidget(force) {
    const root = createRoot();
    const state = computeWidgetState();
    currentWidgetMode = state.mode;
    if (state.mode === 'selection' && state.query) lastSelectedText = state.query;

    // 所有引擎按钮都被隐藏时不留下一条空白悬浮条（设置仍可从脚本管理器菜单进入）
    const hasVisibleEngine = config.engines.some((engine) => !engine.hidden);
    if (!state.visible || !hasVisibleEngine) {
      root.classList.add('hidden');
      root.setAttribute('aria-hidden', 'true');
      renderedSignature = '';
      return;
    }

    const wasHidden = root.classList.contains('hidden');
    root.classList.remove('hidden');
    root.setAttribute('aria-hidden', 'false');
    applyThemeTo(root);
    // 从隐藏变为可见时重新计算自定义坐标的边界限制
    if (wasHidden) applyRootPosition(root);

    const signature = `${state.activeId}|${state.query}`;
    if (force || signature !== renderedSignature) {
      renderedSignature = signature;
      rebuildPills(state.activeId);
    }
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    setTimeout(() => {
      renderQueued = false;
      renderWidget();
    }, 0);
  }

  function onSelectionChanged() {
    if (config.ui.selectionTrigger === 'off') {
      if (currentWidgetMode === 'selection') scheduleRender();
      return;
    }
    if (selectionTimer) clearTimeout(selectionTimer);
    selectionTimer = setTimeout(() => {
      selectionTimer = null;
      renderWidget();
    }, 180);
  }

  // ==================== 设置面板 ====================

  function createPanel() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) return existing;

    const overlay = document.createElement('div');
    overlay.id = PANEL_ID;
    overlay.innerHTML = '<div class="panel" role="dialog" aria-modal="true" aria-label="搜索引擎切换器设置"></div>';
    document.documentElement.appendChild(overlay);
    applyThemeTo(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePanel();
    });

    const panel = overlay.querySelector('.panel');
    // 阻止面板滚动影响下方网页
    panel.addEventListener(
      'wheel',
      (e) => {
        const isAtTop = panel.scrollTop === 0;
        const isAtBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;
        if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
    panel.addEventListener(
      'touchmove',
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Escape') return;
        const current = document.getElementById(PANEL_ID);
        if (current && current.classList.contains('show')) {
          e.stopPropagation();
          closePanel();
        }
      },
      true
    );

    return overlay;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderEngineRows(panel) {
    const container = panel && panel.querySelector('#ses-engine-rows');
    if (!container) return;

    container.innerHTML = config.engines
      .map(
        (e, i) => `
      <div class="engine-row ${e.hidden ? 'hidden-engine' : ''}" data-index="${i}">
        <div>
          <div><strong>${escapeHtml(e.name)}${e.hidden ? ' <span class="muted">(按钮已隐藏)</span>' : ''}${e.disableWidget ? ' <span class="muted" style="color:var(--ses-danger-border);">(本站禁用悬浮)</span>' : ''}</strong></div>
          <div class="muted">${escapeHtml(e.searchUrl)}</div>
          <div class="muted">识别域名: ${escapeHtml((e.hosts || []).join(', ') || '(空)')}</div>
          ${e.queryKeys && e.queryKeys.length ? `<div class="muted">结果页参数: ${escapeHtml(e.queryKeys.join(', '))}</div>` : ''}
        </div>
        <div class="ops" style="flex-wrap: wrap;">
          <button class="op" data-act="up" title="上移">↑</button>
          <button class="op" data-act="down" title="下移">↓</button>
          <button class="op" data-act="edit">编辑</button>
          <button class="op" data-act="${e.hidden ? 'show' : 'hide'}" title="在切换器面板中显示或隐藏该按钮">${e.hidden ? '显示按钮' : '隐藏按钮'}</button>
          <button class="op" data-act="toggle-widget" title="是否在该搜索引擎的网页中注入并显示悬浮控件">${e.disableWidget ? '启用悬浮' : '禁用悬浮'}</button>
          <button class="danger" data-act="del">删除</button>
        </div>
      </div>
    `
      )
      .join('');

    container.querySelectorAll('.engine-row').forEach((row) => {
      row.addEventListener('click', (event) => {
        const target = event.target;
        if (!target || !target.closest) return;
        const actionElement = target.closest('[data-act]');
        if (!actionElement) return;

        const index = Number(row.getAttribute('data-index'));
        const action = actionElement.getAttribute('data-act');
        if (action === 'up') moveEngine(index, -1);
        if (action === 'down') moveEngine(index, 1);
        if (action === 'edit') editEngine(config.engines[index]);
        if (action === 'del') deleteEngine(index);
        if (action === 'hide' || action === 'show') toggleEngineVisibility(index);
        if (action === 'toggle-widget') toggleWidgetVisibility(index);
      });
    });
  }

  function refreshEngineRows() {
    const panel = document.querySelector(`#${PANEL_ID} .panel`);
    if (panel) renderEngineRows(panel);
    renderWidget(true);
  }

  function applyUiSettings() {
    applyRootPosition(createRoot());
    applyTheme();
    renderWidget(true);
  }

  function bindPanelEvents(panel) {
    const on = (selector, handler) => {
      const element = panel.querySelector(selector);
      if (element) element.addEventListener('click', handler);
    };

    on('#ses-add', () => editEngine(null));
    on('#ses-export', exportConfig);
    on('#ses-import', importConfig);
    on('#ses-show-guide', showOfflineGuide);
    on('#ses-drag', () => {
      closePanel();
      startDragPositioning();
    });
    on('#ses-close', closePanel);

    on('#ses-reset-engines', () => {
      if (!confirm('确定恢复默认搜索引擎列表吗？')) return;
      config.engines = deepClone(DEFAULT_CONFIG.engines);
      config.presetVersion = PRESET_VERSION;
      saveConfig(config);
      renderPanel();
      applyUiSettings();
    });

    on('#ses-reset-position', () => {
      if (!confirm('确定恢复默认显示位置吗？')) return;
      const reset = deepClone(DEFAULT_CONFIG);
      config.ui.vertical = reset.ui.vertical;
      config.ui.align = reset.ui.align;
      config.ui.offsetX = reset.ui.offsetX;
      config.ui.offsetY = reset.ui.offsetY;
      config.ui.useCustomXY = reset.ui.useCustomXY;
      config.ui.customX = reset.ui.customX;
      config.ui.customY = reset.ui.customY;
      saveConfig(config);
      applyRootPosition(createRoot());
      renderPanel();
    });

    on('#ses-reset-behavior', () => {
      if (!confirm('确定恢复默认行为选项吗？')) return;
      const reset = deepClone(DEFAULT_CONFIG);
      config.ui.enabled = reset.ui.enabled;
      config.ui.showWhenNoQuery = reset.ui.showWhenNoQuery;
      config.ui.selectionTrigger = reset.ui.selectionTrigger;
      config.ui.openInNewTab = reset.ui.openInNewTab;
      config.ui.theme = reset.ui.theme;
      saveConfig(config);
      applyUiSettings();
      renderPanel();
    });

    on('#ses-save', () => {
      const positionMode = panel.querySelector('#ses-pos-mode').value;
      const vertical = panel.querySelector('#ses-vertical').value;
      const align = panel.querySelector('#ses-align').value;
      const offsetX = toNumber(panel.querySelector('#ses-offset-x').value, 0);
      const offsetY = toNumber(panel.querySelector('#ses-offset-y').value, 0);
      const customX = toNumber(panel.querySelector('#ses-custom-x').value, 0);
      const customY = toNumber(panel.querySelector('#ses-custom-y').value, 0);
      const enabled = panel.querySelector('#ses-enabled').value === '1';
      const showNoQuery = panel.querySelector('#ses-show-no-query').value === '1';
      const selection = panel.querySelector('#ses-selection').value;
      const openInNewTab = panel.querySelector('#ses-open-way').value === '1';
      const theme = panel.querySelector('#ses-theme').value;

      config.ui.enabled = enabled;
      config.ui.useCustomXY = positionMode === 'custom';
      config.ui.vertical = vertical === 'top' ? 'top' : 'bottom';
      config.ui.theme = ['light', 'dark'].includes(theme) ? theme : 'auto';
      config.ui.align = ['left', 'center', 'right'].includes(align) ? align : 'center';
      config.ui.offsetX = Math.max(0, offsetX);
      config.ui.offsetY = Math.max(0, offsetY);
      config.ui.customX = Math.max(0, customX);
      config.ui.customY = Math.max(0, customY);
      config.ui.showWhenNoQuery = showNoQuery;
      config.ui.selectionTrigger = ['off', 'engine', 'global'].includes(selection) ? selection : 'engine';
      config.ui.openInNewTab = openInNewTab;

      saveConfig(config);
      applyUiSettings();
      closePanel();
    });
  }

  function renderPanel() {
    const overlay = createPanel();
    const panel = overlay.querySelector('.panel');
    const ui = config.ui;
    const option = (value, current) => (value === current ? ' selected' : '');

    panel.innerHTML = `
      <h3>搜索引擎切换器设置</h3>

      <div class="sub" style="display:flex; justify-content:space-between; align-items:center;">
        <span>引擎列表（支持新增 / 删除 / 排序 / 隐藏）</span>
        <div style="display:flex; gap:8px;">
          <button class="primary" id="ses-show-guide" style="padding:4px 8px; font-size:12px;">使用指南</button>
          <button class="ghost" id="ses-reset-engines" style="padding:4px 8px; font-size:12px;">恢复默认</button>
        </div>
      </div>
      <div id="ses-engine-rows"></div>
      <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="primary" id="ses-add">新增搜索引擎</button>
        <button class="ghost" id="ses-export">导出配置</button>
        <button class="ghost" id="ses-import">导入配置</button>
      </div>

      <div class="sub" style="display:flex; justify-content:space-between; align-items:center;">
        <span>显示位置</span>
        <button class="ghost" id="ses-reset-position" style="padding:4px 8px; font-size:12px;">恢复默认</button>
      </div>
      <div class="grid2">
        <div>
          <label>定位模式</label>
          <select id="ses-pos-mode">
            <option value="preset"${option('preset', ui.useCustomXY ? 'custom' : 'preset')}>预设位置</option>
            <option value="custom"${option('custom', ui.useCustomXY ? 'custom' : 'preset')}>自定义坐标</option>
          </select>
        </div>
        <div>
          <label>垂直位置</label>
          <select id="ses-vertical">
            <option value="bottom"${option('bottom', ui.vertical)}>底部</option>
            <option value="top"${option('top', ui.vertical)}>顶部</option>
          </select>
        </div>
        <div>
          <label>水平对齐</label>
          <select id="ses-align">
            <option value="left"${option('left', ui.align)}>左</option>
            <option value="center"${option('center', ui.align)}>中</option>
            <option value="right"${option('right', ui.align)}>右</option>
          </select>
        </div>
        <div>
          <label>水平偏移(px)</label>
          <input type="number" id="ses-offset-x" value="${Number(ui.offsetX) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>垂直偏移(px)</label>
          <input type="number" id="ses-offset-y" value="${Number(ui.offsetY) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>自定义 X(px)</label>
          <input type="number" id="ses-custom-x" value="${Number(ui.customX) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>自定义 Y(px)</label>
          <input type="number" id="ses-custom-y" value="${Number(ui.customY) || 0}" min="0" step="1" />
        </div>
      </div>
      <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="op" id="ses-drag">拖拽定位</button>
      </div>

      <div class="sub" style="display:flex; justify-content:space-between; align-items:center;">
        <span>行为选项</span>
        <button class="ghost" id="ses-reset-behavior" style="padding:4px 8px; font-size:12px;">恢复默认</button>
      </div>
      <div class="grid2">
        <div>
          <label>悬浮窗</label>
          <select id="ses-enabled">
            <option value="1"${option('1', ui.enabled === false ? '0' : '1')}>启用</option>
            <option value="0"${option('0', ui.enabled === false ? '0' : '1')}>停用</option>
          </select>
        </div>
        <div>
          <label>无关键词时（引擎首页/搜索页）</label>
          <select id="ses-show-no-query">
            <option value="1"${option('1', ui.showWhenNoQuery ? '1' : '0')}>仍然显示切换器</option>
            <option value="0"${option('0', ui.showWhenNoQuery ? '1' : '0')}>隐藏切换器</option>
          </select>
        </div>
        <div>
          <label>选中文字时（划词搜索）</label>
          <select id="ses-selection">
            <option value="off"${option('off', ui.selectionTrigger)}>不显示</option>
            <option value="engine"${option('engine', ui.selectionTrigger)}>仅搜索引擎页面</option>
            <option value="global"${option('global', ui.selectionTrigger)}>所有网站</option>
          </select>
        </div>
        <div>
          <label>打开方式</label>
          <select id="ses-open-way">
            <option value="0"${option('0', ui.openInNewTab ? '1' : '0')}>当前标签页</option>
            <option value="1"${option('1', ui.openInNewTab ? '1' : '0')}>新标签页</option>
          </select>
        </div>
        <div>
          <label>主题模式</label>
          <select id="ses-theme">
            <option value="auto"${option('auto', ui.theme)}>跟随系统</option>
            <option value="light"${option('light', ui.theme)}>浅色</option>
            <option value="dark"${option('dark', ui.theme)}>深色</option>
          </select>
        </div>
      </div>

      <div class="panel-footer">
        <button class="ghost" id="ses-close">关闭</button>
        <button class="primary" id="ses-save">保存设置</button>
      </div>
    `;

    renderEngineRows(panel);
    bindPanelEvents(panel);
  }

  function openPanel() {
    renderPanel();
    const overlay = createPanel();
    overlay.classList.add('show');
    applyThemeTo(overlay);
  }

  function closePanel() {
    const overlay = document.getElementById(PANEL_ID);
    if (overlay) overlay.classList.remove('show');
  }

  // ==================== 引擎增删改 ====================

  function editEngine(existing) {
    const name = prompt('搜索引擎名称', existing ? existing.name : '');
    if (name == null) return;

    const searchUrl = prompt(
      '搜索 URL（必须包含 {q}）',
      existing ? existing.searchUrl : 'https://example.com/search?q={q}'
    );
    if (searchUrl == null) return;
    const trimmedUrl = searchUrl.trim();
    if (!trimmedUrl.includes('{q}')) {
      alert('URL 必须包含 {q} 占位符');
      return;
    }
    try {
      new URL(trimmedUrl.split('{q}').join('test'));
    } catch (_) {
      alert('搜索 URL 不是合法的网址');
      return;
    }

    const hostsRaw = prompt('识别当前引擎的域名（可选，逗号分隔）', existing ? (existing.hosts || []).join(',') : '');
    if (hostsRaw == null) return;

    const hosts = hostsRaw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (existing) {
      existing.name = name.trim() || existing.name;
      existing.searchUrl = trimmedUrl;
      existing.hosts = hosts;
    } else {
      config.engines.push({
        id: uid(),
        name: name.trim() || '未命名',
        searchUrl: trimmedUrl,
        hosts,
        queryKeys: [],
        hidden: false,
        disableWidget: false
      });
    }

    saveConfig(config);
    refreshEngineRows();
  }

  function moveEngine(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= config.engines.length) return;
    const item = config.engines[index];
    config.engines[index] = config.engines[target];
    config.engines[target] = item;
    saveConfig(config);
    refreshEngineRows();
  }

  function deleteEngine(index) {
    if (config.engines.length <= 1) {
      alert('至少保留一个搜索引擎');
      return;
    }
    const item = config.engines[index];
    if (!item) return;
    const confirmed = confirm(`确定删除 ${item.name} 吗？`);
    if (!confirmed) return;
    config.engines.splice(index, 1);
    saveConfig(config);
    refreshEngineRows();
  }

  function toggleEngineVisibility(index) {
    const engine = config.engines[index];
    if (!engine) return;
    engine.hidden = !engine.hidden;
    saveConfig(config);
    refreshEngineRows();
  }

  function toggleWidgetVisibility(index) {
    const engine = config.engines[index];
    if (!engine) return;
    engine.disableWidget = !engine.disableWidget;
    saveConfig(config);
    refreshEngineRows();
  }

  // ==================== 配置导入导出 ====================

  function exportConfig() {
    const json = JSON.stringify(config, null, 2);
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'search-engine-switcher-config.json';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (_) {
      const dataUrl = `data:text/json;charset=utf-8,${encodeURIComponent(json)}`;
      const anchor = document.createElement('a');
      anchor.href = dataUrl;
      anchor.download = 'search-engine-switcher-config.json';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }
  }

  function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const imported = JSON.parse(loadEvent.target.result);
          const merged = mergeConfig(imported);
          migratePresets(merged);
          if (!confirm('确定要覆盖当前配置吗？此操作不可逆！')) return;

          Object.assign(config, merged);
          saveConfig(config);
          applyRootPosition(createRoot());
          applyUiSettings();
          renderPanel();
          alert('配置导入成功！');
        } catch (error) {
          alert('配置导入失败：无效的 JSON 格式或数据结构。');
          console.error('Import Config Error:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ==================== 拖拽定位 ====================

  function startDragPositioning() {
    if (dragModeActive) return;
    const root = createRoot();
    const original = {
      useCustomXY: config.ui.useCustomXY,
      customX: config.ui.customX,
      customY: config.ui.customY
    };

    dragModeActive = true;
    config.ui.useCustomXY = true;
    // 拖拽时需要看到控件本体，即使当前页面按规则本应隐藏
    root.classList.remove('hidden');
    root.setAttribute('aria-hidden', 'false');
    if (!root.querySelector('.ses-pill')) rebuildPills('');
    applyRootPosition(root);
    root.style.cursor = 'move';
    root.style.touchAction = 'none';

    const hint = document.createElement('div');
    hint.textContent = '拖动切换器到目标位置，松开保存；按 Esc 取消';
    hint.setAttribute(
      'style',
      'position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:2147483647;background:#1f2430;color:#fff;padding:8px 14px;border-radius:8px;font:13px/1.4 -apple-system,"Segoe UI",Arial,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.35);pointer-events:none;'
    );
    document.documentElement.appendChild(hint);

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = config.ui.customX;
    let originY = config.ui.customY;
    let finished = false;

    function cleanup() {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('keydown', onKeydown, true);
      root.removeEventListener('pointerdown', onDown);
      root.style.cursor = '';
      root.style.touchAction = '';
      hint.remove();
      dragModeActive = false;
    }

    function finish(save) {
      if (finished) return;
      finished = true;
      if (!save) {
        config.ui.useCustomXY = original.useCustomXY;
        config.ui.customX = original.customX;
        config.ui.customY = original.customY;
      } else {
        const rect = root.getBoundingClientRect();
        config.ui.customX = Math.round(rect.left);
        config.ui.customY = Math.round(rect.top);
        saveConfig(config);
      }
      cleanup();
      applyRootPosition(root);
      refreshEngineRows();
    }

    function onDown(e) {
      if (e.button != null && e.button !== 0) return;
      const target = e.target;
      if (target && target.closest && target.closest('.ses-pill')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originX = config.ui.customX;
      originY = config.ui.customY;
      if (target && target.setPointerCapture) {
        try {
          target.setPointerCapture(e.pointerId);
        } catch (_) {
          // ignore
        }
      }
      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onCancel);
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      config.ui.customX = Math.max(0, originX + (e.clientX - startX));
      config.ui.customY = Math.max(0, originY + (e.clientY - startY));
      applyRootPosition(root);
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      finish(true);
    }

    function onCancel() {
      if (!dragging) return;
      dragging = false;
      finish(false);
    }

    function onKeydown(e) {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      finish(false);
    }

    root.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKeydown, true);
  }

  // ==================== 使用指南 ====================

  function showOfflineGuide() {
    const guideHtml = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Search Engine Switcher 使用指南</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .container {
            background-color: #fff;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          h1 { color: #2e5fff; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          h2 { color: #444; margin-top: 30px; }
          ul, ol { padding-left: 20px; }
          li { margin-bottom: 10px; }
          .highlight { background-color: #ffeeba; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          code { background: #f2f3f5; padding: 1px 5px; border-radius: 4px; }
          .tip {
            background-color: #f0f7ff;
            border-left: 4px solid #2e5fff;
            padding: 12px;
            margin-top: 16px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 欢迎使用 Search Engine Switcher (v${CURRENT_VERSION})</h1>
          <p>感谢您安装本脚本！为了让您更好地使用，请花 1 分钟阅读以下指南：</p>

          <h2>👀 悬浮窗什么时候出现、什么时候隐藏？</h2>
          <p>为了避免打扰正常浏览，悬浮窗<strong>只在需要切换搜索引擎时出现</strong>：</p>
          <ul>
            <li><strong>搜索结果页</strong>：当页面网址里带有搜索关键词（如 <code>q=</code>、<code>wd=</code>、<code>text=</code>）时自动出现，方便一键切换到其他引擎。</li>
            <li><strong>划词搜索</strong>（默认开启，仅限搜索引擎页面）：在 Google、百度等引擎的首页或结果页选中文字后出现，可把选中的文字直接带去其他引擎搜索。可在 <strong>设置 → 行为选项 → 选中文字时</strong> 改为“不显示”或“所有网站”。</li>
            <li><strong>无关键词时</strong>：该选项可选“仍然显示切换器”，让该引擎的首页/搜索页常驻悬浮窗（默认隐藏）。</li>
          </ul>
          <p>以下页面<strong>不会</strong>出现悬浮窗：普通网页、Gmail / Google 文档 / 百度百科 / 贴吧这类“虽然属于某引擎域名、但并不是搜索页”的页面，以及您在设置中“禁用悬浮”的站点。</p>

          <h2>⚙️ 如何打开设置？</h2>
          <ol>
            <li>点击悬浮窗右侧的小齿轮 ⚙；</li>
            <li>或长按悬浮窗约 0.5 秒；</li>
            <li>或点击浏览器脚本管理器（Tampermonkey 等）图标 → 本脚本菜单 → <strong>搜索引擎切换器设置</strong>。<strong>悬浮窗隐藏时也可用这个入口</strong>，包括在任意网页上。</li>
          </ol>

          <h2>🖱️ 基础操作</h2>
          <ul>
            <li><strong>左键点击</strong>：直接在当前页面（或根据设置在新标签页）切换到目标搜索引擎。</li>
            <li><strong>鼠标中键点击</strong>：强制在<span class="highlight">新标签页</span>中打开搜索结果。</li>
            <li><strong>长按悬浮窗 / 点击 ⚙</strong>：打开设置面板，可增删引擎、调整顺序、修改显示位置与行为。</li>
          </ul>

          <h2>🚫 不想在某个网站看到悬浮窗？</h2>
          <p>在 <strong>设置 → 引擎列表</strong> 中找到对应网站（如哔哩哔哩、YouTube），点击其右侧的 <strong>“禁用悬浮”</strong> 按钮即可。另外，如果不想使用划词唤起，把“选中文字时”改为“不显示”即可。</p>

          <h2>🔄 关于预设更新</h2>
          <p>脚本更新时会自动把<strong>预置搜索引擎的地址/域名迁移到最新版本</strong>（例如 Kimi 更换域名），您无需手动修改；但您自己手动改过的搜索引擎不会被覆盖。想彻底重置可点击引擎列表右上角的“恢复默认”。</p>

          <div class="tip">
            <strong style="color:#2e5fff; display:block; margin-bottom:6px;">💡 小提示</strong>
            悬浮窗位置、主题（跟随系统/浅色/深色）、打开方式都可以在设置里调整；设置会保存在脚本管理器的存储中，在所有网站通用。
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const blob = new Blob([guideHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
      const opened = window.open(url, '_blank');
      if (!opened) {
        // 弹窗被拦截时降级为当前页打开
        window.location.assign(url);
      }
    } catch (error) {
      console.error('Show Guide Error:', error);
    }
  }

  // ==================== 初始化 ====================

  function checkFirstInstallOrUpdate() {
    const lastVersion = safeGMGet(VERSION_KEY, null);
    if (lastVersion === CURRENT_VERSION) return;
    // 只记录版本，不再自动 window.open 指南（无用户手势会被浏览器拦截，且反复弹窗很打扰）
    safeGMSet(VERSION_KEY, CURRENT_VERSION);
  }

  function registerMenuCommands() {
    if (typeof GM_registerMenuCommand !== 'function') return;
    const safeRegister = (label, handler) => {
      try {
        GM_registerMenuCommand(label, handler);
      } catch (_) {
        // ignore
      }
    };
    safeRegister('搜索引擎切换器设置', openPanel);
    safeRegister('使用指南', showOfflineGuide);
    safeRegister(config.ui.enabled === false ? '启用悬浮切换器' : '停用悬浮切换器', () => {
      config.ui.enabled = config.ui.enabled === false;
      saveConfig(config);
      applyUiSettings();
    });
  }

  function installHistoryHooks() {
    // 部分 SPA（如 YouTube）用 history.pushState 换页且不派发事件，包装后立即刷新状态
    try {
      for (const method of ['pushState', 'replaceState']) {
        const original = window.history && window.history[method];
        if (typeof original !== 'function' || original.__sesWrapped) continue;
        const wrapped = function (...args) {
          const result = original.apply(this, args);
          scheduleRender();
          return result;
        };
        wrapped.__sesWrapped = true;
        window.history[method] = wrapped;
      }
    } catch (_) {
      // ignore
    }
  }

  function init() {
    checkFirstInstallOrUpdate();
    injectStyle();
    createRoot();
    applyTheme();
    renderWidget(true);
    registerMenuCommands();

    window.addEventListener('popstate', scheduleRender);
    window.addEventListener('hashchange', scheduleRender);
    installHistoryHooks();

    document.addEventListener('selectionchange', onSelectionChanged);
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        applyRootPosition(createRoot());
      }, 150);
    });

    if (window.matchMedia) {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        const onSchemeChange = () => {
          if (config.ui.theme === 'auto') {
            applyTheme();
            renderWidget(true);
          }
        };
        if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', onSchemeChange);
        else if (mediaQuery.addListener) mediaQuery.addListener(onSchemeChange);
      } catch (_) {
        // ignore
      }
    }

    // 页面移除我们的节点时自动恢复；只观察 documentElement 的直接子节点，避免整棵文档的性能开销
    const observer = new MutationObserver(() => {
      if (!document.getElementById(ROOT_ID)) {
        createRoot();
        renderWidget(true);
      }
      if (!document.getElementById(STYLE_ID)) injectStyle();
    });
    observer.observe(document.documentElement, { childList: true });

    // 兜底：极少数环境无法包装 history，用极轻量的 URL 轮询兜底（只在地址真正变化时才重新渲染）
    let lastHref = location.href;
    window.setInterval(() => {
      if (location.href !== lastHref) {
        lastHref = location.href;
        scheduleRender();
      }
    }, 800);
  }

  init();
})();
