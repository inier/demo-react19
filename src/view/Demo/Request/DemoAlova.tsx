import { useRequest } from 'alova/client';
import { request, apiUrls } from '@/api';
import { Button } from '@/component'; // 假设项目有Button组件

// 假设 data 符合预期的用户信息结构
interface UserInfo {
    id: number;
    username: string;
    email: string;
}

function DemoAlova() {
    // 使用alova实例创建method并传给useRequest即可发送请求
    const { loading, data, error, send, update } = useRequest(
        request.Get(apiUrls.GET_USER_INFO, {
            cacheFor: 0,
            params: { userId: 123 },
        }),
        {
            initialData: {}, // 设置data状态的初始数据
            immediate: true, // 是否立即发送请求，默认为true
        }
    );

    const handleSend = () => {
        send();
    };
    const handleUpdate = () => {
        update({
            data: { title: 'new title' },
        });
    };

    if (loading) {
        return <div>Loading...</div>;
    } else if (error) {
        return <div>{error.message}</div>;
    }

    function reload(): void {
        throw new Error('Function not implemented.');
    }
    const userData = data as UserInfo;

    return (
        <div className="example-container">
            {loading && (
                <div className="loading">
                    <span role="img" aria-label="loading">
                        ⏳
                    </span>{' '}
                    加载中...
                </div>
            )}

            {error && (
                <div className="error">
                    <h4>请求失败</h4>
                    <p>错误信息：{error.message}</p>
                    <Button onClick={reload} type="primary">
                        重新加载
                    </Button>
                </div>
            )}

            {userData && (
                <div className="user-info">
                    <h3>用户信息</h3>
                    <p>用户ID：{userData.id}</p>
                    <p>用户名：{userData.username}</p>
                    <p>邮箱：{userData.email}</p>
                    <Button onClick={reload} type="default">
                        刷新信息
                    </Button>
                    <div>
                        <div>请求结果: {JSON.stringify(userData)}</div>
                        <button onClick={handleSend}>手动发送请求</button>
                        <button onClick={handleUpdate}>手动修改data</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DemoAlova;
