<template>
  <div>
    <a-spin v-if="showLevel" :loading="pageLoading" :size="32">
      <a-card :title="t('当前等级')" class="mb-5">
        <a-row :gutter="40">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-3">
            <div class="current-level-info">
              <div class="level-icon">
                <img :src="sellerLogoData[currentLevel].href" alt="level-icon">
                <div class="level-name">{{ t("等级{_$1}", {_$1: currentLevel}) }}</div>
              </div>
              <div class="level-info">
                <div class="level-name">{{ t("{_$1}-等级卖家", {_$1: currentLevel}) }}</div>
                <p v-if="showStoreNum">
                  {{ t('当前分店人数：') }}
                  <span>
                    {{ sellerInfo.childNum || 0 }}
                    <template v-if="nextLevelInfo">
                      /{{ nextLevelInfo.popularizeUserCountCnd || 0 }}
                    </template>
                  </span>
                  <template v-if="showTeamNum">
                    {{ t('，当前团队人数：') }}
                    <span>
                      {{ sellerInfo.teamNum || 0 }}
                      <template v-if="currentLevelInfo && currentLevelInfo.teamNum">
                        /{{ currentLevelInfo.teamNum || 0 }}
                      </template>
                    </span>
                  </template>
                </p>
                <p>
                  {{ t("当前运行资金:") }}
                  <pc-number :data="currentFund" :color="true"></pc-number>
                  <template v-if="nextLevelInfo">
                    {{ t(`，距离等级{_$1}还需：`, {_$1: nextLevelInfo.level}) }}
                    <pc-number :data="gapFund" :color="true"></pc-number>
                  </template>
                </p>
                <p class="gap-1">
                  {{ t('当前采购优惠') }}
                  <pc-number :data="currentDiscount" :color="true" :currency="false" suffix="%"></pc-number>
                </p>
              </div>
            </div>
          </a-col>
          <a-col v-if="nextLevelInfo" :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-3">
            <h3 class="progress-title">{{ t('等级进度') }}</h3>
            <template v-if="showTwoProgress">
              <div class="progress-item">
                <div class="progress-wrapper">
                  <p>{{ t('运行资金') }}</p>
                  <div class="flex items-center gap-1">
                    <pc-number :data="currentFund" :color="true"></pc-number>
                    /
                    <pc-number :data="nextFund" :color="true"></pc-number>
                  </div>
                </div>
                <a-progress :percent="fundProgress" />
              </div>
              <div class="progress-item mt-4">
                <div class="progress-wrapper">
                  <p>{{ t('分店数') }}</p>
                  <div class="flex items-center gap-1">
                    <pc-number :data="sellerInfo.childNum || 0" :color="true" :currency="false" :decimals="0"></pc-number>
                    /
                    <pc-number :data="nextLevelInfo.popularizeUserCountCnd || 0" :color="true" :currency="false" :decimals="0"></pc-number>
                  </div>
                </div>
                <a-progress :percent="storeNumProgress" />
              </div>
            </template>
            <template v-else>
              <div v-if="currentLevelInfo && nextLevelInfo" class="level-progress">
                <div class="level-icon">
                  <img :src="sellerLogoData[currentLevelInfo.level].href" alt="level-icon">
                  <p>{{ currentLevelInfo.level }}</p>
                </div>
                <div class="level-progress-line">
                  <div class="flex items-center gap-1">
                    <pc-number :data="currentFund" :color="true"></pc-number>
                    /
                    <pc-number :data="nextFund" :color="true"></pc-number>
                  </div>
                  <a-progress :percent="fundProgress" />
                </div>
                <div class="level-icon">
                  <img :src="sellerLogoData[nextLevelInfo.level].href" alt="level-icon">
                  <p>{{ nextLevelInfo.level }}</p>
                </div>
              </div>
            </template>
          </a-col>
        </a-row>
      </a-card>
    </a-spin>

    <a-spin v-if="showLevelIntro" :loading="pageLoading" :size="32">
      <a-card :title="t('等级介绍')" class="mb-5">
        <div class="level-intro-content">
          <div class="intro-title flex gap-4">
            <h3>{{ t('升级') }}<span>{{ t('销量扶持') }}</span></h3>
            <h3>{{ t('轻松') }}<span>{{ t('月入过万') }}</span></h3>
          </div>
          <p class="title-txt">
            <span v-if="showUpgradeAndInfo">1.</span>
            {{ t('卖家等级介绍') }}
          </p>
          <p class="intro-txt">{{ t('平台为鼓励广大创业者，为创业者提供更大的商业机会，让您与我与我们一同成长，助您在销售中获得更大的成功，创业过程中为您准备了丰厚的升级奖励和销售利润比例提升，无论您是新手还是经验丰富的销售员，我们都鼓励您参与升级计划，并诚挚的邀请您加入我们，实现您的销售梦想！') }}</p>
          <template v-if="showUpgradeAndInfo">
            <p class="title-txt">2.{{ t('会员升级说明') }}</p>
            <p class="intro-txt">
              <b>{{ t('会员升级') }}: </b>
              {{ t('会员升级是通过直属推分店数决会员级别，分店数越高或运行资金满足条件，系统将自动升级。') }}
            </p>
            <p class="intro-txt">
              <b>{{ t('分店人数') }}: </b>
              <p v-html="t('直属下级中，累计充值金额超过{_$1}将视为有效人数', {_$1: `<span>${numberStrFormat(limitRechargeAmount)}</span>`})"></p>
            </p>
            <p class="intro-txt">
              <b>{{ t('团队人数') }}: </b>
              <p v-html="t('所有下级中，累计充值金额超过{_$1}视为有效团队人数', {_$1: `<span>${numberStrFormat(teamRechargeAmount)}</span>`})"></p>
            </p>
            <p class="intro-txt">
              <b>{{ t('销售利润比例') }}: </b>
              {{ t('等级越高，获得销售利润越高') }}
            </p>
            <p class="intro-txt">
              <b>{{ t('平台流量扶持') }}: </b>
              {{ t('系统将优先为您提供一定商品流量曝光，创造更多的销售机会') }}
            </p>
            <p v-if="showUpgradeGift" class="intro-txt">
              <b>{{ t('升级礼金') }}: </b>
              {{ t('每升级成功，系统将自动发放升级礼金') }}
            </p>

            <p class="title-txt">3.{{ t('成长规则') }}</p>
            <p class="intro-txt">{{ t('会员等级从升级那一刻开始计算，等级身份将终生有效；') }}</p>
          </template>
        </div>
      </a-card>
    </a-spin>

    <level-card-intro
      v-if="levelList.length && !pageLoading"
      :level-list="levelList"
      :can-buy="isBuySellerLevel"
      :seller-info="sellerInfo"
      :show-store-num="showStoreNum"
      :show-team-num="showTeamNum"
      :show-level-intro="showLevelIntro"
      :show-upgrade-and-info="showUpgradeAndInfo"
      :show-upgrade-gift="showUpgradeGift"
      @refresh="refreshHandle"
    />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/store'
  import { sysConfigGetSyspara } from '@/api/system'
  import { sellerListMallLevel } from '@/api/seller'
  import { sellerLogoData } from '@/configs'
  import tool from '@/utils/tool'
  import { numberStrFormat } from '@/utils'
  import LevelCardIntro from './components/level-card-intro.vue'

  const appName = import.meta.env.VITE_APP

  const { t } = useI18n()
  const userStore = useUserStore()

  // 店铺等级显示与否
  const showLevel = computed(() => {
    return !['targetShop'].includes(appName);
  })

  // 显示两个进度条
  const showTwoProgress = computed(() => {
    return ['tiktok2'].includes(appName)
  })

  // 显示分店人数
  const showStoreNum = computed(() => !['penguin', 'harrods', 'tiktok9'].includes(appName))

  // 显示团队人数
  const showTeamNum = computed(() => !['penguin'].includes(appName))

  // 显示等级介绍
  const showLevelIntro = computed(() => {
    return !['kaifeng'].includes(appName)
  })
  
  // 显示升级和信息
  const showUpgradeAndInfo = computed(() => {
    return !['penguin'].includes(appName)
  })

  // 显示升级礼金
  const showUpgradeGift = computed(() => {
    return !['inchoi', 'whale'].includes(appName)
  })

  const sellerInfo = computed(() => userStore.sellerInfo)
  const currentLevel = computed(() => sellerInfo.value.mallLevel || 'D')
  const currentLevelInfo = computed(() => {
    const currentIndex = levelList.value.findIndex(item => item.level === currentLevel.value)
    if (currentIndex === -1) {
      return null
    }
    return levelList.value[currentIndex]
  })

  const nextLevelInfo = computed(() => {
    const currentIndex = levelList.value.findIndex(item => item.level === currentLevel.value)
    if (currentIndex === -1) {
      return levelList.value[0]
    }
    return levelList.value[currentIndex + 1] ? levelList.value[currentIndex + 1] : null
  })

  const currentFund = computed(() => {
    const storeMoneyRechargeAcc = sellerInfo.value.storeMoneyRechargeAcc || 0
    const moneyWithdrawAcc = sellerInfo.value.moneyWithdrawAcc || 0
    const num = tool.minus(storeMoneyRechargeAcc, moneyWithdrawAcc)
    return Number(Number(num).toFixed(2))
  })

  const nextFund = computed(() => {
    if (nextLevelInfo.value) {
      const rechargeAmountCnd = nextLevelInfo.value.rechargeAmountCnd || 0
      return rechargeAmountCnd
    }
    return 0
  })

  const gapFund = computed(() => {
    if (nextLevelInfo.value) {
      const num = tool.minus(nextFund.value, currentFund.value)
      return Number(Number(num).toFixed(2))
    }
    return 0
  })

  const currentDiscount = computed(() => {
    if (currentLevelInfo.value) {
      const sellerDiscount = currentLevelInfo.value.sellerDiscount || 0
      const num = tool.times(sellerDiscount, 100)
      return Number(Number(num).toFixed(2))
    }
    return 0
  })

  const fundProgress = computed(() => {
    if (currentLevelInfo.value && nextLevelInfo.value) {
      const rechargeAmountCnd = nextLevelInfo.value.rechargeAmountCnd || 0
      if (rechargeAmountCnd) {
        const num = tool.div(currentFund.value, rechargeAmountCnd)
        return Number(Number(num).toFixed(2))
      }
      return 0
    }
    return 0
  })

  const storeNumProgress = computed(() => {
    if (currentLevelInfo.value && nextLevelInfo.value) {
      const num = tool.div(sellerInfo.value.childNum || 0, nextLevelInfo.value.popularizeUserCountCnd || 0)
      return Number(Number(num).toFixed(2))
    }
    return 0
  })

  const pageLoading = ref(false)

  const levelList = ref([])
  const getSellerLevelList = () => {
    sellerListMallLevel().then(res => {
      levelList.value = res.result
      levelList.value.forEach(item => {
        item.loading = false
      })
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
    })
  }

  const limitRechargeAmount = ref(0)
  const teamRechargeAmount = ref(0)
  const isBuySellerLevel = ref(false)

  const refreshHandle = async () => {
    pageLoading.value = true
    await getSellerLevelList()
    await userStore.getSellerInfo()
    pageLoading.value = false
  }

  onMounted(async() => {
    pageLoading.value = true
    sysConfigGetSyspara({
      code: 'valid_recharge_amount_for_seller_upgrade,valid_recharge_amount_for_team_num,level_is_support_purchase'
    }).then(res => {
      limitRechargeAmount.value = res.valid_recharge_amount_for_seller_upgrade || 0
      teamRechargeAmount.value = res.valid_recharge_amount_for_team_num || 0
      isBuySellerLevel.value = Number(res.level_is_support_purchase) === 1
      getSellerLevelList()
    }).catch(() => {
      pageLoading.value = false
    })

    await userStore.getSellerInfo()
  })
</script>

<style lang="less" scoped>
.current-level-info {
  display: flex;
  align-items: center;
  > .level-icon {
    position: relative;
    width: 90px;
    height: 90px;
    > img {
      width: auto;
      height: 100%;
    }
    > .level-name {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20px;
      line-height: 20px;
      text-align: center;
      font-size: 12px;
      color: #fff;
      border-radius: 20px;
      background: linear-gradient(180deg, rgb(var(--primary-4)) 0%, rgb(var(--primary-6)) 100%);
      text-align: center;
    }
  }
  > .level-info {
    flex: 1;
    margin-left: 25px;
    > .level-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      color: var(--color-text-1);
    }
    > p {
      color: var(--color-text-2);
      font-size: 12px;
      display: flex;
      align-items: center;
      margin-top: 2px;
      flex-wrap: wrap;
      line-height: 18px;
      > span {
        color: rgb(var(--primary-6));
      }
    }
    :deep(.pc-number-wrapper) {
      font-size: 12px !important;
    }
  }
}

.level-progress {
  display: flex;
  align-items: center;
  margin-top: 20px;
  :deep(.pc-number-wrapper) {
    font-size: 12px !important;
  }
  > .level-icon {
    position: relative;
    width: 40px;
    height: 40px;
    > img {
      width: auto;
      height: 100%;
    }
    > p {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: #fff;
      text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
    }
  }
  > .level-progress-line {
    flex: 1;
    padding: 0 20px;
    :deep(.arco-progress-line) {
      height: 6px !important;
    }
  }
}

.progress-item {
  .progress-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    > p {
      font-size: 12px;
      color: var(--color-text-1);
    }
  }
  :deep(.arco-progress-line) {
    height: 6px !important;
  }
  :deep(.pc-number-wrapper) {
    font-size: 12px !important;
  }
}

.progress-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--color-text-1);
}

.level-intro-content {
  line-height: 1.5;
  .intro-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    color: var(--color-text-1);
    > h3 {
      > span {
        color: rgb(var(--primary-6));
        padding-left: 4px;
      }
    }
  }
  .title-txt {
    font-size: 14px;
    font-weight: bold;
    margin-top: 15px;
    color: var(--color-text-1);
  }
  .intro-txt {
    font-size: 13px;
    margin-top: 5px;
    color: var(--color-text-2);
    > p {
      display: inline;
      :deep(span) {
        color: rgb(var(--primary-6));
        font-weight: bold;
        padding: 0 2px;
      }
    }
  }
}
</style>
