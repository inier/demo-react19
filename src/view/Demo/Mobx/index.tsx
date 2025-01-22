import { Tab } from '@/component';
import InjectInClassComponent from './InjectInClassComponent';
import InjectInFuncComponent from './InjectInFuncComponent';
import HookInFuncComponent from './HookInFuncComponent';

function Mobx() {
    const tabs = [
        { title: 'func + mobx hook', key: 'chm', content: <HookInFuncComponent /> },
        {
            title: 'func + mobx inject',
            key: 'cfm',
            content: <InjectInFuncComponent />,
        },
        {
            title: 'class + mobx inject',
            key: 'ccm',
            content: <InjectInClassComponent />,
        },
    ];

    return (
        <Tab tabs={tabs}>
            {tabs.map((item) => (
                <Tab.TabPane key={item.title} tabKey={item.title}>
                    {item.content}
                </Tab.TabPane>
            ))}
        </Tab>
    );
}

export default Mobx;
