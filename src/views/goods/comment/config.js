const appName = import.meta.env.VITE_APP
import i18n from '@/i18n'
const { t } = i18n.global

export const evaluationTypeData = [
  { label: '全部', value: '' },
  { label: '好评', value: 1 },
  { label: '中评', value: 2 },
  { label: '差评', value: 3 }
]

export const evaluationColor = ['gray', 'green', 'blue', 'red']

export const tableColumns = [
  {
    title: t('商品名称'),
    dataIndex: 'goodsName',
    slotName: 'goodsName',
    minWidth: 160,
    ellipsis: true,
    tooltip: true
  },
  {
    title: t('会员昵称'),
    dataIndex: 'userName',
    slotName: 'userName',
    width: 120
  },
  {
    title: t('评价'),
    dataIndex: 'evaluationType',
    slotName: 'evaluationType',
    width: 120
  },
  {
    title: t('评分'),
    dataIndex: 'rating',
    slotName: 'rating',
    width: 180
  },
  {
    title: t('评价内容'),
    dataIndex: 'content',
    slotName: 'content',
    minWidth: 200,
    ellipsis: true,
    tooltip: true
  },
  {
    title: t('评价图片'),
    dataIndex: 'imgUrl',
    slotName: 'imgUrl',
    width: 140
  },
  {
    title: t('评论时间'),
    dataIndex: 'evaluationTime',
    slotName: 'evaluationTime',
    width: 180
  }
]