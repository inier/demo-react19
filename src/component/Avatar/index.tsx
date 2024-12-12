import React from 'react';
import { clsx } from 'clsx';
import styles from './styles.module.scss';

interface AvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  alt?: string;
  shape?: 'circle' | 'square';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  shape = 'circle',
  style,
  className,
  onClick,
  children
}) => {
  const avatarClass = clsx(
    styles.avatar,
    styles[`avatar-${size}`],
    styles[`avatar-${shape}`],
    src && styles['avatar-image'],
    !src && styles['avatar-text'],
    className
  );

  return (
    <div 
      className={avatarClass}
      style={style}
      onClick={onClick}
    >
      {src ? (
        <img src={src} alt={alt} />
      ) : children || (
        <span>{alt?.[0]?.toUpperCase() || '?'}</span>
      )}
    </div>
  );
};

export default Avatar;
