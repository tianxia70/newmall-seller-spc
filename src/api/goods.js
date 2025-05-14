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
 * 修改商品
 */
export const sellerGoodsManageGoods = (data) =>
  request({
    url: '/user/seller/goods/manageGoods',
    method: 'post',
    data
  });

/**
 * 批量编辑商品
 */
export const sellerGoodsUpdateDisProBatch = (params) =>
  request({
    url: '/user/seller/goods/updateDisProBatch',
    method: 'post',
    params
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

/**
 * 商品删除
 */
export const sellerGoodsDelete = (params) =>
  request({
    url: '/user/seller/goods/delete',
    method: 'post',
    params
  });

/**
 * 商品批量上、下架
 */
export const sellerGoodsShelfBatch = (params) =>
  request({
    url: '/user/seller/goods/shelfBatch',
    method: 'post',
    params
  });

/**
 * 获取商品规格列表
 */
export const sellerGoodsSkuInfo = (params) =>
  request({
    url: '/user/seller/mall/sellerGoodsSkuInfo',
    method: 'post',
    params
  });
