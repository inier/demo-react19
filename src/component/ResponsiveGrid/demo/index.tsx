import ResponsiveGrid from '../index';
import styles from './styles.module.scss';

const ResponsiveGridDemo = () => {
  return (
    <div className={styles.demoContainer}>
      <h3>Responsive Grid 响应式网格</h3>
      
      <div className={styles.demoSection}>
        <h4>基础用法</h4>
        <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }} gap={16}>
          <ResponsiveGrid.Cell colSpan={2}>
            <div className={styles.demoCell}>Cell 1</div>
          </ResponsiveGrid.Cell>
          <ResponsiveGrid.Cell colSpan={1}>
            <div className={styles.demoCell}>Cell 2</div>
          </ResponsiveGrid.Cell>
          <ResponsiveGrid.Cell colSpan={1}>
            <div className={styles.demoCell}>Cell 3</div>
          </ResponsiveGrid.Cell>
          <ResponsiveGrid.Cell colSpan={1}>
            <div className={styles.demoCell}>Cell 4</div>
          </ResponsiveGrid.Cell>
          <ResponsiveGrid.Cell colSpan={2}>
            <div className={styles.demoCell}>Cell 5</div>
          </ResponsiveGrid.Cell>
          <ResponsiveGrid.Cell colSpan={1}>
            <div className={styles.demoCell}>Cell 6</div>
          </ResponsiveGrid.Cell>
          <ResponsiveGrid.Cell colSpan={1}>
            <div className={styles.demoCell}>Cell 7</div>
          </ResponsiveGrid.Cell>
          <ResponsiveGrid.Cell colSpan={1}>
            <div className={styles.demoCell}>Cell 8</div>
          </ResponsiveGrid.Cell>
        </ResponsiveGrid>
      </div>
    </div>
  );
};

export default ResponsiveGridDemo;
