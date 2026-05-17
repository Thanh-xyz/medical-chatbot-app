import {
    sendMessageAPI,
    streamMessageFromAPI,
    cancelChatResponseAPI,
} from './chat.api';
export const sendMessageToAI = async (_userId, conversationId, message, options = {}) => {
    return sendMessageAPI(conversationId, message, options.model || 'qwen', options);
};

export const streamMessageFromAI = async (_userId, conversationId, message, onChunk, onDone, onError, options = {}) => {
    try {
        await streamMessageFromAPI(conversationId, message, options.model || 'qwen', onChunk);
        onDone?.();
    } catch (err) {
        onError?.(err);
    }
};

export const cancelAIResponse = async (_userId, conversationId) => {
    return cancelChatResponseAPI(conversationId);
};
