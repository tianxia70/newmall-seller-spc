<template>
  <div>
    <a-row :gutter="20">
      <a-col :xs="24" :sm="24" :md="8" :lg="8">
        <div class="ma-content-block p-4 mb-3 invest-item">
          <pc-number :data="investInfo?.balance || 0" :bold="true" :size="24" :color="true" />
          <p>{{ t('总资产') }}</p>
        </div>
      </a-col>
      <a-col :xs="24" :sm="24" :md="8" :lg="8">
        <div class="ma-content-block p-4 mb-3 invest-item">
          <pc-number :data="investInfo?.yesterdayProfit || 0" :bold="true" :size="24" :color="true" />
          <p>{{ t('昨日收益') }}</p>
        </div>
      </a-col>
      <a-col :xs="24" :sm="24" :md="8" :lg="8">
        <div class="ma-content-block p-4 mb-3 invest-item">
          <pc-number :data="investInfo?.totalProfit || 0" :bold="true" :size="24" :color="true" />
          <p>{{ t('累计收益') }}</p>
        </div>
      </a-col>
    </a-row>

    <div class="ma-content-block p-4 mb-3">
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
        <template #name="{ record }">
          <span>{{ t('余额宝收益') }}</span>
        </template>
        <template #income="{ record }">
          <pc-number :data="record.income" :color="true" />
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { sellerInvestInfo } from '@/api/user'
import { useI18n } from 'vue-i18n'
import { sellerInvestList } from '@/api/user'
import { useTableList } from '@/hooks/useTableList'

const { t } = useI18n()

const tableColumns = [
  {
    title: t('名称'),
    dataIndex: 'name',
    minWidth: 200,
    slotName: 'name'
  },
  {
    title: t('收益金额'),
    dataIndex: 'income',
    minWidth: 200,
    slotName: 'income'
  },
  {
    title: t('日期'),
    dataIndex: 'createTime',
    minWidth: 200,
    slotName: 'createTime'
  }
]

const { tableData, tableLoading, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(sellerInvestList)

const investInfo = ref({
  balance: 0,
  totalProfit: 0,
  yesterdayProfit: 0
})

const getInvestInfo = () => {
  sellerInvestInfo().then(res => {
    investInfo.value = res
  })
}

onMounted(() => {
  getInvestInfo()
})
</script>

<style lang="less" scoped>
.invest-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 25px;
  padding-bottom: 25px;

  > p {
    color: var(--color-text-2);
    margin-top: 10px;
  }
}
</style>  