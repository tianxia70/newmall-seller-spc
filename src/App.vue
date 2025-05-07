<template>
  <div class="h-full">
    <a-config-provider :locale="systemLocale">
      <router-view />
    </a-config-provider>

    <div v-if="customer_service_url" class="customer-service" :style="{'background-color': appStore.color}" @click="serviceHandle">
      <icon-customer-service :size="26" />
    </div>
  </div>
  
</template>

<script setup>
  import { onMounted, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useAppStore, useSystemStore, useChatStore, useUserStore } from '@/store'
  import { getToken } from "@/utils/token-util.js"

  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
  import zhTW from '@arco-design/web-vue/es/locale/lang/zh-TW';
  import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
  import jaJP from '@arco-design/web-vue/es/locale/lang/ja-JP';
  import ptPT from '@arco-design/web-vue/es/locale/lang/pt-PT';
  import idID from '@arco-design/web-vue/es/locale/lang/id-ID';
  import frFR from '@arco-design/web-vue/es/locale/lang/fr-FR';
  import deDE from '@arco-design/web-vue/es/locale/lang/de-DE';
  import koKR from '@arco-design/web-vue/es/locale/lang/ko-KR';
  import itIT from '@arco-design/web-vue/es/locale/lang/it-IT';
  import msMY from '@arco-design/web-vue/es/locale/lang/ms-MY';
  import thTH from '@arco-design/web-vue/es/locale/lang/th-TH';
  import viVN from '@arco-design/web-vue/es/locale/lang/vi-VN';
  import arEG from '@arco-design/web-vue/es/locale/lang/ar-EG';
  import ruRU from '@arco-design/web-vue/es/locale/lang/ru-RU';

  const token = getToken()
  const appStore = useAppStore()
  const systemStore = useSystemStore()
  const chatStore = useChatStore()
  const userStore = useUserStore()
  const { locale } = useI18n()
  const customer_service_url = computed(() => systemStore.customer_service_url)
  const sellerInfo = computed(() => userStore.sellerInfo)
  const imDone = computed(() => chatStore.imDone)

  const serviceHandle = () => {
    window.open(customer_service_url.value)
  }

  const localeMap = {
    'zh-cn': zhCN,
    'zh-tw': zhTW,
    'en': enUS,
    'ja': jaJP,
    'pt': ptPT,
    'id': idID,
    'fr': frFR,
    'de': deDE,
    'ko': koKR,
    'it': itIT,
    'ms': msMY,
    'th': thTH,
    'vi': viVN,
    'ar': arEG,
    'ru': ruRU
  }

  const systemLocale = computed(() => {
    return localeMap[locale.value] || enUS
  })

  watch(
    () => sellerInfo.value,
    (val) => {
      if (val && token && !imDone.value) {
        // IM 配置
        chatStore.loadImConfig()
      }
    }
  , { immediate: true })

  onMounted(() => {
    // 系统配置
    systemStore.getSystemConfig()

    if (!token) {
      // IM 配置
      chatStore.loadImConfig()
    }
  })
</script>

<style lang="less" scoped>
  .customer-service {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    right: 15px;
    bottom: 15px;
    z-index: 999;
    cursor: pointer;
    color: #fff;
  }
</style>
