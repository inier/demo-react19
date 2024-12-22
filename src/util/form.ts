import { cloneDeep } from 'lodash-es';

/**
 * 组装表单数据
 * @param {array} src 原始数据
 * @param {array} ext 扩展数据，默认值[]
 * @returns {array} 组装后的值
 */
export function assembleFormConfig(src: any[] = [], ext: any[] = []): any[] {
    if (ext.length === 0) {
        return src;
    }
    const tData = cloneDeep(src);
    ext.forEach((item: any) => {
        const tId = item.key;
        const tIndex = tData.findIndex((it) => {
            return it.key === tId;
        });
        const { key, ...rest } = item;
        Object.assign(tData[tIndex], rest);
    });

    return tData;
}
