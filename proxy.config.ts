// dev proxy config
// http://localhost:3000/api -> http://localhost:3000
// http://localhost:3000/api/foo -> http://localhost:3000/foo

export default {
    '/api/mock': {
        // mock api地址
        target: 'http://172.16.192.162:3000/mock/12',
        changeOrigin: true,
        pathRewrite: {
            '^/api/mock': '',
        },
    },
    '/api': {
        // target: 'https://uat.mall.changan.com.cn',
        target: 'https://mall.changan.com.cn',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: { '^/api': '' },
    },
};
