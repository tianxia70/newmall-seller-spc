import copy from './copy/index'
import focus from './focus/index'


export default {
  install (Vue) {
    Vue.directive('copy', copy)
    Vue.directive('focus', focus)
  }
}
