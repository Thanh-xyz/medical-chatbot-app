import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';

export const getRolesAPI = async (params = {}) => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/roles', { params });
    return response.data;
};

export const updatePermissionsAPI = async (permissionsData) => {
    const response = await authorizedAxiosAdmin.patch('/admin/v1/roles/permissions', { permissions: permissionsData });
    return response.data;
};
