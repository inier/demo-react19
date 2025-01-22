// 辅助工具集合，项目通用方法、函数等的统一出口

// const isProd = process.env.ENV === 'production';

const reg =
    /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

/**
 * 判断是否是有效的 URL
 * @param path
 */
export const isUrl = (path: string): boolean => reg.test(path);

export const getUuid = (length) => Number(`${Math.random().toString().substr(3, length)}${Date.now()}`).toString(36);

/**
 * 是否是开发模式
 */
export const isDev = (): boolean => {
    return import.meta.env.MODE === 'development';
};

// 参数处理
export * from './params';
// 字符处理
export * from './string';
// 数据相关：Array和Map等
export * from './data';
// 用户信息处理
export * from './user';
// 设备信息相关
export * from './checkDevice';
// 表单处理
export * from './form';
// 鉴权相关
export * from './authority';
