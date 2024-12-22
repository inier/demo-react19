import Avatar from '../index';
import styles from './styles.module.scss';

const AvatarDemo = () => {
    return (
        <div className={styles.demoContainer}>
            <h3>Avatar 头像</h3>

            <div className={styles.demoSection}>
                <h4>基础用法</h4>
                <Avatar src="http://iph.href.lu/200x200" />
                <Avatar>U</Avatar>
                <Avatar>USER</Avatar>
            </div>

            <div className={styles.demoSection}>
                <h4>不同尺寸</h4>
                <Avatar size="xs" src="http://iph.href.lu/100x100" />
                <Avatar size="sm" src="http://iph.href.lu/200x200" />
                <Avatar size="md" src="http://iph.href.lu/300x300" />
                <Avatar size="lg" src="http://iph.href.lu/400x400" />
                <Avatar size="xl" src="http://iph.href.lu/500x500" />
            </div>

            <div className={styles.demoSection}>
                <h4>不同形状</h4>
                <Avatar shape="circle" src="http://iph.href.lu/200x200" />
                <Avatar shape="square" src="http://iph.href.lu/200x200" />
            </div>
        </div>
    );
};

export default AvatarDemo;
