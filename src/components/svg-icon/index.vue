<template>
  <svg aria-hidden="true" class="svg-icon" :style="style">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    name: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: '1em'
    }
  })  

  const iconName = computed(() => `#icon-${props.name}`)
  const style = computed(() => ({
    width: props.size || '1em',
    height: props.size || '1em',
  }))
</script>

<style lang="less" scoped>
.svg-icon {
  fill: currentColor;
  vertical-align: middle;
}
</style>