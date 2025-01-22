import { makeAutoObservable } from 'mobx';

import userService from '../services/demo';

class DemoStore {
    userInfo = {
        avatar: '',
        name: '',
    };

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    setUserInfo(res) {
        this.userInfo = res;
    }

    async getUser() {
        return userService.fakeAccountLogin().then((res: any) => {
            this.setUserInfo(res);

            return res;
        });
    }
}

export default new DemoStore();
