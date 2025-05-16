<template>
  <div class="ma-content-block p-4">
    <details-dialog v-model:visible="detailsVisible" :data-info="currentData" />

    <div class="search-form-content">
      <a-form :model="searchParams" layout="inline">
        <a-form-item :label="t('订单状态')" field="returnStatus">
          <a-select v-model="searchParams.returnStatus" :placeholder="t('请选择')">
            <a-option v-for="item in returnStatusData" :key="item.value" :value="item.value">
              {{ t(item.label) }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('申请日期')" field="createTime" class="time-range">
          <a-range-picker
            v-model="searchParams.createTime"
            format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item>
          <a-space size="medium">
            <a-button type="primary" @click="searchHandle">{{ t('查询') }}</a-button>
            <a-button @click="resetHandle">{{ t('重置') }}</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <a-table
      ref="tableRef"
      page-position="bottom"
      :columns="tableColumns"
      :data="tableData"
      :bordered="true"
      :loading="tableLoading"
      :pagination="{
        ...pageObj,
        showTotal: true,
        showPageSize: true
      }"
      @page-change="pageChange"
      @page-size-change="pageSizeChange"
    >
      <template #returnReason="{ record }">
        <span>{{ getReturnReason(record.returnReason) }}</span>
      </template>
      <template #returnDetail="{ record }">
        <span>{{ record.returnDetail || '--' }}</span>
      </template>
      <template #returnPrice="{ record }">
        <pc-number :data="record.returnPrice || 0" :color="true" />
      </template>
      <template #returnStatus="{ record }">
        <a-tag :color="returnStatusColor[Number(record.returnStatus)]">{{ getTypeName(record.returnStatus) }}</a-tag>
      </template>
      <template #action="{ record }">
        <a-button type="primary" @click="detailsHandle(record)">{{ t('查看') }}</a-button>
      </template>
    </a-table>
  </div>

  
</template>

<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTableList } from '@/hooks/useTableList'
  import { orderRefundPagelist } from '@/api/goods'
  import { returnStatusData, returnReasonData, returnStatusColor, tableColumns } from './config'
  import { cloneDeep } from 'lodash-es'
  import DetailsDialog from './components/details-dialog.vue'

  const { t } = useI18n()
  const searchParams = ref({
    returnStatus: '',
    createTime: []
  })
  
  const { tableData, tableLoading, getTableData, searchReset, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(orderRefundPagelist)

  const getTypeName = (type) => {
    const obj = returnStatusData.find(item => item.value === Number(type))
    if (obj) {
      return t(obj.label)
    }
    return '--'
  }

  const getReturnReason = (type) => {
    const obj = returnReasonData.find(item => item.value === Number(type))
    if (obj) {
      return t(obj.label)
    }
    return '--'
  }

  const searchHandle = () => {
    const data = cloneDeep(searchParams.value)
    if (data.createTime && data.createTime.length) {
      data.begin = `${data.createTime[0]} 00:00:00`
      data.end = `${data.createTime[1]} 23:59:59`
    }
    delete data.createTime
    getTableData(data)
  }

  const resetHandle = () => {
    searchParams.value = {
      returnStatus: '',
      createTime: []
    }
    searchReset()
  }

  const currentData = ref(null)
  const detailsVisible = ref(false)

  const detailsHandle = (data) => {
    currentData.value = {
      ...data,
      returnReasonStr: getReturnReason(data.returnReason),
      returnStatusStr: getTypeName(data.returnStatus)
    }
    detailsVisible.value = true
  }
</script>

<style lang="less" scoped>
.amount-content {
  display: flex;
  align-items: center;
  gap: 2px;
  &.plus {
    color: #00a870;
    :deep(.pc-number-wrapper) {
      color: #00a870 !important;
    }
  }
  &.minus {
    color: #ff4d4f;
    :deep(.pc-number-wrapper) {
      color: #ff4d4f !important;
    }
  }
  .info-icon {
    color: rgb(var(--primary-6));
    cursor: pointer;
    margin-left: 4px;
    &:hover {
      color: rgb(var(--primary-5));
    }
  }
} 
</style>