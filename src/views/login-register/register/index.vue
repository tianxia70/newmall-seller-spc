<template>
  <div>
    <component v-if="currentTemp && currentComponent" :is="currentComponent"></component>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { loadSiteConfig } from '@/utils'

import tempDefault from './components/temp-default.vue'
import tempOne from './components/temp-one.vue'

const appName = import.meta.env.VITE_APP
const siteConfig = ref({})
const currentTemp = ref('')

const tempData = {
  'temp-default': tempDefault,
  'temp-one': tempOne
}

const currentComponent = computed(() => {
  return tempData[currentTemp.value] ? tempData[currentTemp.value] : null
})

onMounted(async () => {
  siteConfig.value = await loadSiteConfig(appName)

  currentTemp.value = siteConfig.value.loginRegistTemp || 'temp-default'
})
</script>
