<template>
  <a-modal
    :visible="visible"
    :width="460"
    :mask-closable="false"
    :esc-to-close="false"
    :footer="false"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ hasChecked ? title : t('信息验证') }}</template>

    <template v-if="!hasChecked">
      <a-alert class="mb-5">{{ t('为了保障您的账号安全，请验证后进行下一步操作') }}</a-alert>
      <p v-if="phoneCheck">{{ t('当前手机号') }}</p>
      <p v-else>{{ t('当前绑定邮箱') }}</p>
      <h3 class="text-xl font-bold mt-1">{{ phoneCheck ? phoneStr : emailStr }}</h3>

      <div class="input-item mt-5">
        <a-input
          :placeholder="t('请输入验证码')"
          :max-length="6"
          v-model="verifCode"
        >
        </a-input>
        <div class="verif-code" @click="sendCodeHandle">
          <a-link :loading="sendLoading">
            {{ t('发送验证码') }}
            <template v-if="time">({{ time }})s</template>
          </a-link>
        </div>
      </div>
      <div class="flex justify-end mt-2">
        <a-link v-if="!phoneCheck && phone" @click="switchCheck(true)">{{ t('切换手机接收验证码') }}</a-link>
        <a-link v-if="phoneCheck && email" @click="switchCheck(false)">{{ t('切换邮箱接收验证码') }}</a-link>
      </div>
      <a-button
        type="primary"
        size="large"
        class="w-full !mt-8"
        :disabled="!verifCode || verifCode.length !== 6"
        :loading="nextLoading"
        @click="nextHandle"
      >
        {{ t('下一步') }}</a-button>
    </template>

    <template v-else>
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
        <a-form-item field="verifCode" :label="t('验证码')">
          <div class="input-item w-full">
            <a-input
              :placeholder="t('请输入验证码')"
              :max-length="6"
              v-model="formState.verifCode"
            >
            </a-input>
            <div class="verif-code" @click="sendCodeHandle">
              <a-link :loading="sendLoading">
                {{ t('发送验证码') }}
                <template v-if="time">({{ time }})s</template>
              </a-link>
            </div>
          </div>
        </a-form-item>
        <a-form-item field="password" :label="t('登录密码')" >
          <a-input-password :placeholder="t('请输入登录密码')" v-model="formState.password" allow-clear />
        </a-form-item>
      </a-form>

      <div class="flex justify-between gap-4 !mt-8">
        <a-button
          size="large"
          class="w-full"
          @click="prevHandle"
        >
          {{ t('上一步') }}</a-button>
        <a-button
          type="primary"
          size="large"
          :loading="submitLoading"
          class="w-full"
          @click="submitHandle"
        >
          {{ t('提交') }}</a-button>
      </div>
      
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'
import { Message } from '@arco-design/web-vue'
import { sendCaptchCode } from '@/api/system'
import { userCheckAccount,userBeforeBind, userBindEmailOrPhone } from '@/api/user'

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
const userInfo = computed(() => userStore.userInfo)

const email = computed(() => userInfo.value?.email || '')
const emailStr = computed(() => {
  if (email.value) {
    return email.value.replace(/(\w{1})\w{1,}(\w{1})/, '$1****$2')
  }
  return ''
})

const phone = computed(() => userInfo.value?.phone || '')
const phoneStr = computed(() => {
  if (phone.value) {
    const index = phone.value.indexOf(' ');
    return '+' + phone.value.substring(0, index + 1) + phone.value.substring(index, index + 4) + '****' + phone.value.substring(phone.value.length - 2, phone.value.length);
  }
  return ''
})

const handleCancel = () => {
  emits('update:visible', false)
}

const title = computed(() => {
  if (props.isModify) {
    return props.type === 'phone' ? t('修改手机号') : t('修改邮箱')
  } else {
    return props.type === 'phone' ? t('设置手机号') : t('设置邮箱')
  }
})

const hasChecked = ref(false)
const phoneCheck = ref(true)

const verifCode = ref('')
const sendLoading = ref(false)
const time = ref(0)
const timer = ref(null)

const sendCodeHandle = async() => {  
  if (time.value) { return false }

  let params  = {
    target: phoneCheck.value ? phone.value : email.value
  }

  if (hasChecked.value) {
    const keyStr = props.type === 'phone' ? 'phone' : 'email'
    const valid = await formRef.value.validateField(keyStr)

    if (valid) {
      return false
    } else {
      params.target = props.type === 'phone' ? `${formState.value.areaCode} ${formState.value.phone}` : formState.value.email
    }

    sendLoading.value = true
    let hasExist = false
    await userCheckAccount(params).catch(() => {
      sendLoading.value = false
      hasExist = true
    })

    if (hasExist) {
      return false
    }
  }

  sendLoading.value = true

  sendCaptchCode(params).then(() => {
    Message.success(t('验证码发送成功'))
    time.value = 60;
    timer.value = setInterval(() => {
      if (time.value > 0) {
        time.value = time.value - 1
      } else {
        time.value = 0
        clearInterval(timer.value)
        timer.value = null
      }
    }, 1000);

    sendLoading.value = false
  }).catch(() => {
    sendLoading.value = false
  })
}

const switchCheck = (flag) => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  sendLoading.value = false
  time.value = 0
  verifCode.value = ''

  phoneCheck.value = flag
}

const sessionToken = ref('')
const nextLoading = ref(false)
const nextHandle = () => {
  const params = {
    target: phoneCheck.value ? phone.value : email.value,
    verifCode: verifCode.value
  }

  if (phoneCheck.value) {
    params.phone = phone.value
  } else {
    params.email = email.value
  }

  nextLoading.value = true
  userBeforeBind(params).then(res => {
    sessionToken.value = res.sessionToken

    time.value = 0
    sendLoading.value = false
    verifCode.value = ''
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
    nextLoading.value = false
    hasChecked.value = true
  }).catch(() => {
    nextLoading.value = false
  })
}

const prevHandle = () => {
  if (formRef.value) {
    formRef.value.resetFields()
    formRef.value.clearValidate()
  }

  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  sendLoading.value = false
  time.value = 0

  nextTick(() => {
    hasChecked.value = false
  })
}

const formRef = ref()
const formState = ref({
  phone: '',
  areaCode: '',
  email: '',
  verifCode: '',
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
  verifCode: [
    { required: true, message: t('请输入验证码'), trigger: 'blur' }
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
      target: props.type === 'phone' ? `${formState.value.areaCode} ${formState.value.phone}` : formState.value.email,
      verifCode: formState.value.verifCode,
      password: formState.value.password,
      sessionToken: sessionToken.value
    }

    if (props.type === 'phone') {
      params.phone = `${formState.value.areaCode} ${formState.value.phone}`
    } else {
      params.email = formState.value.email
    }

    submitLoading.value = true

    userBindEmailOrPhone(params).then(async () => {
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
    verifCode.value = ''
    sendLoading.value = false
    nextLoading.value = false
    time.value = 0

    hasChecked.value = false
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
    
    submitLoading.value = false

    if (formRef.value) {
      formRef.value.resetFields()
      formRef.value.clearValidate()
    }
  } else {
    phoneCheck.value = props.type === 'phone'

    if (phoneCheck.value && !phone.value) {
      phoneCheck.value = false
    }

    if (!phoneCheck.value && !email.value) {
      phoneCheck.value = true
    }
  }
})
</script>

<style lang="less" scoped>
.input-item {
  position: relative;
  .verif-code {
    padding: 0 15px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    cursor: pointer;
    right: 0;
    top: 0;
  }
}
</style>