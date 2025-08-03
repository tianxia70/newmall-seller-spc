import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import App from './App.vue';
import router from './router'
import store, { useAppStore } from './store'
import directives from './directives'

// 样式
import 'vant/lib/index.css'
import '@arco-design/web-vue/dist/arco.css';
import "./assets/iconfont/iconfont.css";
import './styles/skin.less'
import './styles/index.css'
import './styles/global.less'

// 全局组件
import 'virtual:svg-icons-register'
import globalComponents from "@/components";

// 初始化多语言
async function initI18n() {
  const { createI18n } = await import('vue-i18n')
  const { langKey, langMessages } = await import('@/configs')
  
  const appName = import.meta.env.VITE_APP
  let lang = 'en'
  const messagesArr = [ 'en', 'zh-cn', 'zh-tw', 'es', 'pt', 'af', 'el', 'it', 'ru', 'tr', 'de', 'fr', 'ja', 'ko', 'ms', 'th', 'tl', 'ar', 'vi', 'hi', 'id']

  // 获取存储的语言设置
  const storeLang = localStorage.getItem(langKey)
  if (langMessages.includes(storeLang)) {
    lang = storeLang
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl')
    }
  } else {
    document.documentElement.setAttribute('dir', 'ltr')
    if (['tiktok9'].includes(appName)) {
      lang = 'zh-cn'
    } else if (['oceanPick'].includes(appName)) {
      lang = 'en'
    } else {
      // 获取浏览器当前语言
      const browserLang = navigator.language.toLowerCase()
      const shortLang = browserLang.split('-')[0]

      if (messagesArr.includes(browserLang)) {
        lang = browserLang
      } else if (messagesArr.includes(shortLang)) {
        lang = shortLang
      }
    }
    
    const type = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem(langKey, lang)
    document.documentElement.setAttribute('dir', type)
  }

  // 创建i18n实例
  const i18n = createI18n({
    legacy: false,
    locale: lang,
    fallbackLocale: 'en',
    messages: {},
    warnHtmlMessage: false
  })

  // 异步加载语言包
  try {
    const messages = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}locales/${lang}.js?t=${new Date().getTime()}`)
    i18n.global.setLocaleMessage(lang, messages.default)
    i18n.global.locale.value = lang
  } catch (error) {
    console.warn(`Failed to load locale ${lang}, falling back to English`)
    // 加载失败时使用英文
    try {
      const enMessages = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}locales/en.js?t=${new Date().getTime()}`)
      i18n.global.setLocaleMessage('en', enMessages.default)
      i18n.global.locale.value = 'en'
    } catch (enError) {
      console.error('Failed to load fallback English locale:', enError)
    }
  }

  return i18n
}

// 盘口配置
async function bootstrap() {
  // 显示加载状态
  const loadingElement = document.createElement('div')
  loadingElement.id = 'app-loading'
  loadingElement.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="text-align: center;">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #165DFF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <div style="color: #666; font-size: 14px;">Loading language pack...</div>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `
  document.body.appendChild(loadingElement)

  try {
    // 1. 加载站点配置
    const appName = import.meta.env.VITE_APP || 'argos'
    const config = await import(`./configs/sites/${appName}.js`).then(m => m.default)

    // 2. 初始化多语言（等待语言包加载完成）
    const i18n = await initI18n()
    
    // 设置 i18n 实例引用，供其他模块使用
    const { setI18nInstance } = await import('@/i18n')
    setI18nInstance(i18n)

    // 3. 创建应用实例
    const app = createApp(App)

    app.use(ArcoVue, {})
    .use(ArcoVueIcon)
    .use(router)
    .use(store)
    .use(i18n)
    .use(directives)
    .use(globalComponents);

    // 4. 挂载应用
    app.mount('#app')

    // 5. 设置 favicon 和标题
    const appStore = useAppStore()
    document.title = config.title
    appStore.setAppName(config.title)
    const favicon = document.querySelector(`link[rel='icon']`) || document.createElement('link')
    favicon.setAttribute('rel', 'icon')
    favicon.setAttribute('type', 'image/x-icon')
    favicon.setAttribute('href', config.favicon)
    document.head.appendChild(favicon)

    // 6. 自定义主题色
    if (config.themeColor) {
      appStore.changeColor(config.themeColor)
    }
    // 主题模式
    const setThemeMode = localStorage.getItem('seller_pc_store_app_theme_mode')
    if (setThemeMode) {
      appStore.toggleMode(setThemeMode)
    } else if (config.themeMode) {
      appStore.toggleMode(config.themeMode)
    }

    // 7. 移除加载动画
    const loadingEl = document.getElementById('app-loading')
    if (loadingEl) {
      loadingEl.remove()
    }

  } catch (error) {
    console.error('Failed to bootstrap application:', error)
    
    // 移除加载动画并显示错误信息
    const loadingEl = document.getElementById('app-loading')
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="text-align: center; color: #f56565;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Failed to load application</div>
            <div style="font-size: 14px; color: #666;">Please refresh the page to try again</div>
            <button onclick="location.reload()" style="
              margin-top: 20px;
              padding: 8px 16px;
              background: #165DFF;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Refresh Page</button>
          </div>
        </div>
      `
    }
  }
}

bootstrap()
