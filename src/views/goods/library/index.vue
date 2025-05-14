<template>
  <div class="ma-content-block p-4">
    <!-- 添加弹窗 -->
    <add-dialog v-model:visible="dialogVisible" :ids="addIds" :goods-info="currentGoods" @done="searchHandle"></add-dialog>

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
        <a-form-item :label="t('排序')" field="sort">
          <a-select v-model="searchParams.sort" :placeholder="t('请选择')">
            <a-option v-for="item in sortData" :key="item.value" :value="item.value">
              {{ `${t(item.label)} ${item.icon}` }}
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
      <a-button type="primary" class="flex items-center gap-1" @click="batchAddHandle">
        {{ t('批量添加') }}
        <span v-if="selectedKeys.length">({{ selectedKeys.length }})</span>
        <a-tooltip :content="t('最多批量操作{0}条数据', [100])">
          <icon-exclamation-circle-fill />
        </a-tooltip>
      </a-button>
      <a-button v-if="selectedKeys.length" @click="selectedKeys = []">{{ t('取消') }}</a-button>
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
      <template #systemPrice="{ record }">
        <pc-number :data="record.systemPrice" :color="true" />
      </template>
      <template #action="{ record }">
        <a-button type="primary" size="small" @click="addHandle(record)">{{ t('添加') }}</a-button>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { categoryTree, sellerSysGoodsList } from '@/api/goods'
import { sortData, tableColumns } from './config'
import { useTableList } from '@/hooks/useTableList'
import { cloneDeep } from 'lodash-es'
import { Message } from '@arco-design/web-vue'
import AddDialog from './components/add-dialog.vue'
import { useUserStore } from '@/store'

const { t } = useI18n()
const userStore = useUserStore()
const sellerInfo = computed(() => userStore.sellerInfo)

const dialogVisible = ref(false)
const addIds = ref([])
const currentGoods = ref(null)

const selectedKeys = ref([])
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
})

const searchParams = ref({
  name: '',
  id: '',
  sort: '',
  categoryId: undefined
})

const { tableData, tableLoading, tableRef, pageObj, getTableData, pageChange, pageSizeChange, searchReset } = useTableList(sellerSysGoodsList)

const categoryTreeData = ref([])

// 检查店铺和实名认证状态
const checkSellerStatus = () => {
  const sellerSettingFlag = Number(sellerInfo.value.sellerSettingFlag)
  const sellerKycFlag = Number(sellerInfo.value.sellerKycFlag)

  if (!sellerSettingFlag) {
    Message.error(t('店铺基础信息不完整'))
    return false
  }

  if (!sellerKycFlag) {
    Message.error(t('实名认证尚未完成'))
    return false
  }

  return true
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
    const res = await categoryTree()
    const formattedData = formatCategoryData(res)
    categoryTreeData.value = formattedData
  } catch (error) {
    console.error('获取分类数据失败:', error)
  }
}

const searchHandle = () => {
  const data = cloneDeep(searchParams.value)
  if (data.sort) {
    data.orderBy = [
      {
        attrName: data.sort.split('|')[0],
        order:  data.sort.split('|')[1]
      }
    ]
    delete data.sort
  }
  selectedKeys.value = []
  getTableData(data)
}

const resetHandle = () => {
  searchParams.value = {
    name: '',
    id: '',
    sort: '',
    categoryId: undefined
  }
  selectedKeys.value = []
  searchReset()
}

const addHandle = (record) => {
  if (!checkSellerStatus()) return

  selectedKeys.value = []
  currentGoods.value = record
  addIds.value = [record.id]
  dialogVisible.value = true
}

const batchAddHandle = () => {
  if (!checkSellerStatus()) return
  if (!checkSelectedCount()) return

  currentGoods.value = null
  addIds.value = cloneDeep(selectedKeys.value)
  dialogVisible.value = true
}

onMounted(async () => {
  getCategoryData()
  await userStore.getGoodsProfit()
})
</script>
