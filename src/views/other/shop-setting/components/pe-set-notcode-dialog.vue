<template>
  <a-modal
    :visible="visible"
    :width="460"
    :mask-closable="false"
    :esc-to-close="false"
    :footer="false"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ title }}</template>

    <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
      <a-form-item v-if="type === 'phone'" field="phone" :label="t('手机号')" >
        <pc-mobile-input
          v-model:value="formState.phone"
          v-model:areaCode="formState.areaCode"
          class="w-full"
        ></pc-mobile-input>
      </a-form-item>
      <a-form-item v-if="type === 'email'" field="email" :label="t('邮箱')" >
        <a-input :placeholder="t('请输入邮箱')" v-model="formState.email" allow-clear></a-input>
      </a-form-item>
      <a-form-item field="password" :label="t('登录密码')" >
        <a-input-password :placeholder="t('请输入登录密码')" v-model="formState.password" allow-clear />
      </a-form-item>
    </a-form>
    
    <a-button
      type="primary" size="large" class="w-full !mt-8"
      :loading="submitLoading"
      @click="submitHandle"
    >{{ t('提交') }}</a-button>
  </a-modal>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'
import { Message } from '@arco-design/web-vue'
import { userBindEmailOrPhoneSm } from '@/api/user'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'phone'
  },
  isModify: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['update:visible'])

const userStore = useUserStore()

const title = computed(() => {
  if (props.isModify) {
    return props.type === 'phone' ? t('修改手机号') : t('修改邮箱')
  } else {
    return props.type === 'phone' ? t('设置手机号') : t('设置邮箱')
  }
})

const handleCancel = () => {
  emits('update:visible', false)
}

const formRef = ref()
const formState = ref({
  phone: '',
  areaCode: '',
  email: '',
  password: ''
})


const validatePhone = (value, cb) => {
  return new Promise((resolve) => {
    if (!/^[0-9]+$/.test(value.trim())) {
      cb(t('请输入正确的手机号码'))
    }
    resolve()
  })
}

const validateEmail = (value, cb) => {
  return new Promise((resolve) => {
    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailReg.test(value.trim())) {
      cb(t('请输入正确的邮箱地址'))
    }

    resolve()
  })
}

const validatePassword = (value, cb) => {
  return new Promise((resolve) => {
    if (value.length < 6 || value.length > 20) {
      cb(t('登录密码必须6-20位'))
    }

    resolve()
  })
}


const formRules = reactive({
  phone: [
    { required: true, message: t('请输入手机号'), trigger: 'blur' },
    { validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('请输入邮箱'), trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('请输入登录密码'), trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ]
})

const submitLoading = ref(false)
const submitHandle = async () => {
  const valid = await formRef.value.validate()
  if (!valid) {
    const params = {
      password: formState.value.password
    }
    
    if (props.type === 'phone') {
      params.target = `${formState.value.areaCode} ${formState.value.phone}`
      params.phone = `${formState.value.areaCode} ${formState.value.phone}`
    } else {
      params.target = formState.value.email
      params.email = formState.value.email
    }
    
    submitLoading.value = true
    userBindEmailOrPhoneSm(params).then(async () => {
      await userStore.getUserInfo()
      Message.success(props.isModify ? t('修改成功') : t('绑定成功'))
      submitLoading.value = false
      handleCancel()
    }).catch(() => {
      submitLoading.value = false
    })
  }
}

watch(() => props.visible, (val) => {
  if (!val) {
    submitLoading.value = false

    formRef.value.resetFields()
    formRef.value.clearValidate()
  }
})
</script>

<style lang="less" scoped>

</style>