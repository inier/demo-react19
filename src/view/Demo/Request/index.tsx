import { Tab } from '@/component';
import { DemoUseRequest1, DemoUseRequest2, DemoUseRequest3 } from './DemoUseRequest';
import DemoRequest from './DemoRequest';

function Request() {
  const tabs = [
    {
      title: 'useRequest',
      key: 'ccm',
      content: (
        <div>
          <DemoUseRequest1 id={1} />
          <DemoUseRequest2 id={2} />
          <DemoUseRequest3 id={3} options={{ throttleInterval: 5000, refreshOnWindowFocus: true }} />
          <DemoUseRequest3 id={4} options={{ cacheKey: `getResList-1`, refreshOnWindowFocus: true }} />
          更多用法：
          <a href="https://ahooks.js.org/zh-CN/hooks/async#%E9%BB%98%E8%AE%A4%E8%AF%B7%E6%B1%82" target="_blank">
            详情
          </a>
        </div>
      ),
    },
    {
      title: 'request',
      key: 'cfm',
      content: (
        <div>
          <DemoRequest id={11} title={'正常请求'} name={'request正常请求'} />
          <DemoRequest
            id={12}
            title={'正常请求(关闭loading)'}
            name={'request正常请求'}
            data={{ x: 300, y: 300 }}
            options={{ loading: false }}
          />
          <DemoRequest
            id={13}
            title={'测试取消请求'}
            name={'request可取消重复请求'}
            options={{ loading: false, cancelRequest: true }}
          />
          <DemoRequest
            id={14}
            title={'测试请求重发，除了原请求外还会重发3次'}
            name={'request请求重发'}
            options={{ loading: false, retry: 3, retryDelay: 1000 }}
          />
          <DemoRequest
            id={15}
            title={'测试缓存请求带参数：setExpireTime 为缓存有效时间ms'}
            name={'request缓存请求带参数'}
            options={{ loading: false, method: 'get', cache: true, setExpireTime: 30000 }}
          />
          <DemoRequest
            id={16}
            title={'测试缓存请求参数值不一样'}
            name={'request缓存请求(默认)'}
            options={{ loading: false, cache: true }}
          />
        </div>
      ),
    },
  ];

  return (
    <Tab tabs={tabs}>
      {tabs.map((item) => (
        <Tab.TabPane tabKey={item.title}>
          {item.content}
        </Tab.TabPane>
      ))}
    </Tab>
  );
}

export default Request;
