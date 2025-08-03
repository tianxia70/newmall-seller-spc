<template>
  <a-dropdown>
    <div class="lang-item current" :class="{'dark': dark}">
      <img :src="currentLang.image" alt="">
      <p>{{ currentLang.title }}</p>
      <icon-caret-down />
    </div>

    <template #content>
      <a-doption v-for="item in langData" :key="item.key" >
        <div class="lang-item" @click="handleSelect(item)">
          <img :src="item.image" alt="">
          <p>{{ item.title }}</p>
        </div>
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script setup>
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { langData } from './config'
  import { loadLocaleMessages } from '@/i18n'

  const props = defineProps({
    dark: {
      type: Boolean,
      default: false
    }
  })

  const { locale } = useI18n()

  const currentLang = computed(() => {
    const obj = langData.find(item => item.key === locale.value)
    return obj
  })

  const handleSelect = async (data) => {
    try {
      // 新的 loadLocaleMessages 函数已经包含了以下操作：
      // 1. 设置 locale.value
      // 2. 保存到 localStorage 
      // 3. 设置文本方向
      const success = await loadLocaleMessages(data.key)
      
      if (success) {
        // 刷新页面以确保所有组件都使用新语言
        window.location.reload()
      } else {
        console.error('Failed to load language:', data.key)
      }
    } catch (error) {
      console.error('Language switch error:', error)
    }
  }
</script>

<style lang="less" scoped>
  .lang-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 2px 0;
    color: var(--color-text-2);
    &.current {
      cursor: pointer;
      margin: 0;
    }
    &.dark {
      color: #fff;
      p {
        color: #fff;
      }
    }
    > img {
      width: 21px;
      height: auto;
    }
    p {
      flex: 1;
    }
  }
</style>
