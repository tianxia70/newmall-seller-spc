import i18n from '@/i18n'
const { t } = i18n.global

export const navData = [
  {
    name: t('一级好友'),
    key: '1'
  },
  {
    name: t('二级好友'),
    key: '2'
  },
  {
    name: t('三级好友'),
    key: '3'
  }
]

export const tableColumns = [
  {
    title: t('店铺LOGO'),
    dataIndex: 'avatar',
    slotName: 'avatar',
    width: 100
  },
  {
    title: t('店铺名称'),
    dataIndex: 'name',
    slotName: 'name',
    width: 140,
    ellipsis: true,
    tooltip: true
  },
  {
    title: t('收益'),
    dataIndex: 'rebate',
    slotName: 'rebate',
    width: 120
  },
  {
    title: t('订单'),
    dataIndex: 'countOrder',
    slotName: 'countOrder',
    width: 120
  },
  {
    title: t('注册日期'),
    dataIndex: 'regTime',
    slotName: 'regTime',
    width: 180
  }
]