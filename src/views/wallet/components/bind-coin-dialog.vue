<template>
  <a-modal
    :visible="visible"
    :width="500"
    :mask-closable="false"
    :esc-to-close="false"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ t('绑定提现地址') }}</template>
    
    <a-alert class="mb-3">
      <template #title>{{ t('提示') }}</template>
      {{ t('仅能绑定一个收款地址!') }}
    </a-alert>

    <a-form ref="formRef" :model="formState" :rules="formRules" layout="vertical">
      <a-form-item :label="t('提现币种')" field="coin">
        <a-select v-model="formState.coin" :options="coinOptions" @change="coinChange" />
      </a-form-item>
      <a-form-item :label="t('提现网络')" field="blockchain_name">
        <a-select v-model="formState.blockchain_name" :options="blockchainData" />
      </a-form-item>
      <a-form-item :label="t('提现地址')" field="channel_address">
        <a-input v-model="formState.channel_address" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="handleCancel">{{ t('取消') }}</a-button>
      <a-button type="primary" :loading="submitLoading" @click="submitHandle">{{ t('提交') }}</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { bindWithdrawAddress } from '@/api/user'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  coinData: {
    type: Array,
    default: () => []
  },
  coinOptions: {
    type: Array,
    default: () => []
  }
})
const emits = defineEmits(['update:visible', 'done'])

const handleCancel = () => {
  emits('update:visible', false)
}

const blockchainData = computed(() => {
  const data = props.coinData.filter(item => item.coin === formState.value.coin)
  if (data.length) {
    return data.map(item => ({
      label: item.blockchainName,
      value: item.blockchainName
    }))
  } else {
    return []
  }
})

const coinChange = () => {
  if (blockchainData.value.length) {
    formState.value.blockchain_name = blockchainData.value[0].value
  } else {
    formState.value.blockchain_name = undefined
  }
}

const formRef = ref()
const formState = ref({
  coin: undefined,
  blockchain_name: undefined,
  channel_address: ''
})

const formRules = reactive({
  coin: [{ required: true, message: t('请选择提现币种'), trigger: 'change' }],
  blockchain_name: [{ required: true, message: t('请选择提现网络'), trigger: 'change' }],
  channel_address: [{ required: true, message: t('请输入提现地址'), trigger: 'blur' }],
})

const submitLoading = ref(false)
const submitHandle = async () => {
  const valid = await formRef.value.validate()
  if (!valid) {
    submitLoading.value = true
    bindWithdrawAddress({
      ...formState.value
    }).then(() => {
      Message.success(t('绑定成功'))
      formRef.value.resetFields()
      formRef.value.clearValidate()
      emits('done')
      handleCancel()
    }).catch(() => {
      submitLoading.value = false
    })
  }
}
</script>
