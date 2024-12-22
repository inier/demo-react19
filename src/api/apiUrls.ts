/* eslint-disable */

//发布后的相对根目录
const ROOT = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_DEV_PROXY_PREFIX : '';

// 范围标记
const ipTest = '/caecnew-ap'; // 适配
const ipTest2 = '/caecnew-gw'; // 网关

const urls = {
    GET_RES_LIST: `/res/list`,
    GET_RESPONSE_CODE: `/resc/list`, // 获取统一返回码
    LOGIN_ENCRYPT: ipTest + '/main/user/loginEncrypt', //密码登录
    GET_PUBLIC_KEY: ipTest + '/main/user/generatePublicKey', //获取加密接口
    GET_SMS_CODE: ipTest + '/main/auth/getSMSCode', //获取短信登录的验证码
    LOGIN_BY_SMS_CODE: ipTest + '/main/user/loginByCode', //短信登录接口
    GET_PIC_CODE: ipTest + '/main/auth/picCode', //获取图片验证码
    RELOAGIN: ipTest + '/main/user/relogin', //刷新登录
    GET_USER_INFO: ipTest + '/member/user/info', //用户信息
};

for (let key in urls) {
    if (Object.prototype.hasOwnProperty.call(urls, key)) {
        let v = urls[key];
        if (v.indexOf('http://') > -1 || v.indexOf('https://') > -1) {
            urls[key] = v;
        } else {
            if (v.indexOf('/') > 0) v = `/${v}`;
            urls[key] = `${ROOT}${v}`;
        }
    }
}

export default urls;
