import { request } from '@/utils/request';

/**
 * 店铺信息
 */
export const sellerInfo = () =>
  request({
    url: '/user/seller/info',
    method: 'post'
  });

/**
 * 修改店铺信息
 */
export const sellerUpdate = (params) =>
  request({
    url: '/user/seller/update',
    method: 'post',
    params
  });
