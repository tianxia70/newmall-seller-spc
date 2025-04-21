import { createI18n } from 'vue-i18n'
import axios from 'axios'
import { langKey, langMessages } from '@/configs'

const appName = import.meta.env.VITE_APP
let lang = 'en'

const i18n = createI18n({
  legacy: false,
  locale: lang, // 首先从缓存里拿，没有的话就用浏览器语言，
  fallbackLocale: lang, // 设置备用语言
  messages: {},
  warnHtmlMessage: false
})

const getLocation = () => {
  return new Promise((resolve, rejcet) => {
    axios.get('https://ipinfo.io/json').then(res => {
      const data = res.data.country
      let lang = 'en'
      switch (data) {
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
          lang = 'tr'
          break
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
      }
      if (['TW', 'HK', 'MC'].includes(data)) {
        lang = 'zh-tw'
      }
      resolve(lang)
    }).catch(err => {
      rejcet(err)
    })
  })
}

const storeLang = localStorage.getItem(langKey)
if (langMessages.includes(storeLang)) {
  lang = storeLang
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl')
  }
} else {
  document.documentElement.setAttribute('dir', 'rtr')
  if (['tiktok9'].includes(appName)) { // 默认简体中文
    lang = 'zh-cn'
    localStorage.setItem(langKey, lang)
    location.reload()
  } else if (['oceanPick'].includes(appName)) { // 默认英文
    lang = 'en'
    localStorage.setItem(langKey, lang)
    location.reload()
  } else {
    getLocation().then(res => {
      const data = res || lang
      const type = lang === 'ar' ? 'rtl' : 'rtr'

      lang = data
      localStorage.setItem(langKey, data)
      document.documentElement.setAttribute('dir', type)

      location.reload()
    }).catch(() => {
      localStorage.setItem(langKey, lang)
      document.documentElement.setAttribute('dir', 'rtr')
    })
  }
}

loadLocaleMessages(lang)

async function loadLocaleMessages(locale) {
  if (!i18n.global.availableLocales.includes(locale)) {
    const messages = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}locales/${locale}.js?t=${new Date().getTime()}`)

    i18n.global.setLocaleMessage(locale, messages.default)
  }
  i18n.global.locale.value = locale
}

export default i18n

export { loadLocaleMessages }