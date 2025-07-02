<template>
  <a-card :title="t('卖家等级')">
    <!-- 密码输入弹窗 -->
    <safe-password-input v-model:visible="showSafePassword" @confirm="submitRequest" />

    <a-row :gutter="25">
      <a-col v-for="item in levelList" :key="item.id" :span="8" class="level-card-item-col">
        <div :class="`level-card-item ${item.level}`">
          <div class="header-content">
            <div class="level-name-content">
              <div class="level-name">
                {{ t('{_$1} - 等级卖家', {_$1: item.level}) }}
                <a-tag v-if="sellerInfo.mallLevel === item.level" size="small" color="green" bordered>
                  {{ t('当前等级') }}
                </a-tag>
              </div>
              <p v-if="showInfoTxt">
                {{ t('累计充值{0},升级店铺{1},利润比例{2}，免费赠送{3}流量', [
                  `${numberStrFormat(item.rechargeAmountCnd)}`,
                  item.level,
                  `${percentageFormat(item.profitRationMin)}% - ${percentageFormat(item.profitRationMax)}%`,
                  `${item.flow || 0}`
                ]) }}
              </p>
              <template v-else>
                <div class="info-txt">
                  <span>{{ t('运行资金') }}</span>
                  <pc-number :data="item?.rechargeAmountCnd || 0" :color="true"></pc-number>
                </div>
                <div v-if="showStoreNum && showUpgradeAndInfo" class="info-txt">
                  <span>{{ t('分店数') }}</span>
                  <pc-number :data="item?.popularizeUserCountCnd || 0" :color="true" :currency="false" :decimals="0"></pc-number>
                </div>
                <div v-if="showTeamNum && showUpgradeAndInfo && Number(item.teamNum)" class="info-txt">
                  <span>{{ t('团队人数') }}</span>
                  <pc-number :data="item?.teamNum || 0" :color="true" :currency="false" :decimals="0"></pc-number>
                </div>
              </template>
            </div>
            <img :src="sellerLogoData[item.level]" alt="">
          </div>
          <div class="level-detail-content">
            <div v-if="!showInfoTxt" class="item">
              <div class="name-content"><i class="iconfont">&#xe745;</i><span>{{ t('销售利润比') }}</span></div>
              <div class="value-content">
                <pc-number :data="percentageFormat(item?.profitRationMin || 0)" :color="true" :currency="false" :decimals="2" suffix="%"></pc-number>
                <span>~</span>
                <pc-number :data="percentageFormat(item?.profitRationMax || 0)" :color="true" :currency="false" :decimals="2" suffix="%"></pc-number>
              </div>
            </div>
            <div class="item">
              <div class="name-content"><i class="iconfont">&#xe783;</i><span>{{ t('平台流量扶持量（每日）') }}</span></div>
              <div class="value-content">{{ item.promoteViewDaily || 0 }}</div>
            </div>
            <div class="item">
              <div class="name-content"><i class="iconfont">&#xe746;</i><span>{{ t('全球到货时间') }}</span></div>
              <div class="value-content">{{ item.deliveryDays || 0 }}</div>
            </div>
            <div v-if="showSellerDiscount" class="item">
              <div class="name-content"><i class="iconfont">&#xe786;</i><span>{{ t('采购优惠') }}</span></div>
              <div class="value-content">
                <pc-number :data="percentageFormat(item?.sellerDiscount || 0)" :color="true" :currency="false" :decimals="2" suffix="%"></pc-number>
              </div>
            </div>
            <div v-if="showUpgradeAward" class="item">
              <div class="name-content"><i class="iconfont">&#xe78a;</i><span>{{ t('升级礼金') }}</span></div>
              <div class="value-content">
                <pc-number v-if="Number(item?.upgradeCash)" :data="item?.upgradeCash || 0" :color="true"></pc-number>
                <i v-else class="iconfont error">&#xe787;</i>
              </div>
            </div>
            <div v-if="Number(item.goodsNum)" class="item">
              <div class="name-content"><i class="iconfont">&#xe744;</i><span>{{ t('可售商品数量') }}</span></div>
              <div class="value-content">{{ item.goodsNum || 0 }}</div>
            </div>
            <div class="item">
              <div class="name-content"><i class="iconfont">&#xe788;</i><span>{{ t('专属服务') }}</span></div>
              <div class="value-content">
                <i v-if="item.hasExclusiveService" class="iconfont success">&#xe785;</i>
                <i v-else class="iconfont error">&#xe787;</i>
              </div>
            </div>
            <div v-if="showRecommend" class="item">
              <div class="name-content"><i class="iconfont">&#xe784;</i><span>{{ t('首页推荐') }}</span></div>
              <div class="value-content">
                <i v-if="item.recommendAtFirstPage" class="iconfont success">&#xe785;</i>
                <i v-else class="iconfont error">&#xe787;</i>
              </div>
            </div>
            <div class="item">
              <div class="name-content"><i class="iconfont">&#xe6bd;</i><span>{{ t('成为供货商') }}</span></div>
              <div class="value-content">
                <i v-if="item.isSupplier" class="iconfont success">&#xe785;</i>
                <i v-else class="iconfont error">&#xe787;</i>
              </div>
            </div>
            <div v-if="canBuy" class="item mt-5">
              <div class="name-content sale-price">
                <pc-number :data="item.price" :color="true"></pc-number>
                <p>{{ t('等级售价') }}</p>
              </div>
              <div v-if="levelIndex[sellerInfo.mallLevel] < levelIndex[item.level]" class="value-content">
                <a-button type="primary" size="small" :loading="item.loading" @click="handleBuyLevel(item)">{{ t('购买等级') }}</a-button>
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { sellerLogoData } from '@/configs'
  import { numberStrFormat } from '@/utils'
  import { Message } from '@arco-design/web-vue'
  import tool from '@/utils/tool'
  import { sellerBuyLevel } from '@/api/seller'

  const appName = import.meta.env.VITE_APP
  const { t } = useI18n()

  const emits = defineEmits(['refresh'])

  const props = defineProps({
    levelList: {
      type: Array,
      default: () => []
    },
    canBuy: {
      type: Boolean,
      default: false
    },
    sellerInfo: {
      type: Object,
      default: () => {}
    },
    showStoreNum: {
      type: Boolean,
      default: false
    },
    showTeamNum: {
      type: Boolean,
      default: false
    },
    showLevelIntro: {
      type: Boolean,
      default: false
    },
    showUpgradeAndInfo: {
      type: Boolean,
      default: false
    },
    showUpgradeGift: {
      type: Boolean,
      default: false
    }
  })

  const levelIndex = {
    'O': 0,
    'C': 1,
    'B': 2,
    'A': 3,
    'S': 4,
    'SS': 5,
    'SSS': 6
  }

  const percentageFormat = (value) => {
    return Number(Number(tool.times((value || 0), 100)).toFixed(2))
  }

  const showInfoTxt = computed(() => {
    return ['tiktok7'].includes(appName)
  })

  const showRecommend = computed(() => {
    return !['cuttingEdge'].includes(appName)
  })

  const showUpgradeAward = computed(() => {
    return !['inchoi', 'tiktok8', 'whale'].includes(appName)
  })

  const showSellerDiscount = computed(() => {
    return !['tiktok9'].includes(appName)
  })

  const currentData = ref()
  const showSafePassword = ref(false)
  const submitRequest = (safeword) => {
    currentData.value.loading = true

    sellerBuyLevel({
      level: currentData.value.level,
      safeword
    }).then(() => {
      Message.success(t('购买成功'))
      currentData.value.loading = false
      emits('refresh')
    }).catch(() => {
      currentData.value.loading = false
    })
  }

  const handleBuyLevel = (item) => {
    currentData.value = item
    showSafePassword.value = true
  }
</script>

<style lang="less" scoped>
.level-card-item-col {
  margin-top: 25px;
  &:nth-child(-n+3) {
    margin-top: 0;
  }
}
.level-card-item {
  border-radius: 10px;
  padding: 20px;
  :deep(.pc-number-wrapper) {
    font-size: 12px !important;
    font-weight: bold !important;
  }
  &.C {
    .header-content::after {
      background: #D6F0F5;
    }

    background: linear-gradient(180deg, #F2FDFF 0%, #E9FAFF 100%);
  }

  &.B {
    .header-content::after {
      background: #E9EFA2;
    }

    background: linear-gradient(180deg, #FFFEF1 0%, #FBFFE0 100%);
  }

  &.A {
    .header-content::after {
      background: #EBD0F9;
    }

    background: linear-gradient(180deg, #F9EEFF 0%, #F3DFFF 100%);
  }

  &.O {
    .header-content::after {
      background: #EBD0F9;
    }

    background: linear-gradient(180deg, #F2F2FF 0%, #E9E9FF 100%);
  }

  &.S {
    .header-content::after {
      background: #FBE6E2;
    }

    background: linear-gradient(180deg, #FFF4F0 0%, #FFE5D9 100%);
  }

  &.SS {
    .header-content::after {
      background: #F9D2CB;
    }

    background: linear-gradient(180deg, #FFF5F1 0%, #FFD6D6 49.48%, #FFC5AB 100%);
  }

  &.SSS {
    .header-content::after {
      background: #EBD0F9;
    }

    background: linear-gradient(180deg, #FAE1FF 0%, #FAD7FF 49.48%, #F5B1FF 100%);
  }
  .header-content {
    position: relative;
    margin-bottom: 18px;
    padding-bottom: 18px;
    display: flex;
    justify-content: space-between;
    line-height: 1.5;
    &::after {
      content: '';
      display: block;
      width: 100%;
      height: 1px;
      position: absolute;
      bottom: 0;
    }
    .level-name-content {
      flex: 1;
      padding-right: 10px;
      .level-name {
        font-size: 15px;
        font-weight: bold;
        color: #000;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      > p {
        font-size: 12px;
        color: #666;
      }
      .info-txt {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
        font-size: 12px;
        color: #000;
      }
    }
    > img {
      width: auto;
      height: 70px;
    }
  }
}

.level-detail-content {
  .item {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    > .name-content {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: #000;
      .iconfont {
        font-size: 16px;
      }
      &.sale-price {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        :deep(.pc-number-wrapper) {
          font-size: 14px !important;
        }
      }
    }
    > .value-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      font-size: 12px;
      color: #000;
      span {
        color: rgb(var(--primary-6));
        padding: 0 2px;
      }
      .iconfont {
        &.error {
          color: rgb(var(--danger-6));
        }
        &.success {
          color: rgb(var(--success-6));
        }
      }
    }
  }
}
</style>