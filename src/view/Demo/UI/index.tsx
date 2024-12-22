import { Tab } from '@/component';
import { UIList } from './config';

function UI() {
    return (
        <Tab tabs={UIList}>
            {...UIList.map((item) => (
                <Tab.TabPane key={item.title} tabKey={item.title}>
                    {item.content}
                </Tab.TabPane>
            ))}
        </Tab>
    );
}

export default UI;
