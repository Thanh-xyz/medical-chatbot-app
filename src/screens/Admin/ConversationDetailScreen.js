import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAdminConversationByIdAPI, getAdminMessagesAPI } from '../../services/apis/Admin/conversation.api';
import { COLORS } from '../../utils/constants';

const ConversationDetailScreen = ({ route, navigation }) => {
    const { conversationId } = route.params;
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [conv, msgs] = await Promise.all([
                    getAdminConversationByIdAPI(conversationId),
                    getAdminMessagesAPI(conversationId),
                ]);
                setConversation(conv);
                setMessages(msgs);
            } catch {
                Alert.alert('Error', 'Failed to load conversation.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [conversationId]);

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                    <Text style={styles.roleLabel}>{isUser ? 'User' : 'Bot'}</Text>
                    <Text style={[styles.messageText, isUser ? styles.textUser : styles.textBot]}>
                        {item.content}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {conversation?.title ?? 'Conversation'}
                    </Text>
                    <Text style={styles.headerSub}>{conversation?.user?.fullName ?? ''}</Text>
                </View>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item._id ?? String(Math.random())}
                renderItem={renderMessage}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No messages.</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    headerBar: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backBtn: { marginRight: 12 },
    headerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
    headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    list: { padding: 16 },
    messageRow: { marginBottom: 12 },
    messageRowUser: { alignItems: 'flex-end' },
    messageRowBot: { alignItems: 'flex-start' },
    bubble: {
        maxWidth: '80%',
        borderRadius: 12,
        padding: 12,
    },
    bubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
    bubbleBot: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    roleLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    messageText: { fontSize: 14, lineHeight: 20 },
    textUser: { color: COLORS.white },
    textBot: { color: COLORS.text },
    empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 32 },
});

export default ConversationDetailScreen;
