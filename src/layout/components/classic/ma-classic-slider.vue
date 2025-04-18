<template>
  <a-layout-sider
    class="layout-classic-sider h-full flex flex-col hidden lg:block"
    :style="`width: ${appStore.menuCollapse ? '48px' : appStore.menuWidth + 'px'};`"
  >
    <ma-menu
      ref="MaMenuRef"
      height="calc(100% - 51px)"
      :class="`${appStore.menuCollapse ? 'ml-1.5' : ''};`"
    />
  </a-layout-sider>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useAppStore } from '@/store'
  import MaMenu from '../ma-menu.vue'
  import { homePageRoutes } from '@/router/homePageRoutes.js'

  const MaMenuRef = ref(null)
  const appStore = useAppStore()

  onMounted(async () => {
    setTimeout(_ => {
      MaMenuRef.value.menus = homePageRoutes
    }, 50)
  })
</script>

<style>
.logo { height: 51px; border-bottom: 1px solid var(--color-border-1); }
</style>
