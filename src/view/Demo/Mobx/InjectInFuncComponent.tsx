import { inject, observer } from 'mobx-react';
import { Avatar } from '@/component';

function FuncComponent(props) {
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
