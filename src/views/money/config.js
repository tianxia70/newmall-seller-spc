const appName = import.meta.env.VITE_APP
import i18n from '@/i18n'
const { t } = i18n.global

export const contentTypeData = [
  { label: '全部', value: '' },
  { label: '充值订单', value: 'recharge' },
  { label: '提现订单', value: 'withdraw' },
  { label: '推广佣金', value: 'brokerage' },
  { label: '商品采购', value: 'push-order' },
  { label: '商品退款', value: 'return-order-seller' },
  { label: '订单收入', value: 'order-income' },
  { label: '购买直通车', value: 'combo-order' },
  { label: '冻结余额', value: 'updateBalance' },
  { label: '解冻余额', value: 'updateFrozenBalance' },
  { label: '活动赠送', value: 'first-recharge-bonus' },
  { label: '升级礼金', value: 'mall_level_upgrade_award' },
  { label: ['tiktok-wholesale', 'aliExpress-wholesale'].includes(appName) ? '代充值' : '赠送彩金', value: 'jackpot' },
  { label: '扣减彩金', value: 'changesub' },
  { label: '邀请奖励', value: 'invitation-rewards' },
  { label: '注册礼金', value: 'sign-bonus' },
  { label: '等级购买', value: 'pay-level' },
  { label: '余额宝转入', value: 'invest-in' },
  { label: '余额宝转出', value: 'invest-out' },
  { label: '贷款放款', value: 'release-credit' },
  { label: '贷款还款', value: 'pay-credit' },
  { label: '贷款还款被拒', value: 'rollback-pay-credit' }
]

export const tableColumns = [
  {
    title: t('资金类型'),
    dataIndex: 'contentType',
    slotName: 'contentType',
    minWidth: 140
  },
  {
    title: t('订单号'),
    dataIndex: 'orderNo',
    slotName: 'orderNo',
    minWidth: 160
  },
  {
    title: t('变更金额'),
    dataIndex: 'amount',
    slotName: 'amount',
    minWidth: 140
  },
  {
    title: t('变更前'),
    dataIndex: 'amountBefore',
    slotName: 'amountBefore',
    minWidth: 140
  },
  {
    title: t('变更后'),
    dataIndex: 'amountAfter',
    slotName: 'amountAfter',
    minWidth: 140
  },
  {
    title: t('入账时间'),
    dataIndex: 'createTimeStr',
    slotName: 'createTimeStr',
    minWidth: 180
  }
]