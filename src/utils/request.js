import axios from "axios";
import i18n from "@/i18n";
import { Notification } from '@arco-design/web-vue';
import { getToken } from "@/utils/token-util.js";
import { isEmpty } from "lodash-es";
import moment from "moment-timezone";
import { Message } from '@arco-design/web-vue'
import { useUserStore } from "@/store";
import { useCurrencyStore } from '@/store'
import qs from "qs";
import { APP_PROXY_PREFIX } from '@/configs'
import { extractNumbers, numberStrFormat } from '@/utils'

function createExternalService() {
  // 创建一个外部网络 axios 实例
  const service = axios.create();

  // HTTP request 拦截器
  service.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  // HTTP response 拦截器
  service.interceptors.response.use(
    (response) => response,
    (error) => {
      Promise.reject(error.response ?? null);
    }
  );
  return service;
}

function createService() {
  // 创建一个 axios 实例
  const service = axios.create();

  // HTTP request 拦截器
  service.interceptors.request.use(
    (config) => config,
    (error) => {
      console.log(error);
      // 失败
      return Promise.reject(error);
    }
  );

  // HTTP response 拦截器
  service.interceptors.response.use(
    (response) => {
      const userStore = useUserStore();
      
      const disposition =
        response.headers["content-disposition"] ||
        response.headers["Content-Disposition"] ||
        null;
      if (
        (disposition ||
          !/^application\/json/.test(response.headers["content-type"])) &&
        response.status === 200
      ) {
        return response;
      } else if (response.data.size) {
        response.data.code = 500;
        response.data.message = i18n.global.t("服务器内部错误");
        response.data.success = false;
      }

      const { errCode, data, msg } = response.data;
      if (errCode !== 200000) {
        if (errCode === 400003) {
          userStore.logout()
          return
        }
        let resInfo = {
          msg,
          data
        }
        // 带参错误提示，多语言重构
        if (msg && msg.indexOf('首次上架账户资金') > -1) {
          let num = 0
          if (data && data._$1) {
            num = data._$1
          } else {
            num = extractNumbers(msg).length ? extractNumbers(msg)[0] : '0'
          }
          num = numberStrFormat(num)
          resInfo = {
            msg: '首次上架账户资金≥{_$1}，请充值后再试',
            data: {_$1: num}
          }
        }

        if (msg && msg.indexOf('当前等级可售商品数量为') > -1) {
          let num = 0
          if (data && data._$1) {
            num = data._$1
          } else {
            num = extractNumbers(msg).length ? extractNumbers(msg)[0] : '0'
          }
          resInfo = {
            msg: '添加失败，当前等级可售商品数量：{noLevelGoodsNum}',
            data: {noLevelGoodsNum: num}
          }
        }

        if (msg && msg.indexOf('最多推广商品数量为') > -1) {
          let num = 0
          if (data && data._$1) {
            num = data._$1
          } else {
            num = extractNumbers(msg).length ? extractNumbers(msg)[0] : '0'
          }
          resInfo = {
            msg: '最多推广商品数量为{_$1}',
            data: {_$1: num}
          }
        }

        Notification.error({
          title: i18n.global.t('错误'),
          content: i18n.global.t(resInfo.msg, resInfo.data) || 'Error',
        })

        return Promise.reject('error');
      } else {
        if (response.data.total || response.data.total === 0) {
          return Promise.resolve({
            pageList: data,
            pageInfo: {
              totalElements: response.data.total
            }
          });
        } else {
          return Promise.resolve(data);
        }
      }
    },
    (error) => {
      const userStore = useUserStore();
      const err = (text) => {
        Message.error({
          content:
            error.response && error.response.data && error.response.data.message
              ? error.response.data.message
              : text,
        });
      };
      if (error.response && error.response.data) {
        switch (error.response.status) {
          case 404:
            err(i18n.global.t("服务器资源不存在"));
            break;
          case 500:
            err(i18n.global.t("服务器内部错误"));
            break;
          case 401:
            userStore.logout()
            break;
          case 403:
            err(i18n.global.t("没有权限访问该资源"));
            break;
          default:
            err(i18n.global.t("未知错误！"));
        }
      } else {
        err(i18n.global.t("请求超时，服务器无响应！"));
      }
      return Promise.reject(
        error.response && error.response.data ? error.response.data : null
      );
    }
  );
  return service;
}

function stringify(data) {
  return qs.stringify(data, { allowDots: true, encode: false });
}

/**
 * @description 创建请求方法
 * @param service
 * @param externalService
 */
function createRequest(service, externalService) {
  return function (config) {
    const token = getToken();
    const currencyStore = useCurrencyStore();

    const headerConfig = {
      'x-api-language': i18n.global.locale.value || 'en', // 多语言
      'x-api-currency': currencyStore.currencyShort || 'USD', // 币种
    };

    if (token) {
      headerConfig["token"] = token;
    }

    if (!config.params) {
      config.params = {}
    }

    const appName = import.meta.env.VITE_APP
    let tzInfo = moment.tz.guess(true)
    if (appName === 'flipkart3') { // 韩国时区
      tzInfo = 'Asia/Seoul'
    }

    config.params = {
      ...config.params,
      'tz': tzInfo // 时区
    }

    const configDefault = {
      headers: Object.assign(
        {
          ...headerConfig,
        },
        config.headers
      ),

      timeout: 60000,
      data: {},
    };

    // 规定 formData 形式
    if (config.formData) {
      configDefault.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
    }

    // 如果是 FormData，必须删除 Content-Type 让浏览器自动加
    if (config.data instanceof FormData) {
      delete configDefault.headers['Content-Type'];
    }

    delete config.headers;
    const option = Object.assign(configDefault, config);

    // json
    if (!isEmpty(option.params)) {
      option.url = option.url + "?" + stringify(option.params);
      option.params = {};
    }

    if (!/^(http|https)/g.test(option.url)) {
      option.baseURL = APP_PROXY_PREFIX
      
      return service(option);
    } else {
      return externalService(option);
    }
  };
}

export const service = createService();
export const externalService = createExternalService();
export const request = createRequest(service, externalService);
