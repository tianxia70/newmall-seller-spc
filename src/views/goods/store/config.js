import i18n from '@/i18n'

const { t } = i18n.global

export const statusData = [
  {
    label: '全部',
    value: ''
  },
  {
    label: '上架',
    value: 1
  },
  {
    label: '下架',
    value: 0
  }
]

export const tableColumns = [
  {
    title: t('商品ID'),
    dataIndex: 'goodsId',
    slotName: 'goodsId',
    width: 140
  },
  {
    title: t('封面图'),
    dataIndex: 'poster',
    slotName: 'poster',
    width: 120
  },
  {
    title: t('商品名称'),
    dataIndex: 'name',
    slotName: 'name',
    minWidth: 240
  },
  {
    title: t('分类'),
    dataIndex: 'categoryName',
    slotName: 'categoryName',
    width: 135
  },
  {
    title: t('二级分类'),
    dataIndex: 'secondaryCateName',
    slotName: 'secondaryCateName',
    width: 135
  },
  {
    title: t('采购价格'),
    dataIndex: 'systemPrice',
    slotName: 'systemPrice',
    width: 120
  },
  {
    title: t('标签'),
    dataIndex: 'tagHandle',
    slotName: 'tagHandle',
    width: 190
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
  },
  {
    title: t('累计销量'),
    dataIndex: 'soldNum',
    slotName: 'soldNum',
    width: 90
  },
  {
    title: t('操作'),
    dataIndex: 'action',
    slotName: 'action',
    fixed: 'right',
    width: 140
  }
]
