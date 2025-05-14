<template>
  <a-modal
    :visible="visible"
    :width="900"
    :mask-closable="false"
    :esc-to-close="false"
    :on-before-cancel="handleCancel"
  >
    <template #title>{{ t('商品规格') }}</template>
    
    <a-table
      :columns="columnsRef"
      :data="tableData"
      :bordered="true"
      :pagination="false"
      :scroll="{ y: 500 }"
      :loading="tableLoading"
    >
      <template #systemPrice="{ record }">
        <pc-number :data="record.systemPrice" :color="true" />
      </template>
      <template #sellingPrice="{ record }">
        <pc-number :data="record.sellingPrice" :color="true" />
      </template>
      <template #discountPrice="{ record }">
        <span v-if="record.discountPrice">
          <span v-if="Number(record.discountPrice) === Number(record.sellingPrice)">--</span>
          <pc-number v-else :data="record.discountPrice" :color="true" />
        </span>
        <span v-else>{{ '--' }}</span>
      </template>
      <template #profit="{ record }">
        <pc-number :data="getProfit(record)" :color="true" />
      </template>
    </a-table>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { sellerGoodsSkuInfo } from '@/api/goods'
import tool from '@/utils/tool'


const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  goodsId: {
    type: [String, Number],
    default: ''
  }
})

const emits = defineEmits(['update:visible'])

const handleCancel = () => {
  emits('update:visible', false)
}

const columnsData = [
  {
    title: t('采购价格'), 
    dataIndex: 'systemPrice',
    slotName: 'poster',
    width: 120
  },
  {
    title: t('销售价格'),
    dataIndex: 'sellingPrice',
    slotName: 'sellingPrice',
    width: 120
  },
  {
    title: t('折扣价'),
    dataIndex: 'discountPrice',
    slotName: 'discountPrice',
    width: 120
  },
  {
    title: t('利润'),
    dataIndex: 'profit',
    slotName: 'profit',
    width: 120
  }
]

const columnsRef = ref([...columnsData])

const tableLoading = ref(false)
const tableData = ref([])

const getProfit = (data) => {
  const num1 = data.discountPrice ? Number(data.discountPrice) : Number(data.sellingPrice)
  const num2 = Number(data.systemPrice)
  const profit = tool.minus(num1, num2)
  return Number(Number(profit).toFixed(2))
}

const getSkuInfo = () => {
  tableLoading.value = true
  sellerGoodsSkuInfo({ sellerGoodsId: props.goodsId }).then((res) => {
    const { attrNames, sellerGoodsSkuDtoList } = res
    if (attrNames && attrNames.length) {
      const attrArr = []
      for (let i = 0; i < attrNames.length; i++) {
        attrArr.push({
          title: attrNames[i],
          dataIndex: `spec_header_${i}`,
          slotName: `spec_header_${i}`,
          width: 120
        })
      }
      columnsRef.value = [...attrArr, ...columnsRef.value]
    }

    sellerGoodsSkuDtoList.forEach(item => {
      if (item.goodsAttributeVos.length) {
        for (let i = 0; i < item.goodsAttributeVos.length; i++) {
          const { attrValue } = item.goodsAttributeVos[i]
          item[`spec_header_${i}`] = attrValue || '--'
        }
      }
    })

    tableData.value = sellerGoodsSkuDtoList || []
    tableLoading.value = false
  }).catch(() => {
    tableLoading.value = false
  })
}
watch(() => props.visible, (val) => {
  if (!val) {
    tableLoading.value = false
    tableData.value = []
    columnsRef.value = [...columnsData]
  } else {
    getSkuInfo()
  }
})

</script>
