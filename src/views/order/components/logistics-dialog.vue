<template>
  <a-modal
    :visible="visible"
    :width="560"
    :mask-closable="false"
    :esc-to-close="false"
    :on-before-cancel="handleCancel"
    :on-ok="handleCancel"
  >
    <template #title>{{ t('物流信息') }}</template>

    <a-spin :loading="logisticsLoading" :size="32">
      <div class="logistics-content">
        <div v-for="item in logisticsData" :key="item.id" class="logistics-item">
          <p class="time">{{ item.updateTime || item.createTimeStr }}</p>
          <p class="info">{{ $t('订单') }}<span class="main-color"> {{ item.orderId }} </span>{{ t(item.tipsTxt) }}
          </p>
        </div>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { orderListOrderLog } from '@/api/order'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  dataInfo: {
    type: Object,
    default: () => {}
  }
})

const emits = defineEmits(['update:visible'])

const handleCancel = () => {
  emits('update:visible', false)
}

const logisticsLoading = ref(false)
const logisticsData = ref([])

const getLogisticsInfo = () => {
  logisticsLoading.value = true
  orderListOrderLog({
    orderId: props.dataInfo.id
  }).then(res => {
    const data = res.map(item => {
      const arr = item.log.split(item.orderId)
      return {
        ...item,
        tipsTxt: arr[1]
      }
    }).reverse()

    logisticsData.value = data
    logisticsLoading.value = false
  }).catch(() => {
    logisticsLoading.value = false
  })
}

watch(() => props.visible, (val) => {
  if (val) {
    getLogisticsInfo()
  } else {
    logisticsLoading.value = false
    logisticsData.value = []
  }
})
</script>

<style lang="less" scoped>
.logistics-content {
  min-height: 200px;
  .logistics-item {
    padding: 10px 0;
    border-bottom: 1px solid var(--color-border-1);

    .time {
      color: var(--color-text-2);
      font-size: 12px;
      margin-bottom: 5px;
    }

    .info {
      font-size: 14px;
      color: var(--color-text-1);
    }
  }
}
</style>