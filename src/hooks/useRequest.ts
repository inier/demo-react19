import { useRequest as useAhooksRequest } from 'ahooks';
import { request } from '@/api';

function useRequest(service, options, plugins) {
    let s;
    if (isFunction(service)) {
        s = service;
    } else if (isString(service)) {
        s = async (...extraOptions) => {
            return request.instance({ url: service, ...extraOptions });
        };
    } else {
        const options = service;
        s = async (...extraOptions) => {
            return request.instance({ ...options, ...extraOptions });
        };
    }

    const req = useAhooksRequest(
        s,
        {
            // Note:
            // ahooks/useRequest manual default to true.
            // this useRequest Default to manual request.
            manual: true,
            // 默认使用 request 作为请求方法
            requestMethod: request,
            ...options,
        },
        plugins
    );
    return {
        ...req,
        // Modify ahooks' useRequest `run` as `request`
        request: req.run,
    };
}
function isString(str) {
    return typeof str === 'string';
}
function isFunction(fn) {
    return typeof fn === 'function';
}

export default useRequest;
