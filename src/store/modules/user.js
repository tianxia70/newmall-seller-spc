import { defineStore } from 'pinia'
import router from '../../router'
import { userCurrentGet, userWalletGetMyWallet, sellerGetGoodsProfit } from '@/api/user'
import { sellerGoodsList } from '@/api/goods'
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
    walletInfo: null,
    goodsProfit: {
      sysParaMin: 0,
      sysParaMax: 0
    },
    saleGoodsNum: 10
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
    async getGoodsProfit() { // 获取商品利润比例
      await sellerGetGoodsProfit().then(res => {
        if (res) {
          const { sysParaMin, sysParaMax } = res
          this.goodsProfit = {
            sysParaMin: Number(sysParaMin),
            sysParaMax: Number(sysParaMax)
          }
        }
      })
    },
    async getSaleGoodsNum() {
      await sellerGoodsList({
        pageNum: 1,
        pageSize: 10
      }).then(res => {
        this.saleGoodsNum = res?.sellerGoodsNum || 0
      })
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

      // 获取当前路由，如果不是login页面就进入login
      const currentRouteName = router.currentRoute.value.name
      if (currentRouteName && currentRouteName !== 'login' && currentRouteName !== 'register') {
        navigationTo('/login')
      }
    }
  }
})

export default useUserStore