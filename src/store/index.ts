/* eslint-disable import/order */
/* eslint-disable no-console */
import { createContext } from 'react';

import { request, responseCode } from '@/api';
import { goToLoginWithRedirect } from '@/util';
// 数据持久化
import { persistParam } from '@/util/PersistData';

// == 通用Stores
import UIStore from './UIStore';
import UserStore from './UserStore';
// == 业务域Stores整合
// ...

// == 页面UIStore整合
// ...

class RootStore {
  commonRequestData: any;
  UIStore: UIStore;
  userStore: UserStore;

  constructor() {
    this.UIStore = new UIStore(this);
    this.userStore = new UserStore(this);
    // 实例化其他Store
    // ...
  }

  /**
   * @description 发送GET请求
   * @param {string} service 请求service
   * @param {object} _params 参数
   * @param {object} opts 其他操作参数，如 {
   *          noCommonData:false, //不挂在公共参数
   *          loading:false,  //不展示loading图标
   *          toast:false,  //不展示接口错误信息
   *      }
   * @returns Promise
   */
  request = async (
    service,
    _params = {},
    opts = { noCommonData: false, loading: false, toast: false },
  ) => {
    if (!service) {
      return Promise.reject(Error('service的参数应该是一个promise.'));
    }
    // 是否挂上公共参数
    !opts.noCommonData && Object.assign(_params, this.commonRequestData);

    return service.call(this, _params, opts);
  };

  /**
   * @description 发送GET请求
   * @param {string} url 请求地址
   * @param {object} _params 参数
   * @param {object} opts 其他操作参数 如 {
   *          noCommonData:false, //不挂在公共参数
   *          loading:false,  //不展示loading图标
   *          toast:false,  //不展示接口错误信息
   *      }
   * @returns Promise
   */
  sendGet = (
    url = '',
    _params = {},
    opts = { noCommonData: false, loading: false, toast: false },
  ) => {
    // 是否挂上公共参数
    !opts.noCommonData && Object.assign(_params, this.commonRequestData);

    return request.get(url, _params, opts);
  };

  /**
   * @description 发送POST请求
   * @param {string} url 请求地址
   * @param {object} _params 参数
   * @param {object} opts 其他操作参数 如 {
   *          noCommonData:false, //不挂在公共参数
   *          loading:false,  //不展示loading图标
   *          toast:false,  //不展示接口错误信息
   *      }
   * @returns Promise
   */
  sendPost = (
    url = '',
    _params = {},
    opts = { noCommonData: false, loading: false, toast: false },
  ) => {
    // 是否挂上公共参数
    !opts.noCommonData && Object.assign(_params, this.commonRequestData);

    return request.post(url, _params, opts);
  };

  /**
   * @description 数据持久化(localStorage或sessionStorage)
   * @param {string|array} keyNames 键值项名称
   * @param {boolean} inSessionStorage 是否添加到sessionStorage，默认为false，添加到localStorage
   * @param {boolean} global 是否用于全局，默认为false，keyName前会增加前缀（所属store的名称），true则不添加前缀
   */
  persistParam(
    currStore,
    keyNames: string | any[],
    inSessionStorage = false,
    global = false,
  ) {
    persistParam(currStore, keyNames, inSessionStorage, global);
  }

  /**
   * @description loading图标的展示状态回调
   * @param {*} boolean true：展示，false：不展示
   */
  handleShowLoading = (boolean: any) => {
    this.UIStore.setLoading(boolean);
  };

  /**
   * @description 请求发送错误码的回调
   * @param {string} code 错误码
   * @param {string} message 错误码
   */
  handleRequestError = (code: string | undefined, message?) => {
    const codeMsg = responseCode.codeMsg(code);
    let msg = codeMsg || message;
    if (codeMsg && message) {
      msg = `${codeMsg}: ${message}`;
    }

    this.UIStore.showToast(msg);
  };

  /**
   * @description 请求token 过期处理
   * @param {String} url 调用接口
   * @param {Object} params 参数
   * @param {object} opts 其他操作参数
   * @param {String} type 请求类型
   */
  handleRequestExpire = (url, params, opts, type?) => {
    goToLoginWithRedirect();
  };

  /**
   * @description 处理获取的结果
   * 1.实现token自动刷新功能
   * 2.实现自动根据api/ResponseCode中的错误信息显示
   * @param {*} json 获取到的结果
   * @param {*} options 操作
   * @returns 获取的数据
   */
  handleResponse = (json: any, options: any) => {
    const { url, params, opts } = options;
    const { toast } = opts;

    if (json && !json.code && json.result) {
      json.code = json.result;
    }
    if (json && !json.code) {
      json.code = 0;
      json.data = json;
    }
    if (!json || typeof json.code === 'undefined' || json.code === null) {
      !toast &&
        this.handleRequestError(json.code, json.message || '数据返回错误！');
      return {};
    }

    switch (String(json.code)) {
      // 获取数据成功
      case '0':
        console.log('获取数据成功');
        return json;
      // token过期
      case '-1': {
        console.log('token过期');
        return this.handleRequestExpire(url, params, opts);
      }
      // 显示错误信息
      default: {
        console.log(`Request is get Error,Code :${json.code}`);
        !toast && this.handleRequestError(json.code, json.message);
        return json;
      }
    }
  };
}

const stores = new RootStore();
const StoresContext = createContext(stores);

export {
  StoresContext,
  UIStore,
  UserStore,
};

export default stores;
