import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';
import { USE_MOCK } from '../../../utils/constants';
import * as mock from '../../mock/mockApi';

export const getUsersAPI = async (params) => {
    if (USE_MOCK) return mock.getUsersAPI(params);
    const response = await authorizedAxiosAdmin.get('/v1/admin/users', { params });
    return response.data;
};

export const getUserByIdAPI = async (userId) => {
    if (USE_MOCK) return mock.getUserByIdAPI(userId);
    const response = await authorizedAxiosAdmin.get(`/v1/admin/users/${userId}`);
    return response.data;
};

export const createUserAPI = async (data) => {
    if (USE_MOCK) return mock.createUserAPI(data);
    const response = await authorizedAxiosAdmin.post('/v1/admin/users', data);
    return response.data;
};

export const updateUserAPI = async (userId, data) => {
    if (USE_MOCK) return mock.updateUserAPI(userId, data);
    const response = await authorizedAxiosAdmin.put(`/v1/admin/users/${userId}`, data);
    return response.data;
};

export const deleteUserAPI = async (userId) => {
    if (USE_MOCK) return mock.deleteUserAPI(userId);
    const response = await authorizedAxiosAdmin.delete(`/v1/admin/users/${userId}`);
    return response.data;
};
