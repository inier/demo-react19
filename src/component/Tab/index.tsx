import React, { FC } from 'react';
import { Tabs } from '@arco-design/mobile-react';
import styles from './styles.module.scss';

interface TabItemProps {
    title: string;
    content: React.ReactNode;
}

interface TabProps {
    tabs: Array<TabItemProps>;
    children?: React.ReactNode;
    defaultActiveTab?: number;
    onChange?: (key: { title: string }, index: number) => void;
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

const Tab: FC<TabProps> & { TabPane: FC<TabPaneProps> } = ({ tabs = [], onChange, children, ...resProps }) => {
    return (
        <Tabs
            tabs={tabs}
            type="line-divide"
            defaultActiveTab={0}
            useCaterpillar={true}
            tabBarHasDivider={false}
            duration={400}
            transitionDuration={400}
            onAfterChange={(tab, index) => {
                console.log('[tabs]', tab, index);
            }}
            {...resProps}
        >
            {children}
        </Tabs>
    );
};

Tab.TabPane = TabPane;

export default Tab;
