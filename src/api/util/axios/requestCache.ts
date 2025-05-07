import Axios from 'axios';

import { generateReqKey } from './commonFuncs';

const options = {
    storage: true, // 是否开启localStorage缓存
    storageKey: 'apiCache',
    storage_expire: 600000, // localStorage 数据存储时间10min（刷新页面判断是否清除）
    expire: 30000, // 每个接口数据缓存ms 数
};
const storage = window.sessionStorage;

// 初始化
(function () {
    const cache = storage.getItem(options.storageKey);
    if (cache) {
        const { storageExpire } = JSON.parse(cache);
        // 未超时不做处理
        if (storageExpire && getNowTime() - storageExpire < options.storage_expire) {
            return;
        }
    }
    storage.setItem(options.storageKey, JSON.stringify({ data: {}, storageExpire: getNowTime() }));
})();

function getCacheItem(key) {
    const cache: any = storage.getItem(options.storageKey);
    const { data } = JSON.parse(cache) || {};

    return (data && data[key]) || null;
}
function setCacheItem(key, value) {
    const cache: any = storage.getItem(options.storageKey);
    const { data, storageExpire } = JSON.parse(cache);

    data[key] = value;
    storage.setItem(options.storageKey, JSON.stringify({ data, storageExpire }));
}

const _CACHES = {};
// 使用Proxy代理
const cacheHandler = {
    get: (target, key) => {
        let value = target[key];
        console.log(`${key} 被读取`, value);

        if (options.storage && !value) {
            value = getCacheItem(key);
        }

        return value;
    },
    set: (target, key, value) => {
        console.log(`${key} 被设置为`, value);
        target[key] = value;

        if (options.storage) {
            setCacheItem(key, value);
        }

        return true;
    },
};

const CACHES = new Proxy(_CACHES, cacheHandler);

export function requestInterceptor(config) {
    // 开启缓存则保存请求结果和cancel 函数
    if (config.cache) {
        const data = CACHES[`${generateReqKey(config)}`];
        // 这里用于存储是默认时间还是用户传递过来的时间
        const setExpireTime = config.setExpireTime || options.expire;

        // 判断缓存数据是否存在 存在的话 是否过期 没过期就返回
        if (data && getNowTime() - data.expire < setExpireTime) {
            config.cancelToken = new Axios.CancelToken((cancel) => {
                // cancel 函数的参数会作为 promise 的 error 被捕获
                cancel(data);
            }); // 传递结果到catch中
        }
    }
}

export function responseInterceptor(response) {
    // 返回的result === 0 时候才会缓存下来
    if (response && response.config.cache && Number(response?.data?.result) === 0) {
        const data = {
            expire: getNowTime(),
            data: response,
        };

        CACHES[`${generateReqKey(response.config)}`] = data;
    }
}

// 获取当前时间戳
function getNowTime() {
    return new Date().getTime();
}

export class RequestCache {
    private cacheMap = new Map();

    has(url: string, params: object): boolean {
        const key = this.generateKey(url, params);
        return this.cacheMap.has(key);
    }

    get<T>(url: string, params: object): T | undefined {
        const key = this.generateKey(url, params);
        return this.cacheMap.get(key);
    }

    set<T>(url: string, params: object, value: T, ttl: number = 60000): void {
        const key = this.generateKey(url, params);
        this.cacheMap.set(key, value);
        setTimeout(() => {
            this.cacheMap.delete(key);
        }, ttl);
    }

    private generateKey(url: string, params: object): string {
        return `${url}?${Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(JSON.stringify(v))}`)
            .join('&')}`;
    }
}

// 使用示例：导出一个实例
export const requestCache = new RequestCache();
