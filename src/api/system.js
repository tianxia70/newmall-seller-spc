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
