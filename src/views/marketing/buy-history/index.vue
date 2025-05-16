<template>
  <div class="ma-content-block p-4">
    <div class="search-form-content">
      <a-form :model="searchParams" layout="inline">
        <a-form-item :label="t('购买日期')" field="createTime" class="time-range">
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
      <template #prize="{ record }">
        <pc-number :data="record.prize" :color="true" />
      </template>
    </a-table>
  </div>

  
</template>

<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTableList } from '@/hooks/useTableList'
  import { comboHistory } from '@/api/seller'
  import { tableColumns } from './config'
  import { cloneDeep } from 'lodash-es'

  const { t } = useI18n()
  const searchParams = ref({
    createTime: []
  })
  
  const { tableData, tableLoading, getTableData, searchReset, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(comboHistory)

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
      createTime: []
    }
    searchReset()
  }
</script>
