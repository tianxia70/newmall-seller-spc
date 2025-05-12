<template>
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
    <template #volume="{ record }">
      <div class="flex gap-1 items-center">
        <pc-number :data="record.volume || 0" :currency="false" :color="true" :decimals="decimalsUnit(record.coinBlockchain)" />
        <span class="text-xs">{{ usdUnit ? 'USD' : (record.coinBlockchain === 'bank' ? 'USD' : record.coinBlockchain)}}</span>
      </div>
    </template>
    <template #coinBlockchain="{ record }">
      <span v-if="record.coinBlockchain">
        {{ record.coinBlockchain === 'USDT' && usdChain ? 'USD' : record.coinBlockchain }}
      </span>
      <span v-else>--</span>
    </template>
    <template #state="{ record }">
      <a-tag v-if="Number(record.state) === 0" color="blue" bordered>{{ t('处理中') }}</a-tag>
      <a-tag v-if="Number(record.state) === 1" color="green" bordered>{{ t('成功') }}</a-tag>
      <a-tag v-if="Number(record.state) === 2" color="red" bordered>{{ t('失败') }}</a-tag>
    </template>
    <template #fee="{ record }">
      <div class="flex gap-1 items-center">
        <pc-number :data="record.fee || 0" :currency="false" :color="true" />
        <span class="text-xs">{{ usdUnit ? 'USD' : (record.coinBlockchain === 'bank' ? 'USD' : 'USDT')}}</span>
      </div>
    </template>
    <template #amount="{ record }">
      <div class="flex gap-1 items-center">
        <pc-number :data="record.amount || 0" :currency="false" :color="true" :decimals="decimalsUnit(record.coinBlockchain)" />
        <span class="text-xs">{{ usdUnit ? 'USD' : (record.coinBlockchain === 'bank' ? 'USD' : record.coinBlockchain)}}</span>
      </div>
    </template>
    <template #remark="{ record }">
      <p v-if="record.failureMsg" class="text-xs text-red-600">{{ record.failureMsg }}</p>
      <p v-if="record.remark" class="text-xs">{{ record.remark }}</p>
      <span v-if="!record.failureMsg && !record.remark">--</span>
    </template>
  </a-table>
</template>

<script setup>
  import { computed, onMounted, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTableList } from '@/hooks/useTableList'
  import { withdrawPageList } from '@/api/user'

  const { t } = useI18n()
  const appName = import.meta.env.VITE_APP
  const usdUnit = computed(() => {
    return ['tiktok8'].includes(appName)
  })
  const usdChain = computed(() => {
    return ['selfridges', 'harrods'].includes(appName)
  })

  const tableColumns = [
    {
      title: t('订单号'),
      dataIndex: 'orderNo',
      slotName: 'orderNo',
      minWidth: 160
    },
    {
      title: t('提现数量'),
      dataIndex: 'volume',
      slotName: 'volume',
      minWidth: 150
    },
    {
      title: t('币种协议'),
      dataIndex: 'coinBlockchain',
      slotName: 'coinBlockchain',
      minWidth: 100
    },
    {
      title: t('订单状态'),
      dataIndex: 'state',
      slotName: 'state',
      minWidth: 100
    },
    {
      title: t('手续费'),
      dataIndex: 'fee',
      slotName: 'fee',
      minWidth: 150
    },
    {
      title: t('实际到账'),
      dataIndex: 'amount',
      slotName: 'amount',
      minWidth: 150
    },
    {
      title: t('创建时间'),
      dataIndex: 'createTime',
      slotName: 'createTime',
      minWidth: 180
    },
    {
      title: t('到账地址'),
      dataIndex: 'to',
      slotName: 'to',
      minWidth: 140
    },
    {
      title: t('备注'),
      dataIndex: 'remark',
      slotName: 'remark',
      minWidth: 140
    }
  ]
  
  const { tableData, tableLoading, getTableData, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(withdrawPageList)

  const decimalsUnit = (unit) => {
    let decimals = 2
    const str = String(unit).toLocaleLowerCase()
    if (str === 'btc') {
      decimals = 6
    }

    if (str === 'eth') {
      decimals = 4
    }

    return decimals
  }

  onMounted(() => {
    window.addEventListener('withdrawSuccess', () => {
      getTableData(true)
    })
  })

  onUnmounted(() => {
    window.removeEventListener('withdrawSuccess', () => {})
  })
</script>