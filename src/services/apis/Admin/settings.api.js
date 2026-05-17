import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';

export const getAdminSettingsAPI = async () => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/settings');
    return response.data.data ?? [];
};

export const updateAdminSettingAPI = async (modelName, data) => {
    const response = await authorizedAxiosAdmin.put(`/admin/v1/settings/${modelName}`, data);
    return response.data;
};
