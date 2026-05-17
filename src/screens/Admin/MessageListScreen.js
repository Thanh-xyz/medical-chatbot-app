import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    FlatList, ActivityIndicator, Alert, RefreshControl, TextInput, Modal, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { getAllMessagesAPI, deleteAdminMessageAPI } from '../../services/apis/Admin/message.api';
import { getAdminConversationsAPI } from '../../services/apis/Admin/conversation.api';
import { useSettings } from '../../store/SettingsContext';

const LIMIT = 15;

const MessageListScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState('');
    const [selectedConvTitle, setSelectedConvTitle] = useState('Tất cả hội thoại');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [showConvPicker, setShowConvPicker] = useState(false);
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    const fetchMessages = useCallback(async (keyword = '', convId = '', pageNum = 1, isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const params = { keyword, page: pageNum, limit: LIMIT };
            if (convId) params.conversationId = convId;
            const data = await getAllMessagesAPI(params);
            setMessages(data.messages);
            setTotalItems(data.total);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách tin nhắn.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        try {
            const data = await getAdminConversationsAPI({ limit: 100 });
            setConversations(data.conversations ?? []);
        } catch {
        }
    }, []);

    useEffect(() => {
        fetchMessages('', '', 1);
        fetchConversations();
    }, []);

    const handleSearch = () => {
        setPage(1);
        fetchMessages(search, selectedConvId, 1);
    };

    const handleClearSearch = () => {
        setSearch('');
        setPage(1);
        fetchMessages('', selectedConvId, 1);
    };

    const handleSelectConv = (convId, title) => {
        setSelectedConvId(convId);
        setSelectedConvTitle(title);
        setShowConvPicker(false);
        setPage(1);
        fetchMessages(search, convId, 1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchMessages(search, selectedConvId, newPage);
    };

    const handleDelete = (id) => {
        Alert.alert('Xóa tin nhắn', 'Xóa tin nhắn này? Hành động không thể hoàn tác.', [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAdminMessageAPI(id);
                        fetchMessages(search, selectedConvId, page, true);
                    } catch { Alert.alert('Lỗi', 'Không thể xóa tin nhắn.'); }
                },
            },
        ]);
    };

    const totalPages = Math.ceil(totalItems / LIMIT);

    const renderItem = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.row, { backgroundColor: cardBg, borderColor }]}>
                <View style={styles.rowTop}>
                    <View style={[styles.roleBadge, { backgroundColor: isUser ? (isDarkMode ? '#1E3A5F' : '#F0FDF4') : (isDarkMode ? '#1E293B' : '#EFF6FF') }]}>
                        <Ionicons
                            name={isUser ? 'person-outline' : 'sparkles-outline'}
                            size={12}
                            color={isUser ? '#16A34A' : '#2563EB'}
                        />
                        <Text style={[styles.roleText, { color: isUser ? '#16A34A' : '#2563EB' }]}>
                            {isUser ? 'Người dùng' : 'Trợ lý AI'}
                        </Text>
                    </View>
                    <Text style={[styles.dateText, { color: textMuted }]}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}
                    </Text>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item._id)}>
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.content, { color: textPrimary }]} numberOfLines={2}>
                    {item.content}
                </Text>
                <Text style={[styles.convId, { color: textMuted }]} numberOfLines={1}>
                    Hội thoại: {item.conversationId?.toString?.().slice(0, 16)}...
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Tin nhắn</Text>
                    <Text style={[styles.headerSub, { color: textMuted }]}>
                        {totalItems > 0 ? `${totalItems} tin nhắn trong hệ thống` : 'Quản lý tin nhắn hệ thống'}
                    </Text>
                </View>
            </View>
            <View style={[styles.toolbar, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <View style={[styles.searchBox, { backgroundColor: inputBg, borderColor }]}>
                    <Ionicons name="search-outline" size={16} color={textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                        style={[styles.searchInput, { color: textPrimary }]}
                        placeholder="Tìm kiếm nội dung..."
                        placeholderTextColor={textMuted}
                        value={search}
                        onChangeText={setSearch}
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={handleClearSearch}>
                            <Ionicons name="close-circle" size={16} color={textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.filterBtn, { backgroundColor: selectedConvId ? '#2563EB' : inputBg, borderColor: selectedConvId ? '#2563EB' : borderColor }]}
                    onPress={() => setShowConvPicker(true)}
                >
                    <Ionicons name="filter-outline" size={15} color={selectedConvId ? '#FFFFFF' : textMuted} />
                </TouchableOpacity>
            </View>
            {selectedConvId ? (
                <View style={[styles.filterChipRow, { backgroundColor: headerBg }]}>
                    <View style={styles.filterChip}>
                        <Ionicons name="chatbubble-outline" size={12} color="#2563EB" />
                        <Text style={styles.filterChipText} numberOfLines={1}>{selectedConvTitle}</Text>
                        <TouchableOpacity onPress={() => handleSelectConv('', 'Tất cả hội thoại')}>
                            <Ionicons name="close" size={13} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}
            {loading ? (
                <ActivityIndicator color="#2563EB" size="large" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchMessages(search, selectedConvId, page, true); }}
                            tintColor="#2563EB"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <Ionicons name="chatbubble-ellipses-outline" size={36} color={textMuted} />
                            <Text style={[styles.emptyText, { color: textMuted }]}>Không có tin nhắn nào</Text>
                        </View>
                    }
                    ListFooterComponent={totalPages > 1 ? (
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                style={[styles.pageBtn, { borderColor, opacity: page <= 1 ? 0.4 : 1 }]}
                                onPress={() => page > 1 && handlePageChange(page - 1)}
                                disabled={page <= 1}
                            >
                                <Ionicons name="chevron-back" size={16} color={textPrimary} />
                            </TouchableOpacity>
                            <Text style={[styles.pageInfo, { color: textMuted }]}>{page} / {totalPages}</Text>
                            <TouchableOpacity
                                style={[styles.pageBtn, { borderColor, opacity: page >= totalPages ? 0.4 : 1 }]}
                                onPress={() => page < totalPages && handlePageChange(page + 1)}
                                disabled={page >= totalPages}
                            >
                                <Ionicons name="chevron-forward" size={16} color={textPrimary} />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                />
            )}
            <Modal visible={showConvPicker} transparent animationType="slide" onRequestClose={() => setShowConvPicker(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowConvPicker(false)} />
                <View style={[styles.pickerSheet, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
                    <View style={styles.pickerHeader}>
                        <Text style={[styles.pickerTitle, { color: textPrimary }]}>Lọc theo hội thoại</Text>
                        <TouchableOpacity onPress={() => setShowConvPicker(false)}>
                            <Ionicons name="close" size={20} color={textMuted} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <TouchableOpacity
                            style={[styles.pickerItem, { borderBottomColor: borderColor }, !selectedConvId && { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}
                            onPress={() => handleSelectConv('', 'Tất cả hội thoại')}
                        >
                            <Ionicons name="apps-outline" size={16} color={!selectedConvId ? '#2563EB' : textMuted} />
                            <Text style={[styles.pickerItemText, { color: !selectedConvId ? '#2563EB' : textPrimary }]}>Tất cả hội thoại</Text>
                            {!selectedConvId && <Ionicons name="checkmark" size={16} color="#2563EB" />}
                        </TouchableOpacity>
                        {conversations.map((conv) => (
                            <TouchableOpacity
                                key={conv._id}
                                style={[styles.pickerItem, { borderBottomColor: borderColor }, selectedConvId === conv._id && { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}
                                onPress={() => handleSelectConv(conv._id, conv.title ?? conv._id)}
                            >
                                <Ionicons name="chatbubble-outline" size={16} color={selectedConvId === conv._id ? '#2563EB' : textMuted} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.pickerItemText, { color: selectedConvId === conv._id ? '#2563EB' : textPrimary }]} numberOfLines={1}>
                                        {conv.title ?? 'Cuộc hội thoại'}
                                    </Text>
                                    <Text style={[styles.pickerItemSub, { color: textMuted }]}>{conv.userId?.fullName ?? ''}</Text>
                                </View>
                                {selectedConvId === conv._id && <Ionicons name="checkmark" size={16} color="#2563EB" />}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
    menuBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700' },
    headerSub: { fontSize: 12, marginTop: 1 },
    toolbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
    searchInput: { flex: 1, fontSize: 14, padding: 0 },
    filterBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    filterChipRow: { paddingHorizontal: 12, paddingVertical: 6 },
    filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
    filterChipText: { color: '#2563EB', fontSize: 12, fontWeight: '600', maxWidth: 200 },
    listContent: { padding: 12, gap: 10, paddingBottom: 24 },
    row: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
    rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
    roleText: { fontSize: 11, fontWeight: '700' },
    dateText: { flex: 1, fontSize: 11, textAlign: 'right' },
    deleteBtn: { padding: 4 },
    content: { fontSize: 13, lineHeight: 18 },
    convId: { fontSize: 11 },
    emptyBox: { alignItems: 'center', paddingVertical: 48, gap: 10 },
    emptyText: { fontSize: 14 },
    pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 16 },
    pageBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    pageInfo: { fontSize: 13, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    pickerSheet: { maxHeight: '65%', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1 },
    pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
    pickerTitle: { fontSize: 15, fontWeight: '700' },
    pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1 },
    pickerItemText: { flex: 1, fontSize: 14, fontWeight: '500' },
    pickerItemSub: { fontSize: 11, marginTop: 1 },
});

export default MessageListScreen;
