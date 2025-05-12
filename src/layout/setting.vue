<template>
  <a-drawer
    class="backend-setting"
    v-model:visible="visible"
    :on-before-ok="save"
    width="350px"
    ok-text="保存"
    @cancel="close"
    unmountOnClose
  >
    <template #title>后台设置</template>
    <a-form :model="form" :auto-label-width="true">
      <a-row class="flex justify-center mb-5">
        <a-divider orientation="center"><span class="title">系统主色调</span></a-divider>
        <ColorPicker
          theme="dark"
          :color="appStore.color"
          :sucker-hide="true"
          :colors-default="defaultColorList"
          @changeColor="changeColor"
          style="width: 218px;"
        />
      </a-row>
      <a-divider orientation="center"><span class="title">个性化配置</span></a-divider>
      <a-form-item label="当前皮肤" help="设置后台皮肤">
        {{ currentSkin }} 
        <a-button type="primary" status="success" size="mini" class="ml-2" @click="skin.open()">
          换肤
        </a-button>
      </a-form-item>
      <a-form-item label="布局" help="设置后台显示方式">
        <a-select v-model="form.layout" @change="handleLayout">
          <a-option value="classic">classic</a-option>
          <a-option value="columns">columns</a-option>
          <a-option value="banner">banner</a-option>
          <a-option value="mixed">mixed</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="切换动画" help="工作区页面切换的进场和出场动画效果">
        <a-select v-model="form.animation" @change="handleAnimation">
          <a-option value="ma-fade">fade</a-option>
          <a-option value="ma-slide-left">sliderLeft</a-option>
          <a-option value="ma-slide-right">sliderRight</a-option>
          <a-option value="ma-slide-down">sliderDown</a-option>
          <a-option value="ma-slide-up">sliderUp</a-option>
        </a-select>
      </a-form-item>
      <a-form-item label="黑夜模式" help="设置页面显示模式" v-if="currentSkin === 'mine'">
        <a-switch v-model="form.mode" @change="handleSettingMode" />
      </a-form-item>
      <a-form-item label="多标签" help="是否启用多标签方式">
        <a-switch v-model="form.tag" @change="handleSettingTag" />
      </a-form-item>
      <a-form-item v-if="form.layout !== 'banner'" label="菜单折叠" help="系统左侧菜单是否折叠起来">
        <a-switch v-model="form.menuCollapse" @change="handleMenuCollapse" />
      </a-form-item>
      <a-form-item v-if="form.layout !== 'banner'" label="菜单宽度" help="设置左侧菜单的显示宽度">
        <a-input-number v-model="form.menuWidth" model-event="input" :hide-button="true" mode="button" @change="handleMenuWidth" />
      </a-form-item>
    </a-form>
  </a-drawer>

  <Skin ref="skin" />
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useAppStore } from '@/store'
import Skin from './components/components/skin.vue'
import skins from '@/configs/skins'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'

const appStore  = useAppStore()

const skin = ref(null)
const visible = ref(false)
const currentSkin = ref('')
const form = reactive({
  mode: appStore.mode === 'dark',
  tag: appStore.tag,
  menuCollapse: appStore.menuCollapse,
  menuWidth: appStore.menuWidth,
  layout: appStore.layout,
  animation: appStore.animation,
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
  if (item.name === appStore.skin) currentSkin.value = item.name
})

watch(() => appStore.skin, v => {
  skins.map(item => {
    if (item.name === v) currentSkin.value = item.name
  })
})

const open = () => visible.value = true
const close = () => visible.value = false

const handleLayout = (val) => appStore.changeLayout(val)
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
    animation: appStore.animation,
    color: appStore.color,
    ws: appStore.ws,
  }

  console.log('data', data)
  done(true)
}

defineExpose({ open })
</script>


