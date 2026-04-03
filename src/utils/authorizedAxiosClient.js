import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROOT, STORAGE_KEYS } from './constants';

const authorizedAxiosClient = axios.create({
    baseURL: API_ROOT,
    timeout: 10000,
});

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
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                const res = await axios.post(`${API_ROOT}/v1/client/auth/refresh`, { refreshToken });
                const { accessToken } = res.data;
                await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return authorizedAxiosClient(originalRequest);
            } catch {
                await AsyncStorage.multiRemove([
                    STORAGE_KEYS.ACCESS_TOKEN,
                    STORAGE_KEYS.REFRESH_TOKEN,
                    STORAGE_KEYS.USER_INFO,
                ]);
            }
        }
        return Promise.reject(error);
    }
);

export default authorizedAxiosClient;
