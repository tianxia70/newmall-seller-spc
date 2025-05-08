<template>
  <div
    class="pc-number-wrapper"
    :class="{ 'text-primary': color, 'font-bold': bold, 'text-danger': danger }"
    :style="{ fontSize: `${size}px` }"
  >
    <span v-if="currency">{{ currencyUnit }}</span>
    <span v-if="extra">{{ extra }}</span>
    <count-to :start-val="0" :end-val="data" :decimals="2" :duration="1000" />
    <span v-if="suffix">{{ suffix }}</span>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { CountTo } from 'vue3-count-to'
  import { useCurrencyStore } from '@/store'

  const props = defineProps({
    data: {
      type: Number,
      default: 0
    },
    currency: {
      type: Boolean,
      default: true
    },
    color: {
      type: Boolean,
      default: false
    },
    danger: {
      type: Boolean,
      default: false
    },
    bold: {
      type: Boolean,
      default: false
    },
    suffix: {
      type: String,
      default: ''
    },
    extra: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 14
    }
  })

  const currencyStore = useCurrencyStore()
  const currencyUnit = computed(() => currencyStore.currencyUnit)
</script>

<style lang="less" scoped>
  .pc-number-wrapper {
    color: var(--color-text-1);
    &.text-primary {
      color: rgb(var(--primary-6));
    }
    &.text-danger {
      color: rgb(var(--danger-6));
    }
    &.font-bold {
      font-weight: bold;
    }
  }
</style>