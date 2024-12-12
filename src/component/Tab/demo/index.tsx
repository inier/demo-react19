import Tab from '../index';
import styles from './styles.module.scss';

const TabDemo = () => {
  return (
    <div className={styles.demoContainer}>
      <h3>Tab 标签页</h3>
      
      <div className={styles.demoSection}>
        <h4>基础用法</h4>
        <Tab defaultActiveKey="1" onChange={(key) => console.log(key)}>
          <Tab.TabPane tab="Tab 1" tabKey="1">
            Content of Tab Pane 1
          </Tab.TabPane>
          <Tab.TabPane tab="Tab 2" tabKey="2">
            Content of Tab Pane 2
          </Tab.TabPane>
          <Tab.TabPane tab="Tab 3" tabKey="3">
            Content of Tab Pane 3
          </Tab.TabPane>
        </Tab>
      </div>
    </div>
  );
};

export default TabDemo;