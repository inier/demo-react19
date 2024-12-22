/**
 * 保存用户信息与登录信息token等其他公共信息
 */
import { makeAutoObservable } from 'mobx';

// import avatar from '@/assets/img/avatar.png';
import { login, logOut as loginOutService } from '@/service/user';
import { getQueryString } from '@/util';

class UserStore {
    rootStore: any;

    // 全局token
    token = '';
    userInfo = {
        name: 'Admin',
        nickName: '',
        avatar: '',
        desc: '',
    };

    constructor(rootStore) {
        makeAutoObservable(this, { rootStore: false }, { autoBind: true });
        this.rootStore = rootStore;

        // 数据持久化
        rootStore.persistParam(this, 'token', true, true);
        rootStore.persistParam(this, 'userInfo');

        // 从Url获得token参数
        const tToken = getQueryString('token');
        if (tToken) {
            this.setToken(tToken);
        }

        // 请求中挂全局参数，比如token
        rootStore.commonRequestData = {
            // token: this.token
        };
    }

    setToken(token) {
        this.token = token;
    }

    setUserInfo(res) {
        this.userInfo = res;
    }

    loginIn(values) {
        return login(values)
            .then((res) => {
                const { data } = res;
                if (data && data.token) {
                    this.setToken(data.token);
                    this.setUserInfo({
                        name: data.userName,
                        avatar: data.avatar || avatar,
                        nickName: data.nickName,
                        desc: data.portalName,
                    });

                    return res;
                }

                return res;
            })
            .catch((err) => {
                console.log('loginIn:', err);
                return false;
            });
    }

    /**
     * 退出登录
     */
    loginOut() {
        loginOutService(this.token).then((res) => {
            if (res) {
                this.setToken(undefined);
            }
        });
    }
}

export default UserStore;
