<template>
  <a-modal
    :visible="visible"
    :width="800"
    :mask-closable="false"
    :esc-to-close="false"
    :on-before-cancel="handleCancel"
    @ok="handleCancel"
  >
    <template #title>{{ t('订单详情') }}</template>
    
    <a-spin :loading="orderInfoLoading" :size="32">
      <a-card :title="t('订单摘要')">
        <a-row :gutter="100">
          <a-col :span="12">
            <div class="flex items-center justify-between">
              <div>{{ t('订单号') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                {{ orderInfoData?.id || '--' }}
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="flex items-center justify-between">
              <div>{{ t('下单时间') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                {{ orderInfoData?.createTime || '--' }}
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('付款方式') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                {{ payType || '--' }}
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('支付状态') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                {{ orderInfoData?.payStatus === 1 ? t('已支付') : t('未支付') }}
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('采购状态') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <template v-if="Object.keys(orderInfoData).length">
                  <a-tag v-if="orderInfoData.purchStatus === 0" color="red">{{ t('待采购') }}</a-tag>
                  <a-tag v-else color="green">{{ t('已采购') }}</a-tag>
                </template>
                <span v-else>--</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('物流状态') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                {{ getStatus(orderInfoData?.status, orderInfoData?.returnStatus) }}
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('采购金额') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <pc-number :data="orderInfoData?.systemDiscountPrice || orderInfoData?.systemPrice || 0" />
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('销售金额') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <pc-number :data="orderInfoData?.prizeReal || 0" />
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('采购时间') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.pushTime || '--' }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('利润') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <pc-number :data="orderInfoData?.profit || 0" :color="true" />
              </div>
            </div>
          </a-col>
        </a-row>

        <a-divider />

        <a-row :gutter="100" class="relative">
          <a-button
            :disabled="disabledChat"
            :loading="chatLoading"
            type="primary"
            shape="circle"
            class="contact-btn"
            @click="handleContact"
          >
            <i v-if="!chatLoading" class="iconfont">&#xe780;</i>
          </a-button>

          <a-col :span="12">
            <div class="flex items-center justify-between">
              <div>{{ t('姓名') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.contacts || '--' }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12">
            <div class="flex items-center justify-between">
              <div>{{ t('邮箱') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.email || '--' }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('地址') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.address || '--' }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('电话') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.phone || '--' }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('国家') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.country || '--' }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('省区') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.province || '--' }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('城市') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.city || '--' }}</span>
              </div>
            </div>
          </a-col>
          <a-col :span="12" class="mt-4">
            <div class="flex items-center justify-between">
              <div>{{ t('邮编') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <span>{{ orderInfoData?.postcode || '--' }}</span>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </a-spin>
    

    <a-row :gutter="30" class="mt-5">
      <a-col :span="16">
        <a-card :title="t('订单商品')">
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
            :scroll="{ y: 150 }"
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
      </a-col>
      <a-col :span="8">
        <a-card :title="t('订单金额')">
          <a-spin :loading="orderInfoLoading" :size="32">
            <div class="flex items-start justify-between mt-4">
              <div>{{ t('采购金额') }}</div>
              <div class="flex-1 pl-2 flex justify-end flex-col items-end">
                <pc-number :data="orderInfoData?.systemPrice || 0" />
                <div v-if="orderInfoData?.sellerDiscount" class="flex items-center text-xs mt-1 flex-wrap justify-end">
                  <span>{{ t('采购优惠') }}</span>
                  <p class="main-color">{{ orderInfoData?.sellerDiscount ? `${(Number(orderInfoData?.sellerDiscount) * 100).toFixed(2)}%` : '0%' }}</p>,
                  <span>{{ t('优惠价') }}</span>
                  <pc-number :data="orderInfoData.systemDiscountPrice || 0" :color="true" />
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between mt-4">
              <div>{{ t('税') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <pc-number :data="orderInfoData?.tax || 0" />
              </div>
            </div>
            <div class="flex items-center justify-between mt-4">
              <div>{{ t('运费') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <pc-number :data="orderInfoData?.fees || 0" />
              </div>
            </div>
            <div class="flex items-center justify-between mt-4">
              <div>{{ t('利润') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <pc-number :data="orderInfoData?.profit || 0" :color="true" />
              </div>
            </div>
            <div class="flex items-center justify-between mt-4 total-price">
              <div>{{ t('合计') }}</div>
              <div class="flex-1 pl-2 flex justify-end">
                <pc-number :data="orderInfoData?.systemDiscountPrice || 0" :color="true" />
              </div>
            </div>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { orderInfo } from '@/api/order'
import { request } from '@/utils/request'
import { useTableList } from '@/hooks/useTableList'
import { statusData, goodsColumns } from './../config'
import { useSystemStore, useChatStore, useUserStore } from '@/store'
import { messageCheck, messageFirst } from '@/api/system'

const appName = import.meta.env.VITE_APP

const { t } = useI18n()
const systemStore = useSystemStore()
const chatStore = useChatStore()
const userStore = useUserStore()

const sellerInfo = computed(() => userStore.userInfo)

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

const payType = computed(() => {
  return ['tiktok8'].includes(appName) ? 'USD' : 'USDT'
})

const disabledChat = computed(() => {
  if (systemStore.customer_service_url) {
    return false
  } else {
    return !chatStore.imDone
  }
})

const orderListGoods = (params) => {
  return request({
    url: `/user/order/listGoods/${props.dataInfo.id}`,
    method: 'get',
    params
  });
}

const { tableData, tableLoading, getTableData, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(orderListGoods, {}, false)

const orderInfoData = ref({})
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

const getStatus = (value, returnStatus) => {
  if (Number(value) === 6) {
    const returnInfo = {
      0: t('未退款'),
      1: t('退款中'),
      2: t('退款成功'),
      3: t('退款失败')
    }
    return returnInfo[returnStatus] || '--'
  } else {
    const obj = statusData.find(item => item.value === value)
    return obj ? t(obj.label) : '--'
  }
}

const chatLoading = ref(false)
const handleContact = () => {
  chatLoading.value = true

  const partyId = orderInfoData.value.partyId
  messageCheck({
    partyId: partyId
  }).then(async res => {
    const { flag } = res

    if (flag) {
      await chatStore.setNewUserContact(partyId)
      chatLoading.value = false
      window.im_create_iframe_business.open()
    } else {
      await messageFirst({
        loginType: 'shop',
        userId: partyId,
        sellerId: sellerInfo.value.id
      })

      await chatStore.setNewUserContact(partyId)
      chatLoading.value = false
      window.im_create_iframe_business.open()
    }
  }).catch(() => {
    chatLoading.value = false
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

.contact-btn {
  position: absolute;
  left: 50%;
  margin-left: -10px;
  box-shadow: 0px 4.5px 6px rgba(var(--primary-6), 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  :deep(.arco-btn-icon) {
    margin-right: 0;
  }
}
</style>
