import axios from 'axios'
import { getToken } from "@/utils/token-util.js";
import i18n from "@/i18n/index.js";
import moment from "moment-timezone";
import { useUserStore } from "@/store";

// 获取时区信息
moment.tz.setDefault('Asia/Shanghai')
let timezone = moment.tz.guess(true) || 'Asia/Shanghai'
const appName = import.meta.env.VITE_APP
if (appName === 'flipkart3') { // 韩国时区
  timezone = 'Asia/Seoul'
}

const BASE_URL = window.location.protocol + "//" + window.location.host

const service = axios.create({
  baseURL: BASE_URL, // url = base url + request url
  headers: {
    'Content-Type': 'application/json;',
  },
  timeout: 30000 // request timeout
})

// 请求拦截
service.interceptors.request.use(config => {
  if (!config) {
    config = {}
  }
  if (!config.headers) {
    config.headers = {}
  }

  // formData 形式
  if (config.formData) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
  }
  const TOKEN = getToken()
  
  if (TOKEN) { // 携带token
    if (!config.headers['token'] && !config.passToken) {
      config.headers['token'] = `${TOKEN}`
    }
  }

  // lang
  if (!config.params) {
    config.params = {}
  }
  config.params.lang = i18n.global.locale.value || 'en'
  config.params.tz = timezone

  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截
service.interceptors.response.use(res => {
  const userStore = useUserStore();
  const { msg, data, errCode} = res.data

  if (res.config['returnType'] === 'origin') { // 原样返回
    return Promise.resolve(res.data)
  }
  switch (Number(errCode)) {
    case 0: // 正确响应
      return Promise.resolve(res.data)
    case 200000: // 正确响应
      return Promise.resolve(res.data)
    case 400003:
      userStore.logout()
      break
    default: // 直接弹出消息
      return Promise.reject(msg);
  }
},
  error => { // 网络状态监控
    if (error && error.request) {
      const status = error.request['status']
      switch (status) {
        case 424:
          logout()
          break
        case 404:
          console.log('接口未找到');
          break
        case 415:
          console.log('接口未HTTP协议不匹配，请确认找到');
          break
        case 428:
          console.log('验证码不合法');
          break
        default:
          console.log(error.message || '服务错误');
      }
    } else {
      console.log(error.message || '服务错误');
    }

    return Promise.reject(error)
  }
)

export default service