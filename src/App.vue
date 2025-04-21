<template>
  <div class="h-full">
    <a-config-provider>
      <router-view />
    </a-config-provider>

    <div v-if="customer_service_url" class="customer-service" :style="{'background-color': appStore.color}" @click="serviceHandle">
      <icon-customer-service :size="26" />
    </div>
  </div>
  
</template>

<script setup>
  import { onMounted, computed } from 'vue'
  import { useAppStore, useSystemStore, useChatStore } from '@/store'

  const appStore = useAppStore()
  const systemStore = useSystemStore()
  const chatStore = useChatStore()

  const customer_service_url = computed(() => systemStore.customer_service_url)

  const serviceHandle = () => {
    window.open(customer_service_url.value)
  }

  onMounted(() => {
    // 系统配置
    systemStore.getSystemConfig()

    // IM 配置
    chatStore.loadImConfig()
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
