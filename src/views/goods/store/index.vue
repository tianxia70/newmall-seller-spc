<template>
  <div class="ma-content-block p-4">
    <a-modal
      v-model:visible="dialogVisible"
      :width="1200"
      :mask-closable="false"
      :esc-to-close="false"
    >
      <template #title>{{ t('商品详情') }}</template>
      <div class="goods-content">
        <iframe v-if="goodsUrl && dialogVisible" :src="goodsUrl" frameborder="0"></iframe>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="batchModalVisible"
      :width="340"
      :mask-closable="false"
      :esc-to-close="false"
      :on-before-ok="batchOk"
    >
      <template #title>{{ batchTitle }}</template>
      <p>{{ batchTipsText }}</p>
    </a-modal>

    <spec-dialog
      v-model:visible="specDialogVisible"
      :goods-id="currentGoodsId"
    />

    <edit-dialog
      v-model:visible="editDialogVisible"
      :ids="selectedKeys"
      :goods-info="currentGoodsInfo"
      @done="editDialogDone"
    />

    <div class="search-form-content">
      <a-form :model="searchParams" layout="inline">
        <a-form-item :label="t('商品名称')" field="name">
          <a-input v-model="searchParams.name" :placeholder="t('请输入')" />
        </a-form-item>
        <a-form-item :label="t('商品ID')" field="id">
          <a-input v-model="searchParams.id" :placeholder="t('请输入')" />
        </a-form-item>
        <a-form-item :label="t('分类')" field="categoryId">
          <a-tree-select 
            v-model="searchParams.categoryId" 
            :data="categoryTreeData" 
            :placeholder="t('请选择')"
          />
        </a-form-item>
        <a-form-item :label="t('商品状态')" field="isShelf">
          <a-select v-model="searchParams.isShelf" :placeholder="t('请选择')">
            <a-option v-for="item in statusData" :key="item.value" :value="item.value">
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
    
    <div class="mb-4 flex items-center gap-2">
      <a-button type="primary" status="success" class="flex items-center gap-1" @click="batchHandle(1)">{{ t('批量上架') }}</a-button>
      <a-button v-if="allowGoodsOut" type="primary" status="danger" class="flex items-center gap-1" @click="batchHandle(2)">{{ t('批量下架') }}</a-button>
      <a-button type="primary" class="flex items-center gap-1" @click="batchHandle(3)">{{ t('批量修改') }}</a-button>
      <a-button v-if="allowGoodsOut" type="primary" status="danger" class="flex items-center gap-1" @click="batchHandle(4)">{{ t('批量删除') }}</a-button>
    </div>

    <a-table
      ref="tableRef"
      page-position="bottom"
      row-key="id"
      :columns="tableColumns"
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
    >
      <template #poster="{ record }">
        <a-image :src="record.imgUrl1 || record.imgUrl2 || record.imgUrl3 || record.imgUrl4" :width="60" :height="60">
          <template #loader>
            <div class="img-loader-animate" style="width: 60px; height: 60px;">
              <a-spin />
            </div>
          </template>
        </a-image>
      </template>
      <template #name="{ record }">
        <a-link v-if="record.isShelf === 1" @click="openDetails(record)">{{ record.name }}</a-link>
        <span v-else>{{ record.name }}</span>
      </template>
      <template #systemPrice="{ record }">
        <pc-number :data="record.systemPrice" :color="true" />
      </template>
      <template #tagHandle="{ record }">
        <div v-if="allowGoodsOut" class="tag-handle-item">
          <a-switch
            v-model="record.isShelf"
            :checked-value="1"
            :unchecked-value="0"
            :beforeChange="() => tagBeforeChange(record, 1)"
          />
          <p>{{ t('上架') }}</p>
        </div>
        <div class="tag-handle-item">
          <a-switch
            v-model="record.recTime"
            :checked-value="1"
            :unchecked-value="0"
            :beforeChange="() => tagBeforeChange(record, 2)"
          />
          <p>{{ t('推荐') }}</p>
        </div>
        <div class="tag-handle-item">
          <a-switch
            v-model="record.isCombo"
            :checked-value="1"
            :unchecked-value="0"
            :beforeChange="() => tagBeforeChange(record, 3)"
          />
          <p>{{ t('直通车') }}</p>
        </div>
      </template>
      <template #sellingPrice="{ record }">
        <pc-number :data="record.sellingPrice" :color="true" />
      </template>
      <template #discountPrice="{ record }">
        <pc-number v-if="Number(record.discountPrice || 0)" :data="record.discountPrice" :color="true" />
        <span v-else>--</span>
      </template>
      <template #profit="{ record }">
        <pc-number :data="getProfit(record)" :color="true" />
      </template>
      <template #soldNum="{ record }">
        <pc-number :data="record.soldNum" :currency="false" :decimals="0" />
      </template>
      <template #action="{ record }">
        <a-dropdown
          :popup-visible="record.opVisible"
          @popup-visible-change="val => record.opVisible = val"
          :hide-on-select="false"
        >
          <a-button type="primary">
            {{ t('操作') }} <icon-down />
          </a-button>

          <template #content>
            <a-doption @click.stop="handleSpec(record)">{{ t('规格') }}</a-doption>
            <a-doption @click.stop="handleEdit(record)">{{ t('修改') }}</a-doption>
            <a-doption @click.stop>
              <a-popconfirm
                type="warning"
                :content="t('确定删除该商品？')"
                :on-before-ok="() => deleteHandle(record)"
              >
                <div @click.stop class="w-full flex items-center">{{ t('删除') }}</div>
              </a-popconfirm>
            </a-doption>
            <a-doption
              v-if="record.detailUrl"
              @click.stop="handleCopy(record)"
            >
              {{ t('复制商品链接') }}
            </a-doption>
          </template>
        </a-dropdown>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { categorySellerTree, sellerGoodsList, sellerGoodsManageGoods, sellerGoodsDelete, sellerGoodsShelfBatch } from '@/api/goods'
import { statusData, tableColumns } from './config'
import { useTableList } from '@/hooks/useTableList'
import { cloneDeep } from 'lodash-es'
import { Message } from '@arco-design/web-vue'
import tool from '@/utils/tool'
import { useUserStore, useSystemStore, useCurrencyStore } from '@/store'
import useClipboard from 'vue-clipboard3'
import SpecDialog from './components/spec-dialog.vue'
import EditDialog from './components/edit-dialog.vue'


const { t, locale } = useI18n()
const { toClipboard } = useClipboard()
const userStore = useUserStore()
const systemStore = useSystemStore()
const currencyStore = useCurrencyStore()
const sellerInfo = computed(() => userStore.sellerInfo)

// 是否允许商品下架 - 优先级 1. 店铺设置(1:允许 0:不允许) 2. 系统设置(1:允许 2:不允许)
const allowGoodsOut = computed(() => {
  const soldOutMode = Number(sellerInfo.value.soldOutMode)
  if (soldOutMode === 0) { // 默认没有配置的情况
    const num = systemStore.value.seller_sold_out_switch ? Number(systemStore.value.seller_sold_out_switch) : 1
    return num === 1
  } else {
    return soldOutMode === 1
  }
})

const selectedKeys = ref([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
})

const searchParams = ref({
  name: '',
  id: '',
  isShelf: '',
  categoryId: undefined
})

const { tableData, tableLoading, tableRef, pageObj, getTableData, pageChange, pageSizeChange, searchReset } = useTableList(
  sellerGoodsList,
  {},
  false,
  300,
  {
    opVisible: false
  }
)

const tagBeforeChange = async (data, type) => {
  if (data.isShelf === 0 && type !== 1) {
    Message.error(t('商品已下架，无法进行其他操作'))
    return false
  }
  const params = {
    sellerGoodsId: data.id,
    isShelf: type === 1 ? data.isShelf === 1 ? 0 : 1 : data.isShelf,
    recTime: type === 2 ? data.recTime === 1 ? 0 : 1 : data.recTime,
    isCombo: type === 3 ? data.isCombo === 1 ? 0 : 1 : data.isCombo,
    percent: data.profitRatio,
    discount: data.discountRatio || 0,
    startTime: data.discountStartTime,
    endTime: data.discountEndTime
  }

  if (!params.isShelf) {
    params.isCombo = 0
    params.recTime = 0
  }
  if (!params.startTime || !params.endTime) {
    params.discount = 0
  }

  try {
    await sellerGoodsManageGoods(params)
    data.isShelf = params.isShelf
    data.recTime = params.recTime
    data.isCombo = params.isCombo
    return true
  } catch (error) {
    return false
  }
}

const categoryTreeData = ref([])

// 处理分类数据
const formatCategoryData = (data) => {
  if (!data) return []
  
  const formatNode = (node) => {
    const formattedNode = {
      title: node.name,
      value: node.categoryId,
      key: node.categoryId,
    }
    
    if (node.subList && node.subList.length > 0) {
      formattedNode.children = node.subList.map(item => formatNode(item))
    }
    
    return formattedNode
  }
  
  // 如果data是数组，直接处理每个节点
  if (Array.isArray(data)) {
    return data.map(item => formatNode(item))
  }
  
  // 如果data是单个对象，包装成数组
  return [formatNode(data)]
}

// 获取分类数据
const getCategoryData = async () => {
  try {
    const res = await categorySellerTree()
    const formattedData = formatCategoryData(res)
    categoryTreeData.value = formattedData
  } catch (error) {
    console.error('获取分类数据失败:', error)
  }
}

// 检查选中商品数量
const checkSelectedCount = () => {
  if (!selectedKeys.value.length) {
    Message.error(t('请选择商品'))
    return false
  }

  if (selectedKeys.value.length > 100) {
    Message.error(t('最多批量操作{0}条数据', [100]))
    return false
  }

  return true
}

const batchTitle = computed(() => {
  if (batchType.value === 1) {
    return t('批量上架')
  } else if (batchType.value === 2) {
    return t('批量下架')
  } else if (batchType.value === 3) {
    return t('批量修改')
  } else if (batchType.value === 4) {
    return t('批量删除')
  }
})

const batchTipsText = computed(() => {
  if (batchType.value === 1) {
    return t('确定批量上架所选商品吗？')
  } else if (batchType.value === 2) {
    return t('确定批量下架所选商品吗？')
  } else if (batchType.value === 3) {
    return t('确定批量修改所选商品吗？')
  } else if (batchType.value === 4) {
    return t('确定批量删除所选商品吗？')
  }
})

const batchModalVisible = ref(false)
const batchType = ref(1)

const batchHandle = (type) => {
  if (!checkSelectedCount()) return
  batchType.value = type
  if (type === 3) {
    currentGoodsInfo.value = null
    editDialogVisible.value = true
  } else {
    batchModalVisible.value = true
  }
}

const batchOk = async (done) => {
  const params = {
    sellerGoodsId: selectedKeys.value.join(',')
  }

  if ([1, 2].includes(batchType.value)) {
    params.isShelf = batchType.value === 1 ? 1 : 0
    if (batchType.value === 2) {
      params.recTime = 0
      params.isCombo = 0
    }
    await sellerGoodsShelfBatch(params).then(() => {
      Message.success(t('操作成功'))
      batchModalVisible.value = false
      getTableData()
      done(true)
    }).catch(() => {
      done(false)
    })
  } else if (batchType.value === 4) {
    try {
      await deleteHandle(selectedKeys.value, true)
      batchModalVisible.value = false
      getTableData(true)
      done(true)
    } catch (error) {
      done(false)
    }
  }

  selectedKeys.value = []
}

const searchHandle = () => {
  const data = cloneDeep(searchParams.value)
  selectedKeys.value = []
  getTableData(data)
}

const resetHandle = () => {
  searchParams.value = {
    name: '',
    id: '',
    isShelf: '',
    categoryId: undefined
  }
  selectedKeys.value = []
  searchReset()
}

const goodsUrl = ref('')
const dialogVisible = ref(false)

const openDetails = (data) => {
  const {hostname, origin} = window.location
  const href = ['localhost'].includes(hostname) ? 'https://www.sjiepc.com/#/product/details/' : `${origin}/#/product/details/`
  const hrefUrl = `${href}${data.id}/${locale.value}/${currencyStore.currencyShort}-${currencyStore.currencyUnit}/seller`

  goodsUrl.value = hrefUrl
  dialogVisible.value = true
}

const getProfit = (data) => {
  const num1 = data.discountPrice ? Number(data.discountPrice) : Number(data.sellingPrice)
  const num2 = Number(data.systemPrice)
  const profit = tool.minus(num1, num2)
  return Number(Number(profit).toFixed(2))
}

const handleCopy = async (record) => {
  try {
    await toClipboard(record.detailUrl)
    Message.success(t('复制成功'))
    record.opVisible = false
  } catch (e) {
    console.error(e);
  }
}

const specDialogVisible = ref(false)
const currentGoodsId = ref('')

const handleSpec = (record) => {
  currentGoodsId.value = record.id
  specDialogVisible.value = true
  record.opVisible = false
}

const editDialogVisible = ref(false)
const currentGoodsInfo = ref(null)

const handleEdit = (record) => {
  currentGoodsInfo.value = record
  editDialogVisible.value = true
  record.opVisible = false
}

const deleteHandle = async (data, batch = false) => {
  let sellerGoodsId = ''
  if (batch) {
    sellerGoodsId = data.join(',')
  } else {
    sellerGoodsId = data.id
  }
  const params = {
    sellerGoodsId
  }

  try {
    await sellerGoodsDelete(params)
    Message.success(t('删除成功'))
    if (!batch) {
      data.opVisible = false
    }
    getTableData(true)
  } catch (error) {
    console.error(error)
  }
}

const editDialogDone = () => {
  selectedKeys.value = []
  getTableData(false)
}

onMounted(async () => {
  tableLoading.value = true
  await getCategoryData()
  const currentcategoryId = sessionStorage.getItem('currentcategoryId') || ''
  if (currentcategoryId) {
    searchParams.value.categoryId = currentcategoryId
    sessionStorage.removeItem('currentcategoryId')
  }
  searchHandle()

  await userStore.getGoodsProfit()
  await userStore.getSellerInfo()
})
</script>

<style lang="less" scoped>
.tag-handle-item {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: 10px;
}

.goods-content {
  width: 100%;
  iframe {
    width: 100%;
    height: 600px;
  }
}
</style>