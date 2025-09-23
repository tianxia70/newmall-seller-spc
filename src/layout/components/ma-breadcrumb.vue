<template>
  <div class="ml-2 mt-3.5 flex ">
    <div v-if="timeZoneName" class="time-zone">{{ timeZoneName }}</div>
    <div class="hidden lg:block">
      <a-breadcrumb>
        <template v-for="(r, index) in route.matched" :key="index">
          <a-breadcrumb-item
            v-if="index > 0"
          >
            {{ t(r.meta.title) }}
          </a-breadcrumb-item>
        </template>
      </a-breadcrumb>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getTimeZone } from '@/api/system'

const { t } = useI18n()
const route = useRoute()

const appName = import.meta.env.VITE_APP
const timeZoneName = ref('')

onMounted(() => {
  getTimeZone().then(res => {
    if (appName === 'flipkart3') {
      timeZoneName.value = 'GMT+9'
    } else {
      timeZoneName.value = res.timeZoneName
    }
  })
})
</script>

<style lang="less">
  .time-zone {
    line-height: 24px;
    margin-right: 10px;
    color: var(--color-text-2);
  }
</style>
