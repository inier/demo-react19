// dev proxy config
// http://localhost:3000/api -> http://localhost:3000
// http://localhost:3000/api/foo -> http://localhost:3000/foo

export const devProxy = {
    '/api-mock': {
        // mock api地址
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
            '^/api-mock': '/api',
        },
    },
    // '/api': {
    //     target: 'http://xxx.xxx.com.cn:3000/xxx/xx',
    //     changeOrigin: true,
    //     pathRewrite: {
    //         '^/api': '',
    //     },
    // },
};
