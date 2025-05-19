import { request } from '@/utils/request';

/**
 * 帐户登录
 */
export const userLogin = (data) =>
  request({
    url: '/user/login',
    method: 'post',
    data
  });

/**
 * 帐户免密登录
 */
export const userLoginSeller = (params) =>
  request({
    url: '/user/loginSeller',
    method: 'post',
    params
  });

/**
 * 注册验证码
 */
export const sendCaptchCodeNoneLogin = (params) =>
  request({
    url: '/user/sendCaptchCodeNoneLogin',
    method: 'post',
    params
  });


/**
 * 用户注册-商家简易版
 */

export const sellerV2Register = (data) =>
  request({
    url: '/user/seller/v2/register',
    method: 'post',
    data
  });

/**
 * 用户信息
 */
export const userCurrentGet = () =>
  request({
    url: '/user/current/get',
    method: 'get'
  });

/**
 * 获取usdt余额 - USDT
 */
export const userWalletGetUsdt = () =>
  request({
    url: '/user/wallet/getUsdt',
    method: 'post'
  });

/**
 * 获取usdt余额 - 带币种参数
 */
export const userWalletGetMyWallet = () =>
  request({
    url: '/user/wallet/getMyWallet',
    method: 'post'
  });

/**
 * 实名认证
 */
export const kycApply = (params) =>
  request({
    url: '/user/kyc/apply',
    method: 'post',
    params
  });

/**
 * 获取实名认证信息
 */
export const kycGetInfo = () =>
  request({
    url: '/user/kyc/get',
    method: 'get'
  });

/**
 * 修改用户头像
 */
export const refreshAvatar = (data) =>
  request({
    url: '/user/refreshAvatar',
    method: 'post',
    data
  });

/**
 * 商品利润比例
 */
export const sellerGetGoodsProfit = () =>
  request({
    url: '/user/seller/getGoodsProfit',
    method: 'get'
  });

/**
 * 设置资金密码
 */
export const setSafewordReg = (params) =>
  request({
    url: '/user/setSafewordReg',
    method: 'post',
    params
  });

/**
 * 余额宝信息
 */
export const sellerInvestInfo = () =>
  request({
    url: '/user/seller/invest/info',
    method: 'get'
  });

/**
 * 余额宝配置信息
 */
export const sellerInvestConfig = () =>
  request({
    url: '/user/seller/invest/config',
    method: 'get'
  });

/**
 * 余额宝转入-转出
 */
export const sellerInvestTransfer = (data) =>
  request({
    url: '/user/seller/invest/transfer',
    method: 'post',
    data
  });

/**
 * 余额宝收益记录
 */
export const sellerInvestList = (params) =>
  request({
    url: '/user/seller/invest/list',
    method: 'get',
    params
  });

/**
 * 提现记录
 */
export const withdrawPageList = (params) =>
  request({
    url: '/user/withdraw/pagelist',
    method: 'post',
    params
  });

/**
 * 充值记录
 */
export const rechargePageList = (params) =>
  request({
    url: '/user/recharge/pagelist',
    method: 'post',
    params
  });

/**
 * 领取邀请好友奖励
 */
export const receiveInviteRewards = () =>
  request({
    url: '/user/seller/receiveInviteRewards',
    method: 'post'
  });

/**
 * 更新活动状态
 */
export const beforeReceiveBonus = () =>
  request({
    url: '/user/seller/beforeReceiveBonus',
    method: 'post'
  });

/**
 * 推广-邀请链接
 */
export const sellerMyPromotional = () =>
  request({
    url: '/user/seller/myPromotional',
    method: 'post'
  });

/**
 * 推广-我的下级
 */
export const sellerTeamLevel = (params) =>
  request({
    url: '/user/seller/teamLevel',
    method: 'post',
    params
  });

/**
 * 领取礼金
 */
export const receiveBonus = (params) =>
  request({
    url: '/user/seller/receiveBonus',
    method: 'post',
    params
  });

/**
 * 获取可充值的币种
 */
export const channelBlockchainList = () =>
  request({
    url: '/user/channelBlockchain/list',
    method: 'post'
  });

/**
 * 充值 首次进入页面，传递session_token
 */
export const rechargeOpen = (data) =>
  request({
    url: '/user/recharge/open',
    method: 'post',
    data
  });

/**
 * 汇率
 */
export const rechargeFee = (params) =>
  request({
    url: '/user/recharge/fee',
    method: 'post',
    params
  });

/**
 * 充值申请
 */
export const rechargeApply = (params) =>
  request({
    url: '/user/recharge/apply',
    method: 'post',
    params
  });

/**
 * 提取提现相关的限制配置信息
 */
export const withdrawLimitConfig = (params) =>
  request({
    url: '/user/withdraw/withdrawLimitConfig',
    method: 'post',
    params
  });

/**
 * 提现 - session_token
 */
export const withdrawOpen = () =>
  request({
    url: '/user/withdraw/withdrawOpen',
    method: 'post'
  });

/**
 * 提现费率
 */
export const withdrawFee = (params) =>
  request({
    url: '/user/withdraw/fee',
    method: 'post',
    params
  });

/**
* 绑定提现地址
*/
export const bindWithdrawAddress = (params) =>
  request({
    url: '/user/bindWithdrawAddress',
    method: 'post',
    params
  });

/**
* 提现申请
*/
export const withdrawApply = (params) =>
  request({
    url: '/user/withdraw/apply',
    method: 'post',
    params
  });

/**
* 资金记录
*/
export const pageListMoneyLog = (params) =>
  request({
    url: '/user/pageListMoneyLog',
    method: 'get',
    params
  });

/**
* 修改资金密码
*/
export const updateOldAndNewSafeword = (params) =>
  request({
    url: '/user/updateOldAndNewSafeword',
    method: 'post',
    params
  });

/**
* 修改登录密码
*/
export const userPassword = (data) =>
  request({
    url: '/user/password',
    method: 'post',
    data
  });

/**
* 注销账号
*/
export const userLogoff = (params) =>
  request({
    url: '/user/logoff',
    method: 'post',
    params
  });
