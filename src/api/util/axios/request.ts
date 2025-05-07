/**
 * axios二次封装
 */
import { CustomSuccessData, IOptions, IRequest, Method } from 'axios';

import stores from '@/store';
import { goToLoginWithRedirect } from '@/util';

import instance from './interceptor';
import { RequestCache } from './requestCache'; // 导入RequestCache类

// 创建requestCache实例
const requestCache = new RequestCache();

/**
 * 核心函数，可通过它处理一切请求数据，并做横向扩展
 * @param {string} url 请求地址
 * @param {object} params 请求参数
 * @param {object} options 请求配置，针对当前本次请求
 * @param {string} method 请求方法，针对当前本次请求
 * @returns {Promise<T>} 返回类型化的Promise
 */
// 提取隐藏加载状态的逻辑
function hideLoadingIfNeeded(defaultOptions: IOptions) {
    if (defaultOptions.loading) {
        stores.UIStore.setLoading(false);
    }
}

// 提取处理网络错误的逻辑
function handleNetworkError(error: unknown, defaultOptions: IOptions) {
    if (error instanceof Error && !('response' in error)) {
        if (defaultOptions.error) {
            stores.UIStore.showToast('网络连接异常，请检查您的网络');
        }
        throw new Error('Network error');
    }
}

// 检查缓存
function checkCache<T>(
    defaultOptions: IOptions,
    requestCache: RequestCache,
    url: string,
    params: object
): T | undefined {
    if (defaultOptions.cache && requestCache.has(url, params)) {
        return requestCache.get<T>(url, params);
    }
    return undefined;
}

// 处理重试逻辑
async function handleRequestWithRetry<T>(
    defaultOptions: IOptions,
    instance: any,
    url: string,
    method: Method,
    defaultParams: object
): Promise<CustomSuccessData<T> | undefined> {
    let response: CustomSuccessData<T> | undefined;

    for (let attempt = 0; attempt <= (defaultOptions.retry ?? 0); attempt++) {
        try {
            response = await instance.request({
                url,
                method,
                [method === 'get' || method === 'delete' ? 'params' : 'data']: defaultParams,
            });

            break; // 如果请求成功，跳出重试循环
        } catch (error) {
            if (attempt === (defaultOptions.retry ?? 0)) {
                throw error; // 如果达到最大重试次数仍失败，抛出错误
            }

            // 等待一段时间后重试（指数退避算法）
            await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)));
        }
    }

    return response;
}

async function request<T>(
    url: string,
    params: object,
    options: IOptions,
    method: Method,
    isReject?: boolean
): Promise<T> {
    const defaultOptions: IOptions = {
        loading: true,
        mock: false,
        error: true,
        cache: false, // 默认不启用缓存
        cacheTTL: 60000, // 默认缓存生存时间（毫秒）
        retry: 0, // 默认不重试
        ...options,
    };

    try {
        // 检查缓存
        const cachedData = checkCache<T>(defaultOptions, requestCache, url, params);
        if (cachedData !== undefined) {
            return cachedData;
        }

        const defaultParams = { ...params };

        // 是否挂上公共参数
        if (!defaultOptions.noCommonData) {
            Object.assign(defaultParams, stores.commonRequestData);
        }

        // 显示加载状态
        if (defaultOptions.loading) {
            stores.UIStore.setLoading(true);
        }

        // 处理重试逻辑
        const response = await handleRequestWithRetry<T>(defaultOptions, instance, url, method, defaultParams);

        // 隐藏加载状态
        hideLoadingIfNeeded(defaultOptions);

        if (!response) {
            throw new Error('Request failed: no response received');
        }

        // 使用handleResponse处理响应数据
        const handledResponse = stores.handleResponse(response, {
            url,
            params: defaultParams,
            opts: defaultOptions,
        });

        // 检查处理后的响应是否存在
        if (!handledResponse) {
            throw new Error('Request failed: empty response after handling');
        }

        // 处理特定的错误代码
        if (typeof handledResponse === 'object' && handledResponse !== null && 'code' in handledResponse) {
            const resultData = handledResponse as { code: string; data?: T; msg?: string; message?: string };

            if (resultData.code === '900002') {
                const errorMessage = resultData.msg || resultData.message || '登录已过期,请重新登录';
                // 登录已过期
                if (defaultOptions.error) {
                    stores.UIStore.showToast(errorMessage);
                }
                goToLoginWithRedirect();
                // 可以选择抛出特定错误或返回特定数据
                return Promise.reject(new Error(errorMessage));
            }
            if (resultData.code === '900000') {
                // 服务异常处理
                const errorMessage = resultData.msg || resultData.message || '请求失败';
                if (defaultOptions.error) {
                    stores.UIStore.showToast(errorMessage);
                }

                // 可以选择抛出特定错误或返回特定数据
                return Promise.reject(new Error(errorMessage));
            }
        }

        // 如果有data属性，使用data作为返回值，否则使用整个响应
        const result = 'data' in handledResponse ? handledResponse.data : handledResponse;
        if (result === undefined || result === null) {
            throw new Error('Request failed: empty response data');
        }

        return result as T;
    } catch (error: unknown) {
        // 隐藏加载状态
        hideLoadingIfNeeded(defaultOptions);

        // 处理网络错误
        handleNetworkError(error, defaultOptions);

        if (isReject === true) {
            // 修正 Promise.reject 的返回问题
            return Promise.reject({ code: '900000', message: '操作失败' });
        } else {
            console.warn('request status > 400:', error);
        }

        // 处理身份验证错误
        if (
            typeof error === 'object' &&
            error !== null &&
            'response' in error &&
            typeof (error as any).response === 'object' &&
            (error as any).response?.status === 401
        ) {
            goToLoginWithRedirect();
            return Promise.reject(new Error('Unauthorized'));
        }

        // 处理服务器错误
        if (defaultOptions.error && error instanceof Error) {
            stores.UIStore.showToast(`请求失败：${error.message}`);
        }

        return Promise.reject(error);
    }
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
        query = `?${keys?.map((key) => `${key}=${params[key] || ''}`).join('&')}`;
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
        method?: string
    ): Promise<CustomSuccessData<T>>;
}

const requestFn = {
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

export default requestFn;
