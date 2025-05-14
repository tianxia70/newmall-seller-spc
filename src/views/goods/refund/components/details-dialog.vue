<template>
  <a-modal
    :visible="visible"
    :width="700"
    :mask-closable="false"
    :esc-to-close="false"
    :footer="false"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ t('退款详情') }}</template>
    
    <a-card v-if="dataInfo?.id" :title="t('订单详情')">
      <div class="flex items-center justify-between">
        <div>{{ t('申请时间') }}</div>
        <div class="flex-1 pl-2 flex justify-end">{{ dataInfo.refundTime }}</div>
      </div>
      <div class="flex items-center justify-between mt-4">
        <div>{{ t('退款单号') }}</div>
        <div class="flex-1 pl-2 flex justify-end">{{ dataInfo.id }}</div>
      </div>
      <div class="flex items-center justify-between mt-4">
        <div>{{ t('退款金额') }}</div>
        <div class="flex-1 pl-2 flex justify-end">
          <pc-number :data="dataInfo.returnPrice" :color="true" />
        </div>
      </div>
      <div class="flex items-center justify-between mt-4">
        <div>{{ t('退款状态') }}</div>
        <div class="flex-1 pl-2 flex justify-end">
          <a-tag :color="returnStatusColor[Number(dataInfo.returnStatus)]">{{ dataInfo.returnStatusStr }}</a-tag>
        </div>
      </div>
      <div class="flex items-center justify-between mt-4">
        <div>{{ t('退款说明') }}</div>
        <div class="flex-1 pl-2 flex justify-end">{{ dataInfo.returnDetail || '--' }}</div>
      </div>
      <div class="flex items-center justify-between mt-4">
        <div>{{ t('退款理由') }}</div>
        <div class="flex-1 pl-2 flex justify-end">{{ dataInfo.returnReasonStr }}</div>
      </div>
    </a-card>

    <a-card v-if="dataInfo?.id" :title="t('退款产品')" class="mt-5">
      <a-table
        ref="tableRef"
        page-position="bottom"
        :columns="goodsColumns"
        :data="tableDataRef"
        :bordered="true"
        :loading="tableLoading"
        :pagination="{
          ...pageObj,
          showTotal: true,
          showPageSize: true
        }"
        :scroll="{ y: 300 }"
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
        <template #goodsReal="{ record }">
          <pc-number :data="record.goodsReal || 0" :color="true" />
        </template>
      </a-table>
    </a-card>
  </a-modal>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { returnStatusColor, goodsColumns } from './../config'
import { request } from '@/utils/request'
import { useTableList } from '@/hooks/useTableList'

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

const orderListGoods = (params) => {
  return request({
    url: `/user/order/listGoods/${props.dataInfo.id}`,
    method: 'get',
    params
  });
}

const { tableData, tableLoading, getTableData, searchReset, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(orderListGoods, {}, false)

const tableDataRef = computed(() => {
  return tableData.value.map(item => {
    const obj = {
      ...item,
      goodsName: item.goodsName || '--'
    }
    let goodsSpecArr = []
    if (item.attributes && item.attributes.length) {
      goodsSpecArr = item.attributes.map(item => item.attrValue)
    }
    obj.goodsSpec = goodsSpecArr.length ? goodsSpecArr.join('; ') : '--'
    return obj
  })
})

watch(() => props.visible, (val) => {
  if (val) {
    getTableData(true)
  }
})
</script>
