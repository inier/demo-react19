import React, { FC, useState } from 'react';
import { Tabs } from '@arco-design/mobile-react';
import styles from './styles.module.scss';

interface TabProps {
    tabs: [],
    children?: React.ReactNode;
    defaultActiveKey?: string;
    onChange?: (key: { title: string, }, index: number) => void;
    className?: string;
    style?: React.CSSProperties;
}

interface TabPaneProps {
    children?: React.ReactNode;
    tabKey: string;
}

const TabPane: FC<TabPaneProps> = ({ children, tabKey }) => (
    <div className={styles.tabPane} key={tabKey}>
        {children}
    </div>
);

const Tab: FC<TabProps> & { TabPane: FC<TabPaneProps> } = ({
    tabs = [],
    onChange,
    children,
    ...resProps
}) => {
    const [index, setIndex] = useState(0);
    return (
        <Tabs
            tabs={tabs}
            type="line-divide"
            defaultActiveTab={index}
            useCaterpillar={true}
            tabBarHasDivider={false}
            duration={400}
            transitionDuration={400}
            onAfterChange={(tab, index) => {
                console.log('[tabs]', tab, index);
                setIndex(index);
                onChange && onChange(tab, index);
            }}
            {...resProps}
        >
            {tabs[index]?.content}
        </Tabs>
    );
}




Tab.TabPane = TabPane;

export default Tab; 