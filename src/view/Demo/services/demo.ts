import { request, apiUrls } from '@/api';

export default {
    // 简单场景
    async getUser() {
        const res = await request.Get('/api/user');

        return res.data;
    },

    // 参数场景
    getRepo(id) {
        return request.Get(`/api/repo/${id}`);
    },

    // 简单场景
    getResList() {
        const res = request.Get(apiUrls.GET_RES_LIST, {});
        return res;
    },

    // 格式化返回值
    async getDetail(params) {
        const data = await request.Get('/api/detail', params);

        return data.map((item) => {
            return {
                ...item,
                price: item.oldPrice,
                text: item.status === '1' ? '确定' : '取消',
            };
        });
    },

    async fakeAccountLogin() {
        return request
            .Get(apiUrls.GET_USER_INFO, {}, { loading: true })
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
                return {};
            })
            .catch((err) => {
                console.log('fakeAccountLogin:', err);
            });
    },
};
