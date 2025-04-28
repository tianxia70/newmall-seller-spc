<template>
  <div class="more-loading">
    <div v-if="loading" class="loading">
      <icon-loading />
      <p>{{ t('加载中...') }}</p>
    </div>
    <template v-else>
      <div v-if="hasMore" class="text-info">{{ t('上拉加载更多') }}</div>
      <div v-else class="text-info">{{ t('没有更多了') }}</div>
    </template>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'

  defineProps({
    hasMore: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n()
</script>

<style lang="less" scoped>
  .more-loading {
    font-size: 13px;
    color: var(--color-text-2);
    padding-bottom: 15px;
    > .loading {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      padding: 5px 0;
    }
    > .text-info {
      width: 100%;
      text-align: center;
      padding: 5px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      &::before,
      &::after {
        content: '';
        display: block;
        width: 10%;
        height: 1px;
        background-color: var(--color-text-3);
      }
    }
  }
</style>
