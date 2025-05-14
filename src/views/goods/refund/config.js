import i18n from '@/i18n'
const { t } = i18n.global

export const returnStatusData = [
  { label: '全部', value: '' },
  { label: '未退款', value: 0 },
  { label: '退款中', value: 1 },
  { label: '退款成功', value: 2 },
  { label: '退款失败', value: 3 }
]

export const returnStatusColor = ['gray', 'blue', 'green', 'red']

export const returnReasonData = [
  { label: '未收到货', value: 1 },
  { label: '不喜欢、不想要', value: 2 },
  { label: '卖家发错货', value: 3 },
  { label: '假冒品牌', value: 4 },
  { label: '少发、漏发', value: 5 },
  { label: '收到商品破损', value: 6 },
  { label: '存在质量问题', value: 7 },
  { label: '与商家协商一致退款', value: 8 },
  { label: '其他原因', value: 9 },
]

export const tableColumns = [
  {
    title: t('订单号'),
    dataIndex: 'id',
    slotName: 'id',
    minWidth: 160
  },
  {
    title: t('申请日期'),
    dataIndex: 'refundTime',
    slotName: 'refundTime',
    minWidth: 180
  },
  {
    title: t('退款理由'),
    dataIndex: 'returnReason',
    slotName: 'returnReason',
    minWidth: 140
  },
  {
    title: t('退款说明'),
    dataIndex: 'returnDetail',
    slotName: 'returnDetail',
    minWidth: 140
  },
  {
    title: t('商品金额'),
    dataIndex: 'returnPrice',
    slotName: 'returnPrice',
    minWidth: 140
  },
  {
    title: t('状态'),
    dataIndex: 'returnStatus',
    slotName: 'returnStatus',
    minWidth: 140
  },
  {
    title: t('操作'),
    dataIndex: 'action',
    slotName: 'action',
    fixed: 'right',
    width: 120
  }
]

export const goodsColumns = [
  {
    title: t('封面图'),
    dataIndex: 'goodsIcon',
    slotName: 'goodsIcon',
    width: 100
  },
  {
    title: t('产品名称'),
    dataIndex: 'goodsName',
    slotName: 'goodsName',
    minWidth: 140,
    ellipsis: true,
    tooltip: true
  },
  {
    title: t('规格'),
    dataIndex: 'goodsSpec',
    slotName: 'goodsSpec',
    minWidth: 120
  },
  {
    title: t('数量'),
    dataIndex: 'goodsNum',
    slotName: 'goodsNum',
    width: 100
  },
  {
    title: t('单价'),
    dataIndex: 'goodsReal',
    slotName: 'goodsReal',
    minWidth: 120
  }
]