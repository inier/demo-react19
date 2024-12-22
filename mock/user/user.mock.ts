import { apiUrls } from '@/api';
// https://www.npmjs.com/package/rspack-plugin-mock
import { defineMock } from 'rspack-plugin-mock/helper';
import Mock from 'mockjs';

export default defineMock([
    {
        url: '/api/user',
        body: {
            result: 0,
            data: { avatar: 'xxx', name: 'yyy' },
        },
    },
    {
        url: '/api/' + apiUrls.GET_RES_LIST,
        body: {
            result: 0,
            data: { avatar: 'xxx', name: 'yyy' },
        },
    },
    {
        url: '/api/test1',
        body: { a: 1, b: 2 },
    },
    // Match /api/test?a=1
    {
        url: '/api/test2',
        validator: {
            query: { a: 1 },
        },
        body: { message: 'query.a == 1' },
    },
    // Match /api/test?a=2
    {
        url: '/api/test3',
        validator: {
            query: { a: 2 },
        },
        body: { message: 'query.a == 2' },
    },
    {
        // `?a=3` will resolve to `validator.query`
        url: '/api/test4?a=3',
        body: { message: 'query.a == 3' },
    },
    // Use mockjs
    {
        url: '/api/test5',
        body: Mock.mock({
            'list|1-10': [
                {
                    'id|+1': 1,
                },
            ],
        }),
    },
    // Hitting the POST /api/test request, and in the request body,
    // field a is an array that contains items with values of 1 and 2.
    {
        url: '/api/test6',
        method: ['POST'],
        validator: { body: { a: [1, 2] } },
    },
]);
