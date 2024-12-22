// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as axios from 'axios';

declare module 'axios' {
    // 定义请求响应格式{result: xxx, data: xxx, total:"", msg:"err message",...}， T：接口返回类型数据
    export interface CustomSuccessData<T> {
        result: string;
        data?: T;
        msg?: string;
        message?: string;
        [keys: string]: any;
    }

    export interface IOptions {
        mock?: boolean; // 是否请求mock而非线上
        noCommonData?: boolean; // 请求是否包含公共参数
        loading?: boolean; // 是否显示loading
        error?: boolean; // 是否显示错误
        cancelRequest?: true; // 是否开启取消重复请求功能
        retry?: number; // 请求重试次数
        retryDelay?: number; // 两次重试之间的时间间隔
        cache?: true; // 是否开启当前接口缓存
        setExpireTime?: number; // 当前接口缓存时限
    }

    // 泛型接口
    export interface IRequest {
        <T>(url: string, params?: object, options?: IOptions, method?: string): Promise<CustomSuccessData<T>>;
    }
}
