<template>
  <div class="ma-content-block p-4">
    <!-- 设置支付密码 -->
    <safe-password-setting
      v-if="showSafewordDialog"
      v-model:visible="showSafewordDialog"
    ></safe-password-setting>

    <!-- 密码输入弹窗 -->
    <safe-password-input v-model:visible="showSafePassword" @confirm="submitRequest" />

    <!-- 确认弹窗 -->
    <pc-confirm-dialog
      v-if="showConfirmDialog"
      v-model:visible="showConfirmDialog"
      :message="t('实名认证尚未完成')"
      :confirmText="t('查看认证进度')"
      @confirm="navigationTo('/other/shop-setting?cert=1')"
    ></pc-confirm-dialog>

    <purchase-dialog
      v-model:visible="purchaseDialogVisible"
      :data-info="currentData"
      @done="searchHandle"
    />

    <logistics-dialog
      v-model:visible="logisticsDialogVisible"
      :data-info="currentData"
    />

    <details-dialog
      v-model:visible="detailsDialogVisible"
      :data-info="currentData"
    />

    <a-tabs v-model:activeKey="activeKey" @change="tabChange">
      <a-tab-pane v-for="item in navData" :key="item.key" :title="item.name">
        <template #title>
          <a-badge :count="item.key === '2' ? orderCount : 0" dot :offset="[5, 0]">
            {{ item.name }}
          </a-badge>
        </template>
      </a-tab-pane>
    </a-tabs>

    <div class="search-form-content">
      <a-form :model="searchParams" layout="inline">
        <a-form-item :label="t('订单编号')" field="orderId">
          <a-input v-model="searchParams.orderId" :placeholder="t('请输入')" />
        </a-form-item>
        <a-form-item :label="t('支付状态')" field="payStatus">
          <a-select v-model="searchParams.payStatus" :placeholder="t('请选择')">
            <a-option v-for="item in payStatusData" :key="item.value" :value="item.value">
              {{ t(item.label) }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('物流状态')" field="status">
          <a-select v-model="searchParams.status" :disabled="activeKey !== '1'" :placeholder="t('请选择')">
            <a-option v-for="item in statusData" :key="item.value" :value="item.value">
              {{ t(item.label) }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('下单时间')" field="createTime" class="time-range">
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

    <div class="mb-4 flex items-center gap-2">
      <a-button :loading="batchLoading" type="primary" class="flex items-center gap-1" @click="batchHandle">
        {{ t('批量采购') }}
        <span v-if="selectedMoney">({{ numberStrFormat(selectedMoney) }})</span>
        <a-tooltip :content="t('最多批量操作{0}条数据', [100])">
          <icon-exclamation-circle-fill />
        </a-tooltip>
      </a-button>
      <a-button v-if="selectedKeys.length" @click="selectedKeys = []">{{ t('取消') }}</a-button>
    </div>

    <a-table
      ref="tableRef"
      row-key="id"
      page-position="bottom"
      :columns="tableColumnsRef"
      :data="tableData"
      :bordered="true"
      :loading="tableLoading"
      :pagination="{
        ...pageObj,
        showTotal: true,
        showPageSize: true
      }"
      :row-selection="rowSelection"
      v-model:selectedKeys="selectedKeys"
      @page-change="pageChange"
      @page-size-change="pageSizeChange"
      @selection-change="selectionChange"
    >
      <template #contacts="{ record }">
        <span>{{ formatContacts(record.contacts) }}</span>
      </template>
      <template #prizeReal="{ record }">
        <pc-number :data="record.prizeReal || 0" />
      </template>
      <template #sellerDiscountPrice="{ record }">
        <pc-number :data="record.sellerDiscountPrice || 0" />
      </template>
      <template #profit="{ record }">
        <pc-number :data="record.profit || 0" :color="true" />
      </template>
      <template #payStatus="{ record }">
        <span>{{ getPayStatus(record.payStatus) }}</span>
      </template>
      <template #purchStatus="{ record }">
        <a-tag v-if="record.purchStatus === 0" color="red">{{ t('待采购') }}</a-tag>
        <a-tag v-else color="green">{{ t('已采购') }}</a-tag>
      </template>
      <template #status="{ record }">
        <span>{{ getStatus(record.status, record.returnStatus) }}</span>
      </template>
      <template #action="{ record }">
        <a-dropdown>
          <a-badge :count="(Number(record.purchStatus) === 0 && Number(record.payStatus) === 1 && Number(record.status) === 1) ? 1 : 0" dot>
            <a-button type="primary">
              {{ t('操作') }} <icon-down />
            </a-button>
          </a-badge>

          <template #content>
            <a-doption @click.stop="itemHandle(record, 1)">{{ t('查看订单') }}</a-doption>
            <a-doption
              v-if="Number(record.purchStatus) === 0 && Number(record.payStatus) === 1 && Number(record.status) === 1"
              @click.stop="itemHandle(record, 2)">{{ t('采购') }}</a-doption>
            <a-doption v-if="[2,3,4,5].includes(Number(record.status))" @click.stop="itemHandle(record, 3)">{{ t('物流信息') }}</a-doption>
          </template>
        </a-dropdown>
      </template>
    </a-table>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Message } from '@arco-design/web-vue'
  import { useTableList } from '@/hooks/useTableList'
  import { orderPagelist, orderPush } from '@/api/order'
  import { payStatusData, statusData, tableColumns} from './config'
  import { cloneDeep } from 'lodash-es'
  import { navData } from './config'
  import { useUserStore, useSystemStore } from '@/store'
  import { navigationTo, numberStrFormat } from '@/utils'
  import tool from '@/utils/tool'
  import PurchaseDialog from './components/purchase-dialog.vue'
  import LogisticsDialog from './components/logistics-dialog.vue'
  import DetailsDialog from './components/details-dialog.vue'

  const appName = import.meta.env.VITE_APP

  const { t } = useI18n()

  const systemStore = useSystemStore()
  const userStore = useUserStore()
  const userInfo = computed(() => userStore.userInfo)
  const hasSafeword = computed(() => userInfo.value.safeword)
  const hasCerted = computed(() => userInfo.value.kyc_status === 2)

  const orderCount = computed(() => systemStore.order_count)

  const showSafewordDialog = ref(false)
  const showConfirmDialog = ref(false)

  let initParams = {}
  if (['masla'].includes(appName)) {
    initParams = {
      pageSize: 100
    }
  }

  const showTimeOut = computed(() => {
    return !['oufan'].includes(appName)
  })

  const tableColumnsRef = computed(() => {
    const data = cloneDeep(tableColumns)
    if (!showTimeOut.value) {
      const index = data.findIndex(item => item.dataIndex === 'overTime')
      if (index !== -1) {
        data.splice(index, 1)
      }
    }
    return data
  })

  const { tableData, tableLoading, getTableData, searchReset, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(
    orderPagelist,
    initParams,
    false
  )

  const timeForamat = (count) => {
    const tt = Math.floor(count / (24 * 60 * 60))
    const yt = count % (24 * 60 * 60)

    const s = Math.floor(yt / (60 * 60))
    let ss = s < 10 ? "0" + s : s
    const ys = yt % (60 * 60)

    const f = Math.floor(ys / 60)
    const ff = f < 10 ? "0" + f : f
    const yf = ys % 60

    const m = yf
    const mm = m < 10 ? "0" + m : m

    const tStr = tt ? `${tt}${this.$t('天')} ` : ''
    if (tt) {
      ss = Number(s) + Number(tt) * 24
    }
    // return `${tStr}${ss} : ${ff} : ${mm}`
    return `${ss} : ${ff} : ${mm}`
  }

  const intervalArr = ref([])
  const clearAllInterval = () => {
    intervalArr.value.forEach(interval => {
      clearInterval(interval)
    })
    intervalArr.value = []
  }

  watch(() => tableData.value, (val) => {
    clearAllInterval()
    selectedKeys.value = []
    selectedMoney.value = 0
    orderIds.value = ''

    if (val && val.length) {
      for (let i = 0; i < tableData.value.length; i++) {
        if ((tableData.value[i].purchStatus == 0)&&tableData.value[i].payStatus == 1&&tableData.value[i].status===1) {
          let count = Number(tableData.value[i].purchCountdownTime)
          if (count && showTimeOut.value) {
            let interval = setInterval(() => {
              if (count <= 0) {
                clearInterval(interval)
                tableData.value[i].overTime = t('已超时')
              } else {
                --count
                tableData.value[i].overTime = timeForamat(count)
              }
            }, 1000)
            intervalArr.value.push(interval)
          } else {
            tableData.value[i].overTime = t('已超时')
          }
        } else {
          tableData.value[i].overTime = '--'
        }
      }
    }
  })

  const searchParams = ref({
    orderId: '',
    payStatus: '',
    status: '',
    createTime: []
  })

  const activeKey = ref(navData[0].key)

  const tabChange = (key) => {
    activeKey.value = key
    
    const obj = navData.find(item => item.key === key)
    if (obj) {
      searchParams.value.status = obj.status
    }
    searchHandle()
  }

  const searchHandle = () => {
    const data = cloneDeep(searchParams.value)
    if (data.createTime && data.createTime.length) {
      data.begin = `${data.createTime[0]} 00:00:00`
      data.end = `${data.createTime[1]} 23:59:59`
    }
    delete data.createTime

    const obj = navData.find(item => item.key === activeKey.value)
    if (obj) {
      data.purchStatus = obj.purchStatus
    }
    getTableData(data)
  }

  const resetHandle = () => {
    searchParams.value = {
      orderId: '',
      payStatus: '',
      status: '',
      createTime: []
    }
    searchReset()
  }

  const formatContacts = (value) => {
    if (value) {
      const name = value.split(' ');
      if (name.length > 1) {
        return value.replace(/^(.{1})(.*)(.{1})$/, "$1****$3");
      } else {
        return name[0].substring(0, 1) + '***';
      }
    }
    return '--'
  }

  const getPayStatus = (value) => {
    const obj = payStatusData.find(item => item.value === value)
    return obj ? t(obj.label) : '--'
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

  const currentData = ref(null)
  const purchaseDialogVisible = ref(false)
  const logisticsDialogVisible = ref(false)
  const detailsDialogVisible = ref(false)
  const itemHandle = (record, type) => {
    currentData.value = record
    if (type === 1) {
      detailsDialogVisible.value = true
    } else if (type === 2) {
      if (!hasSafeword.value) {
        showSafewordDialog.value = true
        return
      }

      if (!hasCerted.value) {
        showConfirmDialog.value = true
        return
      }
      
      purchaseDialogVisible.value = true
    } else if (type === 3) {
      logisticsDialogVisible.value = true
    }
  }

  const selectedKeys = ref([])
  const rowSelection = reactive({
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false
  })
  const selectedMoney = ref(0)

  const selectionChange = (selectedRowKeys) => {
    const dataArr = tableData.value.filter(item => selectedRowKeys.includes(item.id))
    const passArr = dataArr.filter(item => item.purchStatus === 0)
    const total = passArr.map(item => (item.sellerDiscountPrice || 0)).reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);
    selectedMoney.value = total
  }


  const orderIds = ref('')
  const showSafePassword = ref(false)
  const batchLoading = ref(false)
  const batchHandle = () => {
    const dataArr = tableData.value.filter(item => selectedKeys.value.includes(item.id))
    const passArr = dataArr.filter(item => item.purchStatus === 0)

    if (!passArr.length) {
      Message.error(t('没有需要采购的订单'))
      return false
    }

    if (passArr.length > 100) {
      Message.error(t('最多批量操作{0}条数据', [100]))
      return false
    }

    orderIds.value = passArr.map(item => item.id).join(',')
    showSafePassword.value = true
  }

  const submitRequest = (safeword) => {
    batchLoading.value = true

    orderPush({
      orderId: orderIds.value,
      safeword
    }).then(() => {
      Message.success(t('订单采购成功'))
      batchLoading.value = false

      systemStore.getOrderCount()
      searchHandle()
    }).catch(() => {
      batchLoading.value = false
    })
  }
  

  onMounted(() => {
    searchHandle()
    window.addEventListener('triggerOrderReload', () => {
      activeKey.value = navData[0].key
      resetHandle()
    })
  })

  onUnmounted(() => {
    clearAllInterval()
  })
</script>

<style lang="less" scoped></style>
