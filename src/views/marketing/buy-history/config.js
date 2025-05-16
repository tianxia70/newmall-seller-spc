import i18n from '@/i18n'
const { t } = i18n.global

export const tableColumns = [
  {
    title: t('购买套餐'),
    dataIndex: 'name',
    slotName: 'name',
    minWidth: 160,
    ellipsis: true,
    tooltip: true
  },
  {
    title: t('购买时间'),
    dataIndex: 'startTime',
    slotName: 'startTime',
    minWidth: 180
  },
  {
    title: t('到期时间'),
    dataIndex: 'stopTime',
    slotName: 'stopTime',
    minWidth: 140
  },
  {
    title: t('付款金额'),
    dataIndex: 'prize',
    slotName: 'prize',
    minWidth: 140
  }
]
