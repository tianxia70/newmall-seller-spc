import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import App from './App.vue';
import router from './router'
import store, { useAppStore } from './store'
import i18n from '@/i18n'
import directives from './directives'

// 样式
import 'vant/lib/index.css'
import '@arco-design/web-vue/dist/arco.css';
import "./assets/iconfont/iconfont.css";
import './styles/skin.less'
import './styles/index.css'
import './styles/global.less'

// 全局组件
import globalComponents from "@/components";

// 盘口配置
async function bootstrap() {
  const appName = import.meta.env.VITE_APP || 'argos'
  const config = await import(`./configs/sites/${appName}.js`).then(m => m.default)

  const app = createApp(App)

  app.use(ArcoVue, {})
  .use(ArcoVueIcon)
  .use(router)
  .use(store)
  .use(i18n)
  .use(directives)
  .use(globalComponents);

  app.mount('#app')

  // 设置 favicon 和标题
  const appStore = useAppStore()
  document.title = config.title
  appStore.setAppName(config.title)
  const favicon = document.querySelector(`link[rel='icon']`) || document.createElement('link')
  favicon.setAttribute('rel', 'icon')
  favicon.setAttribute('type', 'image/x-icon')
  favicon.setAttribute('href', config.favicon)
  document.head.appendChild(favicon)

  // 自定义主题色
  if (config.themeColor) {
    appStore.changeColor(config.themeColor)
  }
  // 主题模式
  if (config.themeMode) {
    appStore.toggleMode(config.themeMode)
  }
}

bootstrap()
