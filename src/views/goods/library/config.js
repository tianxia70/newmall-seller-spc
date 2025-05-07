import i18n from '@/i18n'

const { t } = i18n.global

export const sortData = [
  {
    label: '价格',
    icon: '↑',
    value: 'systemPrice|asc'
  },
  {
    label: '价格',
    icon: '↓',
    value: 'systemPrice|desc'
  },
  {
    label: '发布时间',
    icon: '↑',
    value: 'upTime|asc'
  },
  {
    label: '发布时间',
    icon: '↓',
    value: 'upTime|desc'
  }
]

export const tableColumns = [
  {
    title: t('商品ID'),
    dataIndex: 'id',
    slotName: 'id',
    width: 160
  },
  {
    title: t('封面图'),
    dataIndex: 'poster',
    slotName: 'poster',
    width: 140
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
    width: 150
  },
  {
    title: t('二级分类'),
    dataIndex: 'secondaryCategoryName',
    slotName: 'secondaryCategoryName',
    width: 150
  },
  {
    title: t('采购价格'),
    dataIndex: 'systemPrice',
    slotName: 'systemPrice',
    width: 150
  },
  {
    title: t('操作'),
    dataIndex: 'action',
    slotName: 'action',
    fixed: 'right',
    width: 140
  }
]
