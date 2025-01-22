/**
 * 用于将需要的数据保存到本地存储，如localStorage等
 */
import { autorun } from 'mobx';

/**
 * 检测 storage 是否同时受支持和可用的函数
 * @param {*} type storage类型，包括localStorage和sessionStorage
 * @returns {boolean}
 */
function storageAvailable(type) {
    let storage;
    try {
        storage = window[type];
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            // everything except Firefox
            (e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

/**
 * 设置对某个Store下的某个字段进行监听，如果该字段有变化就存储到localStorage
 * 注:尽量不要使用Object对象来进行持久化，因为对象中的某个值改变不会触发反应函数。如果必须使用对象，那请使用深拷贝对对象赋值
 * @param {String} currStore Store
 * @param {string} name 字段名
 * @param {boolean} inSessionStorage 是否存放到sessionStorage
 * @param {boolean} global 是否用于全局，true则存入storage时不携带store名
 */
function persistItem(currStore, name, inSessionStorage = false, global = false) {
    const storage = inSessionStorage ? window.sessionStorage : window.localStorage;
    // 避免名称冲突
    const keyName = global ? `${name}` : `${currStore.constructor.name}_${name}`;
    const persistedData = storage.getItem(keyName);

    // 如果本地已经存在keyName，将数据初始化到store对应的变量上
    if (persistedData !== null) {
        try {
            // 如果为undefined
            if (typeof persistedData === 'undefined') {
                currStore[name] = undefined;
            } else {
                // 如果能转换为对象或，则会自动转换为对象
                const tData = JSON.parse(persistedData);

                if (['object', 'boolean'].includes(typeof tData)) {
                    currStore[name] = tData;
                } else {
                    currStore[name] = persistedData;
                }
            }
        } catch (e) {
            console.log('error:', e);
            currStore[name] = persistedData;
        }
    }

    autorun(() => {
        const data = currStore[name];
        if (typeof data !== 'undefined' && typeof data !== 'function' && data !== null) {
            storage.setItem(keyName, typeof data !== 'string' ? JSON.stringify(data) : data);
        } else {
            storage.removeItem(keyName);
        }
    });
}

/**
 * @description 数据持久化(localStorage或者sessionStorage)
 * @param {String} currStore Store名
 * @param {string|array} keyNames 需要持久化的键值项名称
 * @param {boolean} inSessionStorage 是否持久化到sessionStorage
 * @param {boolean} global 是否用于全局，true则存入storage时不携带store名
 */
export function persistParam(currStore, keyNames, inSessionStorage = false, global = false) {
    if (!storageAvailable('localStorage') || !storageAvailable('sessionStorage')) {
        throw Error('本应用暂不支持隐私/无痕浏览模式，请切换到正常模式使用。');
    }
    if (!keyNames) {
        return;
    }
    if (typeof keyNames === 'string') {
        persistItem(currStore, keyNames, inSessionStorage, global);
    } else {
        keyNames.forEach((keyName) => persistItem(currStore, keyName, inSessionStorage, global));
    }
}
