import { useMemo, useEffect } from 'react';
import { Avatar, Form, Tab } from '@alifd/next';
import { observer } from 'mobx-react';

import { PageContainer, Text } from '@/components/Temp';
import { useMobxStore } from '@/hooks';
import { getFirstCapitalizedLetter } from '@/utils';

const { Item: TabPane } = Tab;

const UserCenterPage = () => {
    const { userInfo, getUser } = useMobxStore('userStore');
    useEffect(() => {
        getUser();
    }, []);

    const userNameInitials = useMemo(() => {
        if (userInfo?.name) {
            return getFirstCapitalizedLetter(userInfo.name);
        }
        return '';
    }, [userInfo?.name]);

    return (
        <PageContainer>
            <Tab defaultActiveKey="1">
                <TabPane title="基本信息" key="1">
                    <Form layout="vertical" style={{ margin: '20px 0' }} className="form-vertical--preview">
                        <Form.Item>
                            <Avatar shape="circle" size={72} style={{ backgroundColor: '#ffa22d' }}>
                                {userNameInitials}
                            </Avatar>
                        </Form.Item>
                        <Form.Item label="姓名">
                            <Text>{userInfo?.name}</Text>
                        </Form.Item>
                        <Form.Item label="邮箱">
                            <Text>{userInfo?.email}</Text>
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane title="其他信息" key="2">
                    <Form layout="vertical" style={{ margin: '20px 0' }} className="form-vertical--preview">
                        <Form.Item label="注册时间">
                            <Text>{userInfo?.createTime}</Text>
                        </Form.Item>
                        <Form.Item label="状态">
                            <Text>{['正常', '冻结'][Number(userInfo?.status || -1)]}</Text>
                        </Form.Item>
                        <Form.Item label="绑定手机">
                            <Text>{userInfo?.mobile}</Text>
                        </Form.Item>
                        <Form.Item label="绑定邮箱">
                            <Text>{userInfo?.email}</Text>
                        </Form.Item>
                    </Form>
                </TabPane>
            </Tab>
        </PageContainer>
    );
};

UserCenterPage.displayName = 'UserCenterPage';

export default observer(UserCenterPage);
