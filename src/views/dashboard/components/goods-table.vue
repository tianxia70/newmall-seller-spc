<template>
  <a-table
    :columns="tableColumns"
    :data="goodsData"
    :bordered="true"
    :pagination="false"
  >
    <template #sellingPrice="{ record }">
      <pc-number :data="record.sellingPrice" />
    </template>
    <template #soldNum="{ record }">
      <pc-number :data="record.soldNum" :currency="false" :decimals="0" />
    </template>
  </a-table>
</template>

<script setup>
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const props = defineProps({
    goodsData: {
      type: Array,
      default: () => []
    }
  })

  const tableColumns = ref([
    {
      title: t('商品名称'),
      dataIndex: 'name',
      slotName: 'name',
      ellipsis: true,
      tooltip: true,
      minWidth: 200
    },
    {
      title: t('价格'),
      dataIndex: 'sellingPrice',
      slotName: 'sellingPrice',
      width: 160
    },
    {
      title: t('销量'),
      dataIndex: 'soldNum',
      slotName: 'soldNum',
      width: 100
    }
  ])
</script>