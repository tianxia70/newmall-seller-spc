import { defineStore } from 'pinia'
import {
  sysConfigGetSyspara,
  bulletinList,
  sellerNoticeGet,
  sellerNoticeRead,
  sellerMallStatNoPushNum,
  notificationUnreadCount,
  addMoneyNotify,
  notifyCallback,
  getCountryList
} from '@/api/system'

const useSystemStore = defineStore('seller_pc_store_system', {
  state: () => ({ 
    seller_sold_out_switch: '0',
    customer_service_url: '',
    system_notice: '',
    get_user_notice_after: false,
    show_user_notice: false,
    user_notice: '',
    user_notice_interval: null,
    order_count: 0,
    order_count_interval: null,
    message_count: 0,
    message_count_interval: null,
    has_money_in: false,
    money_interval: null,
    countryList: []
  }),

  getters: {
    getState() {
      return { ...this.$state }
    }
  },

  actions: {
    getSystemConfig() {
      sysConfigGetSyspara({
        code: 'customer_service_url,seller_sold_out_switch'
      }).then(res => {
        this.customer_service_url = res.customer_service_url || ''
        this.seller_sold_out_switch = res.seller_sold_out_switch || ''
      })
    },
    getSystemNotice() {
      return new Promise((resolve, reject) => {
        bulletinList().then(res => {
          const content = res?.content || ''
          this.system_notice = content
          resolve(content)
        }).catch(err => {
          reject(err)
        })
      })
    },
    userNoticeRequset() {
      sellerNoticeGet().then(res => {
        if (res) {
          this.user_notice = res.content
          this.show_user_notice = true
          sellerNoticeRead({id: res.id})
        } else {
          this.get_user_notice_after = true
        }
      })
    },
    getUserNotice() {
      this.userNoticeRequset()

      if (this.user_notice_interval) {
        clearInterval(this.user_notice_interval)
        this.user_notice_interval = null
      }
    
      this.user_notice_interval = setInterval(() => {
        this.userNoticeRequset()
      }, 60000)
    },
    clearUserNotice() {
      this.show_user_notice = false
      this.get_user_notice_after = false

      if (this.user_notice_interval) {
        clearInterval(this.user_notice_interval)
        this.user_notice_interval = null
      }
    },
    closeUserNotice() {
      this.show_user_notice = false
    },
    orderCountReqset() {
      sellerMallStatNoPushNum().then(res => {
        this.order_count = res ? res.noPushNum : 0
      })
    },
    getOrderCount() {
      this.orderCountReqset()

      if (this.order_count_interval) {
        clearInterval(this.order_count_interval)
        this.order_count_interval = null
      }
    
      this.order_count_interval = setInterval(() => {
        this.orderCountReqset()
      }, 60000)
    },
    clearOrderCount() {
      if (this.order_count_interval) {
        clearInterval(this.order_count_interval)
        this.order_count_interval = null
      }
    },
    messageCountReqset() {
      notificationUnreadCount({module: 1, clientRoleType: 'seller', type: 3}).then(res => {
        this.message_count = res?.count || 0
      })
    },
    getMessageCount() {
      this.messageCountReqset()

      if (this.message_count_interval) {
        clearInterval(this.message_count_interval)
        this.message_count_interval = null
      }
    
      this.message_count_interval = setInterval(() => {
        this.messageCountReqset()
      }, 30000)
    },
    clearMessageCount() {
      if (this.message_count_interval) {
        clearInterval(this.message_count_interval)
        this.message_count_interval = null
      }
    },
    moneyReqset() {
      this.has_money_in = false
      addMoneyNotify().then(async (res) => {
        const data = res || []
        if (data.length) {
          this.has_money_in = true

          for (let i = 0; i < data.length; i++) {
            await notifyCallback({
              moneyLogId: data[i]
            })
          }
        }
      })
    },
    getMoneyNotify() {
      this.moneyReqset()

      if (this.money_interval) {
        clearInterval(this.money_interval)
        this.money_interval = null
      }
    
      this.money_interval = setInterval(() => {
        this.moneyReqset()
      }, 5000)
    },
    clearMoneyReqset() {
      this.has_money_in = false
      if (this.money_interval) {
        clearInterval(this.money_interval)
        this.money_interval = null
      }
    },
    getCountryListHandle() {
      if (!this.countryList.length) {
        getCountryList(0).then(res => {
          this.countryList = res
        })
      }
    }
  }
})

export default useSystemStore