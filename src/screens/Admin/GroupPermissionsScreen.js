import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    Switch, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useSettings } from '../../store/SettingsContext';
import { getRolesAPI, updatePermissionsAPI } from '../../services/apis/Admin/role.api';
const permissionMatrix = [
    {
        groupName: 'Quản lý Tài khoản người dùng',
        permissions: [
            { key: 'users_view', label: 'Xem tài khoản người dùng' },
            { key: 'users_edit', label: 'Chỉnh tài khoản người dùng' },
            { key: 'users_delete', label: 'Xóa tài khoản người dùng' },
        ],
    },
    {
        groupName: 'Quản lý Tài khoản quản trị',
        permissions: [
            { key: 'accounts_view', label: 'Xem tài khoản quản trị' },
            { key: 'accounts_create', label: 'Thêm tài khoản quản trị' },
            { key: 'accounts_edit', label: 'Chỉnh tài khoản quản trị' },
            { key: 'accounts_delete', label: 'Xóa tài khoản quản trị' },
        ],
    },
    {
        groupName: 'Quản lý Nhóm Quyền',
        permissions: [
            { key: 'roles_view', label: 'Xem danh sách nhóm quyền' },
            { key: 'roles_create', label: 'Thêm nhóm quyền' },
            { key: 'roles_edit', label: 'Chỉnh nhóm quyền' },
            { key: 'roles_delete', label: 'Xóa nhóm quyền' },
            { key: 'roles_permissions', label: 'Phân quyền' },
        ],
    },
    {
        groupName: 'Quản lý Hội thoại',
        permissions: [
            { key: 'conversations_view', label: 'Xem lịch sử hội thoại' },
            { key: 'conversations_delete', label: 'Xóa lịch sử hội thoại' },
            { key: 'conversations_edit', label: 'Chỉnh lịch sử hội thoại' },
        ],
    },
    {
        groupName: 'Quản lý Tin nhắn',
        permissions: [
            { key: 'chats_view', label: 'Xem lịch sử tin nhắn' },
            { key: 'chats_delete', label: 'Xóa lịch sử tin nhắn' },
            { key: 'chats_edit', label: 'Chỉnh lịch sử tin nhắn' },
        ],
    },
    {
        groupName: 'Quản lý Cấu hình cài đặt',
        permissions: [
            { key: 'settings_edit', label: 'Chỉnh cấu hình cài đặt' },
        ],
    },
];

const GroupPermissionsScreen = ({ navigation }) => {
    const { isDarkMode } = useSettings();
    const [roles, setRoles] = useState([]);
    const [localPerms, setLocalPerms] = useState({}); // { [roleId]: string[] }
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);

    const bg = isDarkMode ? '#0F172A' : '#F1F5F9';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const groupHeaderBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    const fetchRoles = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const res = await getRolesAPI({ limit: 100 });
            const list = res.data ?? [];
            setRoles(list);
            const map = {};
            list.forEach((r) => { map[r._id] = r.permissions ?? []; });
            setLocalPerms(map);
            if (list.length > 0) setSelectedRoleId((prev) => prev ?? list[0]._id);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách nhóm quyền.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchRoles(); }, []);

    const selectedRole = roles.find((r) => r._id === selectedRoleId);
    const isLocked = selectedRole?.isSystemAdmin ?? false;

    const togglePerm = (key) => {
        if (isLocked || !selectedRoleId) return;
        setLocalPerms((prev) => {
            const cur = prev[selectedRoleId] ?? [];
            const next = cur.includes(key) ? cur.filter((p) => p !== key) : [...cur, key];
            return { ...prev, [selectedRoleId]: next };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const dataToSave = roles
                .filter((r) => !r.isSystemAdmin)
                .map((r) => ({ _id: r._id, permissions: localPerms[r._id] ?? [] }));
            await updatePermissionsAPI(dataToSave);
            Alert.alert('Thành công', 'Đã lưu cấu hình phân quyền!');
        } catch {
            Alert.alert('Lỗi', 'Lưu phân quyền thất bại!');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Nhóm quyền</Text>
                    <Text style={[styles.headerSub, { color: textMuted }]}>Quản lý phân quyền hệ thống</Text>
                </View>
                <TouchableOpacity
                    style={[styles.saveHeaderBtn, { opacity: saving ? 0.6 : 1 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving
                        ? <ActivityIndicator size="small" color="#FFFFFF" />
                        : <Ionicons name="save-outline" size={15} color="#FFFFFF" />}
                    <Text style={styles.saveHeaderBtnText}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
            ) : (
                <ScrollView
                    contentContainerStyle={[styles.container, { backgroundColor: bg }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchRoles(true); }}
                            tintColor="#2563EB"
                        />
                    }
                >
                    <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="people-circle-outline" size={16} color="#2563EB" />
                            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Chọn nhóm quyền</Text>
                        </View>
                        <View style={styles.roleGrid}>
                            {roles.map((role) => {
                                const active = selectedRoleId === role._id;
                                return (
                                    <TouchableOpacity
                                        key={role._id}
                                        style={[styles.roleCard, {
                                            borderColor: active ? '#2563EB' : borderColor,
                                            backgroundColor: active ? (isDarkMode ? '#1E3A5F' : '#EFF6FF') : (isDarkMode ? '#0F172A' : '#F8FAFC'),
                                        }]}
                                        onPress={() => setSelectedRoleId(role._id)}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.roleTitleRow}>
                                                {role.isSystemAdmin && (
                                                    <Ionicons name="shield-checkmark-outline" size={13} color={active ? '#2563EB' : textMuted} />
                                                )}
                                                <Text style={[styles.roleName, { color: active ? '#2563EB' : textPrimary }]} numberOfLines={1}>
                                                    {role.title}
                                                </Text>
                                            </View>
                                            <Text style={[styles.roleDesc, { color: textMuted }]}>
                                                {role.isSystemAdmin ? 'Nhóm hệ thống — được khóa' : `${localPerms[role._id]?.length ?? 0} quyền`}
                                            </Text>
                                        </View>
                                        {active && <Ionicons name="checkmark-circle" size={18} color="#2563EB" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                    {selectedRole && (
                        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
                            <View style={styles.permHeaderRow}>
                                <View style={styles.sectionTitleRow}>
                                    <Ionicons name="key-outline" size={16} color="#2563EB" />
                                    <Text style={[styles.sectionTitle, { color: textPrimary }]}>
                                        Quyền — {selectedRole.title}
                                    </Text>
                                </View>
                                {isLocked && (
                                    <View style={[styles.lockedBadge, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
                                        <Ionicons name="lock-closed-outline" size={11} color={textMuted} />
                                        <Text style={[styles.lockedText, { color: textMuted }]}>Hệ thống</Text>
                                    </View>
                                )}
                            </View>

                            {permissionMatrix.map((group) => (
                                <View key={group.groupName}>
                                    <View style={[styles.groupHeader, { backgroundColor: groupHeaderBg, borderColor }]}>
                                        <Text style={[styles.groupHeaderText, { color: textMuted }]}>{group.groupName}</Text>
                                    </View>
                                    {group.permissions.map((perm, idx) => {
                                        const isChecked = isLocked || (localPerms[selectedRole._id] ?? []).includes(perm.key);
                                        const isLast = idx === group.permissions.length - 1;
                                        return (
                                            <View
                                                key={perm.key}
                                                style={[styles.permRow, { borderBottomColor: borderColor, borderBottomWidth: isLast ? 0 : 1 }]}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.permLabel, { color: textPrimary }]}>{perm.label}</Text>
                                                    <Text style={[styles.permKey, { color: textMuted }]}>{perm.key}</Text>
                                                </View>
                                                <Switch
                                                    value={isChecked}
                                                    onValueChange={() => togglePerm(perm.key)}
                                                    thumbColor="#FFFFFF"
                                                    trackColor={{ true: '#2563EB', false: isDarkMode ? '#334155' : '#E2E8F0' }}
                                                    disabled={isLocked}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
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
    saveHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    saveHeaderBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    container: { padding: 14, paddingBottom: 40, gap: 12 },
    sectionCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    sectionTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
    roleGrid: { gap: 10 },
    roleCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 10 },
    roleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
    roleName: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
    roleDesc: { fontSize: 12 },
    permHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    lockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
    lockedText: { fontSize: 11, fontWeight: '600' },
    groupHeader: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 12, marginBottom: 4, borderWidth: 1 },
    groupHeaderText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    permRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    permLabel: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
    permKey: { fontSize: 11 },
});

export default GroupPermissionsScreen;
