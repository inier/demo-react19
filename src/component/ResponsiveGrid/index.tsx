import React, { FC } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

interface ResponsiveGridProps {
    children: React.ReactNode;
    gap?: number;
    columns?: {
        xs?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    className?: string;
    style?: React.CSSProperties;
}

interface CellProps {
    children?: React.ReactNode;
    colSpan?: number;
    className?: string;
    style?: React.CSSProperties;
}

const Cell: FC<CellProps> = ({ children, colSpan = 1, className, style }) => {
    return (
        <div className={clsx(styles[`col-${colSpan}`], className)} style={style}>
            {children}
        </div>
    );
};

const ResponsiveGrid: FC<ResponsiveGridProps> & { Cell: FC<CellProps> } = ({
    children,
    gap = 16,
    columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
    className,
    style,
}) => {
    const gridStyle = {
        ...style,
        gap: `${gap}px`,
    };

    const gridClass = clsx(
        styles.grid,
        columns.xs && styles[`cols-xs-${columns.xs}`],
        columns.sm && styles[`cols-sm-${columns.sm}`],
        columns.md && styles[`cols-md-${columns.md}`],
        columns.lg && styles[`cols-lg-${columns.lg}`],
        columns.xl && styles[`cols-xl-${columns.xl}`],
        className
    );

    return (
        <div className={gridClass} style={gridStyle}>
            {children}
        </div>
    );
};

ResponsiveGrid.Cell = Cell;

export default ResponsiveGrid;
