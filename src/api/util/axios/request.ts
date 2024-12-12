/**
 * axios二次封装
 */
import { CustomSuccessData, IOptions, IRequest, Method } from 'axios';

import stores from '@/store';
import { goToLoginWithRedirect } from '@/util';

import instance from './interceptor';
/**
 * 核心函数，可通过它处理一切请求数据，并做横向扩展
 * @param {string} url 请求地址
 * @param {object} params 请求参数
 * @param {object} options 请求配置，针对当前本次请求
 * @param {string} method 请求配置，针对当前本次请求
 */
function request<T>(
  url: string,
  params: object,
  options: IOptions,
  method: Method,
  isReject?: boolean,
): Promise<T> {
  const defaultOptions: IOptions = {
    loading: true,
    mock: false,
    error: true,
    ...options,
  };
  const defaultParams = { ...params };

  // url = `http://10.10.123.3:8000${url}`

  // 是否挂上公共参数
  if (!defaultOptions.noCommonData) {
    Object.assign(defaultParams, stores.commonRequestData);
  }

  // 请求前loading
  if (defaultOptions.loading) {
    // console.log(`${url}, loading...`);
    stores.UIStore.setLoading(true);
  }

  return new Promise((resolve, reject) => {
    let data = {};

    // get请求：使用params字段
    if (method === 'get' || method === 'delete') {
      data = { params: defaultParams };
    }
    // post请求：使用data字段
    if (method === 'post') {
      data = { data: defaultParams };
    }

    instance({ url, method, ...defaultOptions, ...data })
      .then((res: any) => {
        const result = stores.handleResponse(res, {
          url,
          params: defaultParams,
          opts: defaultOptions,
        });
        if (result.code === '900002') {
          reject('登录已过期,请重新登录');
          goToLoginWithRedirect();
        } else {
          resolve(result);
        }
      })
      .catch(error => {
        if (isReject === true) {
          reject({ code: '900000', message: '操作失败' });
        } else {
          console.log('request status > 400:', error);
        }
      })
      .finally(() => {
        // 请求完关闭loading
        if (defaultOptions.loading) {
          // console.log(`${url}, loaded`);
          stores.UIStore.setLoading(false);
        }
      });
  });
}

// 封装GET请求
const doGet: IRequest = async (url, params, options) => {
  return request(url, params || {}, options || {}, 'get', true);
};

// 封装POST请求
const doPost: IRequest = async (url, params, options) => {
  return request(url, params || {}, options || {}, 'post', true);
};

// 封装Delete请求
const doDelete: IRequest = async (url, params, options) => {
  return request(url, params || {}, options || {}, 'delete', true);
};

// 封装POST请求，根据keys，从params中获取url的query参数
const doPostQuery: IDoRequest = async (url, keys, params, options) => {
  let query = '';
  if (keys && params) {
    query = `?${keys?.map(key => `${key}=${params[key] || ''}`).join('&')}`;
  }
  return request(`${url}${query}`, params || {}, options || {}, 'post', true);
};

// doPostQuery默认的keys集合
const queryKeys: string[] = ['pageNum', 'pageSize'];

// 封装GET请求
const get: IRequest = async (url, params, options) => {
  return request(url, params || {}, options || {}, 'get');
};
// 封装POST请求
const post: IRequest = async (url, params, options) => {
  return request(url, params || {}, options || {}, 'post');
};

// 封装Delete请求
const deleteRequest: IRequest = async (url, params, options) => {
  return request(url, params || {}, options || {}, 'delete');
};

// 泛型接口
export interface IDoRequest {
  <T>(
    url: string,
    keys?: string[],
    params?: object,
    options?: IOptions,
    method?: string,
  ): Promise<CustomSuccessData<T>>;
}

export default {
  instance,
  get,
  post,
  deleteRequest,
  doGet,
  doPost,
  doDelete,
  doPostQuery,
  queryKeys,
};
