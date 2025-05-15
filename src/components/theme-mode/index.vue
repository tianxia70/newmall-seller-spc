<template>
  <div class="theme-mode" @click="setThemeMode">
    <i class="iconfont" :class="currentMode === 'light' ? 'icon-anheimoshi' : 'icon-a-Frame48'"></i>
  </div>
</template>
<script setup>
  import { onMounted, ref } from 'vue'
  import { useAppStore } from '@/store'
  import { loadSiteConfig } from '@/utils'

  const emits = defineEmits(['change'])

  const appName = import.meta.env.VITE_APP

  const appStore = useAppStore()
  const siteConfig = ref()
  const currentMode = ref('')

  const setThemeMode = () => {
    const mode = currentMode.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('seller_pc_store_app_theme_mode', mode)
    currentMode.value = mode
    appStore.toggleMode(mode)
    emits('change', mode)
  }

  onMounted(async () => {
    siteConfig.value = await loadSiteConfig(appName)
    currentMode.value = localStorage.getItem('seller_pc_store_app_theme_mode') || siteConfig.value?.themeMode || ''
  })
</script>

<style lang="less" scoped>
  .theme-mode {
    cursor: pointer;
    user-select: none;
    > i {
      font-size: 18px;
      color: var(--color-text-2);
    }
  }
</style>
