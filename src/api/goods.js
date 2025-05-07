import { request } from '@/utils/request';

/**
 * 获取商品库总分类
 */
export const categoryTree = () =>
  request({
    url: '/user/category/tree',
    method: 'get'
  });

/**
 * 获取店铺商品分类
 */
export const categorySellerTree = (params) =>
  request({
    url: '/user/category/sellerTree',
    method: 'get',
    params
  });

/**
 * 商品库
 */
export const sellerSysGoodsList = (data) =>
  request({
    url: '/user/seller/sysgoods/list',
    method: 'post',
    data
  });

/**
 * 添加商品
 */
export const sellerGoodsAddOrUpdate = (data) =>
  request({
    url: '/user/seller/goods/addOrUpdate',
    method: 'post',
    data
  });

  /**
 * 店铺商品列表
 */
export const sellerGoodsList = (params) =>
  request({
    url: '/user/seller/goods/list',
    method: 'post',
    params
  });
