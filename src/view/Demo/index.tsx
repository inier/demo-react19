import { ResponsiveGrid, Card } from '@/component';

import DemoRequest from './Request';
import DemoMobx from './Mobx';
import DemoUI from './UI';
import './Mock';

const { Cell } = ResponsiveGrid;

const list = [
    {
        title: 'UI示例',
        content: <DemoUI />,
    },
    {
        title: '请求示例',
        content: <DemoRequest />,
    },
    {
        title: 'mobx状态示例',
        content: <DemoMobx />,
    },
    {
        title: 'mock示例',
        content: <div id="mockDemo" />,
    },
];

const DemoList = () => {
    return (
        <ResponsiveGrid gap={0}>
            <Cell colSpan={12}>
                {list.map((item) => {
                    return (
                        <Card key={item.title}>
                            <Card.Header title={item.title} />
                            <Card.Divider />
                            <Card.Content>{item.content}</Card.Content>
                        </Card>
                    );
                })}
            </Cell>
        </ResponsiveGrid>
    );
};

export default DemoList;
