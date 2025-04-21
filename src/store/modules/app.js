import { defineStore } from 'pinia'
import { generate, getRgbStr } from '@arco-design/color'

let defaultSetting = {
  appName: 'argos',
  mode: 'light',
  tag: true,
  menuCollapse: false,
  menuWidth: 240,
  layout: 'classic',
  skin: 'mine',
  animation: 'ma-slide-right',
  color: '#165DFF',
  settingOpen: false,
  searchOpen: false,
  registerWangEditorButtonFlag: false
}

document.body.setAttribute('arco-theme', defaultSetting.mode)
document.body.setAttribute('mine-skin', defaultSetting.skin)

const useAppStore = defineStore('seller_pc_store_app', {
  state: () => ({ ...defaultSetting }),

  getters: {
    appCurrentSetting() {
      return { ...this.$state }
    },
  },

  actions: {
    setAppName(appname) {
      this.appName = appname
    },

    updateSettings(partial) {
      this.$patch(partial);
    },

    toggleMode(dark) {
      this.mode = dark
      document.getElementsByTagName('html')[0].className = this.mode
      document.body.setAttribute('arco-theme', this.mode)
      defaultSetting.mode = this.mode
      this.changeColor(this.color)
    },

    toggleMenu(status) {
      this.menuCollapse = status
      defaultSetting.menuCollapse = this.menuCollapse
    },

    toggleTag(status) {
      this.tag = status
      defaultSetting.tag = this.tag
    },

    toggleWs(val) {
      this.ws = val
      defaultSetting.ws = this.ws
    },

    changeMenuWidth(width) {
      this.menuWidth = width
      defaultSetting.menuWidth = this.menuWidth
    },

    changeLayout(layout) {
      this.layout = layout
      defaultSetting.layout = this.layout
    },

    changeColor(color) {
      if (!/^#[0-9A-Za-z]{6}/.test(color)) return
      this.color = color
      const list = generate(this.color, { list: true, dark: this.mode === 'dark' })
      list.forEach((color, index) => {
        const rgbStr = getRgbStr(color)
        document.body.style.setProperty(`--primary-${index + 1}`, rgbStr)
        document.body.style.setProperty(`--arcoblue-${index + 1}`, rgbStr)
      })
      defaultSetting.color = this.color
    },

    changeAnimation(name) {
      this.animation = name
      defaultSetting.animation = this.animation
    },

    useSkin(name) {
      this.skin = name
      defaultSetting.skin = this.skin
      document.body.setAttribute('mine-skin', this.skin)
    },

    setRegisterWangEditorButtonFlag(value) {
      this.registerWangEditorButtonFlag = value
    }
  }
})

export default useAppStore
