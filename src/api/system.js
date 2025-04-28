import { request } from '@/utils/request';

/**
 * 获取系统参数配置
 */
export const sysConfigGetSyspara = (params) =>
  request({
    url: '/user/sysconfig/getSyspara',
    method: 'get',
    params
  });

/**
 * 当前时区
 */
export const getTimeZone = () =>
  request({
    url: '/user/getTimeZone',
    method: 'get'
  });

/**
 * 系统公告
 */
export const bulletinList = () =>
  request({
    url: '/user/bulletin/list',
    method: 'post'
  });

/**
 * 用户指定消息-获取
 */
export const sellerNoticeGet = () =>
  request({
    url: '/user/seller/notice/get',
    method: 'get'
  });

/**
 * 用户指定消息-已读
 */
export const sellerNoticeRead = (params) =>
  request({
    url: '/user/seller/notice/read',
    method: 'post',
    params
  });

/**
 * 统计未采购数量
 */
export const sellerMallStatNoPushNum = () =>
  request({
    url: '/user/seller/mall/statNoPushNum',
    method: 'post'
  });

/**
 * 站内信列表 PC端分页查看消息记录
 */
export const notificationPagelistMessage = (params) =>
  request({
    url: '/user/notification/pagelistMessage',
    method: 'get',
    params
  });

/**
 * 站内信未读数量
 */
export const notificationUnreadCount = (params) =>
  request({
    url: '/user/notification/unreadCount',
    method: 'get',
    params
  });

/**
 * 站内信 变成已读
 */
export const notificationRead = (params) =>
  request({
    url: '/user/notification/read',
    method: 'post',
    params
  });

/**
 * 站内信 全部已读
 */
export const notificationReadAll = () =>
  request({
    url: '/user/notification/readAll',
    method: 'post'
  });

/**
 * 是否开启上传合同
 */
export const sysconfigGetSysParaSign = () =>
  request({
    url: '/user/sysconfig/getSysParaSign',
    method: 'post'
  });

/**
 * 图片上传
 */
export const imageUpload = (data) =>
  request({
    url: '/user/uploadimg',
    method: 'post',
    data
  });

/**
 * 签合同
 */
export const sellerUpdateSignPdf = (params) =>
  request({
    url: '/user/seller/updateSignPdf',
    method: 'get',
    params
  });

/**
 * 获取帐变消息
 */
export const addMoneyNotify = () =>
  request({
    url: '/user/addMoneyNotify',
    method: 'get'
  });

/**
 * 帐变消息回调
 */
export const notifyCallback = (params) =>
  request({
    url: '/user/notifyCallback',
    method: 'get',
    params
  });

/**
 * 获取国家地区列表
 */
export const getCountryList = (parentId) =>
  request({
    url: `/user/area/list/${parentId}`,
    method: 'get'
  });
