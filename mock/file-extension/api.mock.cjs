/**
 * @type {import('rspack-plugin-mock').MockHttpItem}
 */
try {
    module.exports = {
        url: '/api/common-js',
        body: {
            message: 'Write mock configuration using a CommonJs file.',
        },
    };
} catch (error) {
    console.error('Failed to load rspack-plugin-mock:', error);
    // 可以选择抛出异常或返回一个默认值
    throw new Error('Failed to load rspack-plugin-mock');
}
