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

/**
 * 商家端报表头部
 */
export const sellerReportHead = (data) =>
  request({
    url: '/user/seller/report/head',
    method: 'post',
    data
  });

/**
 * 报表列表
 */
export const sellerReportList = (params) =>
  request({
    url: '/user/seller/report/list',
    method: 'post',
    params
  });
