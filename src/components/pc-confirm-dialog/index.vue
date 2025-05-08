<template>
  <a-modal
    :visible="visible"
    :width="400"
    :mask-closable="false"
    :esc-to-close="false"
    :closable="false"
    :ok-text="t(confirmText)"
    :cancel-text="t(cancelText)"
    :style="{ zIndex: 3000 }"
    @ok="handleConfirm"
    @cancel="handleCancel"
    
  >
    <template #title>{{ t(title) }}</template>
    
    <p>{{ message }}</p>
  </a-modal>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: () => '提示'
  },
  message: {
    type: String,
    default: 'message'
  },
  confirmText: {
    type: String,
    default: () => '确定'
  },
  cancelText: {
    type: String,
    default: () => '取消'
  }
})

const emits = defineEmits(['update:visible', 'confirm'])

const handleCancel = () => {
  emits('update:visible', false)
}

const handleConfirm = () => {
  handleCancel()
  emits('confirm')
}
</script>
