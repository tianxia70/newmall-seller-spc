<template>
  <div class="ma-content-block p-4 mb-3 min-height">
    <!-- 设置支付密码 -->
    <safe-password-setting
      v-if="showSafewordDialog"
      v-model:visible="showSafewordDialog"
      @cancel="closePage"
    ></safe-password-setting>

    <!-- 输入安全密码 -->
    <safe-password-input
      v-model:visible="showSafePassword"
      @confirm="withdrawRequest"
    ></safe-password-input>

    <!-- 确认弹窗 -->
    <pc-confirm-dialog
      v-if="showConfirmDialog"
      v-model:visible="showConfirmDialog"
      :message="t('实名认证尚未完成')"
      :confirmText="t('查看认证进度')"
      @confirm="confirmPage"
      @cancel="closePage"
    ></pc-confirm-dialog>

    <!-- 绑定提现地址 -->
    <bind-coin-dialog
      v-if="showBindDialog"
      v-model:visible="showBindVisible"
      :coin-data="cryptData"
      :coin-options="cryptSelectData"
      @done="getSessionToken"
    ></bind-coin-dialog>

    <a-spin :loading="pageLoading" :size="32">
      <div class="form-main-content">
        <template v-if="showBindTips && !pageLoading">
          <a-alert type="warning" class="mb-3">
            <template #title>{{ t('提示') }}</template>
            {{ t('请先绑定绑定提现地址') }}
          </a-alert>
          <a-button type="primary" @click="showBindVisible = true">{{ t('绑定提现地址') }}</a-button>
        </template>

        <template v-if="showBindDialog && !pageLoading && !showBindTips && formState.type === 'crypt'">
          <a-alert type="warning" class="mb-3">
            <template #title>{{ t('提示') }}</template>
            {{ t('使用已绑定提现地址') }}
          </a-alert>
        </template>

        <a-form v-if="typeData.length && !pageLoading && !showBindTips" ref="formRef" :model="formState" :rules="formRules" layout="vertical">
          <a-form-item :label="t('提现方式')" field="type">
            <a-select v-model="formState.type" :options="typeData" @change="typeChange" />
          </a-form-item>
          <template v-if="currentType === 'crypt'">
            <a-form-item :label="t('币种')" field="channel">
              <a-select v-model="formState.channel" :options="cryptSelectData" :disabled="showBindDialog" @change="channelChange" />
            </a-form-item>
            <a-form-item :label="t('提现网络')" field="blockchain_name">
              <a-select v-model="formState.blockchain_name" :options="blockchainData" :disabled="showBindDialog" />
            </a-form-item>
            <a-form-item :label="t('提现地址')" field="from">
              <a-input v-model="formState.from" :disabled="showBindDialog" />
            </a-form-item>
          </template>

          <template v-if="currentType === 'service'">
            <a-alert>
              <template #title>{{ t('提示') }}</template>
              {{ t('请联系客服') }}
            </a-alert>
          </template>

          <template v-if="currentType === 'bank'">
            <a-form-item v-if="showBankNational" :label="t('国家')" field="countryName">
              <a-select
                v-model="formState.countryName"
                allow-search
              >
                <a-option
                  v-for="item in countrySelectData"
                  :key="item.id"
                  :label="item.i18nName"
                  :value="item.i18nName"
                />
              </a-select>
            </a-form-item>
            <a-form-item :label="t('姓名')" field="bankUserName">
              <a-input v-model="formState.bankUserName" />
            </a-form-item>
            <a-form-item :label="t('开户行')" field="bankName">
              <a-input v-model="formState.bankName" />
            </a-form-item>
            <a-form-item :label="t('银行卡号')" field="bankCardNo">
              <a-input v-model="formState.bankCardNo" />
            </a-form-item>
            <template v-if="showBankMoreInfo">
              <a-form-item :label="t('国际代码')" field="swiftCode">
                <a-input v-model="formState.swiftCode" />
              </a-form-item>
              <a-form-item :label="t('路由号码')" field="routingNum">
                <a-input v-model="formState.routingNum" />
              </a-form-item>
              <a-form-item :label="t('账户地址')" field="accountAddress">
                <a-input v-model="formState.accountAddress" />
              </a-form-item>
              <a-form-item :label="t('银行地址')" field="bankAddress">
                <a-input v-model="formState.bankAddress" />
              </a-form-item>
            </template>
          </template>

          <template v-if="['crypt', 'bank'].includes(currentType)">
            <a-form-item class="label-item-flex" field="amount">
              <template #label>
                <div class="flex items-center gap-2 justify-between flex-1">
                  <span>{{ t('提现金额') }}</span>
                </div>
              </template>
              <a-input-number
                v-model="formState.amount" model-event="input"
                :min="0"
                :placeholder="t('请输入')"
                :precision="precisionNum"
                :hide-button="true"
              >
              <template #suffix>
                {{ currentType === 'crypt' ? formState.channel : 'USD' }}
              </template>
              </a-input-number>
              <template #extra>
                <div class="flex items-center gap-2">
                  <a-tag color="cyan" size="small" bordered>{{ t('钱包余额') }} {{ `$${numberStrFormat(allBalance, 2, false, true)}` }}</a-tag>
                  <a-tag v-if="amountUnitNum && currentType === 'crypt'" color="blue" size="small" bordered>
                    ≈<pc-number :data="Number(amountUnitNum)" :decimals="precisionNum" :currency="false" class="tag-number" />{{ formState.channel }}
                  </a-tag>
                </div>
              </template>
            </a-form-item>
            <a-form-item :label="t('实际到账')">
              <a-input v-model="actualAmount" readonly>
                <template #suffix>
                  {{ currentType === 'crypt' ? formState.channel : 'USD' }}
                </template>
              </a-input>
              <template #extra>
                <div class="flex items-center gap-2">
                  <a-tag v-if="actualAmount" color="blue" size="small" bordered>
                    ≈<pc-number :data="actualAmountUsd" :decimals="precisionNum" :currency="false" class="tag-number" />{{ currentType === 'crypt' ? 'USDT' : 'USD' }}
                  </a-tag>
                </div>
              </template>
            </a-form-item>
            <a-form-item :label="t('手续费')">
              <a-input v-model="amountFee" readonly>
                <template #suffix>
                  {{ currentType === 'crypt' ? formState.channel : 'USD' }}
                </template>
              </a-input>
              <template #extra>
                <div class="flex items-center justify-between">
                  <a-tag v-if="amountFee" color="blue" size="small" bordered>
                    ≈<pc-number :data="amountFeeUsd" :decimals="precisionNum" :currency="false" class="tag-number" />{{ currentType === 'crypt' ? 'USDT' : 'USD' }}
                  </a-tag>
                  <p v-else></p>
                  <a-tag color="cyan" size="small" bordered>
                    {{ t('手续费') }}
                    <pc-number :data="Number(tool.times(100, handlingFee))" :currency="false" suffix="%" class="tag-number cyan" />
                  </a-tag>
                </div>
              </template>
            </a-form-item>
            <a-form-item v-if="showRemark" :label="t('备注')" field="remark">
              <a-textarea v-model="formState.remark" :placeholder="t('请输入')" :max-length="100" show-word-limit/>
            </a-form-item>
            <div class="flex items-center gap-2 justify-end mt-2 pb-4">
              <a-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ t('提交') }}</a-button>
            </div>
          </template>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useUserStore, useSystemStore } from '@/store'
  import { navigationTo,numberStrFormat } from '@/utils'
  import { closeTag } from '@/utils/common'
  import { Message } from '@arco-design/web-vue'
  import tool from '@/utils/tool'
  import { userWalletGetUsdt, withdrawLimitConfig, channelBlockchainList, withdrawOpen, rechargeFee, withdrawFee, withdrawApply } from '@/api/user'
  import BindCoinDialog from './../components/bind-coin-dialog.vue'
  import { cloneDeep } from 'lodash-es'
  import { bankInfoKey } from '@/configs'

  const appName = import.meta.env.VITE_APP
  const { t } = useI18n()

  const route = useRoute()
  const userStore = useUserStore()
  const systemStore = useSystemStore()
  const userInfo = computed(() => userStore.userInfo)
  const hasSafeword = computed(() => userInfo.value.safeword)
  const hasCerted = computed(() => userInfo.value.kyc_status === 2)

  const showSafewordDialog = ref(false)
  const showConfirmDialog = ref(false)

  const checkCert = () => {
    if (!hasSafeword.value) {
      showSafewordDialog.value = true
    } else {
      if (!hasCerted.value) {
        showConfirmDialog.value = true
      }
    }
  }

  const confirmPage = () => {
    closePage()
    navigationTo('/other/shop-setting?cert=1')
  }

  const closePage = () => {
    const { fullPath, name, meta } = route
    const tag = {
      name,
      title: meta.title,
      path: fullPath,
    }
    closeTag(tag)
  }

  const countrySelectData = computed(() => {
    const data = cloneDeep(systemStore.countryList)
    return data || []
  })

  const formRef = ref()
  const formState = ref({
    type: undefined,
    channel: undefined,
    blockchain_name: undefined,
    from: '',
    amount: undefined,
    countryName: undefined,
    bankUserName: '',
    bankName: '',
    bankCardNo: '',
    swiftCode: '',
    routingNum: '',
    accountAddress: '',
    bankAddress: '',
    remark: ''
  })

  const validateAmount = (value, cb) => {
    return new Promise((resolve) => {
      const valueNum = Number(value)
      const feeNum = formState.value.type === 'crypt' ? Number(fee.value) : 1
      const unit = formState.value.type === 'crypt' ? 'USDT' : 'USD'
      const expectAmountNum = Number(tool.times(valueNum, feeNum))

      if (!value) {
        cb(t('请输入充值数量'))
      }

      if (expectAmountNum < withdrawAmountMin.value) {
        cb(t('提款范围') + ` ≥ ${withdrawAmountMin.value} ${unit}`)
      }
      if (expectAmountNum > withdrawAmountMax.value) {
        cb(t('提款范围') + `${withdrawAmountMin.value} - ${withdrawAmountMax.value} ${unit}`)
      }

      resolve()
    })
  }

  const formRules = reactive({
    type: [{ required: true, message: t('请选择'), trigger: 'change'}],
    channel: [{ required: true, message: t('请选择提现币种'), trigger: 'change' }],
    blockchain_name: [{ required: true, message: t('请选择提现网络'), trigger: 'change' }],
    from: [{ required: true, message: t('请输入提现地址'), trigger: 'blur' }],
    amount: [{ required: true, validator: validateAmount, trigger: 'blur' }],
    countryName: [{ required: true, message: t('请选择国家'), trigger: 'change' }],
    bankUserName: [{ required: true, message: t('请输入姓名'), trigger: 'blur' }],
    bankName: [{ required: true, message: t('请输入开户行'), trigger: 'blur' }],
    bankCardNo: [{ required: true, message: t('请输入银行卡号'), trigger: 'blur' }]
  })

  // 是否有虚拟币提现
  const hasCryptWithdraw = computed(() => {
    return !['tiktok8'].includes(appName)
  })

  // 是否有银行卡提现方式
  const hasBankType = computed(() => {
    return !['tiktok-wholesale', 'aliExpress-wholesale', 'tiktok2', 'aiMall'].includes(appName)
  })

  // 银行卡提现跳客服
  const hasBankTypeOpenService = computed(() => {
    return ['familyShop', 'sm', 'flipkart', 'family-wholesale-group', 'tiktok5', 'argos6'].includes(appName)
  })

  // 银行卡提现国家选择
  const showBankNational = computed(() => {
    return ['argos', 'shop2u'].includes(appName)
  })

  // 显示银行卡额外信息
  const showBankMoreInfo = computed(() => {
    return ['argos'].includes(appName)
  })

  // 显示备注
  const showRemark = computed(() => {
    return ['argos', 'tiktok6'].includes(appName)
  })

  const currentType = computed(() => {
    const type = formState.value.type
    const obj = typeData.value.find(item => item.value === type)
    return obj ? obj.type : ''
  })

  const blockchainData = computed(() => {
    const data = cryptData.value.filter(item => item.coin === formState.value.channel)
    if (data.length) {
      return data.map(item => ({
        label: item.blockchainName,
        value: item.blockchainName
      }))
    } else {
      return []
    }
  })

  const precisionNum = computed(() => {
    let res = 2
    if (formState.value.type !== 'crypt') {
      res = 2
    } else {
      if (formState.value.channel === 'BTC') {
        res = 6
      }
      if (formState.value.channel === 'ETH') {
        res = 4
      }
    }
    return res
  })

  const amountUnitNum = computed(() => {
    if (fee.value) {
      const num = tool.div(allBalance.value, fee.value)
      return num || 0
    } else {
      return 0
    }
  })

  const actualAmount = computed(() => {
    if (formState.value.amount) {
      const feeNum = Number(tool.times(formState.value.amount, handlingFee.value))
      return String(Number(Number(tool.minus(formState.value.amount, feeNum)).toFixed(precisionNum.value)))
    } else {
      return ''
    }
  })

  const actualAmountUsd = computed(() => {
    if (actualAmount.value) {
      const feeNum = formState.value.type === 'crypt' ? Number(fee.value) : 1
      return Number(tool.times(actualAmount.value, feeNum))
    } else {
      return 0
    }
  })

  const amountFee = computed(() => {
    if (formState.value.amount) {
      return String(Number(Number(tool.times(formState.value.amount, handlingFee.value)).toFixed(precisionNum.value)))
    } else {
      return ''
    }
  })

  const amountFeeUsd = computed(() => {
    if (amountFee.value) {
      const feeNum = formState.value.type === 'crypt' ? Number(fee.value) : 1
      return Number(tool.times(amountFee.value, feeNum))
    } else {
      return 0
    }
  })

  const typeChange = () => {
    if (currentType.value === 'service') {
      if (systemStore.customer_service_url) {
        window.open(systemStore.customer_service_url)
      } else {
        im_create_iframe_client && im_create_iframe_client.open();
      }
    } else {
      getFeeHandle()
    }
  }

  const channelChange = () => {
    getWithdrawFee()
    if (blockchainData.value.length) {
      formState.value.blockchain_name = blockchainData.value[0].value
    } else {
      formState.value.blockchain_name = undefined
    }
  }

  const pageLoading = ref(true)
  const allBalance = ref(0)
  const withdrawAmountMin = ref(0)
  const withdrawAmountMax = ref(100000)

  const typeData = ref([])
  const cryptData = ref([])
  const cryptSelectData = ref([])

  const getChannelBlockchainList = async() => {
    await channelBlockchainList().then((res) => {
      const data = res || []
      cryptData.value = data

      const storeArr = []
      for (let i = 0; i < data.length; i++) {
        const iconName = data[i].coin
        if (!storeArr.includes(iconName)) {
          storeArr.push({
            label: iconName,
            value: iconName
          })
        }
      }

      cryptSelectData.value = storeArr

      const dataList = []

      let iconName = '虚拟币'
      if (['familyShop', 'selfridges', 'sm', 'aliExpress-wholesale', 'tiktok2', 'tiktok-wholesale'].includes(appName)) {
        iconName = '加密货币'
      }
      if (['argos2'].includes(appName)) {
        iconName = '货币'
      }

      if (hasCryptWithdraw.value) {
        dataList.push({
          label: iconName,
          value: 'crypt',
          type: 'crypt'
        })
      }

      if (hasBankType.value) {
        dataList.push({
          label: ['sm'].includes(appName) ? t('银行卡2') : t('银行卡'),
          value: 'bank',
          type: hasBankTypeOpenService.value ? 'service' : 'bank'
        })
      }

      if (dataList.length) {
        formState.value.type = dataList[0].value
        if (formState.value.type === 'crypt') {
          formState.value.channel = cryptSelectData.value[0].value
          channelChange()
          getFeeHandle()
        }
        if (formState.value.type === 'bank') {
          getFeeHandle()
        }
      }

      typeData.value = dataList
    }).catch(() => {
      pageLoading.value = false
    })
  }

  const session_token = ref('')
  const showBindDialog = ref(false)
  const showBindVisible = ref(false)
  const showBindTips = ref(true)

  const getSessionToken = async () => {
    await withdrawOpen().then((res) => {
      session_token.value = res.session_token

      if (res.openWithdrawAddressBinding === 1) {
        formState.value.channel = res.coinType
        formState.value.blockchain_name = res.chainName
        formState.value.from = res.existWithdrawAddress

        showBindDialog.value = true
        showBindTips.value = !res.chainName || !res.coinType || !res.existWithdrawAddress
        showBindVisible.value = showBindTips.value
      } else {
        showBindDialog.value = false
        showBindVisible.value = false
        showBindTips.value = false
      }

      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
    })
  }

  const pageInit = async () => {
    try {
      pageLoading.value = true
      const moneyInfo = await userWalletGetUsdt()
      allBalance.value = moneyInfo.money

      const limitConfig = await withdrawLimitConfig()
      withdrawAmountMin.value = limitConfig.withdrawAmountMin
      withdrawAmountMax.value = limitConfig.withdrawAmountMax > allBalance.value ? allBalance.value : limitConfig.withdrawAmountMax

      await getChannelBlockchainList()

      await getSessionToken()

      // 没有虚拟币提现
      if (!hasCryptWithdraw.value) {
        const bankInfo = localStorage.getItem(bankInfoKey)
        if (bankInfo) {
          const bankInfoObj = JSON.parse(bankInfo)
          for(const key in bankInfoObj) {
            formState.value[key] = bankInfoObj[key] || ''
          }
        }
      }

    } catch (error) {
      console.error('获取信息失败:', error)
    } finally {
      pageLoading.value = false
    }
  }

  const feeInterval = ref(null)
  const fee = ref(0)
  // 请求汇率
  const getFeeRequest = () => {
    rechargeFee({
      symbol: formState.value.channel
    }).then((res) => {
      fee.value = res.price
    })
  }
  const getFeeHandle = () => {
    getWithdrawFee()
    if (formState.value.channel) {
      getFeeRequest()
      if (feeInterval.value) {
        clearInterval(feeInterval.value)
      }

      feeInterval.value = setInterval(() => {
        getFeeRequest()
      }, 1000)
    }
  }

  // 获取提款手续费
  const handlingFee = ref(0)
  const getWithdrawFee = () => {
    withdrawFee({
      channel: formState.value.type === 'crypt' ? formState.value.channel : 'bank'
    }).then((res) => {
      handlingFee.value = res.withdraw_fee || 0
    })
  }

  const submitLoading = ref(false)
  const handleSubmit = async () => {
    const valid = await formRef.value.validate()

    if (!valid) {
      showSafePassword.value = true
    }
  }

  const showSafePassword = ref(false)
  const withdrawRequest = (safeword) => {
    const { type, amount, from, channel, remark, bankName, bankUserName, bankCardNo, swiftCode, routingNum, accountAddress, bankAddress, countryName } = formState.value
    const params = {
      safeword: safeword,
      amount,
      channel,
      remark,
      session_token: session_token.value
    }

    if (type === 'crypt') {
      params.from = from
    }

    if (type === 'bank') {
      params.channel = 'bank'

      params.bankName = bankName
      params.bankUserName = bankUserName
      params.bankCardNo = bankCardNo

      if (showBankMoreInfo.value) {
        params.swiftCode = swiftCode || ''
        params.routingNum = routingNum || ''
        params.accountAddress = accountAddress || ''
        params.bankAddress = bankAddress || ''
      }

      if (showBankNational.value) {
        params.countryName = countryName || ''
      }
    }

    // 没有虚拟币提现
    if (!hasCryptWithdraw.value) {
      const obj = {
        bankName,
        bankUserName,
        bankCardNo,
        swiftCode,
        routingNum,
        accountAddress,
        bankAddress,
        countryName
      }

      localStorage.setItem(bankInfoKey, JSON.stringify(obj))
    }

    submitLoading.value = true
    withdrawApply(params).then(async () => {
      await getSessionToken()
      Message.success(t('提交成功'))
      window.dispatchEvent(new Event('withdrawSuccess'))
      closePage()
      navigationTo('/wallet')
      submitLoading.value = false
    }).catch(async () => {
      await getSessionToken()
      submitLoading.value = false
    })
  }

  onMounted(async () => {
    checkCert()
    systemStore.getCountryListHandle()
    pageInit()
  })

  onUnmounted(() => {
    if (feeInterval.value) {
      clearInterval(feeInterval.value)
    }
  })

  watch(() => hasSafeword.value, () => {
    checkCert()
  })
</script>

<style lang="less" scoped>
  .form-main-content {
    width: 100%;
    max-width: 600px;
    min-height: 300px;
    :deep(.tag-number) {
      padding: 0 2px;
      span {
        font-size: 12px !important;
        line-height: 20px;
        color: rgb(var(--blue-6));
      }
      &.cyan {
        span {
          color: rgb(var(--cyan-6)) !important;
        }
      }
    }
  }
</style>
