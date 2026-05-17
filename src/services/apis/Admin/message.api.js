import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';

export const getAllMessagesAPI = async (params = {}) => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/messages', { params });
    const data = response.data;
    return {
        messages: data.data ?? [],
        total: data.pagination?.totalItems ?? 0,
        keyword: data.keyword,
        pagination: data.pagination,
    };
};

export const deleteAdminMessageAPI = async (id) => {
    const response = await authorizedAxiosAdmin.delete(`/admin/v1/messages/${id}`);
    return response.data;
};
