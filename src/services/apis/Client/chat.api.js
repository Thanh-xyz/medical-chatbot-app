import AsyncStorage from '@react-native-async-storage/async-storage';
import authorizedAxiosClient from '../../../utils/authorizedAxiosClient';
import { API_ROOT, STORAGE_KEYS } from '../../../utils/constants';

const normalizeConversation = (data, fallbackModel = 'qwen-7b') => {
    if (!data || typeof data !== 'object') return data;

    if (data.conversationId && !data._id) {
        return {
            _id: data.conversationId,
            title: data.title || 'Cuộc hội thoại mới',
            model: data.model || fallbackModel,
            aiSessionId: data.aiSessionId,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
        };
    }

    return data;
};

const getCurrentUserId = async () => {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!userJson) return null;

    try {
        const user = JSON.parse(userJson);
        return user?._id || user?.id || user?.userId || null;
    } catch {
        return null;
    }
};

export const getConversations = async (userId) => {
    const currentUserId = userId || await getCurrentUserId();
    if (!currentUserId) throw new Error('Không thể xác định người dùng hiện tại.');

    const response = await authorizedAxiosClient.get(`/v1/chat/conversations/${currentUserId}`);
    return response.data;
};

export const createConversation = async (userIdOrModel = 'qwen-7b', modelOrOptions = {}, maybeOptions = {}) => {
    let userId = null;
    let model = 'qwen-7b';
    let options = {};

    if (typeof modelOrOptions === 'string') {
        userId = userIdOrModel;
        model = modelOrOptions;
        options = maybeOptions || {};
    } else {
        model = userIdOrModel || 'qwen-7b';
        options = modelOrOptions || {};
        userId = await getCurrentUserId();
    }

    if (!userId) throw new Error('Không thể xác định người dùng hiện tại.');

    const response = await authorizedAxiosClient.post('/v1/chat/conversation', { userId, model }, {
        signal: options.signal,
    });
    return normalizeConversation(response.data, model);
};

export const sendMessages = async (conversationId, message, model = 'qwen', options = {}) => {
    const response = await authorizedAxiosClient.post(
        '/v1/chat/message',
        { conversationId, message, model },
        { signal: options.signal }
    );
    return response.data;
};

export const sendMessage = sendMessages;

export const deleteConversation = async (conversationId) => {
    const response = await authorizedAxiosClient.delete(`/v1/chat/conversation/${conversationId}`);
    return response.data;
};

export const renameConversation = async (conversationId, title) => {
    const response = await authorizedAxiosClient.put(`/v1/chat/conversation/${conversationId}`, { title });
    return response.data;
};

export const deleteAllConversations = async () => {
    const response = await authorizedAxiosClient.delete('/v1/chat/conversations/all');
    return response.data;
};

export const getMessages = async (conversationId) => {
    const response = await authorizedAxiosClient.get(`/v1/chat/messages/${conversationId}`);
    return response.data;
};

export const cancelChatResponse = async (conversationId) => {
    try {
        const response = await authorizedAxiosClient.post('/v1/chat/cancel', { conversationId });
        return response.data;
    } catch {
        return null;
    }
};

export const streamMessageFromAPI = async (conversationId, message, model, onChunk) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const response = await fetch(`${API_ROOT}/v1/chat/message-stream`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ conversationId, message, model }),
    });

    if (!response.ok) throw new Error(`Stream request failed: ${response.status}`);
    if (!response.body) throw new Error('Streaming not supported in this environment');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
            if (!part.startsWith('data: ')) continue;
            const dataStr = part.substring(6);
            if (dataStr === '[DONE]') return;
            if (dataStr.startsWith('[METADATA] ')) continue;
            if (dataStr === '[ERROR]') continue;
            if (dataStr && dataStr !== 'undefined') {
                onChunk(dataStr);
            }
        }
    }
};

export const speechToText = async (audioUri, mimeTypeOrOptions = 'audio/m4a', maybeOptions = {}) => {
    const mimeType = typeof mimeTypeOrOptions === 'string' ? mimeTypeOrOptions : 'audio/m4a';
    const options = typeof mimeTypeOrOptions === 'string' ? maybeOptions : mimeTypeOrOptions || {};
    const formData = new FormData();
    formData.append('file', {
        uri: audioUri,
        type: mimeType,
        name: 'audio.m4a',
    });
    const response = await authorizedAxiosClient.post('/v1/chat/stt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: options.signal,
    });
    return response.data;
};

export const textToSpeech = async (text, conversationId, options = {}) => {
    const response = await authorizedAxiosClient.post('/v1/chat/tts', { text, conversationId }, {
        signal: options.signal,
    });
    return response.data;
};

export const getConversationsAPI = getConversations;
export const createConversationAPI = createConversation;
export const deleteConversationAPI = deleteConversation;
export const renameConversationAPI = renameConversation;
export const deleteAllConversationsAPI = deleteAllConversations;
export const getMessagesAPI = getMessages;
export const sendMessageAPI = sendMessage;
export const cancelChatResponseAPI = cancelChatResponse;
export const speechToTextAPI = speechToText;
export const textToSpeechAPI = textToSpeech;
