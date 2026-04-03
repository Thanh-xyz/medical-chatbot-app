import authorizedAxiosClient from '../../../utils/authorizedAxiosClient';
import { USE_MOCK } from '../../../utils/constants';
import * as mock from '../../mock/mockApi';

export const getConversationsAPI = async () => {
    if (USE_MOCK) return mock.getConversationsAPI();
    const response = await authorizedAxiosClient.get('/v1/client/conversations');
    return response.data;
};

export const createConversationAPI = async () => {
    if (USE_MOCK) return mock.createConversationAPI();
    const response = await authorizedAxiosClient.post('/v1/client/conversations');
    return response.data;
};

export const deleteConversationAPI = async (conversationId) => {
    if (USE_MOCK) return mock.deleteConversationAPI(conversationId);
    const response = await authorizedAxiosClient.delete(`/v1/client/conversations/${conversationId}`);
    return response.data;
};

export const getMessagesAPI = async (conversationId) => {
    if (USE_MOCK) return mock.getMessagesAPI(conversationId);
    const response = await authorizedAxiosClient.get(`/v1/client/conversations/${conversationId}/messages`);
    return response.data;
};

export const sendMessageAPI = async (conversationId, content) => {
    if (USE_MOCK) return mock.sendMessageAPI(conversationId, content);
    const response = await authorizedAxiosClient.post(
        `/v1/client/conversations/${conversationId}/messages`,
        { content }
    );
    return response.data;
};
