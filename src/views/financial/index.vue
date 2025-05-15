<template>
  <div>
    <a-row :gutter="24" >
      <a-col :xs="24" :sm="24" :md="12" :lg="6" :xl="4" :xxl="4" v-for="item in reportDataRef" :key="item.key">
        <div class="report-item" :style="{'background-color': item.color}">
          <p>{{ t(item.title) }}</p>
          <div class="report-item-number">
            <pc-number :data="item.number || 0" :currency="item.currency" :decimals="item.decimals" />
          </div>
        </div>
      </a-col>
    </a-row>

    <div class="ma-content-block p-4">
      <div class="search-form-content">
        <a-form :model="searchParams" layout="inline">
          <a-form-item :label="t('筛选')" field="content_type">
            <a-select v-model="searchParams.content_type" :placeholder="t('请选择')">
              <a-option v-for="item in reportFilter" :key="item.value" :value="item.value">
                {{ t(item.label) }}
              </a-option>
            </a-select>
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
        <template #totalSales="{ record }">
          <pc-number :data="record.totalSales || 0" />
        </template>
        <template #totalProfit="{ record }">
          <pc-number :data="record.totalProfit || 0"  :color="true" />
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTableList } from '@/hooks/useTableList'
  import { reportData, reportFilter, tableColumns } from './config'
  import { sellerReportHead, sellerReportList } from '@/api/seller'
  import { cloneDeep } from 'lodash-es'
  import { useUserStore } from '@/store'

  const { t } = useI18n()

  const userStore = useUserStore()
  const sellerInfo = computed(() => userStore.sellerInfo)
  const sellerId = computed(() => sellerInfo.value.id)

  const reportDataRef = ref(cloneDeep(reportData))

  const searchParams = ref({
    content_type: 2
  })

  const { tableData, tableLoading, getTableData, searchReset, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(sellerReportList, {
    sellerId: String(sellerId.value),
    content_type: searchParams.value.content_type
  }, false)

  const searchHandle = () => {
    const data = cloneDeep(searchParams.value)
    getTableData(data)
    getReportHead()
  }

  const resetHandle = () => {
    searchParams.value = {
      content_type: 2
    }
    searchReset()
    getReportHead()
  }

  const getReportHead = () => {
    sellerReportHead({
      content_type: searchParams.value.content_type,
      sellerId: String(sellerId.value)
    }).then(res => {
      const { head } = res
      reportDataRef.value.forEach(item => {
        item.number = head[item.key]
      })
    })
  }

  onMounted(() => {
    searchHandle()
  })
</script>

<style lang="less" scoped>
  .report-item {
    border-radius: 4px;
    padding: 15px 10px;
    margin-bottom: 20px;
    p {
      font-size: 14px;
      font-weight: 500;
      color: #fff;
    }
    .report-item-number {
      display: flex;
      justify-content: flex-end;
      margin-top: 15px;
      :deep(.pc-number-wrapper) {
        color: #fff;
        font-size: 20px !important;
        font-weight: 500;
      }
    }
  }
</style>
