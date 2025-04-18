import { defineStore } from 'pinia'

const useKeepAliveStore = defineStore('seller_pc_store_keepAlive', {
  state: () => ({
    keepAlives: [],
    show: true,
    menuLoader: false,
  }),

  getters: {
    getState() {
      return { ...this.$state }
    },
  },

  actions: {
    addKeepAlive (component) {
      if (!this.keepAlives.includes(component.name)) {
        this.keepAlives.push(component.name)
      }
    },

    removeKeepAlive (component) {
      const idx = this.keepAlives.indexOf(component.name)
      if (idx !== -1) {
        this.keepAlives.splice(idx, 1)
      }
    },

    display () { this.show = true },

    hidden  () { this.show = false },

    clearKeepAlive() { this.keepAlives = [] },
  },
})

export default useKeepAliveStore