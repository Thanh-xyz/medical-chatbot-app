import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    FlatList, ActivityIndicator, Alert, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { getAdminConversationsAPI, deleteAdminConversationAPI } from '../../services/apis/Admin/conversation.api';
import { useSettings } from '../../store/SettingsContext';

const ConversationListScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    const fetchConversations = useCallback(async (keyword = '') => {
        try {
            const data = await getAdminConversationsAPI({ keyword });
            setConversations(data.conversations ?? data ?? []);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách hội thoại.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchConversations(); }, []);

    const handleDelete = (id, title) => {
        Alert.alert('Xóa hội thoại', `Xóa "${title || 'hội thoại này'}"?`, [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAdminConversationAPI(id);
                        setConversations((prev) => prev.filter((c) => c._id !== id));
                    } catch { Alert.alert('Lỗi', 'Không thể xóa hội thoại.'); }
                },
            },
        ]);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.row, { backgroundColor: cardBg, borderColor }]}
            onPress={() => navigation.navigate('AdminConversationDetail', { conversationId: item._id })}
        >
            <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#2563EB" />
            </View>
            <View style={styles.info}>
                <Text style={[styles.title, { color: textPrimary }]} numberOfLines={1}>{item.title || 'Cuộc hội thoại mới'}</Text>
                <Text style={[styles.sub, { color: textMuted }]} numberOfLines={1}>
                    {item.userId?.fullName ?? 'Người dùng'} · {item.messageCount ?? 0} tin nhắn
                </Text>
                <Text style={[styles.date, { color: textMuted }]}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item._id, item.title)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Cuộc hội thoại</Text>
                    <Text style={[styles.headerSub, { color: textMuted }]}>Quản lý toàn bộ hội thoại trong hệ thống</Text>
                </View>
            </View>
            <View style={[styles.searchRow, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <View style={[styles.searchBox, { backgroundColor: inputBg, borderColor }]}>
                    <Ionicons name="search-outline" size={16} color={textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                        style={[styles.searchInput, { color: textPrimary }]}
                        placeholder="Tìm kiếm hội thoại..."
                        placeholderTextColor={textMuted}
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={() => fetchConversations(search)}
                        returnKeyType="search"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearch(''); fetchConversations(''); }}>
                            <Ionicons name="close-circle" size={16} color={textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {loading ? (
                <ActivityIndicator color="#2563EB" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={(c) => c._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(search); }} tintColor="#2563EB" />}
                    ListEmptyComponent={<Text style={[styles.empty, { color: textMuted }]}>Không có hội thoại nào</Text>}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
    menuBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700' },
    headerSub: { fontSize: 12, marginTop: 1 },
    searchRow: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
    searchBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
    searchInput: { flex: 1, fontSize: 14 },
    listContent: { padding: 14, gap: 10 },
    row: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
    iconBox: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1 },
    title: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
    sub: { fontSize: 12, marginBottom: 2 },
    date: { fontSize: 11 },
    deleteBtn: { padding: 6 },
    empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
});

export default ConversationListScreen;
