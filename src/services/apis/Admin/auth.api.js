import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';
import apiClient from '../../../utils/apiClient';
import {
    attachCookieHeader,
    clearAuthSession,
    persistResponseCookies,
} from '../../../utils/authSession';

export const loginAdminAPI = async (data) => {
    const response = await apiClient.post('/admin/v1/auth/login', data);
    await persistResponseCookies(response.headers, 'admin');
    return response.data;
};

export const logoutAdminAPI = async () => {
    try {
        const response = await authorizedAxiosAdmin.delete('/admin/v1/auth/logout');
        return response.data;
    } finally {
        await clearAuthSession('admin');
    }
};

export const refreshAdminTokenAPI = async () => {
    const config = await attachCookieHeader({}, 'admin');
    const response = await apiClient.post('/admin/v1/auth/refresh-token', {}, config);
    await persistResponseCookies(response.headers, 'admin');
    return response.data;
};
