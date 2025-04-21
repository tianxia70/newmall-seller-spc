import { defineStore } from 'pinia'
import { sysConfigGetSyspara } from '@/api/system'

const useSystemStore = defineStore('seller_pc_store_system', {
  state: () => ({ 
    seller_sold_out_switch: '0',
    customer_service_url: '',
    isArLang: false,
    showNotic: true
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
    setIsArLang(flag) {
      this.isArLang = flag
    },
    setShowNotic(flag) {
      this.showNotic = flag
    }
  }
})

export default useSystemStore