import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';
import { USE_MOCK } from '../../../utils/constants';
import * as mock from '../../mock/mockApi';

export const getAdminConversationsAPI = async (params) => {
    if (USE_MOCK) return mock.getAdminConversationsAPI(params);
    const response = await authorizedAxiosAdmin.get('/v1/admin/conversations', { params });
    return response.data;
};

export const getAdminConversationByIdAPI = async (id) => {
    if (USE_MOCK) return mock.getAdminConversationByIdAPI(id);
    const response = await authorizedAxiosAdmin.get(`/v1/admin/conversations/${id}`);
    return response.data;
};

export const deleteAdminConversationAPI = async (id) => {
    if (USE_MOCK) return mock.deleteAdminConversationAPI(id);
    const response = await authorizedAxiosAdmin.delete(`/v1/admin/conversations/${id}`);
    return response.data;
};

export const getAdminMessagesAPI = async (conversationId) => {
    if (USE_MOCK) return mock.getAdminMessagesAPI(conversationId);
    const response = await authorizedAxiosAdmin.get(`/v1/admin/conversations/${conversationId}/messages`);
    return response.data;
};
