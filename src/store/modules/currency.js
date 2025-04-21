import { defineStore } from 'pinia';
import tool from '@/utils/tool'

let sellerPcCurrencyUnit = '$'
let sellerPcCurrencyShort = 'USD'

if (tool.local.get('sellerPcCurrencyUnit')) {
  sellerPcCurrencyUnit = tool.local.get('sellerPcCurrencyUnit')
}

if (tool.local.get('sellerPcCurrencyShort')) {
  sellerPcCurrencyShort = tool.local.get('sellerPcCurrencyShort')
}

const useCurrencyStore = defineStore('seller_pc_store_currency', {
  state: () => ({
    currencyUnit: sellerPcCurrencyUnit,
    currencyShort: sellerPcCurrencyShort
  }),

  getters: {
    getState() {
      return { ...this.$state };
    }
  },

  actions: {
    setCurrencyShort(short) {
      this.currencyShort = short
      tool.local.set('sellerPcCurrencyShort', short)
    },
    setCurrencyUnit(unit) {
      this.currencyUnit = unit
      tool.local.set('sellerPcCurrencyUnit', unit)
    }
  }
});
export default useCurrencyStore;
