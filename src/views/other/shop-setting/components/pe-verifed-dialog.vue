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

    <a-alert class="mb-5">{{ t('为了保障您的账号安全，请{0}', [title]) }}</a-alert>
    <p v-if="type === 'phone'">{{ t('当前手机号') }}</p>
    <p v-if="type === 'email'">{{ t('当前绑定邮箱') }}</p>
    <h3 class="text-xl font-bold mt-1">{{ type === 'phone' ? phoneStr : emailStr }}</h3>


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
    
    <a-button
      type="primary" size="large" class="w-full !mt-8"
      :loading="submitLoading"
      :disabled="!verifCode || verifCode.length !== 6"
      @click="submitHandle"
    >{{ t('提交验证') }}</a-button>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'
import { Message } from '@arco-design/web-vue'
import { sendCaptchCode } from '@/api/system'
import { checkEmailOrPhone } from '@/api/user'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'phone'
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

const title = computed(() => {
  return props.type === 'phone' ? t('认证手机号') : t('认证邮箱')
})

const handleCancel = () => {
  emits('update:visible', false)
}

const verifCode = ref('')
const sendLoading = ref(false)
const time = ref(0)
const timer = ref(null)

const sendCodeHandle = () => {  
  if (time.value) { return false }

  const params  = {
    target: props.type === 'phone' ? phone.value : email.value
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

const submitLoading = ref(false)
const submitHandle = () => {
  if (!verifCode.value) {
    Message.error(t('请输入验证码'))
    return false
  }

  const params = {
    target: props.type === 'phone' ? phone.value : email.value,
    verifCode: verifCode.value
  }

  submitLoading.value = true
  checkEmailOrPhone(params).then(async () => {
    Message.success(t('验证完成'))
    await userStore.getUserInfo()
    submitLoading.value = false
    emits('update:visible', false)
  }).catch(() => {
    submitLoading.value = false
  })
}

watch(() => props.visible, (val) => {
  if (!val) {
    verifCode.value = ''
    submitLoading.value = false
    time.value = 0
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
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