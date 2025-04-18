import { defineStore } from 'pinia';

const useLanguageStore = defineStore('seller_pc_store_language', {
  state: () => ({
    appName: 'VC Online'
  }),

  getters: {
    getState() {
      return { ...this.$state };
    }
  },

  actions: {
    
  }
});
export default useLanguageStore;
