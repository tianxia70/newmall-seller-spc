<template>
  <div class="ma-content-block p-4">
    <div class="search-form-content">
      <a-form :model="searchParams" layout="inline">
        <a-form-item :label="t('资金类型')" field="content_type">
          <a-select v-model="searchParams.content_type" :placeholder="t('请选择')">
            <a-option v-for="item in contentTypeDataRef" :key="item.value" :value="item.value">
              {{ t(item.label) }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('入账时间')" field="createTime" class="time-range">
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
      <template #contentType="{ record }">
        <span>{{ getTypeName(record.contentType) }}</span>
      </template>
      <template #orderNo="{ record }">
        <span>{{ record.orderNo || '--' }}</span>
      </template>
      <template #amount="{ record }">
        <div class="amount-content" :class="{ plus: record.amount > 0, minus: record.amount < 0 }">
          <span>{{ record.amount > 0 ? '+' : '-' }}</span>
          <pc-number :data="Math.abs(record.amount || 0)" />
          <a-popover title="" trigger="click">
            <icon-question-circle-fill v-if="record.contentType === 'order-income' && record.detail && record.detail.length" class="info-icon" />
            <template #content>
              <a-descriptions :title="t('利润去哪里了？')" bordered>
                <a-descriptions-item v-for="(item, index) in [t('一级返佣'),t('二级返佣'),t('三级返佣')]" :span="24" :key="index" :label="item">
                  <pc-number :data="record.detail[index].rebate || 0" />
                </a-descriptions-item>
              </a-descriptions>
            </template>
          </a-popover>
        </div>
      </template>
      <template #amountBefore="{ record }">
        <pc-number :data="record.amountBefore || 0" />
      </template>
      <template #amountAfter="{ record }">
        <pc-number :data="record.amountAfter || 0" :color="true" />
      </template>
      <template #createTimeStr="{ record }">
        <span>{{ record.createTimeStr || '--' }}</span>
      </template>
    </a-table>
  </div>

  
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTableList } from '@/hooks/useTableList'
  import { pageListMoneyLog } from '@/api/user'
  import { contentTypeData, tableColumns } from './config'
  import { cloneDeep } from 'lodash-es'

  const appName = import.meta.env.VITE_APP

  const { t } = useI18n()
  const searchParams = ref({
    content_type: '',
    createTime: []
  })
  
  const { tableData, tableLoading, getTableData, searchReset, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(pageListMoneyLog)

  const contentTypeDataRef = computed(() => {
    const data = cloneDeep(contentTypeData)
    if (['primePick'].includes(appName)) {
      const arr = ['invest-in', 'invest-out']
      const resData = data.filter(item => !arr.includes(item.value))
      return resData
    } else {
      return data
    }
    return data
  })

  const getTypeName = (type) => {
    const obj = contentTypeDataRef.value.find(item => item.value === type)
    if (obj) {
      return t(obj.label)
    }
    return '--'
  }

  const searchHandle = () => {
    const data = cloneDeep(searchParams.value)
    if (data.createTime && data.createTime.length) {
      data.beginTime = `${data.createTime[0]} 00:00:00`
      data.endTime = `${data.createTime[1]} 23:59:59`
    }
    delete data.createTime
    getTableData(data)
  }

  const resetHandle = () => {
    searchParams.value = {
      content_type: '',
      createTime: []
    }
    searchReset()
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