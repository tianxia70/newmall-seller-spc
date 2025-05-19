<template>
  <div>
    <!-- 密码输入弹窗 -->
    <safe-password-input v-model:visible="showSafePassword" @confirm="safePasswordSubmit" />

    <a-modal
      v-model:visible="confirmModalVisible"
      :width="400"
      :mask-closable="false"
      :esc-to-close="false"
      :ok-text="t('同意注销')"
      :on-before-ok="submitRequest"
    >
      <template #title>{{ t('您确认要注销吗？') }}</template>
      <p>{{ t('警告！请谨慎操作注销账户，如果您不再使用该账号，可点击【同意注销】，注销后可能几天内无法注册。') }}</p>
    </a-modal>

    <a-modal
      :visible="visible"
      :width="500"
      :mask-closable="false"
      :esc-to-close="false"
      :footer="false"
      :on-before-cancel="handleCancel"
    >
      <template #title>{{ t('注销账号') }}</template>
      
      <a-spin :loading="pageLoading" :size="32">
        <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
          <a-form-item field="account" :label="t('账号')" >
            <a-input v-model="formState.account" disabled />
          </a-form-item>
          <a-form-item field="reason" :label="t('原因')" >
            <a-textarea v-model="formState.reason" :placeholder="t('请输入注销原因')" :max-length="200" show-word-limit/>
          </a-form-item>
        </a-form>

        <a-button type="primary" size="large" class="w-full !mt-8" @click="submitHandle">{{ t('确定') }}</a-button>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { userLogoff } from '@/api/user'
import { useUserStore } from '@/store'
import { Message } from '@arco-design/web-vue'

const { t } = useI18n()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const walletInfo = computed(() => userStore.walletInfo)

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:visible'])

const handleCancel = () => {
  emits('update:visible', false)
}

const formRef = ref(null)
const formState = ref({
  account: '',
  reason: ''
})

const formRules = reactive({
  reason: [{ required: true, message: t('请输入注销原因'), trigger: 'blur'}]
})

const showSafePassword = ref(false)
const confirmModalVisible = ref(false)
const cashPassword = ref('')

const submitHandle = async () => {
  const valid = await formRef.value.validate()
  if (!valid) {
    if (walletInfo.value.money > 0) {
      Message.error(t('该账号存在可用余额，不可注销！'))
      return
    }

    showSafePassword.value = true
  }
}

const safePasswordSubmit = (password) => {
  cashPassword.value = password
  confirmModalVisible.value = true
}

const submitRequest = async (done) => {
  const params = {
    account: formState.value.account,
    reason: formState.value.reason,
    cashPassword: cashPassword.value || ''
  }

  await userLogoff(params).then(() => {
    Message.success(t('注销成功'))
    userStore.logout()
    done(true)
  }).catch(() => {
    done(false)
  })
}

const pageLoading = ref(false)

watch(() => props.visible, async (val) => {
  if (!val) {
    cashPassword.value = ''
    confirmModalVisible.value = false

    formRef.value.resetFields()
    formRef.value.clearValidate()
  } else {
    pageLoading.value = true
    await userStore.getWalletInfo()
    pageLoading.value = false

    const username = userInfo.value.username || userInfo.value.email
    if (userInfo.value.username.indexOf('@') > -1) {
      formState.value.account = username
    } else {
      if (userInfo.value.phone) {
        const arr = userInfo.value.phone.split(' ')
        formState.value.account = `(+${arr[0]}) ${arr[1]}`
      } else {
        formState.value.account = username
      }
    }
  }
})
</script>
