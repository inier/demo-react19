import React from 'react';
import type { CSSProperties } from 'react';
import styles from './styles.module.scss';

interface ButtonProps {
    children?: React.ReactNode;
    type?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
    size?: 'sm' | 'md' | 'lg' | 'xs' | 'xl';
    disabled?: boolean;
    loading?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    style?: CSSProperties;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    type = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    style,
    className,
}) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) {
            return;
        }
        onClick?.(e);
    };

    const classes = [
        styles.btn,
        styles[`btn-${type}`],
        styles[`btn-${size}`],
        disabled ? styles['btn-disabled'] : '',
        loading ? styles['btn-loading'] : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} onClick={handleClick} disabled={disabled || loading} style={style}>
            {loading && <span className={styles['btn-loading-icon']} />}
            {children}
        </button>
    );
};

export default Button;
