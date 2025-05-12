import LanguagePicker from './language-picker/index.vue';
import CurrencyPicker from './currency-picker/index.vue';
import PcMobileInput from './pc-mobile-input/index.vue';
import PcNumberCode from './pc-number-code/index.vue';
import PcMoreLoading from './pc-more-loading/index.vue';
import PcNumber from './pc-number/index.vue';
import PcConfirmDialog from './pc-confirm-dialog/index.vue';
import SafePasswordSetting from './safe-password-setting/index.vue';
import SafePasswordInput from './safe-password-input/index.vue';
import PcCheckPicker from './pc-check-picker/index.vue';

export default {
  install(Vue) {
    Vue.component('LanguagePicker', LanguagePicker),
    Vue.component('CurrencyPicker', CurrencyPicker),
    Vue.component('PcMobileInput', PcMobileInput),
    Vue.component('PcNumberCode', PcNumberCode),
    Vue.component('PcMoreLoading', PcMoreLoading),
    Vue.component('PcNumber', PcNumber),
    Vue.component('PcConfirmDialog', PcConfirmDialog),
    Vue.component('SafePasswordSetting', SafePasswordSetting),
    Vue.component('SafePasswordInput', SafePasswordInput),
    Vue.component('PcCheckPicker', PcCheckPicker)
  }
};
