// 尝试检查是否安装了 alova 包，如果未安装，可使用 npm install alova 或 yarn add alova 进行安装
// 若已安装，可能需要检查类型声明文件，尝试安装 @types/alova （如果存在）
import { createAlova } from 'alova';
import ReactHook from 'alova/react';
import fetchRequestAdapter from 'alova/fetch'; // 替换为 fetch 适配器
import stores from '@/store';
import { goToLoginWithRedirect } from '@/util';

// 配置基础URL（根据项目实际情况修改）
const baseURL = import.meta.env.BASE_URL || 'https://api.example.com';

// 定义扩展后的 method.config 类型
interface ExtendedConfig {
    loading?: boolean;
    noCommonData?: boolean;
}

export const alovaInstance = createAlova({
    baseURL,
    statesHook: ReactHook, // 使用React Hooks状态管理
    requestAdapter: fetchRequestAdapter(), // 替换为 fetch 适配器
    timeout: 50000, // 超时时间（原axios实例配置）

    // 请求前拦截（替代原axios请求拦截器）
    beforeRequest: (method) => {
        // 类型断言为扩展后的类型
        const extendedConfig = method.config as ExtendedConfig;

        // 显示加载状态（原stores.UIStore.setLoading(true)）
        if (extendedConfig.loading !== false) {
            stores.UIStore.setLoading(true);
        }

        // 添加公共参数（原逻辑：Object.assign(defaultParams, stores.commonRequestData)）
        if (!extendedConfig.noCommonData) {
            method.data = { ...method.data, ...stores.commonRequestData };
        }
    },

    // 响应处理（替代原axios响应拦截器）
    responded: {
        // 成功响应处理
        onSuccess: async (response, method) => {
            // 类型断言为扩展后的类型
            const extendedConfig = method.config as ExtendedConfig;

            // 隐藏加载状态
            if (extendedConfig.loading !== false) {
                stores.UIStore.setLoading(false);
            }

            // 原handleResponse逻辑
            const handledResponse = stores.handleResponse(response.data, {
                url: method.url,
                params: method.data,
                opts: method.config,
            });

            // 处理特定错误码（原900002、900000逻辑）
            if (handledResponse?.code === '900002') {
                stores.UIStore.showToast(handledResponse.msg || '登录已过期，请重新登录');
                goToLoginWithRedirect();
                return Promise.reject(handledResponse);
            }
            if (handledResponse?.code === '900000') {
                stores.UIStore.showToast(handledResponse.msg || '请求失败');
                return Promise.reject(handledResponse);
            }

            return handledResponse?.data;
        },

        // 错误响应处理
        onError: (error, method) => {
            // 类型断言为扩展后的类型
            const extendedConfig = method.config as ExtendedConfig;

            // 隐藏加载状态
            if (extendedConfig.loading !== false) {
                stores.UIStore.setLoading(false);
            }

            // 网络错误处理（原handleNetworkError）
            if (error.message === 'Network Error') {
                stores.UIStore.showToast('网络连接异常，请检查您的网络');
            }

            // 401未授权处理
            if (error.response?.status === 401) {
                goToLoginWithRedirect();
            }

            return Promise.reject(error);
        },
    },
});
