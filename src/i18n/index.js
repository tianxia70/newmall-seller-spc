import axios from 'axios'
import { langKey } from '@/configs'

// 注意：这个文件现在主要用于提供动态切换语言的功能
// 主要的 i18n 初始化逻辑已经移动到 main.js 中

let i18nInstance = null

// 设置 i18n 实例的引用（由 main.js 调用）
export function setI18nInstance(instance) {
  i18nInstance = instance
}

// 获取当前 i18n 实例
export function getI18nInstance() {
  return i18nInstance
}

// 动态加载语言包
export async function loadLocaleMessages(locale) {
  if (!i18nInstance) {
    console.error('i18n instance not initialized yet')
    return false
  }

  try {
    // 检查是否已经加载过该语言包
    if (!i18nInstance.global.availableLocales.includes(locale)) {
      const messages = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}locales/${locale}.js?t=${new Date().getTime()}`)
      i18nInstance.global.setLocaleMessage(locale, messages.default)
    }
    
    // 切换语言
    i18nInstance.global.locale.value = locale
    
    // 保存到本地存储
    localStorage.setItem(langKey, locale)
    
    // 设置文本方向
    const direction = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', direction)
    
    return true
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error)
    return false
  }
}

// 通过IP获取位置来推断语言（可用于自动检测用户语言）
export const getLocationBasedLanguage = () => {
  return new Promise((resolve, reject) => {
    axios.get('https://ipinfo.io/json').then(res => {
      const country = res.data.country
      let lang = 'en'
      
      switch (country) {
        case 'JP':
          lang = 'ja'
          break
        case 'IN':
          lang = 'hi'
          break
        case 'VN':
          lang = 'vi'
          break
        case 'ID':
          lang = 'id'
          break
        case 'MY':
          lang = 'ms'
          break
        case 'TH':
          lang = 'th'
          break
        case 'KR':
          lang = 'ko'
          break
        case 'DE':
          lang = 'de'
          break
        case 'TU':
        case 'TR':
          lang = 'tr'
          break
        case 'RU':
          lang = 'ru'
          break
        case 'FR':
          lang = 'fr'
          break
        case 'IT':
          lang = 'it'
          break
        case 'ES':
          lang = 'es'
          break
        case 'GR':
          lang = 'el'
          break
        case 'TW':
        case 'HK':
        case 'MC':
          lang = 'zh-tw'
          break
        case 'CN':
          lang = 'zh-cn'
          break
      }
      
      resolve(lang)
    }).catch(err => {
      reject(err)
    })
  })
}

// 获取支持的语言列表
export const getSupportedLanguages = () => {
  return ['en', 'zh-cn', 'zh-tw', 'es', 'pt', 'af', 'el', 'it', 'ru', 'tr', 'de', 'fr', 'ja', 'ko', 'ms', 'th', 'tl', 'ar', 'vi', 'hi', 'id']
}

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18nInstance?.global.locale.value || 'en'
}

// 检查语言是否被支持
export const isLanguageSupported = (locale) => {
  return getSupportedLanguages().includes(locale)
}

// 为了向后兼容，导出一个空的默认对象
// 实际的 i18n 实例由 main.js 创建和管理
export default {
  // 这些方法将在应用初始化后可用
  get global() {
    return i18nInstance?.global
  }
}