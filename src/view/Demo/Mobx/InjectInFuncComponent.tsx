import { inject, observer } from 'mobx-react';
import { Avatar } from '@/component';
import UserStore from '@/store/UserStore';

interface InjectedProps {
    userStore: UserStore;
}

function FuncComponent(props: InjectedProps) {
    const { userStore } = props;
    const { avatar, name } = userStore.userInfo;

    return (
        <>
            <p>func component + mobx inject</p>
            <div>
                <Avatar size="sm" src={avatar} />
                <span style={{ marginLeft: 10 }}>{name}</span>
            </div>
        </>
    );
}

export default inject('userStore')(observer(FuncComponent));
