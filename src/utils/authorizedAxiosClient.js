import { DeviceEventEmitter } from 'react-native';
import { createApiClient } from './apiClient';
import {
    attachCookieHeader,
    clearAuthSession,
    persistResponseCookies,
} from './authSession';

const authorizedAxiosClient = createApiClient({
    timeout: 1000 * 60 * 10,
});
const refreshAxiosClient = createApiClient();

const clearAuthAndNotify = async () => {
    await clearAuthSession('client');
    DeviceEventEmitter.emit('auth:logout');
};

authorizedAxiosClient.interceptors.request.use(
    (config) => attachCookieHeader(config, 'client'),
    (error) => Promise.reject(error)
);

authorizedAxiosClient.interceptors.response.use(
    async (response) => {
        await persistResponseCookies(response.headers, 'client');
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        if (status === 410 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await attachCookieHeader(originalRequest, 'client');
                const refreshConfig = await attachCookieHeader({}, 'client');
                const refreshResponse = await refreshAxiosClient.post('/v1/refresh-token', {}, refreshConfig);
                await persistResponseCookies(refreshResponse.headers, 'client');
                await attachCookieHeader(originalRequest, 'client');
                return authorizedAxiosClient(originalRequest);
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

export default authorizedAxiosClient;
