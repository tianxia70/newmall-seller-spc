<template>
  <div class="page max-7xl mx-auto text-center">
    <div class="bg mx-auto">
      <img src="@/assets/images/verify/404.svg" />
      <div class="mt-2">{{ t('访问的页面不存在') }}</div>
    </div>
    <div class="mt-5"><a-button type="primary" @click="navigationTo('/')">{{ t('返回首页') }}</a-button></div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import { navigationTo } from '@/utils'

  const { t } = useI18n()
</script>

<style scoped lang="less">
.page {
  position: absolute; top: 50%; left: 50%; margin-top: -200px; margin-left: -195px;
}
.bg, .bg img{
  width: 390px;
}
</style>