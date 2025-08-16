/**
 * ---- 存储标识 -----
 */

// 系统token存储标识
export const tokenKey = 'seller_pc_token'

// 多语言存储标识
export const langKey = 'seller_pc_store_language'

// 手机区号存储标识
export const phoneAreaCodeKey = 'seller_pc_religion_code'

// 登录存储标识
export const loginTypeKey = 'seller_pc_login_type'
export const loginEmailKey = 'seller_pc_login_email'
export const loginMobileKey = 'seller_pc_login_mobile'

// 银行信息存储标识
export const bankInfoKey = 'seller_pc_bank_info'

/**
 * ---- 存储标识 -----
 */


// api 前缀
export const APP_PROXY_PREFIX = '/api'

// 路由白名单
export const whiteRoute = ['login', 'register']

// 系统支持的多语言标识
export const langMessages = [ 'en', 'zh-cn', 'zh-tw', 'es', 'pt', 'af', 'el', 'it', 'ru', 'tr', 'de', 'fr', 'ja', 'ko', 'ms', 'th', 'tl', 'ar', 'vi', 'hi', 'id', 'ro']

// 手机区号默认
export const phoneAreaCodeDefalut = 44

// 用户头像
export const userAvatarData = [
  new URL('@/assets/images/avatar/0.png', import.meta.url),
  new URL('@/assets/images/avatar/1.png', import.meta.url),
  new URL('@/assets/images/avatar/2.png', import.meta.url),
  new URL('@/assets/images/avatar/3.png', import.meta.url),
  new URL('@/assets/images/avatar/4.png', import.meta.url),
  new URL('@/assets/images/avatar/5.png', import.meta.url),
  new URL('@/assets/images/avatar/6.png', import.meta.url),
  new URL('@/assets/images/avatar/7.png', import.meta.url),
  new URL('@/assets/images/avatar/8.png', import.meta.url),
  new URL('@/assets/images/avatar/9.png', import.meta.url),
  new URL('@/assets/images/avatar/10.png', import.meta.url),
  new URL('@/assets/images/avatar/11.png', import.meta.url),
  new URL('@/assets/images/avatar/12.png', import.meta.url),
  new URL('@/assets/images/avatar/13.png', import.meta.url),
  new URL('@/assets/images/avatar/14.png', import.meta.url),
  new URL('@/assets/images/avatar/15.png', import.meta.url),
  new URL('@/assets/images/avatar/16.png', import.meta.url),
  new URL('@/assets/images/avatar/17.png', import.meta.url),
  new URL('@/assets/images/avatar/18.png', import.meta.url),
  new URL('@/assets/images/avatar/19.png', import.meta.url),
  new URL('@/assets/images/avatar/20.png', import.meta.url),
  new URL('@/assets/images/avatar/21.png', import.meta.url)
]

// 店铺等级
export const sellerLogoData = {
  'A': new URL('@/assets/images/level/a.png', import.meta.url),
  'B': new URL('@/assets/images/level/b.png', import.meta.url),
  'C': new URL('@/assets/images/level/c.png', import.meta.url),
  'D': new URL('@/assets/images/level/d.png', import.meta.url),
  'S': new URL('@/assets/images/level/s.png', import.meta.url),
  'SS': new URL('@/assets/images/level/ss.png', import.meta.url),
  'SSS': new URL('@/assets/images/level/sss.png', import.meta.url)
}

// 测试环境地址
export const TEST_URL = 'https://www.sjiepc.com'
