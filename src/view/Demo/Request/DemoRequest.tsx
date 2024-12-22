import { inject, observer } from 'mobx-react';

function DemoRequest(props: any) {
    const { userStore, id, title, name, data = { x: 100 }, options = {} } = props;
    const { resList = [] } = userStore;
    const handleClick = () => {
        userStore.getAdminResList(data, options);
    };

    return (
        <div>
            <h6>{title}</h6>
            <div>
                <button onClick={handleClick}>{name}</button>
                <span>
                    data: {JSON.stringify(data)}, options：{JSON.stringify(options)}
                </span>
                <span>
                    {id}-result: <span>{resList[0]?.resourceName}</span>
                </span>
            </div>
        </div>
    );
}

export default inject('userStore')(observer(DemoRequest));
