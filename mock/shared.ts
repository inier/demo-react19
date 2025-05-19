import path from 'node:path';
import { createDefineMock } from 'rspack-plugin-mock/helper';

export const defineAPIMock = createDefineMock((mock) => {
    mock.url = path.join('/api', mock.url);
});

export const definePostMock = createDefineMock((mock) => {
    mock.url = `/api/post/${mock.url}`;
});
