export interface IPublicKey {
    exp: string;
    mod: string;
}

export interface IDataSource {
    username: string;
    password: string;
    picCode: string;
    timestamp: string;
}

export interface ILoginProps {
    dataSource?: IDataSource;
    [propName: string]: any;
}

export interface ILoginReturn {
    token?: string;
    userName?: string;
    avatar?: string;
    portalName?: string;
}

export interface UserInfo {
    isAdmin: boolean;
    name: string;
    username: string;
    nickName: string;
    avatar: string;
    userid: string;
    userType: 'admin' | 'user';
    portalId: number;
    partnerId: string;
}

export interface LoginParams {
    username: string;
    password: string;
}

export interface LoginResult {
    success?: boolean;
    msg?: string;
}
