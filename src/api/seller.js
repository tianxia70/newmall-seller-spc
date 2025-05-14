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

/**
 * 商家个人中心控制面板数据展示
 */
export const sellerHead = () =>
  request({
    url: '/user/seller/head',
    method: 'post'
  });

/**
 * 商家个人中心控制面板订单数量展示
 */
export const sellerStats = (params) =>
  request({
    url: '/user/seller/stats',
    method: 'post',
    params
  });

/**
 * 商家个人中心控制面板数据折线
 */
export const sellerLine = (params) =>
  request({
    url: '/user/seller/line',
    method: 'post',
    params
  });

/**
 * 获取店铺首页分类数据
 */
export const mallCategoryGoodCount = (params) =>
  request({
    url: '/user/seller/mall/categoryGoodCount',
    method: 'post',
    params
  });
