import React, { FC } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

interface CardProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  cover?: React.ReactNode;
  children?: React.ReactNode;
  bordered?: boolean;
  hoverable?: boolean;
  free?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface CardComposition {
  Header: FC<{ title: string }>;
  Content: FC<{ children: React.ReactNode }>;
  Divider: FC;
}

const Card: FC<CardProps> & CardComposition = ({
  title,
  extra,
  cover,
  children,
  bordered = true,
  hoverable = false,
  free,
  className,
  style,
}) => {
  const cardClass = clsx(
    styles.card,
    bordered && styles.bordered,
    hoverable && styles.hoverable,
    free && styles.free,
    className
  );

  return (
    <div className={cardClass} style={style}>
      {cover && <div className={styles.cover}>{cover}</div>}
      {(title || extra) && (
        <div className={styles.header}>
          {title && <div className={styles.title}>{title}</div>}
          {extra && <div className={styles.extra}>{extra}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
};

Card.Header = ({ title }) => (
  <div className={styles.header}>
    <div className={styles.title}>{title}</div>
  </div>
);

Card.Content = ({ children }) => (
  <div className={styles.body}>{children}</div>
);

Card.Divider = () => <div className={styles.divider} />;

export default Card; 