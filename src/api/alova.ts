// 尝试检查是否安装了 alova 包，如果未安装，可使用 npm install alova 或 yarn add alova 进行安装
// 若已安装，可能需要检查类型声明文件，尝试安装 @types/alova （如果存在）
import { createAlova } from 'alova';
import ReactHook from 'alova/react';
import fetchRequestAdapter from 'alova/fetch'; // 替换为 fetch 适配器
import stores from '@/store';

// 配置基础URL（根据项目实际情况修改）
const baseURL = import.meta.env.BASE_URL || 'https://api.example.com';

// 定义扩展后的 method.config 类型
interface ExtendedConfig {
    meta: {
        loading?: boolean;
    };
}

// 添加更明确的响应类型
interface BaseResponse<T = any> {
    code: string;
    result?: string;
    msg?: string;
    data: T;
}

const alovaInstanceTemp = createAlova({
    // 基础URL前缀
    baseURL,
    // useHook 请求策略
    statesHook: ReactHook,
    // 请求适配器，定义Alova如何发送请求，这里使用fetch适配器
    requestAdapter: fetchRequestAdapter(),
    // 请求超时时间，单位为毫秒，默认为0，表示永不超时
    timeout: 50000,
    // 设置响应缓存
    cacheFor: {
        GET: 0, // 关闭所有GET缓存
        POST: 60 * 60 * 1000, // 设置所有POST缓存1小时
    },
    // 请求前拦截器
    // method实例，包含如url、params、data、headers等请求数据
    beforeRequest: (method: any) => {
        // 类型断言为扩展后的类型
        const extendedConfig = method.config as ExtendedConfig;

        // 显示加载状态
        if (extendedConfig.meta.loading !== false) {
            stores.UIStore.setLoading(true);
        }

        // 假设我们需要添加token到请求头
        // method.config.headers.token = 'token';
    },

    // 响应处理
    responded: {
        // 请求成功的拦截器
        // 当使用 `alova/fetch` 请求适配器时，第一个参数接收Response对象
        // 第二个参数为当前请求的method实例，可以用它同步请求前后的配置信息
        onSuccess: async (response, method) => {
            // 处理特定状态码
            if (response.status >= 400) {
                throw new Error(response.statusText);
            }
            const json = await response.json();
            if (json.code !== 200) {
                // 抛出错误或返回reject状态的Promise实例时，此请求将抛出错误
                throw new Error(json.message);
            }

            // handleResponse逻辑
            const handledResponse = stores.handleResponse(json as BaseResponse, {
                url: method.url,
                params: method.data,
                msg: json.msg,
                opts: method.config,
            });

            return handledResponse?.data;
        },

        // 请求失败的拦截器
        // 请求错误时将会进入该拦截器
        // 第二个参数为当前请求的method实例，可以用它同步请求前后的配置信息
        onError: (error, method) => {
            // 网络错误处理（原handleNetworkError）
            if (error.message === 'Network Error') {
                stores.UIStore.showToast('网络连接异常，请检查您的网络');
            }

            // 401未授权处理
            if (error.response?.status === 401) {
                stores.handleRequestExpire(method.url, method.data, method.config, '401');
            }

            return Promise.reject(error);
        },

        // 请求完成的拦截器
        // 请求不论是成功、失败、还是命中缓存都要执行
        // 接收当前请求的method实例
        onComplete: async (method) => {
            const extendedConfig = method.config as ExtendedConfig;

            // 隐藏加载状态
            if (extendedConfig.meta.loading !== false) {
                stores.UIStore.setLoading(false);
            }
        },
    },
});

export const alovaInstance = {
    ...alovaInstanceTemp,
    get: alovaInstanceTemp.Get,
    post: alovaInstanceTemp.Post,
    put: alovaInstanceTemp.Put,
    delete: alovaInstanceTemp.Delete,
    patch: alovaInstanceTemp.Patch,
    head: alovaInstanceTemp.Head,
    options: alovaInstanceTemp.Options,
};
