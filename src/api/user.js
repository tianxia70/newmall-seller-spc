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
 * 获取usdt余额 - USD
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
