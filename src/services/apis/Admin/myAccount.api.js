import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';

export const getAdminAccountAPI = async () => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/my-profile');
    return response.data.user;
};

export const updateAdminAccountAPI = async (data) => {
    const response = await authorizedAxiosAdmin.patch('/admin/v1/my-profile', data);
    return response.data.user;
};

export const changeAdminPasswordAPI = async (data) => {
    const response = await authorizedAxiosAdmin.patch('/admin/v1/my-profile/change-password', data);
    return response.data;
};
