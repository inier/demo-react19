// sse.mock.ts
import { createSSEStream, defineMock } from 'rspack-plugin-mock/helper';

export default defineMock({
    url: '/api/sse',
    response(req, res) {
        const sse = createSSEStream(req, res);
        let count = 0;
        const timer = setInterval(() => {
            sse.write({
                event: 'count',
                data: { count: ++count },
            });
            if (count >= 10) {
                sse.end();
                clearInterval(timer);
            }
        }, 1000);
    },
});
