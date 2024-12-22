import styles from './Loading.module.scss';

/**
 * @description 抖音风格的loading图标
 * @returns 组件
 */
function Loading({ style = 'douyin' }: any) {
    return (
        <div className={styles.progressBox}>
            <div className={styles.progressWrap}>{style === 'douyin' && <DouYinLoading />}</div>
        </div>
    );
}

function DouYinLoading() {
    return (
        <div className={styles.loading7}>
            <i />
            <i />
        </div>
    );
}

export default Loading;
