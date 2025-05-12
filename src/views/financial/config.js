import i18n from '@/i18n'
const { t } = i18n.global

export const reportData = [
  {
    title: '待到账金额',
    number: 0,
    color: '#41A3FF',
    currency: true,
    decimals: 2,
    key: 'willIncome'
  },
  {
    title: '总销售额',
    number: 0,
    color: '#54C1FF',
    currency: true,
    decimals: 2,
    key: 'totalSales'
  },
  {
    title: '总利润',
    number: 0,
    color: '#3CCDC4',
    currency: true,
    decimals: 2,
    key: 'totalProfit'
  },
  {
    title: '总订单',
    number: 0,
    color: '#FF6F4F',
    currency: false,
    decimals: 0,
    key: 'orderNum'
  },
  {
    title: '取消订单',
    number: 0,
    color: '#757F8F',
    currency: false,
    decimals: 0,
    key: 'orderCancel'
  },
  {
    title: '退款订单',
    number: 0,
    color: '#DD4E4E',
    currency: false,
    decimals: 0,
    key: 'orderReturns'
  }
]

export const reportFilter = [
  {
    label: '全部',
    value: 0
  },
  {
    label: '今日',
    value: 1
  },
  {
    label: '昨日',
    value: 2
  },
  {
    label: '本周',
    value: 3
  },
  {
    label: '本月',
    value: 4
  },
  {
    label: '本年',
    value: 5
  }
]


export const tableColumns = [
  {
    title: t('日期'),
    dataIndex: 'dayString',
    slotName: 'dayString',
    minWidth: 140
  },
  {
    title: t('总订单'),
    dataIndex: 'orderNum',
    slotName: 'orderNum',
    minWidth: 140
  },
  {
    title: t('总销售额'),
    dataIndex: 'totalSales',
    slotName: 'totalSales',
    minWidth: 140
  },
  {
    title: t('利润'),
    dataIndex: 'totalProfit',
    slotName: 'totalProfit',
    minWidth: 140
  },
  {
    title: t('取消订单'),
    dataIndex: 'orderCancel',
    slotName: 'orderCancel',
    minWidth: 140
  },
  {
    title: t('退款订单'),
    dataIndex: 'orderReturns',
    slotName: 'orderReturns',
    minWidth: 140
  }
]
