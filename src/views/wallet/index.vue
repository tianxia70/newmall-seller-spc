<template>
  <div>
    <!-- 设置支付密码 -->
    <safe-password-setting
      v-if="showSafewordDialog"
      v-model:visible="showSafewordDialog"
    ></safe-password-setting>

    <!-- 确认弹窗 -->
    <pc-confirm-dialog
      v-if="showConfirmDialog"
      v-model:visible="showConfirmDialog"
      :message="t('实名认证尚未完成')"
      :confirmText="t('查看认证进度')"
      @confirm="navigationTo('/other/shop-setting?cert=1')"
    ></pc-confirm-dialog>

    <!-- 余额宝转入、转出 -->
    <transfer-dialog
      v-model:visible="showTransferDialog"
      :is-in="transferIn"
      :yue-balance="investInfo.balance"
      @done="transferDone"
    ></transfer-dialog>

    <a-row :gutter="20">
      <a-col :xs="24" :sm="24" :md="24" :lg="headerSpanLg" :xl="headerSpan" :xxl="headerSpan">
        <div class="ma-content-block p-4 mb-3 wallet-header-item">
          <div class="icon"><img :src="imgIcon[0]" alt=""></div>
          <div class="flex-1 pl-3">
            <pc-number :data="walletInfo?.rebate || 0" :bold="true" :size="24" />
            <div class="mt-1">{{ t('累计收益') }}</div>
            <div class="item-button text-base">
              {{ t('累计所有订单收益+推广收益') }}
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="headerSpanLg" :xl="headerSpan" :xxl="headerSpan">
        <div class="ma-content-block p-4 mb-3 wallet-header-item">
          <div class="icon"><img :src="imgIcon[2]" alt=""></div>
          <div class="flex-1 pl-3">
            <pc-number :data="walletInfo?.money || 0" :bold="true" :size="24" />
            <div class="mt-1 flex gap-2">
              <p class="pr-2">{{ t('钱包余额') }}</p>
              <template v-if="walletInfo?.frozenMoney" >
                <p>{{ t('冻结金额') }}</p>
                <pc-number :data="walletInfo?.frozenMoney || 0" :danger="true" />
              </template>
            </div>
            
            <div class="item-button">
              <a-button v-if="loanShow" type="outline" status="success" size="small" @click="handleLoan">{{ t('信贷服务') }}</a-button>
              <a-button type="outline" size="small" @click="walletHandle(false)">{{ withdrawTxt }}</a-button>
              <a-button type="primary" size="small" @click="walletHandle(true)">{{ rechargeTxt }}</a-button>
            </div>
          </div>
        </div>
      </a-col>
      <a-col v-if="showYueBao" :xs="24" :sm="24" :md="24" :lg="headerSpanLg" :xl="headerSpan" :xxl="headerSpan">
        <div class="ma-content-block p-4 mb-3 wallet-header-item cursor-pointer" @click.stop="navigationTo('/wallet/yuebao')">
          <div class="icon"><img :src="imgIcon[1]" alt=""></div>
          <div class="flex-1 pl-3">
            <pc-number :data="investInfo?.balance || 0" :bold="true" :size="24" :currency="false" extra="$" />
            <div class="mt-1 flex gap-2">
              <p class="pr-2">{{ t('余额宝') }}</p>
              <p>{{ t('昨日收益') }}</p>
              <pc-number :data="investInfo?.yesterdayProfit || 0" :color="true" :currency="false" extra="$" />
            </div>
            <div class="item-button">
              <a-button type="outline" size="small" @click.stop="openTransferDialog(false)">{{ t('转出') }}</a-button>
              <a-button type="primary" size="small" @click.stop="openTransferDialog(true)">{{ t('转入') }}</a-button>
            </div>
          </div>
          <icon-right />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useSystemStore, useUserStore } from '@/store'
  import { sellerInvestInfo } from '@/api/user'
  import { getToken } from '@/utils/token-util'
  import { TEST_URL } from '@/configs'
  import TransferDialog from './components/transfer-dialog.vue'
  import { Notification } from '@arco-design/web-vue'
  import dayjs from 'dayjs'
  import { navigationTo } from '@/utils'

  const { t, locale } = useI18n()

  const userStore = useUserStore()
  const systemStore = useSystemStore()

  const appName = import.meta.env.VITE_APP

  const showSafewordDialog = ref(false)
  const showConfirmDialog = ref(false)

  const walletInfo = computed(() => userStore.walletInfo)
  const userInfo = computed(() => userStore.userInfo)
  const hasSafeword = computed(() => userInfo.value.safeword)
  const hasCerted = computed(() => userInfo.value.kyc_status === 2)

  const imgIcon = [
    new URL('@/assets/images/wallet/icon01.png', import.meta.url),
    new URL('@/assets/images/wallet/icon02.png', import.meta.url),
    new URL('@/assets/images/wallet/icon03.png', import.meta.url)
  ]

  const showYueBao = computed(() => {
    return ['argos', 'argos2', 'argos4', 'aliExpress-wholesale', 'tiktok2'].includes(appName)
  })

  const loanShow = computed(() => {
    return ['hive', 'kaifeng', 'family-wholesale-group', 'whale'].includes(appName)
  })

  const headerSpan = computed(() => {
    let span = 12
    if (showYueBao.value) {
      span = 8
    }
    return span
  })

  const headerSpanLg = computed(() => {
    let span = 12
    if (showYueBao.value) {
      span = 28
    }
    return span
  })

  const rechargeTxt = computed(() => {
    return ['hive', 'aliExpress-wholesale'].includes(appName) ? t('加值') : t('充值')
  })

  const withdrawTxt = computed(() => {
    return ['hive', 'aliExpress-wholesale'].includes(appName) ? t('提领') : t('提现')
  })

  const investInfo = ref({
    balance: 0,
    totalProfit: 0,
    yesterdayProfit: 0,
    allowTransferOutTime: 0
  })

  const getInvestInfo = () => {
    sellerInvestInfo().then(res => {
      investInfo.value = res
    })
  }

  const handleLoan = () => {
    const { origin, hostname } = window.location
    const url = hostname === 'localhost' ? TEST_URL : origin
    window.open(`${url}/#/credit?token=${getToken()}&lang=${locale.value}`)
  }

  const showTransferDialog = ref(false)
  const transferIn = ref(false)

  const openTransferDialog = (flag) => {
    if (!hasSafeword.value) {
      showSafewordDialog.value = true
      return
    }

    if (!hasCerted.value) {
      showConfirmDialog.value = true
      return
    }

    if (!flag && investInfo.value.allowTransferOutTime) {
      const nowTime = new Date().getTime()
      if (nowTime < investInfo.value.allowTransferOutTime) {
        Notification.warning({
          title: t('提示'),
          content: t('可允许转出', {time: dayjs(new Date(investInfo.value.allowTransferOutTime)).format('YYYY-MM-DD HH:mm:ss')}),
        })
        return
      }
    }

    transferIn.value = flag
    showTransferDialog.value = true
  }

  const transferDone = () => {
    getInvestInfo()
    userStore.getWalletInfo()
  }

  const walletHandle = (flag) => {
    if (!hasSafeword.value) {
      showSafewordDialog.value = true
      return
    }

    if (!hasCerted.value) {
      showConfirmDialog.value = true
      return
    }
    
    if (flag) {
      if (['argos', 'flipkart', 'selfridges', 'harrods', 'targetShop', 'globease', 'tiktok8', 'tiktok9'].includes(appName)) {
        Notification.info({
          title: t('提示'),
          content: t('请联系客服')
        })
        if (systemStore.customer_service_url) {
          window.open(systemStore.customer_service_url)
        } else {
          im_create_iframe_client && im_create_iframe_client.open();
        }
      } else {
        navigationTo('/wallet/recharge')
      }
    } else {
      if (['argos', 'selfridges', 'harrods', 'targetShop', 'globease'].includes(appName)) {
        Notification.info({
          title: t('提示'),
          content: t('请联系客服')
        })
        if (systemStore.customer_service_url) {
          window.open(systemStore.customer_service_url)
        } else {
          im_create_iframe_client && im_create_iframe_client.open();
        }
      } else {
        navigationTo('/wallet/withdraw')
      }
    }
  }

  onMounted(async () => {
    getInvestInfo()
    await userStore.getWalletInfo()
  })
</script>
<style lang="less" scoped>
  .wallet-header-item {
    min-width: 300px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .icon {
      width: 4vw;
      height: 4vw;
      min-width: 60px;
      min-height: 60px;
      background-color: rgb(var(--primary-6));
      border-radius: 50%;
      padding: 16px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .item-button {
      min-height: 30px;
      display: flex;
      align-items: center;
      margin-top: 10px;
      gap: 10px;
      flex-wrap: wrap;
    }
  }
</style>
