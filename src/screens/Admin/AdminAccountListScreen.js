import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, TextInput, ScrollView,
    RefreshControl, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useSettings } from '../../store/SettingsContext';
import {
    getAdminAccountsAPI,
    createAdminAccountAPI,
    deleteAdminAccountAPI,
    getRolesAPI,
} from '../../services/apis/Admin/adminAccounts.api';

const ROLE_LABELS = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    moderator: 'Moderator',
};

const ROLE_COLORS = {
    superadmin: { bg: '#EDE9FE', text: '#7C3AED' },
    admin: { bg: '#DBEAFE', text: '#1D4ED8' },
    moderator: { bg: '#FEF3C7', text: '#D97706' },
};

const AdminAccountListScreen = ({ navigation }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRoleId, setNewRoleId] = useState('');
    const [newStatus, setNewStatus] = useState('active');
    const [creating, setCreating] = useState(false);
    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F1F5F9';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    const fetchAdmins = useCallback(async (keyword = '') => {
        try {
            const data = await getAdminAccountsAPI({ keyword });
            setAdmins(data?.admins ?? (Array.isArray(data) ? data : []));
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách tài khoản quản trị.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        if (roles.length > 0) return;
        setRolesLoading(true);
        try {
            const data = await getRolesAPI();
            setRoles(data);
            if (data.length > 0) setNewRoleId(data[0]._id);
        } catch {
        } finally { setRolesLoading(false); }
    }, [roles.length]);

    useEffect(() => { fetchAdmins(); }, []);

    const handleDelete = (adminId, name) => {
        Alert.alert('Xóa tài khoản', `Xóa tài khoản "${name}"?`, [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAdminAccountAPI(adminId);
                        setAdmins((prev) => prev.filter((a) => a._id !== adminId));
                    } catch { Alert.alert('Lỗi', 'Không thể xóa tài khoản.'); }
                },
            },
        ]);
    };

    const handleCreate = async () => {
        if (!newName.trim() || !newEmail.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên và email.');
            return;
        }
        if (!newPassword.trim() || newPassword.trim().length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        if (!newRoleId) {
            Alert.alert('Lỗi', 'Vui lòng chọn nhóm quyền.');
            return;
        }
        setCreating(true);
        try {
            const created = await createAdminAccountAPI({
                fullName: newName.trim(),
                email: newEmail.trim(),
                password: newPassword.trim(),
                role_id: newRoleId,
                status: newStatus,
            });
            setAdmins((prev) => [created, ...prev]);
            setShowAddModal(false);
            setNewName(''); setNewEmail(''); setNewPassword(''); setNewRoleId(roles[0]?._id ?? ''); setNewStatus('active');
        } catch (err) {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể tạo tài khoản.');
        } finally {
            setCreating(false);
        }
    };

    const roleColor = (role) => ROLE_COLORS[role] ?? { bg: '#F1F5F9', text: '#64748B' };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Tài khoản quản trị</Text>
                    <Text style={[styles.headerSub, { color: textMuted }]}>Quản lý tài khoản vận hành hệ thống</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAdmins(search); }} tintColor="#2563EB" />}
            >
                <View style={[styles.pageCard, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.pageBadge}>
                        <Ionicons name="shield-outline" size={13} color="#2563EB" />
                        <Text style={styles.pageBadgeText}>Quản lý tài khoản quản trị</Text>
                    </View>
                    <View style={styles.pageTitleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.pageTitle, { color: textPrimary }]}>Tài khoản quản trị</Text>
                            <Text style={[styles.pageDesc, { color: textMuted }]}>
                                Quản lý nhân sự vận hành, vai trò và trạng thái truy cập vào hệ thống quản trị.
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.addBtn} onPress={() => { setShowAddModal(true); fetchRoles(); }}>
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                            <Text style={styles.addBtnText}>Thêm tài khoản</Text>
                        </TouchableOpacity>
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
                            onSubmitEditing={() => fetchAdmins(search)}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearch(''); fetchAdmins(''); }}>
                                <Ionicons name="close-circle" size={16} color={textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.searchBtn} onPress={() => fetchAdmins(search)}>
                        <Text style={styles.searchBtnText}>Tìm kiếm</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <ActivityIndicator color="#2563EB" size="large" style={{ marginVertical: 40 }} />
                ) : admins.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor, margin: 14, borderRadius: 14, borderWidth: 1 }]}>
                        <Ionicons name="shield-outline" size={36} color={textMuted} />
                        <Text style={[styles.emptyTitle, { color: textPrimary }]}>Không tìm thấy dữ liệu</Text>
                        <Text style={[styles.emptyDesc, { color: textMuted }]}>Thử thay đổi từ khóa tìm kiếm hoặc tải lại trang.</Text>
                    </View>
                ) : (
                    <View style={styles.listWrap}>
                        {admins.map((item) => {
                            const rc = item.role_id?.isSystemAdmin
                                ? { bg: '#EDE9FE', text: '#7C3AED' }
                                : { bg: '#DBEAFE', text: '#1D4ED8' };
                            return (
                                <View key={item._id} style={[styles.itemCard, { backgroundColor: cardBg, borderColor }]}>
                                    <View style={styles.cardMain}>
                                        <View style={styles.avatarCircle}>
                                            <Text style={styles.avatarLetter}>{item.fullName?.[0]?.toUpperCase() ?? 'A'}</Text>
                                        </View>
                                        <View style={styles.cardInfo}>
                                            <Text style={[styles.cardName, { color: textPrimary }]} numberOfLines={1}>{item.fullName ?? '—'}</Text>
                                            <Text style={[styles.cardEmail, { color: textMuted }]} numberOfLines={1}>{item.email ?? '—'}</Text>
                                            <View style={[styles.roleBadge, { backgroundColor: rc.bg, marginTop: 4 }]}>
                                                <Text style={[styles.roleText, { color: rc.text }]}>{item.role_id?.title ?? '—'}</Text>
                                            </View>
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
                                            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id, item.fullName)}>
                                                <Ionicons name="trash-outline" size={17} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
            <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: textPrimary }]}>Thêm tài khoản quản trị</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={20} color={textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 10, paddingTop: 4 }} keyboardShouldPersistTaps="handled">
                            <Text style={[styles.inputLabel, { color: textMuted }]}>Họ và tên</Text>
                            <TextInput
                                style={[styles.inputField, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
                                placeholder="Nhập họ và tên..."
                                placeholderTextColor={textMuted}
                                value={newName}
                                onChangeText={setNewName}
                            />

                            <Text style={[styles.inputLabel, { color: textMuted }]}>Email</Text>
                            <TextInput
                                style={[styles.inputField, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
                                placeholder="Nhập địa chỉ email..."
                                placeholderTextColor={textMuted}
                                value={newEmail}
                                onChangeText={setNewEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={[styles.inputLabel, { color: textMuted }]}>Mật khẩu</Text>
                            <TextInput
                                style={[styles.inputField, { backgroundColor: inputBg, borderColor, color: textPrimary }]}
                                placeholder="Ít nhất 6 ký tự..."
                                placeholderTextColor={textMuted}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />

                            <Text style={[styles.inputLabel, { color: textMuted }]}>Nhóm quyền</Text>
                            {rolesLoading ? (
                                <ActivityIndicator color="#2563EB" size="small" />
                            ) : (
                                <View style={styles.roleRow}>
                                    {roles.map((r) => (
                                        <TouchableOpacity
                                            key={r._id}
                                            style={[styles.roleOption, { borderColor: newRoleId === r._id ? '#2563EB' : borderColor, backgroundColor: newRoleId === r._id ? '#EFF6FF' : inputBg }]}
                                            onPress={() => setNewRoleId(r._id)}
                                        >
                                            <Text style={[styles.roleOptionText, { color: newRoleId === r._id ? '#2563EB' : textMuted }]} numberOfLines={1}>
                                                {r.title}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={[styles.inputLabel, { color: textMuted }]}>Trạng thái</Text>
                            <View style={styles.roleRow}>
                                {[{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Khoá' }].map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[styles.roleOption, { borderColor: newStatus === opt.value ? '#2563EB' : borderColor, backgroundColor: newStatus === opt.value ? '#EFF6FF' : inputBg }]}
                                        onPress={() => setNewStatus(opt.value)}
                                    >
                                        <Text style={[styles.roleOptionText, { color: newStatus === opt.value ? '#2563EB' : textMuted }]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor }]} onPress={() => setShowAddModal(false)}>
                                <Text style={[styles.cancelBtnText, { color: textMuted }]}>Huỷ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, creating && { opacity: 0.6 }]} onPress={handleCreate} disabled={creating}>
                                {creating ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Tạo tài khoản</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
        paddingVertical: 12, borderBottomWidth: 1, gap: 12,
    },
    menuBtn: { padding: 4 },
    headerTitle: { fontSize: 16, fontWeight: '700' },
    headerSub: { fontSize: 12, marginTop: 1 },
    pageCard: { margin: 14, borderRadius: 14, borderWidth: 1, padding: 18, marginBottom: 10 },
    pageBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
    pageBadgeText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
    pageTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    pageTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
    pageDesc: { fontSize: 13, lineHeight: 18 },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#2563EB', paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 10, alignSelf: 'flex-start',
    },
    addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
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
    cardMeta: { fontSize: 12 },
    roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    roleText: { fontSize: 11, fontWeight: '600' },
    statusBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
    statusText: { fontSize: 11, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
    actionRow: { flexDirection: 'row', gap: 4 },
    actionBtn: { padding: 6 },
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 8 },
    emptyTitle: { fontSize: 15, fontWeight: '600' },
    emptyDesc: { fontSize: 13, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalCard: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 12 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { fontSize: 16, fontWeight: '700' },
    inputLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
    inputField: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
    roleRow: { flexDirection: 'row', gap: 10 },
    roleOption: { flex: 1, borderWidth: 1.5, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
    roleOptionText: { fontSize: 13, fontWeight: '600' },
    modalFooter: { flexDirection: 'row', gap: 10, marginTop: 4 },
    cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
    cancelBtnText: { fontSize: 14, fontWeight: '600' },
    saveBtn: { flex: 1, backgroundColor: '#2563EB', borderRadius: 8, paddingVertical: 11, alignItems: 'center' },
    saveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});

export default AdminAccountListScreen;
