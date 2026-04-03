import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ROOT, STORAGE_KEYS, USE_MOCK } from '../../../utils/constants';
import * as mock from '../../mock/mockApi';

export const loginAdminAPI = async (data) => {
    if (USE_MOCK) return mock.loginAdminAPI(data);
    const response = await axios.post(`${API_ROOT}/v1/admin/auth/login`, data);
    return response.data;
};

export const logoutAdminAPI = async () => {
    if (USE_MOCK) return mock.logoutAdminAPI();
    const response = await authorizedAxiosAdmin.delete('/v1/admin/auth/logout');
    return response.data;
};

export const refreshAdminTokenAPI = async () => {
    if (USE_MOCK) return { accessToken: 'mock-admin-token' };
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const response = await axios.post(`${API_ROOT}/v1/admin/auth/refresh`, { refreshToken });
    return response.data;
};
