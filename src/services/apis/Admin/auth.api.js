import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetchJson } from '../../../utils/apiClient';
import { STORAGE_KEYS } from '../../../utils/constants';

export const loginAdminAPI = async (data) => {
    return apiFetchJson('/admin/v1/auth/login', { method: 'POST', body: data });
};

export const logoutAdminAPI = async () => {
    const response = await authorizedAxiosAdmin.delete('/admin/v1/auth/logout');
    return response.data;
};

export const refreshAdminTokenAPI = async () => {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    return apiFetchJson('/admin/v1/auth/refresh-token', { method: 'POST', body: { refreshToken } });
};
