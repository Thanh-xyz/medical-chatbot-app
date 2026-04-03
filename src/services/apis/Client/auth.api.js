import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authorizedAxiosClient from '../../../utils/authorizedAxiosClient';
import { API_ROOT, STORAGE_KEYS, USE_MOCK } from '../../../utils/constants';
import * as mock from '../../mock/mockApi';

export const loginClientAPI = async (data) => {
    if (USE_MOCK) return mock.loginClientAPI(data);
    const response = await axios.post(`${API_ROOT}/v1/client/auth/login`, data);
    return response.data;
};

export const registerClientAPI = async (data) => {
    if (USE_MOCK) return mock.registerClientAPI(data);
    const response = await axios.post(`${API_ROOT}/v1/client/auth/register`, data);
    return response.data;
};

export const logoutClientAPI = async () => {
    if (USE_MOCK) return mock.logoutClientAPI();
    const response = await authorizedAxiosClient.delete('/v1/client/auth/logout');
    return response.data;
};

export const refreshClientTokenAPI = async () => {
    if (USE_MOCK) return { accessToken: 'mock-client-token' };
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const response = await axios.post(`${API_ROOT}/v1/client/auth/refresh`, { refreshToken });
    return response.data;
};
