import { Tab } from '@/component';
import { UIList } from './config';

function UI() {
  return (
    <Tab tabs={UIList} tabBarGutter={42}>
      {...UIList.map((item) => (
        <Tab.TabPane tabKey={item.title}>
          {item.content}
        </Tab.TabPane>
      ))}
    </Tab>
  );
}

export default UI;
