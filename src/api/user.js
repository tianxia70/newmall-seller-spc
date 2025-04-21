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
 * 用户信息
 */
export const userCurrentGet = () =>
  request({
    url: '/user/current/get',
    method: 'get'
  });

/**
 * 获取usdt余额 - (没有做币种转换，已弃用)
 */
export const userWalletGetUsdt = () =>
  request({
    url: '/user/wallet/getUsdt',
    method: 'post'
  });

/**
 * 获取usdt余额 - 币种切换用
 */
export const userWalletGetMyWallet = () =>
  request({
    url: '/user/wallet/getMyWallet',
    method: 'post'
  });
