<template>
  <div>
    <div class="audio-content">
      <audio ref="notifyAudio">
        <source src="https://imgtest1.s3.amazonaws.com/audio/notify.mp3" type="audio/mpeg">
      </audio>
    </div>

    <a-dropdown
      :popup-max-height="450"
      :hide-on-select="false"
    >
      <div class="message-badge">
        <a-badge :count="messageCount" :offset="[10, 0]">
          <i class="iconfont">&#xe634;</i>
        </a-badge>
      </div>

      <template #content>
        <div v-if="tableData.length" class="clear-all">
          <a-link class="flex gap-1" :loading="clearAllLoading" @click="clearAllHandle">
            <i v-if="!clearAllLoading" class="iconfont">&#xe71c;</i>
            {{ t('全部已读') }}
          </a-link>
        </div>
        <a-scrollbar
          style="height:400px; overflow: auto;"
          @scroll="scrollHandle"
        >
          <div v-if="tableData.length" class="message-list-content">
            <a-doption v-for="item in tableData" :key="item.id" @click.stop="messageHandle(item)">
              <div class="message-item">
                <div class="message-title" :class="{'active': item.status !== 2}">{{ item.title }}</div>
                <p class="message-content">{{ item.content }}</p>
                <p class="message-time">{{ item.sendTime }}</p>
              </div>
            </a-doption>
          </div>
          <div v-else class="message-list-content no-data"><a-empty /></div>

          <pc-more-loading v-if="tableData.length" :has-more="hasMore" :loading="tableLoading"></pc-more-loading>
        </a-scrollbar>
      </template>
    </a-dropdown>
  </div>
  
</template>

<script setup>
  import { ref, reactive, computed, onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useSystemStore } from '@/store'
  import { notificationPagelistMessage, notificationRead, notificationReadAll } from '@/api/system'

  const appName = import.meta.env.VITE_APP

  const { t } = useI18n()
  const systemStore = useSystemStore()
  const messageCount = computed(() => systemStore.message_count)

  const tableLoading = ref(false)
  const tableData = ref([])
  const hasMore = ref(true)
  const pageInfo = reactive({
    pageNum: 1,
    pageSize: 10,
    totalElements: -1
  })
  const totalNum = ref(0)

  const getElementsI18n = (list) => {
    list.forEach(item => {
      // i18n支持通配符
      let varInfo = JSON.parse(item.varInfo)
      let varObj = {}
      varInfo.forEach((item, index) => {
        varObj[item.code] = item.value

        if (item.code === 'complaintReason') {
          varObj[item.code] = t(item.value)
        }

        if (['amount', 'orderAmount'].includes(item.code)) {
          varObj[item.code] = item.value + ' USDT '
        }
      })

      switch (item.bizType) {
        case 'inbox_finish_order':
          item.title = 'One order finished'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_freeze_seller_money':
          item.title = 'Freeze seller because of violation'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_new_order_submitted':
          item.title = 'New Order'
          item.content = t('新订单内容')
          item.title = t(item.title)
          break;
        case 'inbox_order_shipped_overtime':
          item.title = 'Order overtime'
          item.content = t(item.content)
          item.title = t(item.title)
          break;
        case 'inbox_reply_buyer_im':
          item.title = 'Buyer Consult from Customer Service'
          item.content = t(item.content)
          item.title = t(item.title)
          break;
        case 'inbox_seller_credit_updated':
          item.title = 'Your Seller-Credit updated'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_unfreeze_seller_money':
          item.title = 'UnFreeze seller'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_withdraw_success':
          item.title = 'Withdraw Success Notify'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_recharge_success':
          item.title = 'Recharge Pass Notify'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_store_audit_success':
          item.title = 'Store certification passed'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_store_audit_fail':
          item.title = 'Store authentication failed'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_order_purchased_overtime':
          item.title = 'Order purchase overtime'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_store_compliant_success':
          item.title = 'Store complaint notification'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_bonus_success':
          item.title = 'Bonus Notification'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_recharge_audit_fail':
          item.title = 'Deposit failure notification'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_withdrawal_audit_fail':
          item.title = 'Withdrawal failure notification'
          item.content = t(item.title + ' content', varObj)
          item.title = t(item.title)
          break;
        case 'inbox_notify_shop_open':
          item.title = t('开店通知')
          item.content = t('店铺{shopName}已开店', varObj)
          break;
          case 'inbox_notify_shop_closed':
          item.title = t('闭店通知')
          item.content = t('店铺{shopName}已闭店', varObj)
          break;
      }

      // 订单采购超时提醒、通知
      if (item.bizType === 'inbox_notify_order_purchas') {
        item.title = t('订单逾期未采购提醒')
        item.content = t('订单逾期未采购提醒内容', varObj)
      }

      if (item.bizType === 'inbox_warn_order_purchas') {
        item.title = t('订单逾期未采购通知')
        item.content = t('订单逾期未采购通知内容', varObj)
      }

      if (['aliExpress-wholesale'].includes(appName)) {
        if (item.bizType === 'inbox_bonus_success') {
          item.title = t('充值通知')
          item.content = t('充值通知内容', varObj)
        }
      }
    })
    return list
  }

  const getListData = () => {
    if (tableLoading.value || !hasMore.value) { return }

    tableLoading.value = true
    const params = {
      ...pageInfo,
      type: 3,
      status: 0,
      module: 1,
      clientRoleType: 'seller'
    }

    notificationPagelistMessage(params).then(res => {
      const {list, total} = res

      const resData = list || []
      const data = getElementsI18n(resData)
      totalNum.value = total || 0
      tableData.value = pageInfo.pageNum === 1 ? data : [...tableData.value, ...data]

      pageInfo.pageNum += 1
      hasMore.value = total > tableData.value.length

      tableLoading.value = false
    }).catch(() => {
      tableLoading.value = false
    })
  }

  const scrollHandle = (event) => {
    const el = event.target;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;

    // 距离底部距离
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceToBottom <= 10) {
      getListData()
    }
  }

  const messageHandle = (data) => {
    notificationRead({
      ids: data.id
    }).then(() => {
      data.status = 2

      systemStore.getMessageCount()
    })
  }

  const clearAllLoading = ref(false)
  const clearAllHandle = () => {
    clearAllLoading.value = true

    notificationReadAll().then(() => {
      systemStore.getMessageCount()

      tableData.value.forEach(item => item.status = 2)
      clearAllLoading.value = false
    }).catch(() => {
      clearAllLoading.value = false
    })
  }

  watch(
    messageCount,
    (val, old) => {
      if (old < val) {
        if (userClick.value && notifyAudio.value) {
          notifyAudio.value.play()
        }
      }
    }
  )

  const notifyAudio = ref()
  const userClick = ref(false)
  const audioPlay = () => {
    userClick.value = true
    notifyAudio.value && (notifyAudio.value.muted = false);
    document.removeEventListener("click", audioPlay);
  }

  onMounted(() => {
    document.addEventListener("click", audioPlay);

    systemStore.getMessageCount()

    getListData()
  })
</script>

<style lang="less" scoped>
  .message-badge {
    margin: 0 5px;
    cursor: pointer;
    color: rgb(var(--primary-6));
    .iconfont {
      font-size: 18px;
    }
    :deep(.arco-badge-number) {
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-weight: normal;
      font-size: 11px;
      line-height: 16px;
    }
  }

  .message-list-content {
    width: 320px;
    min-height: 400px;
    padding: 15px;
    padding-top: 5px;
    &.no-data {
      padding-top: 30px;
    }
    :deep(.arco-dropdown-option-content) {
      text-overflow: inherit;
      white-space: normal;
    }
    .message-item {
      line-height: 1.5;
      padding: 10px 0;
      .message-title {
        font-size: 14px;
        color: var(--color-text-1);
        display: flex;
        justify-content: flex-start;
        align-items: center;
        position: relative;

        &.active {
          text-indent: 15px;

          &::before {
            display: inline-block;
            width: 8px;
            height: 8px;
            content: '';
            background-color: rgb(var(--danger-6));
            border-radius: 8px;
            position: absolute;
            top: 8px;
          }
        }
      }

      .message-content {
        font-size: 12px;
        color: var(--color-text-2);
        margin-top: 8px;
      }

      .message-time {
        font-size: 12px;
        color: var(--color-text-3);
        margin-top: 5px;
      }
    }
  }

  .clear-all {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 15px;
    padding-bottom: 5px;
    .iconfont {
      font-size: 14px;
    }
  }

  .audio-content {
    display: none;
  }
</style>
