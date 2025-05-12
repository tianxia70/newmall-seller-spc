<template>
  <div class="invite-pop" v-if="visible">
    <div class="invite-pop-content">
      <img :src="invitePopImg.href" class="invite-pop-content-image" alt="">

      <div class="icon-close" @click="handleCancel">
        <icon-close />
      </div>

      <div class="invite-pop-main">
        <div class="invite-pop-title">
          <span v-html='t("邀请好友 <span class=highlight>得现金</span>")' />
          <span 
            class="invite-pop-title-des"
            v-html='t("邀请好友瓜分海量现金")'
          />
        </div>

        <div class="invite-pop-rule">
          <div class="invite-pop-rule-title">
            <img :src="inviteIconImg.href" alt="" style="width: 16px; height: 12px; margin: 0 12px;" >
            <span>{{ t("活动规则") }}</span>
            <img :src="inviteIconImg.href" alt="" style="width: 16px; height: 12px; margin: 0 12px; transform: rotate(180deg)" >
          </div>

          <div class="invite-pop-text mt-4 mb-2">
            {{ t("活动期间，你每成功邀请一个新用户注册并激活店铺都将得到奖金,达到邀请人数之后奖金提升如下：") }}
          </div>

          <div class="invite-table">
            <div class="invite-table-header">
              <div>{{ t("邀请人数") }}</div>
              <div>{{ t("每人奖励") }}</div>
            </div>
            <div 
              class="invite-table-row" 
              v-for="(item, index) in sysparaList" 
              :key="index"
            >
              <div>{{ item.inviteMin }}{{ item.inviteMax ? ' - ' + item.inviteMax : ' +' }}</div>
              <div class="blue">{{ numberStrFormat(item.reward) }}</div>
            </div>
          </div>

          <div class="invite-pop-text mt-2">
            {{ t("邀请越多，奖励越多，先到先得，数量有限！") }}
          </div>

          <div class="invite-pop-text mt-1">
            {{ t("注意：好友开店首次充值金额满足≥ {_$1}", {_$1: numberStrFormat(inviteCondition)}) }}
          </div>
        </div>

        <div class="invite-history">
          <div class="invite-history-title">
            <img :src="inviteIconImg.href" alt="" style="width: 16px; height: 12px; margin: 0 12px;" >
            <span>{{ t("我的邀请记录") }}</span>
            <img :src="inviteIconImg.href" alt="" style="width: 16px; height: 12px; margin: 0 12px; transform: rotate(180deg)" >
          </div>

          <div class="invite-history-content">
            <div class="invite-history-content-item">
              <div class="invite-history-content-number">{{ sellerInfo.inviteNum || 0 }}</div>
              <div class="invite-pop-text">{{ t("成功邀请(人)") }}</div>
            </div>
            <div class="invite-history-content-item">
              <div class="invite-history-content-number">{{ numberStrFormat(sellerInfo.inviteReceivedReward || 0) }}</div>
              <div class="invite-pop-text">{{ t('累计返现({0})', [currencyUnit]) }}</div>
            </div>
          </div>

          <div class="invite-href">
            <div class="invite-href-content">
              <div class="invite-href-text">{{ inviteHref }}</div>
              <a-button type="primary" shape="round" @click="handleCopy">{{ t("复制链接") }}</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { numberStrFormat } from '@/utils'
import { Message } from '@arco-design/web-vue'
import { useUserStore, useCurrencyStore } from '@/store'
import { sellerMyPromotional } from '@/api/user'
import useClipboard from 'vue-clipboard3'

const { t } = useI18n()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  inviteData: {
    type: Array,
    default: () => []
  },
  inviteCondition: {
    type: Number,
    default: 0
  }
})

const emits = defineEmits(['update:visible'])

const handleCancel = () => {
  emits('update:visible', false)
}

const { toClipboard } = useClipboard()

const userStore = useUserStore()
const sellerInfo = computed(() => userStore.sellerInfo)
const currencyStore = useCurrencyStore()
const currencyUnit = computed(() => currencyStore.currencyUnit)

const inviteHref = ref('')

const invitePopImg = new URL('@/assets/images/wallet/invite_pop.png', import.meta.url)
const inviteIconImg = new URL('@/assets/images/wallet/invite_title_icon.png', import.meta.url)

const sysparaList = computed(() => {
  const data = props.inviteData
  const arrData = []
  for (let i = 0; i < data.length; i++) {
    arrData.push({
      reward: data[i][0],
      inviteMin: data[i][1],
      inviteMax: i + 1 < data.length ? ((data[i + 1][1]) - 1) : ''
    })
  }
  return arrData
})

sellerMyPromotional().then(res => {
  inviteHref.value = res.download + '?usercode=' + res.code
})

const handleCopy = async () => {
  try {
    await toClipboard(inviteHref.value)
    Message.success(t('复制成功'))
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="less" scoped>
.invite-pop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9;

  .invite-pop-text {
    color: #333;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, .5);
  }

  .invite-pop-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    overflow: hidden;
    border-radius: 10px;
    z-index: 9;
    width: 476px;
    height: auto;
    flex-shrink: 0;

    .icon-close {
      position: absolute;
      top: 12px;
      right: 12px;
      cursor: pointer;
      z-index: 9;
      border: solid 1px #fff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .invite-pop-content-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 476px;
    }

    .invite-pop-main {
      width: 100%;
      height: 100%;
      padding: 12px;
      box-sizing: border-box;
      position: relative;
      z-index: 1;

      .invite-pop-title {
        display: flex;
        justify-content: center;
        align-items: self-start;
        flex-direction: column;
        color: #FFF;
        font-size: 20px;
        font-weight: 600;
        height: 120px;
        width: 220px;
        position: relative;
        line-height: 26px;
        left: 56px;
        top: 12px;

        .invite-pop-title-des {
          color: #D6EFFF;
          width: 100%;
          font-size: 16px;
          font-weight: 400;
          line-height: 16px;
          margin-top: 5px;
        }
      }

      .invite-pop-rule {
        border-radius: 6px;
        background: #E2EAFF;
        padding: 18px;
        margin-bottom: 12px;
        margin-top: 24px;

        .invite-pop-rule-title {
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1552F0;
        }

        .invite-table {
          border-radius: 6px;
          overflow: hidden;
          margin: 12px 0;

          .invite-table-header {
            background: #C3D4FF;
            display: flex;
            justify-content: space-between;

            > div {
              width: 50%;
              height: 34px;
              line-height: 34px;
              text-align: center;
              color: #000;

              &:first-child {
                border-right: 1px solid #ffffff;
              }
            }
          }

          .invite-table-row {
            background: #F1F5FF;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ffffff;
            height: 35px;
            color: #000;
            font-size: 13px;
            font-style: normal;
            font-weight: 500;

            .blue {
              color: rgb(var(--primary-6));
              font-size: 13px;
              font-style: normal;
              font-weight: 500;
            }

            &:last-child {
              border-bottom: none;
              height: 34px;
            }

            > div {
              width: 50%;
              line-height: 34px;
              text-align: center;

              &:first-child {
                border-right: 1px solid #ffffff;
              }
            }
          }
        }
      }

      .invite-history {
        border-radius: 6px;
        background: #E2EAFF;
        padding: 18px;

        .invite-history-title {
          color: #1552F0;
          font-size: 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .invite-history-content {
          display: flex;
          justify-content: space-between;

          .invite-history-content-item {
            width: 50%;
            text-align: center;
            margin: 12px 0;
            position: relative;

            &:first-child::after {
              content: "";
              position: absolute;
              top: 0;
              right: 0;
              width: 1px;
              height: 26px;
              background: #B0C1ED;
              transform: translateY(50%);
            }

            .invite-history-content-number {
              color: rgb(var(--primary-6));
              font-size: 24px;
              font-style: normal;
              font-weight: 500;
              line-height: normal;
            }
          }
        }

        .invite-href {
          margin-top: 12px;

          .invite-href-content {
            height: 42px;
            border-radius: 6px;
            background: #F1F5FF;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px;

            .invite-href-text {
              color: #000;
              font-size: 12px;
              font-style: normal;
              font-weight: 400;
              line-height: 16px;
              padding-left: 6px;
            }
          }
        }
      }
    }
  }
}

.first-charge {
  margin-bottom: 12px;
  border-radius: 4px;
  overflow: hidden;
  height: 158px;
  width: 100%;
  position: relative;

  .first-charge-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: #fff;
    padding: 12px 50px 12px 12px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .first-charge-text {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      flex: 1;
      width: 100%;
      padding: 0 50px;

      .first-charge-title {
        font-style: normal;
        font-weight: 700;
        font-size: 32px;
        line-height: 38px;
        text-align: center;
        margin-bottom: 18px;
        text-shadow: 1px 1px 1px #888888;

        .yellow {
          color: #FECC1C;
        }
      }

      .first-charge-desc {
        font-style: normal;
        font-weight: 400;
        font-size: 32px;
        line-height: 32px;
        text-shadow: 1px 1px 1px #888888;
        color: #FFFFFF;
        text-align: center;
      }
    }

    .first-charge-btn {
      width: 100%;
      height: 40px;
      text-align: center;
      border-radius: 40px;
      background: #fff;
      color: #ffffff;
      min-width: 150px;
      font-style: normal;
      font-weight: 700;
      font-size: 20px;
      border: none;
      background: linear-gradient(180deg, #FF965B 0%, #CE3925 100%);
    }

    .first-charge-image {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
}
</style>

