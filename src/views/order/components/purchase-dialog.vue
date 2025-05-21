<template>
  <div>
    <!-- 密码输入弹窗 -->
    <safe-password-input v-model:visible="showSafePassword" @confirm="submitRequest" />

    <a-modal
      :visible="visible"
      :width="860"
      :mask-closable="false"
      :esc-to-close="false"
      :footer="false"
      :on-before-cancel="handleCancel"
    >
      <template #title>{{ t('采购确定') }}</template>

      <a-spin :loading="orderInfoLoading" :size="32">
        <a-card :title="t('采购')">
          <div class="flex items-center justify-between">
            <div>{{ t('买家付款') }}</div>
            <div class="flex-1 pl-2 flex justify-end">
              <pc-number :data="orderInfoData?.prizeReal || 0" />
            </div>
          </div>
          <div class="flex items-center justify-between mt-4">
            <div>{{ t('采购金额') }}</div>
            <div class="flex-1 pl-2 flex justify-end flex-col items-end">
              <pc-number :data="orderInfoData?.systemPrice || 0" />
              <div v-if="orderInfoData?.sellerDiscount" class="flex items-center text-xs mt-1">
                <span>{{ t('采购优惠') }}</span>
                <p class="main-color">{{ orderInfoData?.sellerDiscount ? `${(Number(orderInfoData?.sellerDiscount) * 100).toFixed(2)}%` : '0%' }}</p>,
                <span>{{ t('优惠价') }}</span>
                <pc-number :data="orderInfoData.systemDiscountPrice || 0" :color="true" />
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between mt-4">
            <div>{{ t('采购数量') }}</div>
            <div class="flex-1 pl-2 flex justify-end">
              <pc-number :data="orderInfoData?.goodsCount || 0" :currency="false" :decimals="0" />
            </div>
          </div>
          <div class="flex items-center justify-between mt-4">
            <div>{{ t('利润') }}</div>
            <div class="flex-1 pl-2 flex justify-end">
              <pc-number :data="orderInfoData?.profit || 0" :color="true" />
            </div>
          </div>
          <div class="flex items-center justify-between mt-4">
            <div>{{ t('运费') }}</div>
            <div class="flex-1 pl-2 flex justify-end">
              <pc-number :data="orderInfoData?.fees || 0" />
            </div>
          </div>
          <div class="flex items-center justify-between mt-4">
            <div>{{ t('税') }}</div>
            <div class="flex-1 pl-2 flex justify-end">
              <pc-number :data="orderInfoData?.tax || 0" />
            </div>
          </div>
          <div class="flex items-center justify-between mt-4 total-price">
            <div>{{ t('合计') }}</div>
            <div class="flex-1 pl-2 flex justify-end">
              <pc-number :data="orderInfoData?.systemDiscountPrice || 0" :color="true" />
            </div>
          </div>
        </a-card>
        <div class="mt-2 flex justify-center">
          <a-button type="primary" :disabled="orderInfoLoading" :loading="submitLoading" @click="showSafePassword = true">
            {{ t('确定支付') }}
          </a-button>
        </div>
      </a-spin>

      <a-card v-if="dataInfo?.id" :title="t('订单商品')" class="mt-5">
        <a-table
          ref="tableRef"
          page-position="bottom"
          :columns="goodsColumns"
          :data="tableData"
          :bordered="true"
          :loading="tableLoading"
          :pagination="{
            ...pageObj,
            showTotal: true,
            showPageSize: true
          }"
          :scroll="{ y: 240 }"
          @page-change="pageChange"
          @page-size-change="pageSizeChange"
        >
          <template #goodsIcon="{ record }">
            <a-image :src="record.goodsIcon" :width="40" :height="40">
              <template #loader>
                <div class="img-loader-animate" style="width: 40px; height: 40px;">
                  <a-spin />
                </div>
              </template>
            </a-image>
          </template>
          <template #goodsNum="{ record }">
            <pc-number :data="record.goodsNum || 0" :currency="false" :decimals="0" />
          </template>
          <template #goodsPrize="{ record }">
            <pc-number :data="record.goodsPrize || 0" />
          </template>
          <template #goodsReal="{ record }">
            <div v-if="Number(record.goodsPrize) !== Number(record.goodsReal)">
              <pc-number :data="record.goodsReal || 0" />
              <p class="main-color text-xs">{{ record.discountRatio ? `(${(Number(record.discountRatio) * 100).toFixed(2)}%)` : '0%' }}</p>
            </div>
            <span v-else>--</span>
          </template>
          <template #systemPrice="{ record }">
            <pc-number :data="record.systemPrice || 0" />
          </template>
          <template #sellerDiscount="{ record }">
            <div v-if="orderInfoData?.sellerDiscount">
              <div class="flex items-center">
                ≈<pc-number :data="(Number(record.systemPrice) - (Number(orderInfoData.sellerDiscount) * Number(record.systemPrice)))" />
              </div>
              <p class="main-color text-xs">{{ orderInfoData?.sellerDiscount ? `(${(Number(orderInfoData?.sellerDiscount) * 100).toFixed(2)}%)` : '0%' }}</p>
            </div>
            <span v-else>--</span>
          </template>
          <template #profit="{ record }">
            <pc-number :data="record.profit || 0" :color="true" />
          </template>
        </a-table>
      </a-card>
    </a-modal>
  </div>
  
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { orderInfo, orderPush } from '@/api/order'
import { request } from '@/utils/request'
import { useTableList } from '@/hooks/useTableList'
import { goodsColumns } from './../config'
import { useSystemStore } from '@/store'

const { t } = useI18n()

const systemStore = useSystemStore()

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

const emits = defineEmits(['update:visible', 'done'])

const handleCancel = () => {
  emits('update:visible', false)
}

const orderListGoods = (params) => {
  return request({
    url: `/user/order/listGoods/${props.dataInfo.id}`,
    method: 'get',
    params
  });
}

const { tableData, tableLoading, getTableData, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(orderListGoods, {}, false)

const orderInfoData = ref(null)
const orderInfoLoading = ref(false)

const getOrderInfo = async () => {
  orderInfoLoading.value = true
  await orderInfo({
    orderId: props.dataInfo.id
  }).then(res => {
    orderInfoData.value = res.orderInfo
    orderInfoLoading.value = false
  }).catch(() => {
    orderInfoLoading.value = false
  })
}

const showSafePassword = ref(false)

const submitLoading = ref(false)
const submitRequest = (safeword) => {
  submitLoading.value = true

  orderPush({
    orderId: props.dataInfo.id,
    safeword
  }).then(() => {
    Message.success(t('订单采购成功'))
    submitLoading.value = false

    systemStore.getOrderCount()
    handleCancel()
    emits('done')
  }).catch(() => {
    submitLoading.value = false
  })
}
watch(() => props.visible, async (val) => {
  if (val) {
    tableLoading.value = true
    await getOrderInfo()
    getTableData(true)
  } else {
    tableLoading.value = false
    tableData.value = []
  }
})
</script>


<style lang="less" scoped>
.text-xs {
  :deep(.pc-number-wrapper) {
    font-size: 12px !important;
  }
}

.total-price {
  :deep(.pc-number-wrapper) {
    font-size: 16px !important;
    font-weight: 500;
  }
}
</style>