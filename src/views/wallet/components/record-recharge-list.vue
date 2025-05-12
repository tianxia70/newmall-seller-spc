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
        <pc-number :data="record.volume || 0" :currency="false" :color="true" :decimals="decimalsUnit(record.coin)" />
        <span class="text-xs">{{ usdUnit ? 'USD' : (record.coin === 'bank' ? 'USD' : record.coin)}}</span>
      </div>
    </template>
    <template #blockchain_name="{ record }">
      <span>
        {{ usdChain ? 'USD' : (record.blockchain_name || record.coin_blockchain || '--') }}
      </span>
    </template>
    <template #state="{ record }">
      <a-tag v-if="Number(record.state) === 0" color="blue" bordered>{{ t('处理中') }}</a-tag>
      <a-tag v-if="Number(record.state) === 1" color="green" bordered>{{ t('成功') }}</a-tag>
      <a-tag v-if="Number(record.state) === 2" color="red" bordered>{{ t('失败') }}</a-tag>
    </template>
    <template #img="{ record }">
      <template v-if="Number(record.isThirdParty) === 1">
        <a-link v-if="Number(record.state) === 0" @click="navigationTo(record.payUrl, true)">{{ t('继续支付') }}</a-link>
        <span v-else>--</span>
      </template>
      <template v-else>
        <a-image v-if="record.img" :src="record.img" :width="40" :height="40">
          <template #loader>
            <div class="img-loader-animate" style="width: 40px; height: 40px;">
              <a-spin />
            </div>
          </template>
        </a-image>
        <span v-else>--</span>
      </template>
    </template>
    <template #amount="{ record }">
      <div class="flex gap-1 items-center">
        <pc-number :data="record.amount || 0" :currency="false" :color="true" />
        <span class="text-xs">{{ usdUnit ? 'USD' : (record.coin === 'bank' ? 'USD' : 'USDT')}}</span>
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
  import { rechargePageList } from '@/api/user'
  import { navigationTo } from '@/utils'

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
      dataIndex: 'order_no',
      slotName: 'order_no',
      minWidth: 160
    },
    {
      title: t('充值数量'),
      dataIndex: 'volume',
      slotName: 'volume',
      minWidth: 150
    },
    {
      title: t('币种协议'),
      dataIndex: 'blockchain_name',
      slotName: 'blockchain_name',
      minWidth: 100
    },
    {
      title: t('订单状态'),
      dataIndex: 'state',
      slotName: 'state',
      minWidth: 100
    },
    {
      title: t('支付/凭证'),
      dataIndex: 'img',
      slotName: 'img',
      minWidth: 100
    },
    {
      title: t('实际到账'),
      dataIndex: 'amount',
      slotName: 'amount',
      minWidth: 150
    },
    {
      title: t('到账地址'),
      dataIndex: 'channel_address',
      slotName: 'channel_address',
      minWidth: 140
    },
    {
      title: t('通过时间'),
      dataIndex: 'reviewTime',
      slotName: 'reviewTime',
      minWidth: 180
    },
    {
      title: t('创建时间'),
      dataIndex: 'createTime',
      slotName: 'createTime',
      minWidth: 180
    },
    {
      title: t('备注'),
      dataIndex: 'remark',
      slotName: 'remark',
      minWidth: 140
    }
  ]
  
  const { tableData, tableLoading, getTableData, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(rechargePageList)

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
    window.addEventListener('rechargeSuccess', () => {
      getTableData(true)
    })
  })

  onUnmounted(() => {
    window.removeEventListener('rechargeSuccess', () => {})
  })
</script>