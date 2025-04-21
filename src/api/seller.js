import { request } from '@/utils/request';

/**
 * 店铺信息
 */
export const sellerInfo = () =>
  request({
    url: '/user/seller/info',
    method: 'post'
  });