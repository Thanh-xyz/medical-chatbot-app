import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';

export const getUsersAPI = async (params) => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/users', { params });
    return response.data;
};

export const getUserByIdAPI = async (userId) => {
    const response = await authorizedAxiosAdmin.get(`/admin/v1/users/${userId}`);
    return response.data.data;
};

export const createUserAPI = async (data) => {
    const response = await authorizedAxiosAdmin.post('/admin/v1/users', data);
    return response.data;
};

export const updateUserAPI = async (userId, data) => {
    const response = await authorizedAxiosAdmin.patch(`/admin/v1/users/${userId}`, data);
    return response.data;
};

export const deleteUserAPI = async (userId) => {
    const response = await authorizedAxiosAdmin.delete(`/admin/v1/users/${userId}`);
    return response.data;
};
