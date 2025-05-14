<template>
  <div class="ma-content-block p-4">
    <a-image-preview-group
      v-model:visible="visible"
      infinite
      :srcList="currentImgList"
    />

    <div class="search-form-content">
      <a-form :model="searchParams" layout="inline">
        <a-form-item :label="t('会员昵称')" field="userName">
          <a-input v-model="searchParams.userName" :placeholder="t('请输入会员昵称')" />
        </a-form-item>
        <a-form-item :label="t('评价')" field="evaluationType">
          <a-select v-model="searchParams.evaluationType" :placeholder="t('请选择')">
            <a-option v-for="item in evaluationTypeData" :key="item.value" :value="item.value">
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
      :data="tableDataRef"
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
      <template #goodsName="{ record }">
        <span>{{ record.goodsVo?.name || '--' }}</span>
      </template>
      <template #evaluationType="{ record }">
        <a-tag :color="evaluationColor[Number(record.evaluationType)]">{{ getTypeName(record.evaluationType) }}</a-tag>
      </template>
      <template #rating="{ record }">
        <a-rate :default-value="Number(record.rating || 5)" readonly />
      </template>
      <template #imgUrl="{ record }">
        <a-link v-if="record.imgUrlArr.length" @click="showImageList(record.imgUrlArr)">{{ t('查看图片') }}</a-link>
        <span v-else>--</span>
      </template>
    </a-table>
  </div>

  
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTableList } from '@/hooks/useTableList'
  import { evaluationPagelist } from '@/api/goods'
  import { evaluationTypeData, evaluationColor, tableColumns } from './config'
  import { cloneDeep } from 'lodash-es'

  const { t } = useI18n()
  const searchParams = ref({
    userName: '',
    evaluationType: ''
  })
  
  const { tableData, tableLoading, getTableData, searchReset, tableRef, pageObj, pageChange, pageSizeChange } = useTableList(evaluationPagelist)

  const tableDataRef = computed(() => {
    return tableData.value.map(item => {
      const obj = {
        ...item,
        content: item.content ? (item.content === '默认好评' ? t('默认好评') : item.content) : t('用户未发表评论')
      }
      const imgArr = []
      for (let i = 1; i < 10; i++) {
        let imgItem = item['imgUrl' + i]
        if (imgItem) {
          imgArr.push(imgItem)
        }
      }
      obj.imgUrlArr = imgArr
      return obj
    })
  })


  const getTypeName = (type) => {
    const obj = evaluationTypeData.find(item => item.value === type)
    if (obj) {
      return t(obj.label)
    }
    return ''
  }

  const searchHandle = () => {
    const data = cloneDeep(searchParams.value)
    getTableData(data)
  }

  const resetHandle = () => {
    searchParams.value = {
      userName: '',
      evaluationType: ''
    }
    searchReset()
  }

  const visible = ref(false)
  const currentImgList = ref([])

  const showImageList = (imgArr) => {
    currentImgList.value = imgArr
    visible.value = true
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