<template>
  <div>
    <!-- 密码输入弹窗 -->
    <safe-password-input v-model:visible="showSafePassword" @confirm="submitRequest" />

    <a-modal
      :visible="visible"
      :width="480"
      :mask-closable="false"
      :esc-to-close="false"
      :footer="false"
      :on-before-cancel="handleCancel"
    >
      <template #title>{{ dialogTitle }}</template>
      <a-spin :loading="pageLoading" :size="32">
        <div class="transfer-container">
          <div class="money-content">
            <img :src="iconImg1.href" alt="">
            <div class="info">
              <h3>{{ isIn ? t('钱包余额') : `$${numberStrFormat(yueBalance, 2, false, true)}` }}</h3>
              <p v-if="isIn">{{ t('当前余额', {money: `$${numberStrFormat(userMoney, 2, false, true)}`}) }}</p>
              <p v-else>{{ t('余额宝余额') }}</p>
            </div>
          </div>

          <div class="transfer-content">
            <p>{{ t(isIn ? '转入金额' : '转出金额') }}</p>
            <div class="input-content">
              <span>$</span>
              <a-input-number
                v-model="inputMoney"
                allow-clear
                :placeholder="t('请输入')"
                :precision="2"
                :step="100"
                :min="0"
                :hide-button="true"
                model-event="input"
              ></a-input-number>
              <p @click="allHandle">{{ t('全部') }}</p>
            </div>
            <div v-if="isIn" class="intro">
                {{ t('每日收益率') }} <span>{{ transferDayRate }}%</span>，{{ t('预计每日收益') }} <span>≈${{ expectedMoney }}</span>，{{ t('预计收益到账时间') }} <span>{{ transferWillDay }}</span>
            </div>
            <div v-else class="intro">{{ t('转出至余额的资金，可进行余额相关交易，对资金合理安排') }}</div>
          </div>

          <div class="btn-content">
            <a-button type="primary" :loading="submitLoading" @click="submitHandle" class="w-full" size="large">{{ t(isIn ? '确认转入' : '确认转出') }}</a-button>
          </div>

          <div v-if="isIn" class="yuebao-intro">
            <p class="title">{{ t('余额宝定期理财') }}</p>
            <p class="info">1.{{ t('转入说明') }}：{{ t('余额定时转入余额宝，每天可获得不同档次收益，存入金额越高收益值越高') }}；</p>
            <p class="info">2.{{ t('收益计算') }}：{{ t('从余额转入余额宝24小时后可获得收益') }}；</p>
            <p class="info">3.{{ t('转入档次') }}：</p>
            <div class="table-content">
              <div class="col">
                <div class="item">{{ t('序号') }}</div>
                <div class="item">{{ t('转入金额') }}</div>
                <div class="item">{{ t('日利率') }}</div>
              </div>
              <div v-for="(item, index) in transferDayRateInfo" :key="index" class="col">
                <div class="item">{{ index + 1 }}</div>
                <div class="item">
                  <span v-if="(index + 1) < transferDayRateInfo.length">${{ numberStrFormat(item.rangeMin, 2, false, true) }} - ${{ numberStrFormat(item.rangeMax, 2, false, true) }}</span>
                  <span v-else>≤ ${{ numberStrFormat(item.rangeMin, 2, false, true) }}</span>
                </div>
                <div class="item"><span>{{ item.profitPercent }}%</span></div>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { sellerInvestConfig, sellerInvestTransfer } from '@/api/user'
import { numberStrFormat } from '@/utils'
import tool from '@/utils/tool'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  isIn: {
    type: Boolean,
    default: false
  },
  yueBalance: {
    type: Number,
    default: 0
  }
})

const emits = defineEmits(['update:visible', 'done'])

const iconImg1 = new URL('@/assets/images/wallet/yuebao_icon3.png', import.meta.url)

const dialogTitle = computed(() => {
  return props.isIn ? t('转入') : t('转出')
})

const pageLoading = ref(false)
const userMoney = ref(0)
const transferDayRateInfo = ref([])
const transferWillDay = ref('')
const transferMin = ref(0)
const transferMax = ref(99999999)
const inputMoney = ref(undefined)

const expectedMoney = computed(() => {
  const rate = tool.div(transferDayRate.value, 100)
  const money = Number(inputMoney.value) || 0
  return numberStrFormat(tool.times(rate, money), 2, false, true)
})

const transferDayRate = computed(() => {
  let num = 0
  const money = Number(inputMoney.value)
  if (!isNaN(money)) {
    for (let i = 0; i < transferDayRateInfo.value.length; i++) {
      if (money >= transferDayRateInfo.value[i].rangeMin && money < transferDayRateInfo.value[i].rangeMax) {
        num = transferDayRateInfo.value[i].profitPercent
      }
      if ((i + 1) === transferDayRateInfo.value.length && money >= transferDayRateInfo.value[i].rangeMin) {
        num = transferDayRateInfo.value[i].profitPercent
      }
    }
  }
  return num
})

const allHandle = () => {
  inputMoney.value = props.isIn ? userMoney.value : props.yueBalance
}

const handleCancel = () => {
  emits('update:visible', false)
}

const showSafePassword = ref(false)
const submitLoading = ref(false)
const submitHandle = () => {
  const money = Number(inputMoney.value)
  if (isNaN(money)) {
    Message.error(t('金额输入有误，请输入数字'))
    return
  }

  if (!props.isIn) {
    if (money > props.yueBalance) {
      Message.error(t('转出金额超出了当前余额宝余额'))
      return
    }
  } else {
    if (money > userMoney.value) {
      Message.error(t('转入金额超出了当前余额'))
      return
    }

    if (money < transferMin.value) {
      Message.error(t('转入金额最小为：', {txt: transferMin.value}))
      return
    }

    if (money > transferMax.value) {
      Message.error(t('转入金额最大为：', {txt: transferMax.value}))
      return
    }
  }

  showSafePassword.value = true
}

const submitRequest = (data) => {
  const params = {
    action: props.isIn ? 'in' : 'out',
    safeword: data,
    amount: Number(inputMoney.value)
  }

  submitLoading.value = true
  sellerInvestTransfer(params)
    .then(() => {
      handleCancel()
      emits('done')
      Message.success(t('操作成功'))
      submitLoading.value = false
    })
    .catch(() => {
      submitLoading.value = false
    })
}

const getConfigData = () => {
  pageLoading.value = true
  sellerInvestConfig()
    .then(res => {
      const { money, willDay, min, max, profitRangeList } = res
      userMoney.value = money
      transferWillDay.value = willDay
      transferMin.value = min
      transferMax.value = max
      transferDayRateInfo.value = profitRangeList
      pageLoading.value = false
    })
    .catch(() => {
      pageLoading.value = false
    })
}

watch(() => props.visible, (val) => {
  if (val) {
    getConfigData()
  } else {
    inputMoney.value = undefined
    pageLoading.value = false
    submitLoading.value = false
  }
})
</script>

<style lang="less" scoped>
.transfer-container {
  min-height: 300px;
  .money-content {
    display: flex;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid rgb(var(--gray-2));

    > img {
      width: 44px;
    }

    > .info {
      padding-left: 10px;

      > h3 {
        font-size: 16px;
        color: var(--color-text-1);
      }

      > p {
        font-size: 12px;
        color: var(--color-text-2);
      }
    }
  }

  .transfer-content {
    margin-top: 20px;

    > p {
      font-size: 12px;
      color: var(--color-text-2);
    }

    > .input-content {
      display: flex;
      align-items: center;
      margin-top: 15px;

      > span {
        font-size: 30px;
        font-weight: bold;
        color: var(--color-text-1);
      }

      > p {
        color: rgb(var(--primary-6));
        cursor: pointer;
        user-select: none;
      }

      :deep(.arco-input-wrapper) {
        flex: 1;
        background-color: transparent !important;
        border: none !important;
      }

      :deep(.arco-input) {
        padding-left: 5px;
        font-size: 30px !important;
        font-weight: bold !important;
        border: none !important;
        background-color: transparent !important;
        border: none !important;
      }
    }

    > .intro {
      padding-top: 15px;
      font-size: 12px;
      color: var(--color-text-2);
      border-top: 1px solid rgb(var(--gray-3));
      margin-top: 10px;

      :deep(span) {
        color: rgb(var(--primary-6));
      }
    }
  }

  .btn-content {
    width: 100%;
    margin-top: 20px;

    :deep(.arco-btn) {
      width: 100%;
      height: 50px;
    }
  }
}

.yuebao-intro {
  padding-bottom: 30px;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 20px;

  > .title {
    font-weight: bold;
    font-size: 13px;
    color: var(--color-text-1);
  }

  > p {
    margin-top: 5px;
  }

  span {
    color: rgb(var(--primary-6));
  }

  > .table-content {
    border: 1px solid rgb(var(--gray-3));
    margin-top: 5px;

    > .col {
      display: flex;
      border-bottom: 1px solid rgb(var(--gray-3));

      &:last-child {
        border-bottom: none;
      }

      > .item {
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid rgb(var(--gray-3));
        word-wrap: break-word;
        text-align: center;

        &:nth-child(1) {
          width: 60px;
        }

        &:nth-child(3) {
          width: 32%;
          border-right: none;
        }

        &:nth-child(2) {
          flex: 1;
        }
      }
    }
  }
}
</style>
