<template>
  <div>
    <!-- 确认弹窗 -->
    <pc-confirm-dialog
      v-if="showConfirmDialog"
      v-model:visible="showConfirmDialog"
      :message="t('您还没有通过商家认证，无法参与活动。')"
      :confirmText="t('查看认证进度')"
      @confirm="confirmDone"
    ></pc-confirm-dialog>

    <!-- 设置支付密码 -->
    <safe-password-setting
      v-if="showSafewordDialog"
      v-model:visible="showSafewordDialog"
    ></safe-password-setting>

    <div class="audio-content">
      <audio ref="chatAudioDD">
        <source src="https://imgtest1.s3.amazonaws.com/audio/order.mp3" type="audio/mpeg">
      </audio>

      <audio ref="chatAudioLL">
        <source src="https://imgtest1.s3.amazonaws.com/audio/money.mp3" type="audio/mpeg">
      </audio>
    </div>

    <!-- 签订电子合同 -->
    <pdf-sign-dialog v-if="showSignPdf" v-model:visible="showSignPdf" @done="signDone"></pdf-sign-dialog>

    <!-- 系统弹窗 -->
    <div class="announcement" v-if="noticeText || showUserNotice">
      <div class="announcement-content">
        <a-image :src="announcementContentBg.href" :preview="false" class="announcement-content-bg"/>
        <a-image :src="closeIcon.href" :preview="false" class="announcement-close" @click="closeAnnouncement"/>
        <div class="announcement-title">{{ t('系统公告') }}</div>
        <a-scrollbar style="height: 400px; overflow: auto; padding: 30px 0;">
          <div v-html="noticeText || userNoticeText" class="announcement-text"></div>
        </a-scrollbar>
      </div>
    </div>

    <!-- 新人专享 -->
    <div v-if="bonusData && showBonusDialog" class="registration-bonus">
      <!--  全屏遮罩  -->
      <div class="mask"></div>
      <!--  弹窗内容  -->
      <div class="content">
        <div class="title">
          <div class="small-title">
            <span class="small-title-text">{{ t("Hello ～ first meeting") }}</span>
          </div>
          <div class="big-title">{{ t("Exclusive rewards for newcomers") }}</div>
        </div>
        <div class="content-body">
          <div class="content-body-main">
            <div class="content-body-main-line">
              <div class="content-body-item">
                <span class="dollar">$</span>
                <count-to
                  :startVal="0"
                  :endVal="bonusData?.signBonus"
                  :decimals="2"
                  :duration="1500"
                  ></count-to>
              </div>
              <div class="content-body-text"
                  v-html='t("To activate the gift, you need to recharge <span>${_$1}</span>,and there is still <span>${_$2}</span> left to activate.",
                  {_$1:moneyA,_$2:moneyB})'>
              </div>
            </div>
          </div>
          <a-image :src="bonusA.href" :preview="false" class="image-a" fit="cover"></a-image>
          <a-image :src="bonusB.href" :preview="false" class="image-b" fit="cover"></a-image>
        </div>
        <a-button type="primary" style="width: 100%;height: 46px" @click="intoPay">
          {{ t("Activate now") }}
        </a-button>
        <div class="close" @click="closeActive">
          <icon-close />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue'
  import { CountTo } from 'vue3-count-to'
  import { useSystemStore, useUserStore } from '@/store'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { userWalletGetUsdt } from '@/api/user'
  import { sysconfigGetSysParaSign } from '@/api/system'
  import tool from '@/utils/tool'
  import { navigationTo } from '@/utils'
  import { isTruthy } from '@/utils'
  import pdfSignDialog from './components/pdf-sign-dialog.vue'
  import { Notification } from '@arco-design/web-vue'

  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP
  const route = useRoute()

  const systemStore = useSystemStore()
  const userStore = useUserStore()

  const userNoticeText = computed(() => systemStore.user_notice)
  const showUserNotice = computed(() => systemStore.show_user_notice)
  const getNotieAfter = computed(() => systemStore.get_user_notice_after)
  const orderCount = computed(() => systemStore.order_count)
  const hasMoneyIn = computed(() => systemStore.has_money_in)
  const userInfo = computed(() => userStore.userInfo)

  const signPdfUrl = computed(() => userStore.sellerInfo?.signPdfUrl)

  const announcementContentBg = new URL('@/assets/images/notice/announcement-content-bg.png', import.meta.url)
  const closeIcon = new URL('@/assets/images/notice/close.png', import.meta.url)
  const bonusA = new URL('@/assets/images/notice/bonus-a.png', import.meta.url)
  const bonusB = new URL('@/assets/images/notice/bonus-b.png', import.meta.url)

  const isSys = ref(false)
  const noticeText = ref('')
  const getSystemNoticeHandle = () => {
    systemStore.getSystemNotice().then(res => {
      noticeText.value = res
      isSys.value = Boolean(res)
      if (!isSys.value) {
        systemStore.getUserNotice()
      }
    })
  }

  const closeAnnouncement = () => {
    noticeText.value = ''
    if (isSys.value) {
      systemStore.getUserNotice()
      isSys.value = false
    } else {
      systemStore.closeUserNotice()
      if (!hasShowBonus.value) {
        getWalletInfo()
      }
    }
  }

  // 请求新人专享奖励
  const bonusData = ref(null)
  const hasShowBonus = ref(false)
  const showBonusDialog = ref(false)
  const moneyA = ref(0)
  const moneyB = ref(0)

  const closeActive = () => {
    showBonusDialog.value = false
  }

  const getWalletInfo = () => {
    userWalletGetUsdt().then(res => {
      bonusData.value = res
      if (res?.signBonus && res.sellerSignBonusRatio) {
        showBonusDialog.value = true
        moneyA.value = Number(tool.times(res.signBonus, res.sellerSignBonusRatio)).toFixed(2)
        moneyB.value =  Number(tool.minus(moneyA.value, res.rechargeAmount)).toFixed(2)
        if(moneyB.value < 0) {
          moneyB.value = (0).toFloor(2)
        }

        hasShowBonus.value = true
      } else {
        closeActive()
      }
    })
  }

  const showConfirmDialog = ref(false)
  const confirmDone = () => {
    closeActive()
    const { path } = route
    if (path !== '/other/shop-setting') {
      const href = `/other/shop-setting?cert=1`
      navigationTo(href)
    } else {
      window.dispatchEvent(new Event('triggerShopSettingCert'))
    }
  }

  const showSafewordDialog = ref(false)

  const intoPay = () => {
    const {kyc_status, safeword} = userInfo.value
    if (kyc_status !== 2) {
      showConfirmDialog.value = true
      return
    }

    if (!safeword) {
      showSafewordDialog.value = true
      return
    }

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
      closeActive()
    } else {
      navigationTo('/wallet/recharge')
      closeActive()
    }
  }

  const chatAudioDD = ref()
  const chatAudioLL = ref()
  const userClick = ref(false)
  const audioPlay = () => {
    userClick.value = true
    chatAudioDD.value && (chatAudioDD.value.muted = false);
    chatAudioLL.value && (chatAudioLL.value.muted = false);
    document.removeEventListener("click", audioPlay);
  }

  watch(
    orderCount,
    (val, old) => {
      if (old < val) {
        if (userClick.value && chatAudioDD.value) {
          chatAudioDD.value.play()
        }
      }
    }
  )

  watch(
    hasMoneyIn,
    (val) => {
      if (val) {
        if (userClick.value && chatAudioLL.value) {
          chatAudioLL.value.play()
        }
      }
    }
  )

  watch(
    getNotieAfter,
    (val) => {
      if (val) {
        getWalletInfo()
      }
    }
  )

  const showSignPdf = ref(false)
  const signDone = () => {
    showSignPdf.value = false
    getSystemNoticeHandle()
  }

  onMounted(() => {
    document.addEventListener("click", audioPlay);

    // 订单未处理数量
    systemStore.getOrderCount()

    // 变帐通知
    systemStore.getMoneyNotify()

    if (signPdfUrl.value) {
      getSystemNoticeHandle()
    } else {
      sysconfigGetSysParaSign().then(res => {
        if (isTruthy(res.sellerSign)) { // 强制签订电子合同
          showSignPdf.value = true
        } else {
          getSystemNoticeHandle()
        }
      })
    }
  })
</script>

<style lang="less" scoped>
.audio-content {
  display: none;
}
.announcement {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99999;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .announcement-content {
    width: 500px;
    background-color: #ffffff;
    position: relative;
    border-radius: 12px;

    .announcement-close {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      bottom: -80px;
      width: 50px;
      height: 50px;
      padding: 1px;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;
    }

    .announcement-content-bg {
      position: absolute;
      left: 0;
      top: 0;
    }

    .announcement-title {
      position: relative;
      width: 100%;
      height: 160px;
      color: #FFF;
      font-family: Roboto;
      font-size: 26px;
      font-style: normal;
      font-weight: 900;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      padding: 0 120px 0 32px;
    }

    .announcement-text {
      width: 100%;
      text-align: left;
      padding: 0px 32px 0px 32px;
      color: #333;
      font-family: Roboto;
      font-size: 15px;
      font-weight: 400;
    }
  }
}

.registration-bonus {
  .close {
    position: absolute;
    bottom: -64px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 36px;
    display: flex;
    border-radius: 50%;
    border: solid 1px #ffffff;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    z-index: 1003;
    color: #FFFFFF;
    font-size: 24px;
    cursor: pointer;

    &:hover {
      background-color: #ffffff;
      color: rgb(var(--primary-6));
    }
  }

  .mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1002;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
  }

  .content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2000;
    min-width: 400px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .5);
    padding: 24px;
    box-sizing: border-box;

    .title {
      padding: 0 20px 20px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;

      .small-title {
        display: flex;
        align-items: center;
        justify-content: center;

        .small-title-text {
          font-size: 14px;
          text-align: center;
          font-family: Roboto;
          font-size: 17.287px;
          font-style: normal;
          font-weight: 400;
          margin: auto 12px;
        }


        &::after {
          content: "";
          display: block;
          height: 1px;
          background: linear-gradient(90deg, #DDD 0%, rgba(221, 221, 221, 0.00) 92.16%);
          width: 50px;
        }

        &::before {
          content: "";
          display: block;
          background: linear-gradient(270deg, #DDD 0%, rgba(221, 221, 221, 0.00) 92.16%);
          height: 1px;
          width: 50px;
        }
      }

      .big-title {
        display: flex;
        align-items: center;
        text-align: center;
        margin: 24px auto auto auto;
        color: #333;
        font-family: Roboto;
        font-size: 28px;
        font-style: normal;
        font-weight: 600;
        max-width: 260px;
        line-height: 28px;
      }
    }

    .content-body {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      border-radius: 6px;
      background-color: rgb(var(--primary-6));
      position: relative;
      padding: 8px 10px;
      box-sizing: border-box;
      margin-bottom: 24px;

      .image-a {
        position: absolute;
        top: -38px;
        right: -32px;
        width: 100px;
        height: 100px;
        //  鼠标放上去 缓慢放大
        transition: all .3s ease-in-out;

        &:hover {
          transform: scale(1.2);
        }
      }

      .image-b {
        position: absolute;
        bottom: -12px;
        left: -12px;
        width: 64px;
        height: 64px;
        //  鼠标放上去 缓慢放大
        transition: all .3s ease-in-out;

        &:hover {
          transform: scale(1.2);
        }
      }

      .content-body-main {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        border-radius: 6px;
        background: linear-gradient(180deg, #FFF 0%, rgb(var(--primary-2)) 100%);
        box-shadow: 0px 2px 6px 0px rgba(30, 39, 63, 0.15);
        padding: 4px;
        box-sizing: border-box;
      }

      .content-body-main-line {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        border-radius: 6px;
        min-width: 360px;
        min-height: 120px;
        border: solid 1px #ECEFF4;
      }

      .content-body-item {
        color: rgb(var(--primary-6));
        text-align: right;
        font-family: Roboto;
        font-size: 36px;
        font-style: normal;
        font-weight: 600;
        margin-top: 12px;
        //  鼠标放上去 缓慢放大
        transition: all .3s ease-in-out;
        display: flex;
        align-items: center;
        justify-content: center;
        &:hover {
          transform: scale(1.2);
        }

        .dollar {
          color: rgb(var(--primary-6));
          font-family: Roboto;
          font-style: normal;
          font-weight: 600;
          margin-right: 6px;
        }
      }

      .content-body-text {
        color: #333;
        text-align: center;
        font-family: Roboto;
        font-size: 12px;
        line-height: 16px;
        font-style: normal;
        font-weight: 500;
        width: 300px;
        margin: 12px 0;
      }
    }
  }
}
</style>
