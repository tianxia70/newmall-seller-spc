import i18n from '@/i18n'
const { t } = i18n.global
const appName = import.meta.env.VITE_APP

export const navData = [
  {
    name: t('全部订单'),
    key: '1',
    type: '',
    status: ''
  },
  {
    name: t('待采购'),
    key: '2',
    purchStatus: 0,
    status: 1
  },
  {
    name: t('已采购'),
    key: '3',
    purchStatus: 1,
    status: 1
  },
  {
    name: t('未发货'),
    key: '4',
    purchStatus: '',
    status: 2
  },
  {
    name: t('已发货'),
    key: '5',
    purchStatus: '',
    status: 3
  },
  {
    name: t('已完成'),
    key: '6',
    purchStatus: '',
    status: ['argos'].includes(appName) ? 4 : 5
  }
]

export const payStatusData = [
  { label: '全部', value: '' },
  { label: '未支付', value: 0 },
  { label: '已支付', value: 1 }
]

export const statusData = [
  { label: '全部', value: '' },
  { label: '订单已取消', value: -1 },
  { label: '等待买家付款', value: 0 },
  { label: '买家已付款', value: 1 },
  { label: '供应商已接单', value: 2 },
  { label: '物流运输中', value: 3 },
  { label: ['argos'].includes(appName) ? '订单已完成' : '买家已签收', value: 4 },
  { label: ['argos'].includes(appName) ? '买家已签收' : '订单已完成', value: 5 },
  { label: '退款订单', value: 6 }
]

export const tableColumns = [
  {
    title: t('订单编号'),
    dataIndex: 'id',
    slotName: 'id',
    width: 170
  },
  {
    title: t('收货人姓名'),
    dataIndex: 'contacts',
    slotName: 'contacts',
    width: 120
  },
  {
    title: t('商品金额'),
    dataIndex: 'prizeReal',
    slotName: 'prizeReal',
    width: 120
  },
  {
    title: t('采购价格'),
    dataIndex: 'sellerDiscountPrice',
    slotName: 'sellerDiscountPrice',
    width: 120
  },
  {
    title: t('利润'),
    dataIndex: 'profit',
    slotName: 'profit',
    width: 120
  },
  {
    title: t('支付状态'),
    dataIndex: 'payStatus',
    slotName: 'payStatus',
    width: 120
  },
  {
    title: t('采购状态'),
    dataIndex: 'purchStatus',
    slotName: 'purchStatus',
    width: 120
  },
  {
    title: t('物流状态'),
    dataIndex: 'status',
    slotName: 'status',
    width: 120
  },
  {
    title: t('下单时间'),
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 180
  },
  {
    title: t('订单超时'),
    dataIndex: 'overTime',
    slotName: 'overTime',
    width: 160
  },
  {
    title: t('操作'),
    dataIndex: 'action',
    slotName: 'action',
    fixed: 'right',
    width: 140
  }
]

export const goodsColumns = [
  {
    title: t('封面图'),
    dataIndex: 'goodsIcon',
    slotName: 'goodsIcon',
    width: 80
  },
  {
    title: t('产品名称'),
    dataIndex: 'goodsName',
    slotName: 'goodsName',
    minWidth: 120,
    ellipsis: true,
    tooltip: true
  },
  {
    title: t('数量'),
    dataIndex: 'goodsNum',
    slotName: 'goodsNum',
    width: 80
  },
  {
    title: t('销售价格'),
    dataIndex: 'goodsPrize',
    slotName: 'goodsPrize',
    width: 100
  },
  {
    title: t('折扣价'),
    dataIndex: 'goodsReal',
    slotName: 'goodsReal',
    width: 100
  },
  {
    title: t('采购价格'),
    dataIndex: 'systemPrice',
    slotName: 'systemPrice',
    width: 100
  },
  {
    title: t('优惠价'),
    dataIndex: 'sellerDiscount',
    slotName: 'sellerDiscount',
    width: 100
  },
  {
    title: t('利润'),
    dataIndex: 'profit',
    slotName: 'profit',
    width: 100
  }
]