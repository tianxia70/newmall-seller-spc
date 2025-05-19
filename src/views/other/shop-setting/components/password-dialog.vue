<template>
  <a-modal
    :visible="visible"
    :width="400"
    :mask-closable="false"
    :esc-to-close="false"
    :footer="false"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ dialogTitle }}</template>
    
    <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
      <a-form-item field="oldPassword" :label="t('旧密码')" >
        <a-input-password :placeholder="t('请输入旧密码')" v-model="formState.oldPassword" allow-clear />
      </a-form-item>
      <a-form-item field="newPassword" :label="t('新密码')" >
        <a-input-password :placeholder="isSafeword ? t('请输入6位数数字密码') : t('登录密码必须6-20位')" v-model="formState.newPassword" allow-clear />
      </a-form-item>
      <a-form-item field="confirmPassword" :label="t('确认密码')" >
        <a-input-password :placeholder="t('请输入确认密码')" v-model="formState.confirmPassword" allow-clear />
      </a-form-item>
    </a-form>

    <a-button type="primary" size="large" class="w-full !mt-8" @click="submitHandle" :loading="subLoading">{{ t('确认修改') }}</a-button>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateOldAndNewSafeword, userPassword } from '@/api/user'
import { useUserStore } from '@/store'
import { Message } from '@arco-design/web-vue'

const { t } = useI18n()
const userStore = useUserStore()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isSafeword: {
    type: Boolean,
    default: false
  }
})

const dialogTitle = computed(() => {
  return props.isSafeword ? t('修改资金密码') : t('修改登录密码')
})

const emits = defineEmits(['update:visible'])

const handleCancel = () => {
  emits('update:visible', false)
}

const formRef = ref(null)
const formState = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePassword = (value, cb) => {
  return new Promise((resolve) => {
    if (props.isSafeword) {
      if (value.length !== 6 || isNaN(Number(value))) {
        cb(t('请输入6位数数字密码'))
      }
    } else {
      if (value.length < 6 || value.length > 20) {
        cb(t('登录密码必须6-20位'))
      }

      const reg = /^[A-Za-z0-9!@#$%^&*_()<>.?\/\\{}[\]|,~+:;']+$/
      if (!reg.test(value)) {
        cb(t('setPasswordTips'))
      }
    }

    if (value === formState.value.oldPassword) {
      cb(t('新密码不能与旧密码相同'))
    }

    resolve()
  })
}

const validateConfirmPassword = (value, cb) => {
  return new Promise((resolve) => {
    if (value !== formState.value.newPassword) {
      cb(t('两次密码输入不一致'))
    }
    resolve()
  })
}

const formRules = reactive({
  oldPassword: [{ required: true, message: t('请输入旧密码'), trigger: 'blur'}],
  newPassword: [
    { required: true, message: t('请输入新密码'), trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('请输入确认密码'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

const subLoading = ref(false)
const submitHandle = async () => {
  const valid = await formRef.value.validate()
  if (!valid) {
    let ajaxFn = userPassword
    let params = {
      password: formState.value.oldPassword,
      newPassword: formState.value.newPassword
    }

    if (props.isSafeword) {
      ajaxFn = updateOldAndNewSafeword
      params = {
        old_safeword: formState.value.oldPassword,
        safeword: formState.value.newPassword,
        re_safeword: formState.value.newPassword
      }
    }

    subLoading.value = true
    ajaxFn(params).then(async () => {
      await userStore.getUserInfo()

      Message.success(t('修改成功'))
      handleCancel()
      subLoading.value = false
    }).catch(() => {
      subLoading.value = false
    })
  }
}

watch(() => props.visible, (val) => {
  if (!val) {
    subLoading.value = false

    formRef.value.resetFields()
    formRef.value.clearValidate()
  }
})
</script>
