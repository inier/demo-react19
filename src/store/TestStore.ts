/**
 * 保存token等信息和其他公共信息
 */
import { makeAutoObservable } from 'mobx';

class TestStore {
    rootStore: any;

    // @observable
    token = '';

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false }, { autoBind: true });
        this.rootStore = rootStore;

        // 持久化token
        rootStore.persistParam(this, 'token', true, true);

        console.log('UI____:', this.token);
    }

    // 添加destroy方法实现
    destroy() {
        // 可以添加清理逻辑，或者留空实现接口要求
        console.log('TestStore destroyed');
    }
}

export default TestStore;
