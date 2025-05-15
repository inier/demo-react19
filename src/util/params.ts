import { cloneDeep } from 'lodash-es';
import { parse } from 'qs';

/**
 * 返回url参考的对象格式
 */
export const getUrlQuery = () => parse(window.location.href.split('?')[1]);

// url相关操作方法

/**
 * @description 通过url得到url对象
 * @param {String} url url
 * @returns {object} url对象，没有返回null
 */
export function urlParse(url) {
    /* eslint-disable no-useless-escape */
    const urlObj = {
        protocol: /^(.+)\:\/\//,
        host: /\:\/\/(.+?)[\?\#\s\/]/,
        path: /\w(\/.*?)[\?\#\s]/,
        query: /\?(.+?)[\#\/\s]/,
        hash: /\#(\w+)\s$/,
    };

    function formatQuery(str) {
        return str.split('&').reduce((a, b) => {
            const arr = b.split('=');
            a[arr[0]] = arr[1];
            return a;
        }, {});
    }

    if (!url) {
        return {};
    }

    try {
        Object.keys(urlObj).forEach((key) => {
            const pattern = urlObj[key];

            if (key === 'query') {
                urlObj[key] = pattern.exec(url) && formatQuery(pattern.exec(url)[1]);
            } else {
                urlObj[key] = pattern.exec(url) && pattern.exec(url)[1];
            }
        });
    } catch (err) {
        console.log(err);
    }

    return urlObj;
}

/**
 * @description 用于获取url中的指定参数
 * @param {String} val 查询key
 * @returns {*} 对应的value，没有返回null
 */
export function getQueryString(val) {
    const reg = new RegExp(`(^|&)${val}=([^&]*)(&|$)`);
    const r = decodeURIComponent(window.location.search.substr(1)).match(reg);

    if (r !== null) {
        return unescape(r[2]);
    }

    return null;
}

export function getHashQueryData() {
    const { hash } = window.location;
    const data = {};
    if (hash.indexOf('?') !== -1) {
        const queryStr = hash.split('?')[1];
        queryStr.split('&').forEach((str) => {
            const p = str.split('=');
            data[p[0]] = p[1];
        });
    }
    return data;
}

export function getQueryString2(val) {
    const reg = new RegExp(`(^|&)?${val}=([^&]*)(&|$)`);
    const r = decodeURIComponent(window.location.hash.substr(1)).match(reg);

    if (r !== null) {
        return unescape(r[2]);
    }

    return null;
}
/**
 * @description 拼接url参数
 * @param {String} src url 或 uri
 * @param {Object} params 参数
 * @returns {String} 拼接后的 url
 */
export function addQueryParams(src = '', params = {}) {
    let paramsStr = '';
    let tSrc = src;

    Object.keys(params).forEach((key) => {
        paramsStr += `&${key}=${params[key]}`;
    });

    if (paramsStr === '') {
        return tSrc;
    } else {
        if (/\?/g.test(tSrc)) {
            tSrc += paramsStr;
        } else {
            tSrc += `?${paramsStr.substring(1)}`;
        }

        return tSrc;
    }
}

/**
 * @description 替换url参数
 * @param {String} url url链接
 * @param {String} arg 参数key
 * @param {String} val 参数值
 * @returns 返回替换后的URL
 */
export function replaceQueryParams(url, arg, val) {
    const pattern = `${arg}=([^&]*)`;
    const replaceText = `${arg}=${val}`;
    let currUrl = '';

    if (url.match(pattern)) {
        const tmp = `/(${arg}=)([^&]*)/gi`;
        currUrl = url.replace(eval(tmp), replaceText);
    } else {
        currUrl = url.includes('?') ? `${url}&${replaceText}` : `${url}?${replaceText}`;
    }

    return currUrl;
}

/**
 * @description 删除url参数
 * @param {String} url url链接
 * @param {String} param 参数名
 * @returns 返回删除参数后的URL
 */
export function removeQueryParams(url, param) {
    const urlParts = url.split('?');
    if (urlParts.length >= 2) {
        // 参数名前缀
        const prefix = `${encodeURIComponent(param)}=`;
        const paras = urlParts[1].split(/[&;]/g);

        // 循环查找匹配参数
        for (let i = paras.length; i > 0; i--) {
            if (paras[i].lastIndexOf(prefix, 0) !== -1) {
                // 存在则删除
                paras.splice(i, 1);
            }
        }

        return `${urlParts[0]}${paras.length > 0 ? `?${paras.join('&')}` : ''}`;
    }
    return url;
}

/**
 * @description url的search转换为参数对象 ?a=1&b=2  => {a:'1',b:'2'}
 * @param {String} search =location.search
 * @returns {Object} 转换后的对象
 */
export function search2obj(search) {
    const searchT = (search && search.substr(1)) || '';

    if (!searchT) {
        return {};
    }

    const paramsList = searchT.split('&');
    const params = {};

    paramsList.forEach((i) => {
        if (!i) {
            return;
        }

        const p = i.split('=');
        if (p.length === 1) {
            params[p[0]] = '';
        } else {
            params[p[0]] = p[1];
        }
    });

    return params;
}

/**
 * @description 参数对象转换为url的search，{a:'1',b:'2'} => ?a=1&b=2
 * @param {Object} obj like {a:'1',b:'2'}
 * @returns {string}
 */
export const obj2search = (obj) => {
    const search = Object.keys(obj)
        .map((i) => `${i}=${obj[i]}`)
        .join('&');

    if (!search) {
        return '';
    }

    return `?${search}`;
};

/**
 * 通过参数对象获取url，{a:'1',b:'2'} => http://xxxxxxx?a=1&b=2
 * @param {Object} obj like {a:'1',b:'2'}
 * @returns {string}
 */
export const getUrlWithSearchObj = (obj) => {
    const params = search2obj(window.location.search);
    Object.assign(params, obj);

    return `${window.location.origin}${window.location.pathname}${obj2search(params)}`;
};

/**
 * @description 对指定字符串进行base64编码
 * @param {String} val 需要编码的数据
 * @returns {*} 编码后的数据
 */
export function urlEncodeBase64(val) {
    return window.btoa(unescape(encodeURIComponent(val)));
}

/**
 * @description 对指定字符串进行base64解码
 * @param {String} val 需要解码的数据
 * @returns {*} 解码后端数目
 */
export function urlDecodeBase64(val) {
    return decodeURIComponent(escape(window.atob(val)));
}

/**
 * @description 是否为绝对地址
 * @param {string} path path
 * @returns {boolean}
 */
export function isAbsolutePath(path = '') {
    if (path.indexOf('//') >= 0) {
        return true;
    }
    return false;
}

/**
 * @description 格式化path
 * @param {string} path path
 * @returns {string|undefined} 格式化后的path
 */
export function formatPath(path) {
    if (!path) {
        return '/404';
    } else if (path.indexOf('//') >= -1) {
        return path;
    }
    return path.indexOf('/') === 0 ? path : `/${path}`;
}

/**
 * @description 获取包含path的url
 * @param {string} path path
 * @returns {string|undefined} 格式化后的path
 */
export function getUrl(path) {
    if (!path) {
        return '/404';
    }

    if (path.indexOf('://') > -1) {
        return path;
    } else {
        return `${window.location.origin}${formatPath(path)}`;
    }
}

/**
 * 将Object值中的null转换为undefined
 */
export const nullTransformationToUndefined = (value) => {
    const cloneObj = cloneDeep(value);
    const transformationFunc = (obj: object): void => {
        if (obj instanceof Object) {
            const ary = Array.isArray(obj) ? obj : Object.keys(obj);
            ary.forEach((it, index) => {
                const key = Array.isArray(obj) ? index : it;
                if (obj[key] === null) {
                    obj[key] = undefined;
                } else if (obj[key] instanceof Object) {
                    transformationFunc(obj[key]);
                }
            });
        }
    };

    transformationFunc(cloneObj);

    return cloneObj;
};

/**
 * 过滤请求参数, 去掉空值/null/undefined
 * @param params
 * @returns params
 */
export function filterUsefulRequestParams(params) {
    const result = {};
    if (!params) {
        return null;
    }
    Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== '' && value !== undefined && value !== null) {
            // 是否要判断空数组?  !(value instanceof Array && value.length === 0)
            result[key] = value;
        }
    });
    return result;
}

export function removeSlash(path) {
    if (!path) {
        return path;
    }

    return path === '/' ? '/' : path?.replace(/\/$/g, '');
}
