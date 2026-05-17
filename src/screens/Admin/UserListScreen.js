import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, FlatList, RefreshControl, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { getUsersAPI, deleteUserAPI } from '../../services/apis/Admin/user.api';
import { useSettings } from '../../store/SettingsContext';

const UserListScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F1F5F9';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    const fetchUsers = useCallback(async (keyword = '') => {
        try {
            const data = await getUsersAPI({ keyword });
            const list = data?.users ?? (Array.isArray(data) ? data : []);
            setUsers(list);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, []);

    const handleDelete = (userId, name) => {
        Alert.alert('Xóa người dùng', `Xóa tài khoản "${name}"?`, [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteUserAPI(userId);
                        setUsers((prev) => prev.filter((u) => u._id !== userId));
                    } catch { Alert.alert('Lỗi', 'Không thể xóa người dùng.'); }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Tài khoản người dùng</Text>
                    <Text style={[styles.headerSub, { color: textMuted }]}>Quản lý tài khoản người dùng hệ thống</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(search); }} tintColor="#2563EB" />}
            >
                <View style={[styles.pageCard, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.pageBadge}>
                        <Ionicons name="people-outline" size={13} color="#2563EB" />
                        <Text style={styles.pageBadgeText}>Quản lý tài khoản người dùng</Text>
                    </View>
                    <View style={styles.pageTitleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.pageTitle, { color: textPrimary }]}>Tài khoản người dùng</Text>
                            <Text style={[styles.pageDesc, { color: textMuted }]}>
                                Theo dõi thông tin, trạng thái và quyền thao tác với người dùng đang sử dụng Medical Chatbot.
                            </Text>
                        </View>
                        <View style={[styles.totalBox, { borderColor }]}>
                            <Text style={[styles.totalLabel, { color: textMuted }]}>Tổng bản ghi</Text>
                            <Text style={[styles.totalCount, { color: textPrimary }]}>{users.length}</Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.searchCard, { backgroundColor: cardBg, borderColor }]}>
                    <View style={[styles.searchBox, { backgroundColor: inputBg, borderColor }]}>
                        <Ionicons name="search-outline" size={16} color={textMuted} style={{ marginRight: 8 }} />
                        <TextInput
                            style={[styles.searchInput, { color: textPrimary }]}
                            placeholder="Tìm kiếm theo tên, email..."
                            placeholderTextColor={textMuted}
                            value={search}
                            onChangeText={setSearch}
                            returnKeyType="search"
                            onSubmitEditing={() => fetchUsers(search)}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearch(''); fetchUsers(''); }}>
                                <Ionicons name="close-circle" size={16} color={textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.searchBtn} onPress={() => fetchUsers(search)}>
                        <Text style={styles.searchBtnText}>Tìm kiếm</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <ActivityIndicator color="#2563EB" size="large" style={{ marginVertical: 40 }} />
                ) : users.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor, margin: 14, borderRadius: 14, borderWidth: 1 }]}>
                        <Ionicons name="people-outline" size={36} color={textMuted} />
                        <Text style={[styles.emptyTitle, { color: textPrimary }]}>Không tìm thấy dữ liệu</Text>
                        <Text style={[styles.emptyDesc, { color: textMuted }]}>Thử thay đổi từ khóa tìm kiếm hoặc tải lại trang.</Text>
                    </View>
                ) : (
                    <View style={styles.listWrap}>
                        {users.map((item) => (
                            <View key={item._id} style={[styles.itemCard, { backgroundColor: cardBg, borderColor }]}>
                                <View style={styles.cardMain}>
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarLetter}>{item.fullName?.[0]?.toUpperCase() ?? 'U'}</Text>
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={[styles.cardName, { color: textPrimary }]} numberOfLines={1}>{item.fullName ?? '—'}</Text>
                                        <Text style={[styles.cardEmail, { color: textMuted }]} numberOfLines={1}>{item.email ?? '—'}</Text>
                                        {item.phone ? (
                                            <View style={styles.phoneRow}>
                                                <Ionicons name="call-outline" size={12} color={textMuted} />
                                                <Text style={[styles.cardMeta, { color: textMuted }]}>{item.phone}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#DCFCE7' : '#FEF2F2' }]}>
                                        <Text style={[styles.statusText, { color: item.status === 'active' ? '#16A34A' : '#DC2626' }]}>
                                            {item.status === 'active' ? 'Hoạt động' : 'Khoá'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
                                    <Text style={[styles.cardMeta, { color: textMuted }]}>
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                                    </Text>
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AdminUserDetail', { userId: item._id })}>
                                            <Ionicons name="eye-outline" size={17} color="#2563EB" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AdminUserEdit', { userId: item._id })}>
                                            <Ionicons name="pencil-outline" size={17} color="#F59E0B" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.fullName)}>
                                            <Ionicons name="trash-outline" size={17} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 10 },
    menuBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700' },
    headerSub: { fontSize: 12, marginTop: 1 },
    pageCard: { margin: 14, borderRadius: 14, borderWidth: 1, padding: 18, marginBottom: 10 },
    pageBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
    pageBadgeText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
    pageTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    pageTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
    pageDesc: { fontSize: 13, lineHeight: 18 },
    totalBox: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', minWidth: 80 },
    totalLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
    totalCount: { fontSize: 20, fontWeight: '700' },
    searchCard: { marginHorizontal: 14, borderRadius: 14, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10 },
    searchInput: { flex: 1, fontSize: 14 },
    searchBtn: { backgroundColor: '#2563EB', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 11 },
    searchBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
    listWrap: { marginHorizontal: 14, gap: 10, marginBottom: 20 },
    itemCard: { borderRadius: 14, borderWidth: 1 },
    cardMain: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    avatarCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    avatarLetter: { color: '#2563EB', fontSize: 16, fontWeight: '700' },
    cardInfo: { flex: 1, gap: 2 },
    cardName: { fontSize: 14, fontWeight: '600' },
    cardEmail: { fontSize: 12 },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    cardMeta: { fontSize: 12 },
    statusBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
    statusText: { fontSize: 11, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
    actionRow: { flexDirection: 'row', gap: 4 },
    actionBtn: { padding: 6 },
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
    emptyTitle: { fontSize: 15, fontWeight: '600' },
    emptyDesc: { fontSize: 13, textAlign: 'center' },
});

export default UserListScreen;
