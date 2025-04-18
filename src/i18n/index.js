import { createI18n } from 'vue-i18n'

import enLocale from './locales/en'
import zh_cnLocale from './locales/zh-cn'
// import zh_twLocale from './locales/zh-tw'

const messages = {
  'en': {
    ...enLocale
  },
  'zh-cn': {
    ...zh_cnLocale
  },
  // 'zh-tw': {
  //   ...zh_twLocale
  // }
}

const langStr = localStorage.getItem('vc-online-language')
const lang = langStr ? JSON.parse(langStr) : 'en'

const i18n = createI18n({
  legacy: false,
  locale: lang,
  fallbackLocale: lang,
  messages,
  warnHtmlMessage: false
})

export default i18n