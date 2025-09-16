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
      :yue-balance="investInfo.balance || 0"
      @done="transferDone"
    ></transfer-dialog>

    <!-- 邀请好友活动弹窗 -->
    <invite-dialog
      :invite-data="inviteFriends"
      :invite-condition="inviteCondition"
      v-model:visible="showInviteDialog"
    ></invite-dialog>

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
              <a-button type="outline" size="small" @click="walletHandle(false)">{{ diyText ? t('提领') : t('提现') }}</a-button>
              <a-button type="primary" size="small" @click="walletHandle(true)">{{ diyText ? t('加值') : t('充值') }}</a-button>
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

    <a-carousel
      v-if="showINviteBanner || (syspara.length && [0, 1].includes(Number(sellerInfo.rechargeBonusStatus)))"
      class="mb-3"
      :current="carouselCurrent"
      :style="{
        width: '100%',
        height: '160px',
      }"
      :auto-play="{
        interval: 5000
      }"
      indicator-type="dot"
      show-arrow="always"
    >
      <a-carousel-item v-if="showINviteBanner">
        <div class="swiper-item" :style="{'background-image': `url(${inviteBgImg.href})`}" @click.stop="showInviteDialogHandle">
          <h3 v-html="t('邀请好友开店 <span class=highlight>豪礼</span>相送')"></h3>
          <p>{{
            t("累计领取{_$1},可领取{_$2}", {
              _$1: numberStrFormat(sellerInfo.inviteReceivedReward || 0),
              _$2: numberStrFormat(sellerInfo.inviteAmountReward || 0)
            })
          }}</p>
          <div class="btn-content">
            <a-button v-if="Number(sellerInfo.inviteAmountReward) && hasCerted" :loading="inviteRewardLoading" @click.stop="getInviteReward">{{ t('领取') }}</a-button>
            <a-button v-if="!Number(sellerInfo.inviteAmountReward)" @click.stop="showInviteDialogHandle">{{ t('邀请') }}</a-button>
          </div>
        </div>
      </a-carousel-item>
      <a-carousel-item v-if="syspara.length && [0, 1].includes(Number(sellerInfo.rechargeBonusStatus))">
        <div class="swiper-item" :style="{'background-image': `url(${firstChargeBg.href})`}">
          <h3><span class="yellow pr-2">{{ diyText ? t('首次加值') : t('首充') }}</span>{{ t('活动奖励') }}</h3>
          <div class="first-charge-desc">
            <div v-for="(item,index) in syspara" :key="index">
              <div v-html="item.content"></div>
              <div v-html="index !== syspara.length - 1 ? '，' : ''"></div>
            </div>
          </div>
          <div class="btn-content">
            <a-button
              v-if="Number(sellerInfo.rechargeBonusStatus) === 1"
              :loading="receiveBonusLoading"
              @click.stop="getReceiveBonus"
            >{{ t('领取') }}</a-button>
            <a-button
              v-if="Number(sellerInfo.rechargeBonusStatus) === 0"
              @click.stop="walletHandle(true)"
            >{{ t('去充值') }}</a-button>
          </div>
        </div>
      </a-carousel-item>
    </a-carousel>

    <div class="ma-content-block p-4 mb-3">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key="1" :title="diyText ? t('提领') : t('提现')">
          <record-withdraw-list></record-withdraw-list>
        </a-tab-pane>
        <a-tab-pane :key="2" :title="diyText ? t('加值') : t('充值')">
          <record-recharge-list></record-recharge-list>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup name="wallet">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useSystemStore, useUserStore } from '@/store'
  import { sellerInvestInfo, receiveInviteRewards, beforeReceiveBonus, receiveBonus } from '@/api/user'
  import { getToken } from '@/utils/token-util'
  import { TEST_URL } from '@/configs'
  import { Message } from '@arco-design/web-vue'
  import TransferDialog from './components/transfer-dialog.vue'
  import { Notification } from '@arco-design/web-vue'
  import dayjs from 'dayjs'
  import { navigationTo, numberStrFormat } from '@/utils'
  import RecordWithdrawList from './components/record-withdraw-list.vue'
  import RecordRechargeList from './components/record-recharge-list.vue'
  import { sysConfigGetSyspara } from '@/api/system'
  import inviteDialog from './components/invite-dialog.vue'

  const { t, locale } = useI18n()

  const userStore = useUserStore()
  const systemStore = useSystemStore()

  const appName = import.meta.env.VITE_APP

  const showSafewordDialog = ref(false)
  const showConfirmDialog = ref(false)

  const walletInfo = computed(() => userStore.walletInfo)
  const userInfo = computed(() => userStore.userInfo)
  const sellerInfo = computed(() => userStore.sellerInfo)
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

  const showINviteBanner = computed(() => {
    return !['flipkart3'].includes(appName) && inviteFriends.value.length
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

  const diyText = computed(() => {
    return ['hive', 'aliExpress-wholesale'].includes(appName)
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
      if (['flipkart', 'selfridges', 'harrods', 'targetShop', 'globease', 'tiktok8', 'tiktok9'].includes(appName)) {
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
      if (['selfridges', 'harrods', 'targetShop', 'globease'].includes(appName)) {
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

  const inviteBgImg = new URL('@/assets/images/wallet/invite_bg.png', import.meta.url)
  const firstChargeBg = new URL('@/assets/images/wallet/first_charge.png', import.meta.url)

  const syspara = ref([])
  const inviteFriends = ref([])
  const inviteCondition = ref(0)

  const getBannerInfo = () => {
    sysConfigGetSyspara({code: 'mall_first_recharge_rewards,mall_first_invite_recharge_rewards,valid_recharge_amount_for_first_recharge_bonus'}).then(res => {
      syspara.value = res.mall_first_recharge_rewards ? JSON.parse(res.mall_first_recharge_rewards) : []

      syspara.value.forEach(item => {
        item.content = t("存{_$1}赠送{_$2}", {
          _$1: `<span class="yellow">$${item[1]}</span>`,
          _$2: `<span class="yellow">$${item[0]}</span>`
        })
      })

      inviteFriends.value = res.mall_first_invite_recharge_rewards ? JSON.parse(res.mall_first_invite_recharge_rewards) : []

      inviteCondition.value = res.valid_recharge_amount_for_first_recharge_bonus || 0
    })
  }

  const inviteRewardLoading = ref(false)
  const getInviteReward = () => {
    inviteRewardLoading.value = true
    receiveInviteRewards().then(async () => {
      await userStore.getSellerInfo()
      await userStore.getWalletInfo()
      Message.success(t('领取成功'))
      inviteRewardLoading.value = false
    }).catch(() => {
      inviteRewardLoading.value = false
    })
  }

  const showInviteDialog = ref(false)
  const showInviteDialogHandle = () => {
    if (!hasCerted.value) {
      showConfirmDialog.value = true
      return
    }
    
    showInviteDialog.value = true
  }

  const carouselCurrent = ref()
  const receiveBonusLoading = ref(false)

  const getReceiveBonus = () => {
    receiveBonusLoading.value = true
    receiveBonus({
      sellerId: sellerInfo.value.id
    }).then(async () => {
      carouselCurrent.value = 1
      await userStore.getSellerInfo()
      await userStore.getWalletInfo()
      Message.success(t('领取成功'))
      receiveBonusLoading.value = false
    }).catch(() => {
      receiveBonusLoading.value = false
    })
  }

  const activeKey = ref(1)

  const changeActiveKey = (key) => {
    activeKey.value = key
  }

  onMounted(async () => {
    window.addEventListener('rechargeSuccess', () => {
      changeActiveKey(2)
    })
    window.addEventListener('withdrawSuccess', () => {
      changeActiveKey(1)
    })
    
    getInvestInfo()
    getBannerInfo()

    beforeReceiveBonus()
    await userStore.getWalletInfo()
  })

  onUnmounted(() => {
    window.removeEventListener('rechargeSuccess', () => {})
    window.removeEventListener('withdrawSuccess', () => {})
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

  .swiper-item {
    width: 100%;
    height: 160px;
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    > h3 {
      font-family: 'Roboto';
      font-style: normal;
      font-weight: 700;
      font-size: 32px;
      line-height: 38px;
      text-align: center;
      margin-bottom: 18px;
      color: #fff;

      .yellow {
        color: #FFD331;
      }
    }
    > p {
      font-style: normal;
      font-weight: 400;
      font-size: 32px;
      line-height: 32px;
      color: #FFD331;
      text-align: center;
      text-shadow: 1px 0px rgba(0,0,0,.7);
      &.recharge {
        font-weight: normal !important;
        color: #fff;
        .yellow {
          color: #f46903;
          font-weight: bold;
        }
      }
    }

    .first-charge-desc {
      padding: 0 150px;
      font-weight: 400;
      font-size: 28px;
      line-height: 32px;
      color: #FFD331;
      text-align: center;
      text-shadow: 1px 0px rgba(0,0,0,.7);
      font-weight: normal !important;
      color: #fff;
      :deep(.yellow ){
        color: #f46903;
        font-weight: bold;
      }

      div {
        display: inline-block;
      }
    }

    > .btn-content {
      position: absolute;
      right: 50px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 10px;
      .arco-btn {
        min-width: 150px;
        height: 40px;
        text-align: center;
        border-radius: 40px;
        background: #fff;
        color: #1552f0;
        min-width: 150px;
        font-family: 'Roboto';
        font-style: normal;
        font-weight: 700;
        font-size: 20px;
        border: none;
        transition: all 0.3s ease;
        &:hover {
          background: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
</style>
