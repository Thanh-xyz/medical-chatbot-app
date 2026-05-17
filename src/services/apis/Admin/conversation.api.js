import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';

export const getAdminConversationsAPI = async (params) => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/conversations', { params });
    const data = response.data;
    return {
        conversations: data.data ?? [],
        total: data.pagination?.totalItems ?? 0,
        keyword: data.keyword,
    };
};

export const getAdminConversationByIdAPI = async (id) => {
    const response = await authorizedAxiosAdmin.get(`/admin/v1/conversations/${id}`);
    return response.data.data;
};

export const deleteAdminConversationAPI = async (id) => {
    const response = await authorizedAxiosAdmin.delete(`/admin/v1/conversations/${id}`);
    return response.data;
};

export const updateAdminConversationAPI = async (id, data) => {
    const response = await authorizedAxiosAdmin.patch(`/admin/v1/conversations/${id}`, data);
    return response.data.data;
};

export const getAdminMessagesAPI = async (conversationId) => {
    const response = await authorizedAxiosAdmin.get(`/admin/v1/messages/conversation/${conversationId}`);
    return response.data.data ?? [];
};
