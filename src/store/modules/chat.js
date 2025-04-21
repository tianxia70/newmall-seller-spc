import { defineStore } from 'pinia'
import i18n from "@/i18n";
import { getToken } from "@/utils/token-util.js";
import request from '@/utils/request-im';
import { sysConfigGetSyspara } from '@/api/system'
import { loadJs, dateFormat, loadSiteConfig } from '@/utils'
import useCurrencyStore from './currency'
import useUserStore from './user'
import useAppStore from './app'
import useSystemStore from './system'
import { userAvatarData } from '@/configs'

const sellerHeadImgObj = {}

for (let i = 0; i < userAvatarData.length; i++) {
  sellerHeadImgObj[i] = userAvatarData[i].href
}

let default_customer = ''
const appName = import.meta.env.VITE_APP || 'argos'
loadSiteConfig(appName).then(res => {
  const logo = res.serviceLogo || res.logo
  default_customer = `${window.location.protocol}//${window.location.host}${logo}`
})

let mp3, servicePlay
audioInit()
function audioInit(){
  servicePlay = function () {
    if (mp3) {
      mp3.play().catch(function () {})
    }
  }

  mp3 = new Audio()
  mp3.src = "https://imgtest1.s3.amazonaws.com/audio/service.mp3"
}

const getChatConfig = (isClient = false, business = false, userName = '') => {
  const userInfo = useUserStore().userInfo
  const sellerInfo = useUserStore().sellerInfo
  let lang = i18n.global.locale.value || 'en'

  let config = {
    userType: 1, // 1:游客，5：会员，目前只支持这两种了
    userName: "游客",
    lang,
    lastLoginTime: dateFormat(new Date()),
  }

  if (business) {
    config = {
      userId: "10016",
      userType: '',
      lang,
      userName: "卖家名称",
      accountType: "演示账号",
      headImg: "",
      welcomeMsg: "欢迎光临"
    }
  }

  if (userInfo) {
    const {usercode, lastLoginTime} = userInfo
    const {id, roleName, recomUserName, createTime, avatar, imInitMessage} = sellerInfo

    const userName = sellerInfo.name || userInfo.username || userInfo.name || userInfo.email || `+${userInfo.phone}`
    if (isClient) {
      config = {
        userId: id,
        userCode: usercode,
        userType: 5, // 1:游客，5：会员，目前只支持这两种了
        lang,
        userName: userName,
        reference: recomUserName || '', // 推荐人
        registerTime: createTime ? dateFormat(createTime) : dateFormat(new Date()),
        lastLoginTime: lastLoginTime ? dateFormat(lastLoginTime) : dateFormat(new Date()),
        accountType: roleName === 'GUEST' ? "演示店铺" : "正式店铺",
        headImg: avatar || ''
      }
    } else {
      config = {
        userType: 2, // 1:买家 2：卖家
        lang,
        userId: id,
        userCode: usercode,
        userName: userName,
        accountType: roleName === 'GUEST' ? "演示店铺" : "正式店铺",
        reference: recomUserName || '', // 推荐人
        registerTime: createTime ? dateFormat(createTime) : dateFormat(new Date()),
        lastLoginTime: lastLoginTime ? dateFormat(lastLoginTime) : dateFormat(new Date()),
        headImg: avatar || '',
        welcomeMsg: imInitMessage || 'Welcome'
      }
    }

    if (userName) {
      config.newUser = userName
    }
  }

  return config
}

const useChatStore = defineStore('seller_pc_store_chat', {
  state: () => ({ 
    imLinkUrl: '',
    chatNum: 0,
    sysChatNum: 0,
    imDone: false
  }),

  getters: {
    getState() {
      return { ...this.$state }
    }
  },

  actions: {
    async loadImConfig() {
      sysConfigGetSyspara({
        code: 'web_config'
      }).then(async res => {
        const web_config = res.web_config
        const link = JSON.parse(web_config)

        let imLink = link.imLink.lastIndexOf('/') === link.imLink.length - 1 ? link.imLink : `${link.imLink}/`

        this.imLinkUrl = imLink

        if (!window.im_create_iframe) {
          await loadJs(`${imLink}im_create_iframe.js?id=${Math.random()}`);
          im_create_iframe = window.im_create_iframe;
        }

        setTimeout(async () => {
          await this.initChatHandle()
        }, 2000)
      })
    },
    async initChatHandle() {
      console.log('chat init')

      const appStore = useAppStore()
      const systemStore = useSystemStore()
      const currencyStore = useCurrencyStore()

      const clientParams = getChatConfig(true)
      const clientConfig = {
        color: appStore.color,//颜色，你们自己配置，要跟网站的主颜色一致
        name: i18n.global.t('官方客服'),//聊天窗口标题
        floatLogoRight: "15",//浮动图标右边距
        floatLogoBottom: "15",//浮动图标底部边距
        width: "45",//宽
        height: "45",//高度
        borderRadius: "100",//圆色
        default_customer: default_customer, // 默认平台客服头像
        default_visitor: clientParams.headImg // 店铺logo
      }

      if (appName === 'tiktok8') {
        clientConfig.logo = default_customer
      }

      const businessParams = getChatConfig(false, true)
      const businessConfig = {
        color: appStore.color,//颜色，你们自己配置，要跟网站的主颜色一致
        name: i18n.global.t('买家消息'),//聊天窗口标题
        floatLogoRight: "15",//浮动图标右边距
        floatLogoBottom: "75",//浮动图标底部边距
        width: "45",//宽
        height: "45",//高度
        borderRadius: "100", //圆色
        default_customer: businessParams.headImg // 店铺logo
      }

      await window.im_create_iframe.init({
        routerConfig: [
          {
            router: "client",
            params: clientParams,
            other: {
              iconStatus: !Boolean(systemStore.customer_service_url),
              callApi: request,
              fileUpload: async function (fileInfo) {
                // 创建 Blob 对象
                const blob = new Blob([fileInfo.buffer], { type: fileInfo.fileType });
  
                // 你可以在 iframe 中使用这个 Blob 对象
                const file = new File([blob], fileInfo.fileName, { type: fileInfo.fileType });
                const formData = new FormData()
                formData.append("file", file)
                formData.append("moduleName", "user")
  
                return request({
                  url: `api/user/uploadimg`,
                  method: "post",
                  data: formData,
                  headers: {
                    "Content-Type": "multipart/form-data", // 指定请求头为文件上传类型
                  }
                })
              },
              imDataConfig: clientConfig,
              play() {
                console.log("播放声音")
                servicePlay && servicePlay()
              },
              getGoosInfoById(json) {
                return new Promise((resolve) => {
                  request({
                    url: `api/user/buyer/goods/info?sellerGoodsId=${json.id}`,
                    method: "post"
                  }).then(({data}) => {
                    resolve({
                      goodsImg: data.imgUrl1,
                      currencySymbol: currencyStore.currencyUnit,
                      goodsPrice: numberStrFormat(data.discountPrice || data.sellingPrice),
                      goodsName: data.name
                    })
                  })
                })
              }
            }
          },
          {
            router: "business",
            params: getChatConfig(false, true),
            other: {
              callApi: request,
              fileUpload: async function (fileInfo) {
                // 创建 Blob 对象
                const blob = new Blob([fileInfo.buffer], { type: fileInfo.fileType });
  
                // 你可以在 iframe 中使用这个 Blob 对象
                const file = new File([blob], fileInfo.fileName, { type: fileInfo.fileType });
                const formData = new FormData()
                formData.append("file", file)
                formData.append("moduleName", "user")
  
                return request({
                  url: `api/user/uploadimg`,
                  method: "post",
                  data: formData,
                  headers: {
                    "Content-Type": "multipart/form-data", // 指定请求头为文件上传类型
                  }
                })
              },
              sellerHeadImgConfig:{
                currentUrl: '',
                sellerHeadImgObj
              },
              imDataConfig: businessConfig,
              play() {
                console.log("播放声音")
                servicePlay && servicePlay()
              },
              getGoosInfoById(json) {
                return new Promise((resolve) => {
                  request({
                    url: `api/user/buyer/goods/info?sellerGoodsId=${json.id}`,
                    method: "post"
                  }).then(({data}) => {
                    resolve({
                      goodsImg: data.imgUrl1,
                      currencySymbol: currencyStore.currencyUnit,
                      goodsPrice: numberStrFormat(data.discountPrice || data.sellingPrice),
                      goodsName: data.name
                    })
                  })
                })
              }
            }
          }
        ],
        autoInit: false
      })

      const im_create_iframe_client = window.im_create_iframe_client
      const im_create_iframe_business = window.im_create_iframe_business
  
      if (getToken()) {
        im_create_iframe_client.eventOrder((event) => {
          if (event.eventType == "unReadNumChange") { // 消息未读变化事件
            this.chatNum = event.data || 0
          }
        });

        im_create_iframe_business.eventOrder((event) => {
          if (event.eventType == "unReadNumChange") { // 商家与买家聊天-消息未读变化事件
            this.sysChatNum = event.data || 0
          }
        });
      }

      this.imDone = true
    },
    async setChatHandle(username = '') {
      const systemStore = useSystemStore()

      this.imDone = false
      if (window.im_create_iframe_client) {
        const configInfo = getChatConfig(true)
        window.im_create_iframe_client.setParams(configInfo, {
          imDataConfig: {
            name: i18n.global.t('官方客服'),
            default_visitor: configInfo.headImg
          }
        });
        window.im_create_iframe_client.setIconStatus(!Boolean(systemStore.customer_service_url))
        window.im_create_iframe_client.eventOrder((event) => {
          if (event.eventType == "unReadNumChange") { // 消息未读变化事件
            this.chatNum = event.data || 0
          }
        });
      }

      if (window.im_create_iframe_business) {
        const configInfo = getChatConfig(false, true, username)
        window.im_create_iframe_business.setParams(configInfo, {
          imDataConfig: {
            name: i18n.global.t('买家消息'),
            default_customer: configInfo.headImg
          }
        });
        window.im_create_iframe_business.setIconStatus(true)

        window.im_create_iframe_business.eventOrder((event) => {
          if (event.eventType == "unReadNumChange") { // 商家与买家聊天-消息未读变化事件
            this.sysChatNum = event.data || 0
          }
        });
      }
      this.imDone = true
    },
    async setNewUserContact(username = '') {
      if (window.im_create_iframe_business) {
        im_create_iframe_business.sendMsg({
          event: 'newUserContact',
          data: {
            newUser: username
          }
        })
        this.imDone = true
      }
    }, 
    async closeChatHandle() {
      this.chatNum = 0
      this.sysChatNum = 0
      
      // 把IM设置为游客
      if (window.im_create_iframe_client) {
        window.im_create_iframe_client.setParams({
          userType: 1
        }, {
          imDataConfig: {
            default_visitor: ''
          }
        });
      }
      
      if (window.im_create_iframe_business) {
        window.im_create_iframe_business.setParams({
          userType: ''
        });
      }
    },
    async setBuyerChatHandle(data) {
      await window.im_create_iframe_business.setParams(data)
    }
  }
})

export default useChatStore