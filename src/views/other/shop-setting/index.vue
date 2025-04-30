<template>
  <div>
    <basic-info class="mb-3"></basic-info>
    <banner-info class="mb-3"></banner-info>
    <soical-info v-if="showSoical"></soical-info>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import BasicInfo from './components/basic-info.vue'
  import BannerInfo from './components/banner-info.vue'
  import soicalInfo from './components/soical-info.vue'

  const appName = import.meta.env.VITE_APP

  const showSoical = computed(() => {
    return !['argos2', 'argos5', 'flipkart'].includes(appName)
  })
</script>

<style lang="less" scoped></style>
