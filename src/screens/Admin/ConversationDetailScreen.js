import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAdminConversationByIdAPI, getAdminMessagesAPI, updateAdminConversationAPI, deleteAdminConversationAPI } from '../../services/apis/Admin/conversation.api';
import { useSettings } from '../../store/SettingsContext';

const ConversationDetailScreen = ({ route, navigation }) => {
    const { conversationId } = route.params;
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [saving, setSaving] = useState(false);
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';
    const botBubbleBg = isDarkMode ? '#1E293B' : '#FFFFFF';

    useEffect(() => {
        (async () => {
            try {
                const [conv, msgs] = await Promise.all([
                    getAdminConversationByIdAPI(conversationId),
                    getAdminMessagesAPI(conversationId),
                ]);
                setConversation(conv);
                setTitleInput(conv?.title ?? '');
                setMessages(msgs);
            } catch {
                Alert.alert('Lỗi', 'Không thể tải hội thoại.');
                navigation.goBack();
            } finally { setLoading(false); }
        })();
    }, [conversationId]);

    const handleSaveTitle = async () => {
        if (!titleInput.trim()) {
            Alert.alert('Lỗi', 'Tiêu đề không được để trống.');
            return;
        }
        setSaving(true);
        try {
            const updated = await updateAdminConversationAPI(conversationId, { title: titleInput.trim() });
            setConversation(updated);
            setEditMode(false);
        } catch (err) {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể cập nhật tiêu đề.');
        } finally { setSaving(false); }
    };

    const handleDelete = () => {
        Alert.alert('Xóa hội thoại', 'Xóa cuộc hội thoại này? Hành động không thể hoàn tác.', [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAdminConversationAPI(conversationId);
                        navigation.goBack();
                    } catch { Alert.alert('Lỗi', 'Không thể xóa hội thoại.'); }
                },
            },
        ]);
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : { ...styles.bubbleBot, backgroundColor: botBubbleBg, borderColor }]}>
                    <Text style={[styles.roleLabel, { color: isUser ? 'rgba(255,255,255,0.7)' : textMuted }]}>
                        {isUser ? 'Người dùng' : 'AI'}
                    </Text>
                    <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : textPrimary }]}>
                        {item.content}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
                <ActivityIndicator color="#2563EB" size="large" style={{ marginTop: 60 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    {editMode ? (
                        <TextInput
                            style={[styles.titleInput, { color: textPrimary, backgroundColor: inputBg, borderColor }]}
                            value={titleInput}
                            onChangeText={setTitleInput}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleSaveTitle}
                        />
                    ) : (
                        <>
                            <Text style={[styles.headerTitle, { color: textPrimary }]} numberOfLines={1}>
                                {conversation?.title ?? 'Cuộc hội thoại'}
                            </Text>
                            <Text style={[styles.headerSub, { color: textMuted }]}>
                                {conversation?.userId?.fullName ?? ''}
                            </Text>
                        </>
                    )}
                </View>
                {editMode ? (
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#2563EB' }]}
                            onPress={handleSaveTitle}
                            disabled={saving}
                        >
                            {saving
                                ? <ActivityIndicator size="small" color="#FFFFFF" />
                                : <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: inputBg, borderWidth: 1, borderColor }]}
                            onPress={() => { setEditMode(false); setTitleInput(conversation?.title ?? ''); }}
                        >
                            <Ionicons name="close" size={18} color={textMuted} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9', borderWidth: 1, borderColor }]}
                            onPress={() => setEditMode(true)}
                        >
                            <Ionicons name="pencil-outline" size={17} color={textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }]}
                            onPress={handleDelete}
                        >
                            <Ionicons name="trash-outline" size={17} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item._id ?? String(Math.random())}
                renderItem={renderMessage}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={[styles.empty, { color: textMuted }]}>Không có tin nhắn nào.</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, gap: 8 },
    backBtn: { marginRight: 4, padding: 4 },
    headerTitle: { fontSize: 15, fontWeight: '700' },
    headerSub: { fontSize: 12, marginTop: 1 },
    titleInput: { fontSize: 14, fontWeight: '600', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    headerActions: { flexDirection: 'row', gap: 6 },
    actionBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    list: { padding: 16 },
    messageRow: { marginBottom: 12 },
    messageRowUser: { alignItems: 'flex-end' },
    messageRowBot: { alignItems: 'flex-start' },
    bubble: { maxWidth: '80%', borderRadius: 12, padding: 12 },
    bubbleUser: { backgroundColor: '#2563EB', borderBottomRightRadius: 4 },
    bubbleBot: { borderBottomLeftRadius: 4, borderWidth: 1 },
    roleLabel: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
    messageText: { fontSize: 14, lineHeight: 20 },
    empty: { textAlign: 'center', marginTop: 32 },
});

export default ConversationDetailScreen;
