import Card from '../index';
import styles from './styles.module.scss';

const CardDemo = () => {
  return (
    <div className={styles.demoContainer}>
      <h3>Card Component Demo</h3>
      <Card title="Demo Card" bordered hoverable>
        <Card.Header title="Card Title" />
        <Card.Content>
          This is a demo card content.
        </Card.Content>
        <Card.Divider />
      </Card>
    </div>
  );
};

export default CardDemo;




