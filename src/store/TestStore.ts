/**
 * 保存token等信息和其他公共信息
 */
import { observable, makeAutoObservable } from 'mobx';

class TestStore {
    rootStore: any;

    // @observable
    token = "";

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false }, { autoBind: true });
        this.rootStore = rootStore;

        // 持久化token
        rootStore.persistParam(this, 'token', true, true);

        console.log('UI____:', this.token);
    }
}

export default TestStore;