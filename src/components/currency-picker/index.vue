<template>
  <a-dropdown>
    <div class="current-currency" :class="{'dark': dark}">
      <p>{{ currencyShort }}</p>
      <icon-caret-down />
    </div>

    <template #content>
      <a-doption v-for="item in currencyData" :key="item.short" >
        <div class="currency-item" @click="handleSelect(item)">
          <p>{{ t(item.name) }}</p>
          <p>{{ `${item.unit}-${item.short}` }}</p>
        </div>
      </a-doption>
    </template>
  </a-dropdown>
</template>

<script setup>
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { currencyData } from './config'
  import { useCurrencyStore } from '@/store'

  const props = defineProps({
    dark: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n()

  const currencyStore = useCurrencyStore()
  const currencyShort = computed(() => currencyStore.currencyShort)

  const handleSelect = (data) => {
    currencyStore.setCurrencyShort(data.short)
    currencyStore.setCurrencyUnit(data.unit)

    window.location.reload()
  }
</script>

<style lang="less" scoped>
  .current-currency {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: var(--color-text-2);
  }
  .currency-item {
    width: 100px;
    padding: 5px 0;
    cursor: pointer;
    > p {
      line-height: 2;
      font-size: 12px;
      color: var(--color-text-2);
      &:first-child {
        color: var(--color-text-1);
        font-weight: bold;
      }
    }
  }
</style>
