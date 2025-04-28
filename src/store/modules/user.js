import { defineStore } from 'pinia'
import { userCurrentGet, userWalletGetMyWallet } from '@/api/user'
import { sellerInfo as sellerInfoApi } from '@/api/seller'
import { removeToken } from '@/utils/token-util.js'
import { navigationTo } from '@/utils'
import useTagStore from './tag'
import useChatStore from './chat'
import useSystemStore from './system'

const useUserStore = defineStore('seller_pc_store_user', {
  state: () => ({ 
    userInfo: null,
    sellerInfo: null,
    walletInfo: null
  }),

  getters: {
    getState() {
      return { ...this.$state }
    }
  },

  actions: {
    async getUserInfo() { // 用户信息
      await userCurrentGet().then(res => {
        this.userInfo = res
      })
    },
    async getSellerInfo() { // 店铺信息
      await sellerInfoApi().then(res => {
        this.sellerInfo = res
      })
    },
    async getWalletInfo() { // 钱包信息
      await userWalletGetMyWallet().then(res => {
        this.walletInfo = res
      })
    },
    async getAllInfo() { // 获取全部信息
      await this.getUserInfo()
      await this.getSellerInfo()
    },
    logout() {
      // 系统tag
      const tagStore = useTagStore()
      tagStore.clearTags()

      // 关闭im
      useChatStore().closeChatHandle()

      // 关闭用户提示请求
      useSystemStore().clearUserNotice()

      // 关闭未处理订单数量请求
      useSystemStore().clearOrderCount()

      // 关闭站内信数量请求
      useSystemStore().clearMessageCount()

      // 关闭变帐通知请求
      useSystemStore().clearMoneyReqset()
      
      // 清除token
      removeToken()
      navigationTo('/login')
    }
  }
})

export default useUserStore