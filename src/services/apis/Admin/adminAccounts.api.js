import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';

export const getAdminAccountsAPI = async (params) => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/accounts', { params });
    const data = response.data;
    return {
        admins: data.accounts ?? [],
        total: data.pagination?.total ?? 0,
    };
};

export const createAdminAccountAPI = async (data) => {
    const response = await authorizedAxiosAdmin.post('/admin/v1/accounts', data);
    return response.data.account;
};

export const deleteAdminAccountAPI = async (adminId) => {
    const response = await authorizedAxiosAdmin.delete(`/admin/v1/accounts/${adminId}`);
    return response.data;
};

export const toggleAdminStatusAPI = async (adminId) => {
    const response = await authorizedAxiosAdmin.patch(`/admin/v1/accounts/${adminId}/toggle-status`);
    return response.data;
};

export const getRolesAPI = async () => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/roles', { params: { limit: 100 } });
    return (response.data?.data ?? []).filter((r) => !r.isSystemAdmin);
};
