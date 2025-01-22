import ReactLogo from '@/assets/svgs/react_logo.svg?react';
import styles from './index.module.scss';

export default function Home() {
    return (
        <div>
            <ReactLogo className={styles.logo} />
            <h2>Hello, React</h2>
        </div>
    );
}
