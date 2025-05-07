import { makeAutoObservable } from 'mobx';

import { isMobile } from '@/util';

/**
 * 应用当前UI的状态，比如：窗口尺寸、当前展示的页面、渲染状态、网络状态等等
 */
class UIStore {
    rootStore: any;

    // 是否展示loading图标
    loading = false;
    // 需要展示的错误信息
    toastMsg: any;
    isMobile: boolean | RegExpMatchArray | null;

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false }, { autoBind: true });

        this.rootStore = rootStore;

        // 浏览器UA判断，true：微信，false：h5等其他
        this.isMobile = isMobile;
        // 数据持久化
        rootStore.persistParam(this, 'isMobile', undefined, true);
    }

    setLoading(isLoading: boolean) {
        this.loading = isLoading;
        console.log('UIStore-Loading:', isLoading);
    }

    setToastMsg(msg: string) {
        this.toastMsg = msg;
        console.log('UIStore-Toast:', msg);
    }

    /**
     * @description 显示Toast提示
     * @param {*} msg 需要显示的提示内容
     * @param {*} autoClose 是否自动关闭
     * @param {*} duration toast显示的持续时间，默认3秒
     */
    showToast = (msg: any, autoClose = true, duration = 3000) => {
        this.setToastMsg(msg);

        // 指定时间后自动关闭toast，默认3秒
        if (autoClose) {
            setTimeout(() => {
                this.setToastMsg('');
            }, duration);
        }
    };

    // 添加destroy方法实现
    destroy() {
        // 可以添加清理逻辑，或者留空实现接口要求
        console.log('UIStore destroyed');
    }
}

export default UIStore;
