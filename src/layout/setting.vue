<template>
  <a-drawer
    class="backend-setting"
    v-model:visible="visible"
    :on-before-ok="save"
    width="350px"
    :ok-text="'确定'"
    @cancel="close"
    unmountOnClose
  >
    <template #title>{{ $t('sys.backendSettingTitle') }}</template>
    <a-form :model="form" :auto-label-width="true">
      <a-row class="flex justify-center mb-5">
        <a-divider orientation="center"><span class="title">qqqqq</span></a-divider>
        <ColorPicker
          theme="dark"
          :color="appStore.color"
          :sucker-hide="true"
          :colors-default="defaultColorList"
          @changeColor="changeColor"
          style="width: 218px;"
        />
      </a-row>
      <a-divider orientation="center"><span class="title">wwwww</span></a-divider>
      <a-form-item :label="$t('sys.skin')" :help="'wwwwww'">
        {{ currentSkin }} 
        <a-button type="primary" status="success" size="mini" class="ml-2" @click="skin.open()">
          adas
        </a-button>
      </a-form-item>
      <a-form-item :label="'aaaa'" :help="'afdsa'">
        <a-select v-model="form.layout" @change="handleLayout">
          <a-option value="classic">adafs</a-option>
          <a-option value="columns">aaaa</a-option>
          <a-option value="banner">aaaa</a-option>
          <a-option value="mixed">aaaa</a-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="'donghua'" :help="'ddddd'">
        <a-select v-model="form.animation" @change="handleAnimation">
          <a-option value="ma-fade">fade</a-option>
          <a-option value="ma-slide-left">sliderLeft</a-option>
          <a-option value="ma-slide-right">sliderRight</a-option>
          <a-option value="ma-slide-down">sliderDown</a-option>
          <a-option value="ma-slide-up">sliderUp</a-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="'dark'" :help="'darkHelp'" v-if="currentSkin === 'Mine'">
        <a-switch v-model="form.mode" @change="handleSettingMode" />
      </a-form-item>
      <a-form-item :label="'tag'" :help="'tagHelp'">
        <a-switch v-model="form.tag" @change="handleSettingTag" />
      </a-form-item>
      <a-form-item v-if="form.layout !== 'banner'" :label="'menuFold'" :help="'menuFoldHelp'">
        <a-switch v-model="form.menuCollapse" @change="handleMenuCollapse" />
      </a-form-item>
      <a-form-item v-if="form.layout !== 'banner'" :label="'menuWidth'" :help="'menuWidthHelp'">
        <a-input-number v-model="form.menuWidth" mode="button" @change="handleMenuWidth" />
      </a-form-item>
    </a-form>
  </a-drawer>

  <Skin ref="skin" />
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useAppStore } from '@/store'
import { Message } from '@arco-design/web-vue'
// import user from '@/api/permission/user'
import Skin from './components/components/skin.vue'
import skins from '@/configs/skins.js'
import { useI18n } from 'vue-i18n'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'

// const userStore = useUserStore()
const appStore  = useAppStore()
const { t } = useI18n()

const skin = ref(null)
const visible = ref(false)
const okLoading = ref(false)
const currentSkin = ref('')
const form = reactive({
  mode: appStore.mode === 'dark',
  tag: appStore.tag,
  menuCollapse: appStore.menuCollapse,
  menuWidth: appStore.menuWidth,
  layout: appStore.layout,
  language: appStore.language,
  animation: appStore.animation,
  i18n: appStore.i18n,
  ws: appStore.ws,
})

const defaultColorList = reactive([
  '#165DFF', '#F53F3F', '#F77234', '#F7BA1E', '#00B42A', '#14C9C9', '#3491FA',
  '#722ED1', '#F5319D', '#D91AD9', '#34C759', '#43a047', '#7cb342', '#c0ca33',
  '#86909c', '#6d4c41',
])
const changeColor = (color) => {
  appStore.changeColor(color.hex)
}

skins.map(item => {
  if (item.name === appStore.skin) currentSkin.value = 'skin--aa'
})

watch(() => appStore.skin, v => {
  skins.map(item => {
    if (item.name === v) currentSkin.value = 'skin.'
  })
})

const open = () => visible.value = true
const close = () => visible.value = false

const handleLayout = (val) => appStore.changeLayout(val)
const handleI18n = (val) => appStore.toggleI18n(val)
const handleWs = (val) => appStore.toggleWs(val)
const handleLanguage = (val) => appStore.changeLanguage(val)
const handleAnimation = (val) => appStore.changeAnimation(val)
const handleSettingMode = (val) => appStore.toggleMode(val ? 'dark' : 'light')
const handleSettingTag = (val) => appStore.toggleTag(val)
const handleMenuCollapse = (val) => appStore.toggleMenu(val)
const handleMenuWidth = (val) => appStore.changeMenuWidth(val)

watch(() => appStore.menuCollapse, val => form.menuCollapse = val)

const save = async (done) => {
  const data = {
    mode: appStore.mode,
    tag: appStore.tag,
    menuCollapse: appStore.menuCollapse,
    menuWidth: appStore.menuWidth,
    layout: appStore.layout,
    skin: appStore.skin,
    i18n: appStore.i18n,
    language: appStore.language,
    animation: appStore.animation,
    color: appStore.color,
    ws: appStore.ws,
  }

  console.log('data', data)

  // user.updateInfo({ id: userStore.user.id, backend_setting: data }).then(res => {
  //   res.success && Message.success(res.message)
  // })
  done(true)
}

defineExpose({ open })
</script>


