import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { apiFetchJson, createApiClient } from './apiClient';
import { STORAGE_KEYS } from './constants';

const authorizedAxiosClient = createApiClient({
    timeout: 1000 * 60 * 10,
});

const clearAuthAndNotify = async () => {
    await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_INFO,
    ]);
    DeviceEventEmitter.emit('auth:logout');
};

authorizedAxiosClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

authorizedAxiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const shouldRefresh = [401, 410].includes(error.response?.status);

        if (shouldRefresh && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                const res = await apiFetchJson('/v1/refresh-token', {
                    method: 'POST',
                    body: refreshToken ? { refreshToken } : {},
                });
                const { accessToken } = res;
                if (accessToken) {
                    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return authorizedAxiosClient(originalRequest);
            } catch {
                await clearAuthAndNotify();
            }
        }
        return Promise.reject(error);
    }
);

export default authorizedAxiosClient;
