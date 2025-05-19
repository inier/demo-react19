import { createContext } from 'react';
import { configure, reaction, action } from 'mobx';

// 启用MobX严格模式
configure({ enforceActions: 'always' });

import { request, responseCode } from '@/api';
import { goToLoginWithRedirect } from '@/util';
// 数据持久化
import { persistParam } from '@/util/PersistData';

// == 通用Stores
import UIStore from './UIStore';
import UserStore from './UserStore';
// == 业务域Stores整合
// ...
import TestStore from './TestStore';
// == 页面UIStore整合
// ...

class RootStore {
    commonRequestData = {};
    UIStore: UIStore;
    userStore: UserStore;
    testStore: TestStore;

    // 惰性初始化stores
    private _initializedStores: Map<string, boolean> = new Map();

    constructor() {
        // 初始化核心stores
        this.UIStore = this._initStore(() => new UIStore(this));
        this.userStore = this._initStore(() => new UserStore(this));

        // 延迟初始化其他stores
        this.testStore = this._initStore(() => new TestStore(this));
    }

    // 惰性初始化store的辅助方法
    private _initStore<T extends { destroy?(): void }>(factory: () => T): T {
        const symbol = Object.getOwnPropertySymbols(this).find((s) => (this as any)[s] === factory);
        const key = symbol ? Symbol.keyFor(symbol) : '';

        if (key && this._initializedStores.get(key)) {
            throw new Error(`Store ${key} already initialized`);
        }

        const store = factory();
        if (key) {
            this._initializedStores.set(key, true);

            // 设置自动清理
            if (store.destroy) {
                reaction(
                    () => this._initializedStores.get(key),
                    (initialized) => {
                        if (!initialized) {
                            store.destroy!();
                        }
                    }
                );
            }
        }

        return store;
    }

    /**
     * 清理指定的store
     * @param storeName 要清理的store名称
     */
    @action
    cleanupStore(storeName: string): void {
        if (
            this[storeName as keyof this] &&
            Object.prototype.hasOwnProperty.call(this[storeName as keyof this], 'destroy')
        ) {
            (this[storeName as keyof this] as { destroy?(): void }).destroy?.();
        }
        this._initializedStores.delete(storeName);
    }

    /**
     * 清理所有stores
     */
    @action
    cleanupAllStores(): void {
        for (const storeName of Array.from(this._initializedStores.keys())) {
            this.cleanupStore(storeName);
        }
    }

    /**
     * @description 发送请求
     * @param {string} service 请求service
     * @param {object} params 参数
     * @param {object} config 其他操作参数,如 {
     *          noCommonData:false, // 不挂在公共参数
     *          loading:false,      // 不展示loading图标
     *          toast:false,        // 不展示接口错误信息
     *          ...config,          // alovaInstance.Get配置参数
     *      }
     * @returns Promise
     */
    request = async (service, params = {}, config = { noCommonData: false, loading: false, toast: false }) => {
        if (!service) {
            return Promise.reject(Error('service的参数应该是一个promise.'));
        }
        // 是否挂上公共参数
        if (!config.noCommonData) {
            Object.assign(params, this.commonRequestData);
        }
        const { noCommonData, loading, toast, ...restConfig } = config;

        return service.call(this, params, { ...restConfig, meta: { loading, toast } });
    };

    /**
     * @description 发送GET请求
     * @param {string} url 请求地址
     * @param {object} params 参数
     * @param {object} config 其他操作参数,如 {
     *          noCommonData:false, // 不挂在公共参数
     *          loading:false,      // 不展示loading图标
     *          toast:false,        // 不展示接口错误信息
     *          ...config,          // alovaInstance.Get配置参数
     *      }
     * @returns Promise
     */
    sendGet = (url = '', params = {}, config = { noCommonData: false, loading: false, toast: false }) => {
        // 是否挂上公共参数
        if (!config.noCommonData) {
            Object.assign(params, this.commonRequestData);
        }
        const { noCommonData, loading, toast, ...restConfig } = config;

        return request.get(url, { params, ...restConfig, meta: { loading, toast } });
    };

    /**
     * @description 发送POST请求
     * @param {string} url 请求地址
     * @param {object} params 参数
     * @param {object} config 其他操作参数,如 {
     *          noCommonData:false, // 不挂在公共参数
     *          loading:false,      // 不展示loading图标
     *          toast:false,        // 不展示接口错误信息
     *          ...config,          // alovaInstance.Get配置参数
     *      }
     * @returns Promise
     */
    sendPost = (url = '', params = {}, config = { noCommonData: false, loading: false, toast: false }) => {
        // 是否挂上公共参数
        if (!config.noCommonData) {
            Object.assign(params, this.commonRequestData);
        }
        const { noCommonData, loading, toast, ...restConfig } = config;

        return request.post(url, params, { ...restConfig, meta: { loading, toast } });
    };

    /**
     * @description 数据持久化(localStorage或sessionStorage)
     * @param {string|array} keyNames 键值项名称
     * @param {boolean} inSessionStorage 是否添加到sessionStorage，默认为false，添加到localStorage
     * @param {boolean} global 是否用于全局，默认为false，keyName前会增加前缀（所属store的名称），true则不添加前缀
     */
    persistParam(currStore, keyNames: string | any[], inSessionStorage = false, global = false) {
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
    handleRequestExpire = (url = '', params = {}, opts = {}, type?) => {
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
    handleResponse = (json, options) => {
        const { url, params, opts, msg } = options;
        const { toast } = opts;

        if (!json || typeof json.code === 'undefined' || json.code === null) {
            if (!toast) {
                this.handleRequestError(json.code, json.message || '数据返回错误！');
            }

            return {};
        }

        if (json && (json?.code || json?.result)) {
            json.code = json.result || json.code;
            json.data = json;
        }

        switch (String(json.code)) {
            // 获取数据成功
            case '0':
                console.log('获取数据成功');
                return json;
            // token过期
            case '-1': {
                console.log('token过期');
                this.handleRequestExpire(url, params, opts);
                this.UIStore.showToast(msg || '登录已过期，请重新登录');

                return json;
            }
            // 显示错误信息
            default: {
                console.log(`Request is get Error,Code :${json.code}`);
                if (!toast) {
                    this.handleRequestError(json.code, json.message);
                }

                return json;
            }
        }
    };
}

const stores = new RootStore();
const StoresContext = createContext(stores);

export { StoresContext, UIStore, UserStore, TestStore };

export default stores;
