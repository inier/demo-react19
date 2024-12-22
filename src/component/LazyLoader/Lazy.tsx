import { lazy as reactLazy, Suspense } from 'react';

import { loadSpinner } from './LoadSpinner';

/**
 * 组件导入函数,支持自定义加载动画
 * Create a loadable component "Suspense" ready.
 * @param {Function} func 返回动态引入的函数, 如 ()=>import('./a/b/c')
 * @param {Object} options {spinner:spinner, // loading动画组件, 默认为loadSpinner, 其他参数参考LoadSpinner组件}
 * @returns {Component}
 */
export const lazy = (func, options) => {
    const { spinner, ...restOptions } = options;
    const LazyComponent = reactLazy(func);

    return function LazyComponentFunc(props) {
        return (
            <Suspense fallback={loadSpinner(spinner, restOptions)}>
                <LazyComponent {...props} />
            </Suspense>
        );
    };
};

/**
 * 组件导入函数,支持自定义加载动画
 * @param {Function} func 返回动态引入的函数, 如 ()=>import('./a/b/c')
 * @param {Object} options {spinner:spinner, // loading动画组件, 默认为loadSpinner, 其他参数参考LoadSpinner组件}
 * @returns {Component}
 */
export const lazyX = (func, options) => {
    const { spinner, ...restOptions } = options;
    const LazyXComponent = reactLazy(func);

    return function LazyXComponentFunc(props) {
        return (
            <Suspense fallback={loadSpinner(spinner, restOptions)}>
                <LazyXComponent {...props} />
            </Suspense>
        );
    };
};
