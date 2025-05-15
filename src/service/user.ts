import { apiUrls, request } from '@/api';
import type { UserInfo, LoginParams, LoginResult } from './typing';

const adminInfo: UserInfo = {
    name: 'Admin',
    avatar: 'https://img.alicdn.com/tfs/TB1.ZBecq67gK0jSZFHXXa9jVXa-904-826.png',
    userid: '00000001',
    userType: 'admin',
};
const userInfo: UserInfo = {
    name: 'User',
    avatar: 'https://img.alicdn.com/tfs/TB1.ZBecq67gK0jSZFHXXa9jVXa-904-826.png',
    userid: '00000002',
    userType: 'user',
};

const waitTime = (time = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

/**
 * 短信登录接口
 * @param params 登录参数（包含用户名、密码等）
 * @returns {Promise<LoginResult | undefined>} 登录结果
 */
export async function login(params: LoginParams): Promise<LoginResult | undefined> {
    return request
        .Post(apiUrls.LOGIN_BY_SMS_CODE, {
            noToken: true,
            ...params,
        })
        .then((loginJson) => {
            if (loginJson && loginJson.result === '0') {
                return loginJson;
            }
        });
}

/**
 * 获取用户信息
 * @returns {Promise<UserInfo | { error: true }>} 用户信息或错误标识
 */
export async function fetchUserInfo(): Promise<UserInfo | { error: true }> {
    const res = await request.Get(apiUrls.GET_USER_INFO); // 修正为小写 get
    if (res.code === '0') {
        return res.data;
    }
    if (res.code === '900002') {
        return { error: true };
    }
    throw new Error(`未知错误码：${res.code}`);
}

/**
 * 退出登录
 * @param token 当前用户 token
 * @returns {Promise<{ code: string; message: string; data: any }>} 退出结果
 */
export async function logOut(token: string): Promise<{ code: string; message: string; data: any }> {
    await waitTime(1000);
    const result = await request.Post(apiUrls.LOGOUT, { token }); // 修正为小写 post 并补充 await
    return { code: '0', message: 'logout success', data: result };
}
