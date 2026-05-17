import AsyncStorage from '@react-native-async-storage/async-storage';
import authorizedAxiosClient from '../../../utils/authorizedAxiosClient';
import { apiFetchJson } from '../../../utils/apiClient';
import { STORAGE_KEYS } from '../../../utils/constants';

export const loginClientAPI = async (data) => {
    const payload = { identifier: data.email ?? data.identifier, password: data.password };
    return apiFetchJson('/v1/login', { method: 'POST', body: payload });
};

export const registerClientAPI = async (data) => {
    const payload = { fullName: data.fullName, identifier: data.email ?? data.identifier, password: data.password };
    return apiFetchJson('/v1/register', { method: 'POST', body: payload });
};

export const logoutClientAPI = async () => {
    const response = await authorizedAxiosClient.delete('/v1/logout');
    return response.data;
};

export const refreshClientTokenAPI = async () => {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    return apiFetchJson('/v1/refresh-token', { method: 'POST', body: { refreshToken } });
};
