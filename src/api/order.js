import { request } from '@/utils/request';

/**
 * 店铺订单列表
 */
export const orderPagelist = (params) =>
  request({
    url: '/user/order/pagelist',
    method: 'post',
    params
  });

/**
 * 订单详情
 */
export const orderInfo = (params) =>
  request({
    url: '/user/order/info',
    method: 'get',
    params
  });

/**
 * 订单采购
 */
export const orderPush = (params) =>
  request({
    url: '/user/order/push',
    method: 'post',
    params
  });

/**
 * 物流信息
 */
export const orderListOrderLog = (params) =>
  request({
    url: '/user/order/listOrderLog',
    method: 'get',
    params
  });
