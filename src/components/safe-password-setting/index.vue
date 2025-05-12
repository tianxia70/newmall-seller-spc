<template>
  <a-modal
    :visible="visible"
    :width="400"
    :mask-closable="false"
    :esc-to-close="false"
    :style="{ zIndex: 3000 }"
    :footer="false"
    :on-before-cancel="beforeCancel"
  >
    <template #title>{{ isConfirm ? t('确认支付密码') : t('设置支付密码') }}</template>
    
    <div class="p-4">
      <template v-if="isConfirm">
        <a-verification-code v-model="formState.re_safeword" masked />
        <div class="flex items-center justify-between !mt-8">
          <a-button size="large" class="w-35" @click="isConfirm = false">{{ t('上一步') }}</a-button>
          <a-button
            type="primary"
            :disabled="formState.re_safeword.length !== 6"
            size="large"
            class="w-35"
            :loading="submitLoading"
            @click="submitHnadle"
          >{{ t('确认') }}</a-button>
        </div>
      </template>
      <template v-else>
        <a-verification-code v-model="formState.safeword" masked />
        <a-button type="primary" :disabled="formState.safeword.length !== 6" size="large" class="w-full !mt-8" @click="isConfirm = true">{{ t('确认') }}</a-button>
      </template>
    </div>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { useUserStore } from '@/store'
import { setSafewordReg } from '@/api/user'

const { t } = useI18n()
const userStore = useUserStore()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:visible', 'cancel'])

const handleCancel = () => {
  emits('update:visible', false)
}

const beforeCancel = () => {
  handleCancel()
  emits('cancel')
}

const isConfirm = ref(false)
const formState = ref({
  safeword: '',
  re_safeword: '',
  verifcode_type: 2
})

const submitLoading = ref(false)
const submitHnadle = () => {
  if (isNaN(Number(formState.value.safeword))) {
    Message.error(t('请输入6位数数字密码'))
    return
  }

  if(formState.value.safeword !== formState.value.re_safeword) {
    Message.error(t('两次密码输入不一致'))
    return
  }

  submitLoading.value = true
  
  setSafewordReg(formState.value).then(async () => {
    await userStore.getUserInfo()
    Message.success(t('设置成功'))
    submitLoading.value = false
    handleCancel()
  }).catch(() => {
    submitLoading.value = false
  })
}
</script>
