import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUserByIdAPI, deleteUserAPI } from '../../services/apis/Admin/user.api';
import { useSettings } from '../../store/SettingsContext';

const DetailRow = ({ label, value, isDark }) => {
    const textPrimary = isDark ? '#F1F5F9' : '#0F172A';
    const textMuted = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? '#334155' : '#E2E8F0';
    return (
        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.detailLabel, { color: textMuted }]}>{label}</Text>
            <Text style={[styles.detailValue, { color: textPrimary }]}>{value ?? '-'}</Text>
        </View>
    );
};

const UserDetailScreen = ({ route, navigation }) => {
    const { userId } = route.params;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';

    useEffect(() => {
        (async () => {
            try {
                const data = await getUserByIdAPI(userId);
                setUser(data);
            } catch {
                Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
                navigation.goBack();
            } finally { setLoading(false); }
        })();
    }, [userId]);

    const handleDelete = () => {
        Alert.alert('Xóa người dùng', 'Bạn có chắc muốn xóa tài khoản này?', [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Xóa', style: 'destructive',
                onPress: async () => {
                    try { await deleteUserAPI(userId); navigation.goBack(); }
                    catch { Alert.alert('Lỗi', 'Không thể xóa người dùng.'); }
                },
            },
        ]);
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
                <Text style={[styles.headerTitle, { color: textPrimary }]}>Chi tiết người dùng</Text>
                <View style={{ width: 34 }} />
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{user?.fullName?.[0]?.toUpperCase() ?? 'U'}</Text>
                    </View>
                    <Text style={[styles.userName, { color: textPrimary }]}>{user?.fullName}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: user?.status === 'active' ? '#DCFCE7' : '#FEF2F2' }]}>
                        <Text style={[styles.roleText, { color: user?.status === 'active' ? '#16A34A' : '#DC2626' }]}>
                            {user?.status === 'active' ? 'Hoạt động' : 'Khoá'}
                        </Text>
                    </View>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <DetailRow isDark={isDarkMode} label="Email" value={user?.email} />
                    <DetailRow isDark={isDarkMode} label="Họ và tên" value={user?.fullName} />
                    <DetailRow isDark={isDarkMode} label="Số điện thoại" value={user?.phone} />
                    <DetailRow isDark={isDarkMode} label="Giới tính" value={user?.sex === 'MALE' ? 'Nam' : user?.sex === 'FEMALE' ? 'Nữ' : user?.sex === 'OTHER' ? 'Khác' : '-'} />
                    <DetailRow isDark={isDarkMode} label="Năm sinh" value={user?.yearOfBirth} />
                    <DetailRow isDark={isDarkMode} label="Địa chỉ" value={user?.address} />
                    <DetailRow isDark={isDarkMode} label="Trạng thái" value={user?.status === 'active' ? 'Hoạt động' : 'Khoá'} />
                    <DetailRow isDark={isDarkMode} label="Ngày tạo" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'} />
                </View>
                <View style={styles.btnRow}>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => navigation.navigate('AdminUserEdit', { userId })}
                    >
                        <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.editBtnText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.deleteBtnText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
    backBtn: { padding: 4, marginRight: 8 },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
    container: { padding: 16 },
    avatarSection: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
    avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { color: '#2563EB', fontSize: 32, fontWeight: '700' },
    userName: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
    roleBadge: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
    roleText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
    card: { borderRadius: 12, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1 },
    detailLabel: { fontSize: 14, fontWeight: '500' },
    detailValue: { fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
    btnRow: { flexDirection: 'row', gap: 12 },
    editBtn: { flex: 1, backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    editBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
    deleteBtn: { flex: 1, backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    deleteBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});

export default UserDetailScreen;
