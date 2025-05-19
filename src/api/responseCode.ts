import { apiUrls, request } from '@/api';

// 服务器响应错误码，对应的提示信息
class ResponseCode {
    // 错误码
    codes = {
        '-1': '登录已过期，请重新登录',
        1: '未知原因导致操作失败',
        10000: '无效图片验证码',
        10001: '系统错误',
        10002: '参数错误',
        10003: '无可用门户，请联系管理员',
        10004: '登录密码错误',
    };
    newCodes = {};

    constructor() {
        if (apiUrls.GET_RESPONSE_CODE) {
            // 用应用的第一级目录做不同应用的区分
            const appPath = window.location.pathname.split('/')[1];

            try {
                this.newCodes = JSON.parse(window.localStorage.getItem(`${appPath}_error_codes`) || '{}');
            } catch (error) {
                console.log('ResponseCode:constructor', error);
            }

            // this.getNewCode();
        }
    }

    /**
     * @description 根据返回码，显示对应的信息
     * @param {*} code 错误码
     * @returns 错误的中文信息
     */
    codeMsg(code = '') {
        if (code === '-1') {
            return;
        }
        if (this.codes && Object.prototype.hasOwnProperty.call(this.codes, code)) {
            return this.codes[code.toString()];
        }
        if (this.newCodes && Object.prototype.hasOwnProperty.call(this.newCodes, code)) {
            return this.newCodes[code.toString()];
        }

        return '';
    }

    // 获取在线错误码
    getNewCode() {
        // 用应用的第一级目录做不同应用的区分
        const appPath = window.location.pathname.split('/')[1];
        // 本地的版本号
        const oldVer = window.localStorage.getItem(`${appPath}_error_code_v`);

        return request
            .Get(apiUrls.GET_RESPONSE_CODE, { params: { version: oldVer } })
            .then((json: any) => {
                if (json && Number(json.result) === 0 && json.data) {
                    window.localStorage.setItem(`${appPath}_error_code_v`, json.version);
                    try {
                        window.localStorage.setItem(
                            `${appPath}_error_codes`,
                            json.data ? JSON.stringify(json.data) : '{}'
                        );
                    } catch (error) {
                        console.log('ResponseCode:getNewCode', error);
                    }
                    this.newCodes = json.data;
                }
                return {};
            })
            .catch(() => {
                return {};
            });
    }
}

const ins = new ResponseCode();

export default ins;
