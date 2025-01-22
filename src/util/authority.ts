import { getQueryString } from '@/util';

// use storage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
    return sessionStorage.getItem('token') || getQueryString('token') || '';
}

export function setAuthority(authority) {
    return sessionStorage.setItem('token', authority);
}
