import { useObserver, Observer, useLocalObservable, observer } from 'mobx-react';
import { useMobxStores } from '@/hooks';
import { Avatar, Button } from '@/component';
import demoStore from '../stores/DemoStore';

function FuncComponent(props) {
    return (
        <>
            <p>func component + mobx hook</p>
            <hr />
            <Demo1 />
            <hr />
            <Demo2 />
            <hr />
            <Demo3 />
            <hr />
            <Demo4 />
        </>
    );
}

// 方法1：useMobxStores
const Demo1 = observer(() => {
    const { userStore } = useMobxStores();
    const { avatar, name } = userStore.userInfo;

    return (
        <div>
            <Avatar size="sm" src={avatar} />
            <span style={{ marginLeft: 10 }}>{name}</span>
        </div>
    );
});

// 方法2：observer包裹组件
const Demo2 = observer(() => {
    const localStore = useLocalObservable(() => demoStore);
    const { avatar, name } = localStore.userInfo;
    const handleClick = () => {
        // 正常请求
        localStore.getUser();
    };

    return (
        <>
            <Button onClick={handleClick}>点击获取信息</Button>
            <div>
                <Avatar size="sm" src={avatar} />
                <span style={{ marginLeft: 10 }}>{name}</span>
            </div>
        </>
    );
});

// 方法3：命令式，useObserver，传入函数
const Demo3 = observer(() => {
    const localStore = useLocalObservable(() => demoStore);
    const { avatar, name } = localStore.userInfo;
    const handleClick = () => {
        // 正常请求
        localStore.getUser();
    };

    return useObserver(() => (
        <>
            <Button onClick={handleClick}>点击获取信息</Button>
            <div>
                <Avatar size="sm" src={avatar} />
                <span style={{ marginLeft: 10 }}>{name}</span>
            </div>
        </>
    ));
});

// 方法4：标签式，Observer包裹返回值，包裹的必须是一个函数
const Demo4 = observer(() => {
    const localStore = useLocalObservable(() => demoStore);
    const { avatar, name } = localStore.userInfo;
    const handleClick = () => {
        // 正常请求
        localStore.getUser();
    };

    return (
        <Observer>
            {() => (
                <>
                    <Button onClick={handleClick}>点击获取信息</Button>
                    <div>
                        <Avatar size="sm" src={avatar} />
                        <span style={{ marginLeft: 10 }}>{name}</span>
                    </div>
                </>
            )}
        </Observer>
    );
});

export default FuncComponent;
