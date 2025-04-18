<template>
  <a-layout-header class="layout-classic-header flex flex-col operation-area">
    <div class="flex justify-between layout-classic-header-container">
      <ma-breadcrumb />
      <ma-operation />
    </div>
    <ma-tags class="hidden lg:flex" />
  </a-layout-header>
</template>

<script setup>
  import {ref, onMounted} from 'vue'
  import MaBreadcrumb from '../ma-breadcrumb.vue'
  import MaOperation from '../ma-operation.vue'
  import MaTags from '../ma-tags.vue'
  import { loadSiteConfig } from '@/utils'

  const appName = import.meta.env.VITE_APP
  const siteConfig = ref({})

  onMounted(async () => {
    siteConfig.value = await loadSiteConfig(appName)
  })
</script>
