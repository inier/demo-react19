import { Component } from 'react';
import { inject, observer } from 'mobx-react';

import { Avatar } from '@/component';
import { UserStore } from '@/store';

interface IUserInfo {
    avatar: string;
    name: string;
    desc?: string;
    nickName?: string;
}

interface IStates {
    userInfo: IUserInfo;
}

interface IProps {
    userStore: UserStore | undefined;
}

@inject('userStore')
@observer
class ClassComponent extends Component<IProps, IStates> {
    render() {
        const { userStore } = this.props;
        const { avatar, name } = userStore.userInfo;

        return (
            <>
                <p>class component + mobx inject</p>
                <div>
                    <Avatar size="sm" src={avatar} />
                    <span style={{ marginLeft: 10 }}>{name}</span>
                </div>
            </>
        );
    }
}

export default ClassComponent;
