<template>
  <div class="pc-check-picker">
    <div class="item" v-for="item in options" :key="item.value" :class="{ 'active': checkValue === item.value }" @click="handleChange(item.value)">
      {{ item.label }}
      <icon-check class="icon-check" />
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    options: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: String,
      default: ''
    }
  })

  const emits = defineEmits(['update:modelValue', 'change'])

  const checkValue = ref(props.modelValue)

  // 监听外部 modelValue 的变化
  watch(() => props.modelValue, (newValue) => {
    checkValue.value = newValue
  })

  const handleChange = (value) => {
    checkValue.value = value
    emits('update:modelValue', value)
    emits('change', value)
  }
</script>

<style lang="less" scoped>
  .pc-check-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    .item {
      padding: 8px 10px;
      min-width: 80px;
      border: 1px solid rgb(var(--gray-4));
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      &::after {
        content: '';
        position: absolute;
        width: 40px;
        height: 40px;
        background-color: rgb(var(--primary-6));
        z-index: 1;
        transform: rotate(45deg);
        right: -22px;
        bottom: -22px;
        opacity: 0;
      }
      &.active {
        border-color: rgb(var(--primary-6));
        &::after {
          opacity: 1;
        }
        .icon-check {
          opacity: 1;
        }
      }
      .icon-check {
        position: absolute;
        right: 2px;
        bottom: 2px;
        color: #fff;
        z-index: 2;
        font-size: 12px;
        opacity: 0;
      }
    }
  }
</style>
