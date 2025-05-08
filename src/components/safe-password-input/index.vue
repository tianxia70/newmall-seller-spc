<template>
  <a-modal
    :visible="visible"
    :width="400"
    :mask-closable="false"
    :esc-to-close="false"
    :style="{ zIndex: 3000 }"
    :footer="false"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ t('输入支付密码') }}</template>
    
    <div class="p-4">
      <a-verification-code v-model="safeword" masked />
      <a-button type="primary" :disabled="safeword.length !== 6" size="large" class="w-full !mt-8" @click="submitHnadle">{{ t('确认') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:visible', 'confirm'])

const handleCancel = () => {
  emits('update:visible', false)
}

const safeword = ref('')

const submitHnadle = () => {
  if (isNaN(Number(safeword.value))) {
    Message.error(t('请输入6位数数字密码'))
    return
  }

  emits('confirm', safeword.value)
  handleCancel()
}

watch(() => props.visible, (val) => {
  if (!val) {
    safeword.value = ''
  }
})
</script>
