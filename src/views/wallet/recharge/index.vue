<template>
  <div class="ma-content-block p-4 mb-3 min-height">
    <!-- 设置支付密码 -->
    <safe-password-setting
      v-if="showSafewordDialog"
      v-model:visible="showSafewordDialog"
      @cancel="closePage"
    ></safe-password-setting>

    <!-- 确认弹窗 -->
    <pc-confirm-dialog
      v-if="showConfirmDialog"
      v-model:visible="showConfirmDialog"
      :message="t('实名认证尚未完成')"
      :confirmText="t('查看认证进度')"
      @confirm="confirmPage"
      @cancel="closePage"
    ></pc-confirm-dialog>

    <a-spin :loading="pageLoading" :size="32">
      <div class="form-main-content">
        <a-alert v-if="showTopTips" type="success" class="mb-3">
          <template #title>{{ t('提示') }}</template>
          {{ t('通过加密货币充值可以得到{0}的奖励', ['5%']) }}
        </a-alert>

        <a-form v-if="typeData.length" ref="formRef" :model="formState" :rules="formRules" layout="vertical">
          <a-form-item :label="t('充值方式')" field="type">
            <a-select v-model="formState.type" :options="typeData" @change="handleChangeType" />
          </a-form-item>
          <template v-if="currentType === 'crypt'">
            <a-form-item :label="t('币种')" field="coin">
              <pc-check-picker v-model="formState.coin" :options="cryptSelectData" @change="getFeeHandle" />
            </a-form-item>
            <a-form-item :label="t('区块链网络')" field="blockchain_name">
              <pc-check-picker v-model="formState.blockchain_name" :options="blockchainNameData" />
            </a-form-item>
            <a-form-item :label="t('充值地址')" field="channel_address">
              <a-input v-model="formState.channel_address" readonly>
                <template #append>
                  <a-link @click="handleCopy">{{ t('复制') }}</a-link>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item v-if="qrCodeImg" :label="t('扫描二维码')">
              <div class="qr-code-img-box">
                <div class="qr-code-img">
                  <img :src="qrCodeImg" alt="qrcode" />
                </div>
                <a-link @click="downloadImage(qrCodeImg, `${formState.coin}_${formState.blockchain_name}`)">{{ t('保存二维码') }}</a-link>
              </div>
            </a-form-item>
            <a-form-item class="label-item-flex" field="amount">
              <template #label>
                <div class="flex items-center gap-2 justify-between flex-1">
                  <span>{{ t('充值数量') }}</span>
                  <p v-if="Number(fee)">{{ t('当前汇率') }}  {{ `${1} : ${numberStrFormat(fee, 2, false, true)}` }}</p>
                </div>
              </template>
              <a-input-number
                v-model="formState.amount" model-event="input"
                :min="0"
                :placeholder="t('请输入')"
                :precision="precisionNum"
                :hide-button="true"
              />
              <template #extra>
                <div class="flex items-center justify-between mt-1">
                  <div class="flex items-center gap-1">
                    <span>{{ t('充值限额') }}</span>
                    <p>
                      <span class="main-color">{{ numberStrFormat(rechargeLimit.min, 2, false, true) }}USDT</span>
                      <span class="main-color"> ~ </span>
                      <span class="main-color">{{ numberStrFormat(rechargeLimit.max, 2, false, true) }}USDT</span>
                    </p>
                  </div>
                  <div class="flex items-center gap-1">
                    <span>{{ t('预计到账') }}</span>
                    <span class="main-color">{{ expectAmount }} USDT</span>
                  </div>
                </div>
              </template>
            </a-form-item>
            <a-form-item :label="t('上传图片（上传支付详情截图）')" field="img">
              <Uploader
                v-model="formState.img"
                :after-read="(file) => afterRead(file)"
                :max-count="1"
                :readonly="false"
                :preview-options="{
                  closeOnClickOverlay: true,
                  closeable: true
                }"
                :max-size="10 * 1024 * 1024"
                @oversize="onOversize"
              />
            </a-form-item>
            <a-form-item v-if="showRemark" :label="t('备注')" field="remark">
              <a-textarea v-model="formState.remark" :placeholder="t('请输入')" :max-length="100" show-word-limit/>
            </a-form-item>
            <div class="flex items-center gap-2 justify-end mt-2 pb-4">
              <a-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ t('提交') }}</a-button>
            </div>
          </template>
          <template v-if="currentType === 'service'">
            <a-alert>
              <template #title>{{ t('提示') }}</template>
              {{ t('请联系客服') }}
            </a-alert>
          </template>
          <template v-if="currentType === 'tips'">
            <a-alert>
              <template #title>{{ t('提示') }}</template>
              {{ t('您所在地区暂不开放此支付方式') }}
            </a-alert>
          </template>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
  import { Uploader } from 'vant'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { Message } from '@arco-design/web-vue'
  import { useUserStore, useSystemStore } from '@/store'
  import { navigationTo, downloadImage, numberStrFormat, compressImage } from '@/utils'
  import { closeTag } from '@/utils/common'
  import tool from '@/utils/tool'
  import { channelBlockchainList, rechargeOpen, rechargeFee, rechargeApply } from '@/api/user'
  import useClipboard from 'vue-clipboard3'
  import QRCode from 'qrcode'
  import { imageUpload } from '@/api/system'

  const appName = import.meta.env.VITE_APP
  const { t } = useI18n()
  const { toClipboard } = useClipboard()

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

  const showTopTips = computed(() => {
    return ['argos', 'masla', 'oceanPick'].includes(appName) && typeData.value.length && typeData.value[0].type === 'crypt'
  })

  // 显示备注
  const showRemark = computed(() => {
    return ['argos', 'tiktok6'].includes(appName)
  })

  const blockchainNameData = computed(() => {
    const data = cryptData.value.filter(item => item.coin === formState.value.coin) || []
    const dataArr = data ? data.map(item => ({ label: item.blockchainName, value: item.blockchainName })) : []
    if (dataArr.length) {
      formState.value.blockchain_name = dataArr[0].value
    }
    return dataArr
  })

  const precisionNum = computed(() => {
    let res = 2
    if (formState.value.coin === 'BTC') {
      res = 6
    }
    if (formState.value.coin === 'ETH') {
      res = 4
    }
    return res
  })

  const formRef = ref()
  const formState = ref({
    type: undefined,
    coin: '',
    blockchain_name: '',
    channel_address: '',
    amount: undefined,
    img: []
  })

  const validateAmount = (value, cb) => {
    return new Promise((resolve) => {
      const valueNum = Number(value)
      const expectAmountNum = Number(tool.times(valueNum, fee.value))

      if (!value) {
        cb(t('请输入充值数量'))
      }

      if (expectAmountNum < rechargeLimit.value.min) {
        cb(t('充值价值不得小于最小限额') + rechargeLimit.value.min + 'USDT')
      }
      if (expectAmountNum > rechargeLimit.value.max) {
        cb(t('充值价值不得大于最大限额') + rechargeLimit.value.max + 'USDT')
      }

      resolve()
    })
  }

  const formRules = reactive({
    type: [{ required: true, message: t('请选择'), trigger: 'change'}],
    coin: [{ required: true, message: t('请选择'), trigger: 'change' }],
    blockchain_name: [{ required: true, message: t('请选择'), trigger: 'change' }],
    amount: [{ required: true, validator: validateAmount, trigger: 'blur' }],
    img: [{ required: true, message: t('请上传图片'), trigger: 'change' }],
  })

  // 预计到账
  const expectAmount = computed(() => {
    return numberStrFormat(tool.times(formState.value.amount, fee.value), 2, false, true)
  })

  const rechargeLimit = ref({
    min: 0,
    max: 0
  })

  const qrCodeImg = ref('')
  const getChannelAddress = async () => {
    const data = cryptData.value.filter(item => item.coin === formState.value.coin) || []
    const obj = data.find(item => item.blockchainName === formState.value.blockchain_name)

    formState.value.channel_address = obj ? obj.address : ''
    if (formState.value.channel_address) {
      qrCodeImg.value = await QRCode.toDataURL(formState.value.channel_address)
      rechargeLimit.value = {
        min: obj.recharge_limit_min,
        max: obj.recharge_limit_max
      }
    }
  }

  watch(() => formState.value.blockchain_name, () => {
    getChannelAddress()
  })

  watch(() => formState.value.coin, () => {
    getChannelAddress()
  })

  const currentType = computed(() => {
    const type = formState.value.type
    const obj = typeData.value.find(item => item.value === type)
    return obj ? obj.type : ''
  })

  const session_token = ref('')
  const getSessionToken = async () => {
    await rechargeOpen().then((res) => {
      session_token.value = res.session_token
    })
  }

  const pageLoading = ref(false)
  const typeData = ref([])
  const cryptData = ref([])
  const cryptSelectData = ref([])

  const getChannelBlockchainList = () => {
    pageLoading.value = true
    channelBlockchainList().then((res) => {
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

      if (data.length) {
        dataList.push({
          label: t('加密货币'),
          value: 'crypt',
          type: 'crypt'
        })
      }

      if (['argos', 'familyShop', 'selfridges', 'sm', 'argos4', 'cuttingEdge', 'harrods', 'zibbet', 'family-wholesale-group', 'oufan', 'tiktok5', 'argos6', 'tiktok8'].includes(appName)) {
        dataList.push({
          label: ['sm'].includes(appName) ? t('银行卡1') : t('银行卡'),
          value: 'bank',
          type: 'service'
        })
      }

      if (['argos', 'oceanPick'].includes(appName)) {
        dataList.push({
          label: t('电汇存款'),
          value: 'wire_deposit',
          type: 'service'
        })
      }

      if (['argos', 'masla'].includes(appName)) {
        dataList.push({
          label: 'Zelle',
          value: 'zelle',
          type: 'service'
        }, {
          label: 'Wire Transfer',
          value: 'wire_transfer',
          type: 'service'
        })
      }

      if (['argos', 'argos5'].includes(appName)) {
        dataList.push({
          label: 'Balance',
          value: 'balance',
          type: 'tips'
        }, {
          label: 'PayPal',
          value: 'paypal',
          type: 'tips'
        }, {
          label: 'Visa',
          value: 'visa',
          type: 'tips'
        }, {
          label: 'MasterCard',
          value: 'mastercard',
          type: 'tips'
        })
      }

      if (dataList.length) {
        formState.value.type = dataList[0].value
        if (formState.value.type === 'crypt') {
          formState.value.coin = cryptSelectData.value[0].value
          getFeeHandle()
        }
      }

      typeData.value = dataList
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
    })
  }

  const handleChangeType = () => {
    if (currentType.value === 'crypt') {
      getFeeHandle()
    }
    if (currentType.value === 'service') {
      if (systemStore.customer_service_url) {
        window.open(systemStore.customer_service_url)
      } else {
        im_create_iframe_client && im_create_iframe_client.open();
      }
    }
  }

  const feeInterval = ref(null)
  const fee = ref(0)
  // 请求汇率
  const getFeeRequest = () => {
    rechargeFee({
      symbol: formState.value.coin
    }).then((res) => {
      fee.value = res.price
    })
  }
  const getFeeHandle = () => {
    if (formState.value.coin) {
      getFeeRequest()
      if (feeInterval.value) {
        clearInterval(feeInterval.value)
      }

      feeInterval.value = setInterval(() => {
        getFeeRequest()
      }, 1000)
    }
  }

  const handleCopy = async () => {
    try {
      await toClipboard(formState.value.channel_address)
      Message.success(t('复制成功'))
    } catch (e) {
      console.error(e);
    }
  }

  const onOversize = () => {
    Message.error(t('图片大小不能超过{0}', ['10MB']))
  }

  const afterRead = async (file) => {
    file.status = 'uploading'
    file.message = t('上传中...')

    try {
      // 如果文件大于10MB，直接提示并返回
      if (file.file.size > 10 * 1024 * 1024) {
        Message.error(t('图片大小不能超过{0}', ['10MB']))
        file.status = 'failed'
        return
      }

      const compressedFile = await compressImage(file.file)

      const formData = new FormData();// 通过formdata上传
      formData.append('file', compressedFile);
      formData.append('moduleName', 'recharge')
      imageUpload(formData).then(res => {
        file.status = 'success'
        file.message = t('上传成功')
        file.url = res.url

        formRef.value.validateField('img')

      }).catch(function (err) {
        file.status = 'failed'
        file.message = t('上传失败')

        formState.value.img = []
      })
    } catch (error) {
      console.error('Upload error:', error)
      file.status = 'failed'
    }
  }

  const submitLoading = ref(false)
  const handleSubmit = async () => {
    const valid = await formRef.value.validate()
    if (!valid) {
      const { coin, blockchain_name, channel_address, amount, img, remark } = formState.value
      const params = {
        session_token: session_token.value,
        coin,
        blockchain_name,
        channel_address,
        amount,
        img: img[0].url,
        remark,
        from: '123', // 客户转出地址
        tx: '' // 转账hash
      }

      submitLoading.value = true

      rechargeApply(params).then(async () => {
        await getSessionToken()
        Message.success(t('提交成功'))
        window.dispatchEvent(new Event('rechargeSuccess'))
        closePage()
        navigationTo('/wallet')
        submitLoading.value = false
      }).catch(async () => {
        await getSessionToken()
        submitLoading.value = false
      })
    }
  }

  watch(() => hasSafeword.value, () => {
    checkCert()
  })

  onMounted(() => {
    checkCert()
    getSessionToken()
    getChannelBlockchainList()
  })

  onUnmounted(() => {
    if (feeInterval.value) {
      clearInterval(feeInterval.value)
    }
  })
</script>

<style lang="less" scoped>
  .form-main-content {
    width: 100%;
    max-width: 600px;
    min-height: 300px;
  }

  .qr-code-img-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .qr-code-img {
    width: 140px;
    height: 140px;
    border: 1px solid rgb(var(--gray-3));
    > img {
      width: 100%;
      height: 100%;
    }
  }
</style>
