import { DeviceEventEmitter } from 'react-native';
import { createApiClient } from './apiClient';
import {
    attachCookieHeader,
    clearAuthSession,
    persistResponseCookies,
} from './authSession';

const authorizedAxiosAdmin = createApiClient({
    timeout: 10000,
});
const refreshAxiosAdmin = createApiClient();

const clearAuthAndNotify = async () => {
    await clearAuthSession('admin');
    DeviceEventEmitter.emit('auth:logout');
};

authorizedAxiosAdmin.interceptors.request.use(
    (config) => attachCookieHeader(config, 'admin'),
    (error) => Promise.reject(error)
);

authorizedAxiosAdmin.interceptors.response.use(
    async (response) => {
        await persistResponseCookies(response.headers, 'admin');
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (status === 410 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await attachCookieHeader(originalRequest, 'admin');
                const refreshConfig = await attachCookieHeader({}, 'admin');
                const refreshResponse = await refreshAxiosAdmin.post('/admin/v1/auth/refresh-token', {}, refreshConfig);
                await persistResponseCookies(refreshResponse.headers, 'admin');
                await attachCookieHeader(originalRequest, 'admin');
                return authorizedAxiosAdmin(originalRequest);
            } catch {
                await clearAuthAndNotify();
            }
        }

        if ([401, 403].includes(status)) {
            await clearAuthAndNotify();
        }

        return Promise.reject(error);
    }
);

export default authorizedAxiosAdmin;
