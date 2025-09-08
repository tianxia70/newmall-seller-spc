<template>
  <div ref="pageContainer">
    <basic-info class="mb-3"></basic-info>
    <banner-info v-if="showBanner" class="mb-3"></banner-info>
    <soical-info v-if="showSoical" class="mb-3"></soical-info>
    <user-info class="mb-3"></user-info>
  </div>
</template>

<script setup>
  import { computed, onMounted, onUnmounted, ref, nextTick } from 'vue'
  import { useRoute } from 'vue-router'
  import BasicInfo from './components/basic-info.vue'
  import BannerInfo from './components/banner-info.vue'
  import SoicalInfo from './components/soical-info.vue'
  import UserInfo from './components/user-info.vue'

  const appName = import.meta.env.VITE_APP
  const route = useRoute()
  const pageContainer = ref(null)

  const showSoical = computed(() => {
    return !['argos2', 'argos5', 'flipkart', 'primePick'].includes(appName)
  })

  const showBanner = computed(() => {
    return !['primePick'].includes(appName)
  })

  const scrollToBottom = () => {
    nextTick(() => {
      setTimeout(() => {
        const workArea = document.querySelector('.work-area')
        if (workArea) {
          workArea.scrollTo({
            top: workArea.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 100)
    })
  }

  onMounted(() => {
    if (route.query.cert === '1') {
      scrollToBottom()
    }
    window.addEventListener('triggerShopSettingCert', () => {
      scrollToBottom()
    })
  })

  onUnmounted(() => {
    window.removeEventListener('triggerShopSettingCert', () => {})
  })
</script>

<style lang="less" scoped></style>
