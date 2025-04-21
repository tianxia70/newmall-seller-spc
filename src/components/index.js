import LanguagePicker from './language-picker/index.vue';
import CurrencyPicker from './currency-picker/index.vue';
import PcMobileInput from './pc-mobile-input/index.vue';
import PcNumberCode from './pc-number-code/index.vue';

export default {
  install(Vue) {
    Vue.component('LanguagePicker', LanguagePicker),
    Vue.component('CurrencyPicker', CurrencyPicker),
    Vue.component('PcMobileInput', PcMobileInput),
    Vue.component('PcNumberCode', PcNumberCode)
  }
};
