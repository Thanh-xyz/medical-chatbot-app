import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    getConversationsAPI,
    createConversationAPI,
    getMessagesAPI,
    sendMessageAPI,
    deleteConversationAPI,
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

export const ChatProvider = ({ children }) => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const fetchConversations = useCallback(async () => {
        setLoadingConversations(true);
        try {
            const data = await getConversationsAPI();
            setConversations(data);
        } catch {
            // silently fail if not yet authenticated
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    const fetchMessages = useCallback(async (conversationId) => {
        setLoadingMessages(true);
        setMessages([]); // clear immediately to prevent stale state race
        try {
            const data = await getMessagesAPI(conversationId);
            setMessages(deduplicateMsgs(data));
        } catch {
            setMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    const selectConversation = useCallback(async (conversation) => {
        setActiveConversation(conversation);
        await fetchMessages(conversation._id);
    }, [fetchMessages]);

    const startNewConversation = useCallback(async () => {
        try {
            const conversation = await createConversationAPI();
            setConversations((prev) => [conversation, ...prev]);
            setActiveConversation(conversation);
            setMessages([]);
            return conversation;
        } catch {
            return null;
        }
    }, []);

    const sendMessage = useCallback(async (content) => {
        if (!activeConversation) return;
        setSending(true);
        try {
            const newMessages = await sendMessageAPI(activeConversation._id, content);
            const incoming = Array.isArray(newMessages) ? newMessages : [newMessages];
            setMessages((prev) => deduplicateMsgs([...prev, ...incoming]));
        } finally {
            setSending(false);
        }
    }, [activeConversation]);

    const removeConversation = useCallback(async (conversationId) => {
        try {
            await deleteConversationAPI(conversationId);
        } catch {
            // still remove locally
        }
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        if (activeConversation?._id === conversationId) {
            setActiveConversation(null);
            setMessages([]);
        }
    }, [activeConversation]);

    return (
        <ChatContext.Provider value={{
            conversations,
            activeConversation,
            messages,
            loadingConversations,
            loadingMessages,
            sending,
            fetchConversations,
            selectConversation,
            startNewConversation,
            sendMessage,
            removeConversation,
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
