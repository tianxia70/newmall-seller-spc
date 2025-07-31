<template>
  <div>
    <a-modal
      v-model:visible="dialogVisible"
      :width="700"
      :mask-closable="false"
      :esc-to-close="false"
    >
      <template #title>{{ t(dialogTitle) }}</template>

      <div class="policy-content">
        <iframe v-if="policyUrl && dialogVisible" :src="policyUrl" frameborder="0"></iframe>
      </div>
    </a-modal>
    
    <div class="bottom-block clearfix">
      <div class="item">
        <div class="title" :title="t('店铺概况')">{{ t('店铺概况') }}</div>
        <div class="store-block">
          <div v-for="item in storeDataRef" :key="item.key" class="item">
            <template v-if="item.question">
              <template v-if="item.key === 'rating'">
                <icon-question-circle-fill v-if="showMerchantTerms" class="el-icon-question" @click="showDialogHandle(item.key)" />
              </template>
              <icon-question-circle-fill v-else class="el-icon-question" @click="showDialogHandle(item.key)" />
            </template>
            <div class="icon-box">
              <svg-icon :name="item.icon" class="icon"/>
            </div>
            <div class="info">
              <div class="number">
                <pc-number :data="item.num || 0" :currency="item.money" :decimals="item.money ? 2 : 0" />
              </div>
              <p>{{ t(item.title) }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="title" :title="t('流量概况')">{{ t('流量概况') }}</div>
        <div class="store-block">
          <div v-for="item in visitsData" :key="item.key" class="item">
            <div class="icon-box">
              <svg-icon :name="item.icon" class="icon"/>
            </div>
            <div class="info">
              <div class="number">
                <pc-number :data="item.num || 0" :currency="item.money" :decimals="item.money ? 2 : 0" />
              </div>
              <p :title="t(item.title)">{{ t(item.title) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="today-block clearfix">
      <div v-for="item in todayData" :key="item.key" class="item">
        <svg-icon :name="item.icon" :style="{'color': item.color}" class="icon"/>
        <div class="number" :style="{'color': item.color}">
          <pc-number :data="item.num || 0" :currency="item.money" :decimals="item.money ? 2 : 0" />
        </div>
        <p>{{ t(item.title) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { cloneDeep } from 'lodash-es'

  const appName = import.meta.env.VITE_APP
  const { t, locale } = useI18n()

  const props = defineProps({
    infoData: {
      type: Object,
      default: () => ({})
    }
  })

  const todayData = ref([
    {
      title: '今日订单',
      key: "todayOrder",
      num: 0,
      icon: 'new-order-1',
      money: false,
      color: '#7239ea'
    },
    {
      title: '今日销售额',
      key: "todaySales",
      num: 0,
      icon: 'new-sale',
      money: true,
      color: '#1b84ff'
    },
    {
      title: '预计利润',
      key: "todayProfit",
      num: 0,
      icon: 'new-dishes',
      money: true,
      color: '#17c653'
    }
  ])
  
  const storeData = ref([
    {
      title: '综合评分',
      key: "rating",
      num: 0,
      icon: 'new-score',
      color: '#1b84ff',
      decimalPlaces: 2,
      money: false,
      question: true
    },
    {
      title: '卖家信用分',
      key: "creditScore",
      num: 0,
      icon: 'new-credit-score',
      color: '#1b84ff',
      money: false,
      question: true
    },
    {
      title: '店铺关注',
      key: "focusCount",
      num: 0,
      icon: 'new-focus',
      color: '#1b84ff',
      money: false,
    }
  ])

  const visitsData = ref([
    {
      title: '今日访客数',
      key: "visits1Today",
      num: 0,
      icon: 'new-1day',
      color: '#1b84ff',
      money: false,
    },
    {
      title: '7日访客数',
      key: "visits7Today",
      num: 0,
      icon: 'new-7day',
      color: '#1b84ff',
      money: false,
    },
    {
      title: '30日访客数',
      key: "visits30Today",
      num: 0,
      icon: 'new-30day',
      color: '#1b84ff',
      money: false,
    }
  ])

  const dialogVisible = ref(false)
  const hrefType = ref('rating')

  const storeDataRef = computed(() => {
    const data = cloneDeep(storeData.value)
    if (['tiktok4'].includes(appName)) {
      data.splice(0, 1)
    }
    return data
  })

  const dialogTitle = computed(() => {
    let title = ''
    if (hrefType.value === 'rating') {
      title = '商家条款'
    } else if (hrefType.value === 'creditScore') {
      title = '卖家政策'
    }

    return title ? t(title) : '--'
  })
  
  const policyUrl = computed(() => {
    let pageType = ''
    if (hrefType.value === 'rating') {
      pageType = 'terms'
    } else if (hrefType.value === 'creditScore') {
      pageType = 'policy'
    }
    const { hostname, origin } = window.location
    const originInfo = hostname === 'localhost' ? 'http://www.sjiepc.com' : origin
    const href = `${originInfo}/seller/#/shop/${pageType}?full=1&lang=${locale.value}`
    return pageType ? href : ''
  })

  const showMerchantTerms = computed(() => {
    return ['aimall', 'kohls', 'argos', 'flipkart3'].includes(appName)
  })

  const showDialogHandle = (key) => {
    hrefType.value = key
    dialogVisible.value = true
  }

  watch(() => props.infoData, (newVal) => {
    todayData.value.forEach(item => {
      item.num = newVal[item.key]
    })
    storeData.value.forEach(item => {
      item.num = newVal[item.key]
    })
    visitsData.value.forEach(item => {
      item.num = newVal[item.key]
    })
  }, { deep: true })
</script>

<style lang="less" scoped>
.today-block {
  margin-top: 15px;
  > .item {
    height: 90px;
    width: calc((100% / 3) - 10px);
    background-color: var(--color-bg-2);
    float: left;
    margin-right: 15px;
    border-radius: 8px;
    box-shadow: 0px 0px 20px 0px rgba(76, 87, 125, .02);
    border: 1px solid var(--color-border-1);
    position: relative;
    padding: 15px;
    overflow: hidden;
    &:last-child {
      margin-right: 0;
    }
    .icon {
      position: absolute;
      z-index: 1;
      font-size: 86px;
      right: -20px;
      bottom: -20px;
      opacity: 0.3;
    }
    .number {
      height: 30px;
      display: flex;
      align-items: center;
      position: relative;
      z-index: 2;
      font-size: 22px;
      font-weight: bold;
      transition: all 0.2s ease;
      :deep(.pc-number-wrapper) {
        font-size: 22px !important;
        // color: var(--color-text-1) !important;
      }
    }
    > p {
      position: relative;
      z-index: 2;
      font-weight: 400;
      font-size: 14px;
      line-height: 16px;
      margin-top: 10px;
      color: var(--color-text-2);
    }
  }
}
.bottom-block {
  > .item {
    float: left;
    width: calc(50% - 7.5px);
    height: 250px;
    border-radius: 8px;
    box-shadow: 0px 0px 20px 0px rgba(76, 87, 125, .02);
    border: 1px solid var(--color-border-1);
    background-color: var(--color-bg-2);
    padding: 15px;
    &:nth-child(odd) {
      margin-right: 7.5px;
    }
    &:nth-child(even) {
      margin-left: 7.5px;
    }
    > .title {
      font-size: 16px;
      color: var(--color-text-1);
      margin-bottom: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.store-block {
  > .item {
    display: flex;
    align-items: center;
    margin-top: 20px;
    position: relative;
    > .el-icon-question {
      cursor: pointer;
      color: var(--color-text-4);
      position: absolute;
      top: -5px;
      left: 35px;
      &:hover {
        color: var(--color-text-5);
      }
    }
    > .icon-box {
      width: 45px;
      height: 45px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgb(var(--primary-1));
      .icon {
        font-size: 26px;
        color: rgb(var(--primary-6));
      }
    }
    > .info {
      flex: 1;
      padding-left: 15px;
      overflow: hidden;
      .number {
        height: 28px;
        display: flex;
        position: relative;
        z-index: 2;
        font-size: 20px;
        font-weight: bold;
        transition: all 0.2s ease;
        :deep(.pc-number-wrapper) {
          color: rgb(var(--primary-6)) !important;
          font-weight: bold;
          font-size: 20px !important;
        }
      }
      > p {
        font-weight: 400;
        font-size: 14px;
        color: var(--color-text-2);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.policy-content {
  width: 100%;
  iframe {
    width: 100%;
    height: 600px;
  }
}

@media (max-width: 1550px) {
  .store-block > .item > .info .number {
    :deep(.pc-number-wrapper) {
      font-size: 18px !important;
    }
  }
  .today-block > .item .number {
    :deep(.pc-number-wrapper) {
      font-size: 18px !important;
    }
  }
}
</style>