import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    getConversations,
    createConversation,
    getMessages,
    sendMessages,
    streamMessageFromAPI,
    deleteConversation,
    deleteAllConversations as deleteAllConversationsRequest,
    renameConversation as renameConversationRequest,
} from '../services/apis/Client/chat.api';

const ChatContext = createContext(null);

const deduplicateMsgs = (arr) => {
    const seen = new Set();
    return arr.filter((m) => {
        const key = m._id;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const getErrorMessage = (err, fallback) => (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
);

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [isLimitReached, setIsLimitReached] = useState(false);
    const [error, setError] = useState(null);

    const fetchConversations = useCallback(async () => {
        setLoadingConversations(true);
        setError(null);
        try {
            const data = await getConversations();
            setConversations(Array.isArray(data) ? data : data?.data ?? []);
        } catch (err) {
            setConversations([]);
            setError(getErrorMessage(err, 'Không thể tải lịch sử trò chuyện.'));
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    const fetchMessages = useCallback(async (conversationId) => {
        setLoadingMessages(true);
        setMessages([]); // clear immediately to prevent stale state race
        try {
            const data = await getMessages(conversationId);
            setMessages(deduplicateMsgs(Array.isArray(data) ? data : data?.data ?? []));
            setError(null);
        } catch (err) {
            setMessages([]);
            setError(getErrorMessage(err, 'Không thể tải tin nhắn của cuộc trò chuyện.'));
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    const selectConversation = useCallback(async (conversation) => {
        setActiveConversation(conversation);
        setIsLimitReached(false);
        setError(null);
        await fetchMessages(conversation._id);
    }, [fetchMessages]);

    const startNewConversation = useCallback(async (model = 'qwen') => {
        try {
            const conversation = await createConversation(model);
            setConversations((prev) => [conversation, ...prev]);
            setActiveConversation(conversation);
            setMessages([]);
            setIsLimitReached(false);
            setError(null);
            return conversation;
        } catch (err) {
            setError(getErrorMessage(err, 'Không thể tạo cuộc trò chuyện mới.'));
            return null;
        }
    }, []);

    const appendAssistantMessage = useCallback((content, extra = {}) => {
        if (!content?.trim()) return;
        setMessages((prev) => [...prev, {
            _id: `local_stopped_${Date.now()}`,
            role: 'assistant',
            content,
            createdAt: new Date().toISOString(),
            ...extra,
        }]);
    }, []);

    const updateMessageAudioUrl = useCallback((messageId, audioUrl, text) => {
        if (!audioUrl) return;
        setMessages((prev) => prev.map((message) => {
            const sameId = messageId && message._id === messageId;
            const sameText = text && message.role === 'assistant' && message.content === text;
            return sameId || sameText ? { ...message, audio_url: audioUrl } : message;
        }));
    }, []);

    const sendMessage = useCallback(async (content, model = 'qwen', options = {}) => {
        if (!content?.trim() || isLimitReached) return null;

        setSending(true);
        setError(null);
        let currentConversation = options.conversation || activeConversation;
        const userMsg = {
            _id: `local_user_${Date.now()}`,
            role: 'user',
            content,
            createdAt: new Date().toISOString(),
        };

        try {
            if (!currentConversation) {
                currentConversation = await createConversation(model, { signal: options.signal });
                if (!currentConversation?._id) {
                    throw new Error('Không thể tạo cuộc trò chuyện mới.');
                }
                options.onConversationReady?.(currentConversation._id);
                setConversations((prev) => [currentConversation, ...prev]);
                setActiveConversation(currentConversation);
                setMessages([]);
            } else {
                options.onConversationReady?.(currentConversation._id);
            }
            const assistantMsgId = `local_bot_stream_${Date.now()}`;
            setMessages((prev) => [...prev, userMsg, {
                _id: assistantMsgId,
                role: 'assistant',
                content: '',
                createdAt: new Date().toISOString(),
                streaming: true,
            }]);

            let streamedResponse = '';
            let data = null;

            try {
                await streamMessageFromAPI(
                    currentConversation._id,
                    content,
                    model,
                    (chunk) => {
                        streamedResponse += chunk;
                        setMessages((prev) => prev.map((msg) => (
                            msg._id === assistantMsgId
                                ? { ...msg, content: streamedResponse, streaming: true }
                                : msg
                        )));
                    },
                    options
                );
                data = { response: streamedResponse };
            } catch (streamError) {
                const isCancelled = streamError?.name === 'CanceledError'
                    || streamError?.name === 'AbortError'
                    || streamError?.code === 'ERR_CANCELED';
                if (isCancelled) throw streamError;

                const fallbackData = await sendMessages(currentConversation._id, content, model, options);
                data = fallbackData;
                streamedResponse = Array.isArray(fallbackData)
                    ? fallbackData.find((msg) => msg.role === 'assistant')?.content || ''
                    : fallbackData?.response;
            }

            setMessages((prev) => prev.map((msg) => (
                msg._id === assistantMsgId
                    ? {
                        ...msg,
                        content: streamedResponse || data?.response || 'Không có phản hồi.',
                        risk_level: data?.risk_level,
                        sources: data?.sources,
                        blocked: data?.blocked,
                        warnings: data?.warnings,
                        streaming: false,
                    }
                    : msg
            )));

            if (data?.response?.includes('Hết hạn mức')) {
                setIsLimitReached(true);
            }

            setConversations((prev) =>
                prev.map((conversation) =>
                    conversation._id === currentConversation._id
                        ? { ...conversation, title: content.substring(0, 50), updatedAt: new Date().toISOString() }
                        : conversation
                )
            );
            return { ...data, conversationId: currentConversation._id };
        } catch (err) {
            const isCancelled = err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED';
            if (!isCancelled) {
                setMessages((prev) => prev.filter((m) => m._id !== userMsg._id && !m.streaming));
                setError(getErrorMessage(err, 'Lỗi kết nối. Vui lòng thử lại.'));
            }
            return null;
        } finally {
            setSending(false);
        }
    }, [activeConversation, isLimitReached]);

    const removeConversation = useCallback(async (conversationId) => {
        try {
            await deleteConversation(conversationId);
        } catch {
        }
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        if (activeConversation?._id === conversationId) {
            setActiveConversation(null);
            setMessages([]);
        }
    }, [activeConversation]);

    const deleteAllConversations = useCallback(async () => {
        await deleteAllConversationsRequest();
        setConversations([]);
        setActiveConversation(null);
        setMessages([]);
    }, []);

    const renameConversation = useCallback(async (conversationId, newTitle) => {
        try {
            const updated = await renameConversationRequest(conversationId, newTitle);
            setConversations((prev) =>
                prev.map((c) => (c._id === conversationId ? { ...c, title: updated.title ?? newTitle } : c))
            );
        } catch {
        }
    }, []);

    return (
        <ChatContext.Provider value={{
            conversations,
            activeConversation,
            messages,
            loadingConversations,
            loadingMessages,
            sending,
            isLimitReached,
            error,
            fetchConversations,
            selectConversation,
            startNewConversation,
            appendAssistantMessage,
            updateMessageAudioUrl,
            sendMessage,
            removeConversation,
            deleteAllConversations,
            renameConversation,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChatContext must be used inside ChatProvider');
    return ctx;
};

export default ChatContext;
