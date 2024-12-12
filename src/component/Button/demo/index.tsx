import Button from '../index';
import styles from './styles.module.scss';

const ButtonDemo = () => {
  return (
    <div className={styles.demoContainer}>
      <h3>Button 按钮</h3>
      
      <div className={styles.demoSection}>
        <h4>基础用法</h4>
        <Button type="default">默认按钮</Button>
        <Button type="primary">主要按钮</Button>
        <Button type="text">文本按钮</Button>
        <Button type="link">链接按钮</Button>
        <Button type="dashed">虚线按钮</Button>
      </div>

      <div className={styles.demoSection}>
        <h4>不同尺寸</h4>
        <Button size="sm">小按钮</Button>
        <Button size="md">中等按钮</Button>
        <Button size="lg">大按钮</Button>
        <Button size="xs">非常小按钮</Button>
        <Button size="xl">非常大按钮</Button>
      </div>

      <div className={styles.demoSection}>
        <h4>禁用状态</h4>
        <Button type="default" disabled>默认禁用</Button>
        <Button type="primary" disabled>主要禁用</Button>
        <Button type="text" disabled>文本禁用</Button>
        <Button type="link" disabled>链接禁用</Button>
        <Button type="dashed" disabled>虚线禁用</Button>
      </div>
    </div>
  );
};

export default ButtonDemo;