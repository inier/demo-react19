import React, { useEffect, useState, PropsWithChildren } from 'react';

import styles from './LoadSpinner.module.scss';

// 过渡loader容器
export const LoadSpinnerWrapper = ({
    className = '',
    style = {},
    children,
}: PropsWithChildren<{ className?: string; style?: React.CSSProperties }>) => {
    return (
        <div className={`${styles.wrapper} ${className}`} style={style}>
            {children}
        </div>
    );
};

// 延迟fallback
export const DelayedFallback = ({ delay = 300, children }: PropsWithChildren<{ delay?: number }>) => {
    const [show, setShow] = useState(false);
    useEffect(() => {
        let timeout = setTimeout(() => setShow(true), delay);
        return () => {
            clearTimeout(timeout);
        };
    }, [delay]);

    return <>{show && children}</>;
};

/**
 * 加载过渡的loader
 * @param {*} spinner 加载过渡的组件
 * @param {*} options 选项, {
 *     spinner:spinner, // loading动画组件, 默认为loadSpinner,
 *     pastDelay:300, // fallback显示的延迟时间, 默认300ms,
 *     isLoading: true, // 强制加载/不加载
 *     error: false, // 强制报错
 * }
 * @returns {*}
 */
export const loadSpinner: any = (spinner = <div className={styles.loader} />, options = {}) => {
    const tOptions = Object.assign(
        {
            pastDelay: 300,
            isLoading: true,
            error: false,
        },
        options
    );
    const { isLoading, pastDelay, error } = tOptions;

    if (error) {
        return (
            <LoadSpinnerWrapper>
                <div>
                    <span>加载失败，</span>
                    <span
                        className={styles.error}
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        点击刷新
                    </span>
                </div>
            </LoadSpinnerWrapper>
        );
    }

    if (isLoading) {
        if (pastDelay) {
            return (
                <LoadSpinnerWrapper>
                    <DelayedFallback delay={pastDelay}>{spinner}</DelayedFallback>
                </LoadSpinnerWrapper>
            );
        }

        return <LoadSpinnerWrapper>{spinner}</LoadSpinnerWrapper>;
    }

    return null;
};
const LoaderSpinner = () => {
    return <div>{loadSpinner()}</div>;
};

export default LoaderSpinner;
