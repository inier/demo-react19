import { apiUrls, request } from '@/api';
import type { UserInfo } from './typing';

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
let currentUserInfo: UserInfo = adminInfo || {};

const waitTime = (time = 1000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
};

/**
 * 短信登录接口
 * @returns {promise}
 */
export async function login(params) {
    return request
        .post(apiUrls.LOGIN_BY_SMS_CODE, {
            noToken: true,
            ...params,
        })
        .then((loginJson) => {
            if (loginJson && loginJson.result === '0') {
                return loginJson;
            }
        });
}

export async function fetchUserInfo() {
    const res = await request.get(apiUrls.GET_USER_INFO);
    if (res.code === '0') {
        return res.data;
    }
    if (res.code === '900002') {
        return { error: true };
    }
}

export async function logOut() {
    const res = { code: '0', message: 'logout success' };
    return res;
}
