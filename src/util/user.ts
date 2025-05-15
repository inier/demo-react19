import { useNavigate } from 'react-router';

/**
 * 重定向跳转登录
 * @param {string} absolutePath 重定向的绝对路径
 */
export const goToLoginWithRedirect = () => {
    const navigate = useNavigate();
    sessionStorage.setItem('token', '');

    navigate('/login');
    // if (window.location.pathname !== `/${PUBLIC_URL}/user/login?redirect`) {
    //   // token 过期处理
    //   const queryString = stringify({
    //     redirect: absolutePath?.indexOf('http') >= 0 ? absolutePath : window.location.href,
    //   });

    //   console.log('无权限，跳转登录');
    //   window.location.href = `${window.location.origin}/${PUBLIC_URL}/user/login?${queryString}`;
    // }
};

/**
 * 获取LocalStorage中的用户信息
 */
export const getUserFromStorage = () => {
    try {
        const user = localStorage.getItem('user') || '';
        return JSON.parse(user);
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
    }
};

/**
 * 设置用户信息到LocalStorage
 * @param user
 */
export const setUserToStorage = (user: string) => {
    localStorage.setItem('user', JSON.stringify(user));
};

/**
 * 清除sessionStorage中的用户信息
 */
export const cleanUserToStorage = () => {
    localStorage.removeItem('user');
};
