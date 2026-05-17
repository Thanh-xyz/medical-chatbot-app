import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import useAuth from '../../hooks/useAuth';
import { updateAdminAccountAPI, changeAdminPasswordAPI } from '../../services/apis/Admin/myAccount.api';
import { uploadImageAPI } from '../../services/apis/Admin/upload.api';
import { useSettings } from '../../store/SettingsContext';

const InfoTile = ({ icon, label, value, textPrimary, textMuted, cardBg, borderColor }) => (
    <View style={[styles.infoTile, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.infoTileHeader}>
            <Ionicons name={icon} size={14} color="#2563EB" />
            <Text style={[styles.infoTileLabel, { color: textMuted }]}>{label}</Text>
        </View>
        <Text style={[styles.infoTileValue, { color: textPrimary }]}>{value || 'Chưa có dữ liệu'}</Text>
    </View>
);

const AdminAccountScreen = ({ navigation }) => {
    const { user, handleLogout, updateUser } = useAuth();
    const { isDarkMode } = useSettings();
    const [editMode, setEditMode] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName ?? '');
    const [loading, setLoading] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null); // local selected image URI
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

    const bg = isDarkMode ? '#0F172A' : '#F1F5F9';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    const initials = (user?.fullName ?? 'AD').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : null;
    const avatarSource = avatarUri || user?.avatar || null;

    const handlePickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            let payload = { fullName: fullName.trim() };
            if (avatarUri) {
                const uploadRes = await uploadImageAPI(avatarUri);
                payload.avatar = uploadRes.url;
            }
            const updated = await updateAdminAccountAPI(payload);
            await updateUser(updated);
            setAvatarUri(null);
            setEditMode(false);
            Alert.alert('Thành công', 'Đã cập nhật thông tin.');
        } catch (err) {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể cập nhật.');
        } finally { setLoading(false); }
    };

    const handleChangePassword = async () => {
        const { currentPassword, newPassword, confirmPassword } = pwForm;
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        setPwLoading(true);
        try {
            await changeAdminPasswordAPI({ currentPassword, newPassword });
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            Alert.alert('Thành công', 'Đổi mật khẩu thành công.');
        } catch (err) {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể đổi mật khẩu.');
        } finally { setPwLoading(false); }
    };

    const pwFields = [
        { key: 'currentPassword', label: 'Mật khẩu hiện tại', showKey: 'current' },
        { key: 'newPassword', label: 'Mật khẩu mới', showKey: 'newPw' },
        { key: 'confirmPassword', label: 'Xác nhận mật khẩu mới', showKey: 'confirm' },
    ];

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
                <TouchableOpacity onPress={() => navigation?.dispatch(DrawerActions.openDrawer())} style={styles.menuBtn}>
                    <Ionicons name="menu" size={22} color={textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Thông tin cá nhân</Text>
                    <Text style={[styles.headerSub, { color: textMuted }]}>Quản lý hồ sơ quản trị viên</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: bg }]} showsVerticalScrollIndicator={false}>
                <View style={[styles.pageCard, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.pageBadge}>
                        <Ionicons name="person-outline" size={13} color="#2563EB" />
                        <Text style={styles.pageBadgeText}>Hồ sơ quản trị viên</Text>
                    </View>
                    <View style={styles.pageTitleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.pageTitle, { color: textPrimary }]}>Thông tin cá nhân</Text>
                            <Text style={[styles.pageDesc, { color: textMuted }]}>
                                Quản lý thông tin định danh dùng trong bảng điều khiển quản trị Medical Chatbot.
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editHeaderBtn} onPress={() => setEditMode(true)}>
                            <Ionicons name="pencil-outline" size={14} color="#FFFFFF" />
                            <Text style={styles.editHeaderBtnText}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor }]}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCircle}>
                            {avatarSource ? (
                                <Image source={{ uri: avatarSource }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>{initials}</Text>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: textPrimary }]}>{user?.fullName ?? 'Admin'}</Text>
                            <Text style={[styles.profileEmail, { color: textMuted }]}>{user?.email}</Text>
                            <View style={styles.badgeRow}>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.roleBadgeText}>Super Admin</Text>
                                </View>
                                <View style={styles.activeBadge}>
                                    <Text style={styles.activeBadgeText}>Hoạt động</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    <View style={styles.infoGrid}>
                        <InfoTile icon="person-outline" label="HỌ VÀ TÊN" value={user?.fullName} textPrimary={textPrimary} textMuted={textMuted} cardBg={isDarkMode ? '#0F172A' : '#F8FAFC'} borderColor={borderColor} />
                        <InfoTile icon="mail-outline" label="EMAIL" value={user?.email} textPrimary={textPrimary} textMuted={textMuted} cardBg={isDarkMode ? '#0F172A' : '#F8FAFC'} borderColor={borderColor} />
                        <InfoTile icon="shield-outline" label="VAI TRÒ" value="Super Admin" textPrimary={textPrimary} textMuted={textMuted} cardBg={isDarkMode ? '#0F172A' : '#F8FAFC'} borderColor={borderColor} />
                        <InfoTile icon="calendar-outline" label="NGÀY THAM GIA" value={joinDate} textPrimary={textPrimary} textMuted={textMuted} cardBg={isDarkMode ? '#0F172A' : '#F8FAFC'} borderColor={borderColor} />
                    </View>
                </View>
                {editMode && (
                    <View style={[styles.editCard, { backgroundColor: cardBg, borderColor }]}>
                        <Text style={[styles.editCardTitle, { color: textPrimary }]}>Chỉnh sửa thông tin</Text>
                        <Text style={[styles.fieldLabel, { color: textMuted }]}>Ảnh đại diện</Text>
                        <View style={styles.avatarPickerRow}>
                            <View style={[styles.avatarCircleSmall, !avatarSource && { backgroundColor: '#EF4444' }]}>
                                {avatarSource ? (
                                    <Image source={{ uri: avatarSource }} style={styles.avatarImageSmall} />
                                ) : (
                                    <Text style={styles.avatarTextSmall}>{initials}</Text>
                                )}
                            </View>
                            <TouchableOpacity style={[styles.pickBtn, { borderColor }]} onPress={handlePickAvatar}>
                                <Ionicons name="camera-outline" size={16} color="#2563EB" />
                                <Text style={styles.pickBtnText}>Chọn ảnh mới</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.fieldLabel, { color: textMuted }]}>Họ và tên</Text>
                        <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor }]}>
                            <Ionicons name="person-outline" size={17} color={textMuted} style={{ marginRight: 8 }} />
                            <TextInput
                                style={[styles.input, { color: textPrimary }]}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholderTextColor={textMuted}
                            />
                        </View>
                        <View style={styles.btnRow}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor }]} onPress={() => { setEditMode(false); setFullName(user?.fullName ?? ''); setAvatarUri(null); }}>
                                <Text style={[styles.cancelBtnText, { color: textMuted }]}>Huỷ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, loading && styles.btnDisabled]} onPress={handleSaveProfile} disabled={loading}>
                                {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.saveBtnText}>Lưu thay đổi</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                <View style={[styles.editCard, { backgroundColor: cardBg, borderColor }]}>
                    <Text style={[styles.editCardTitle, { color: textPrimary }]}>Đổi mật khẩu</Text>
                    <Text style={[styles.editCardSub, { color: textMuted }]}>Cập nhật mật khẩu để bảo mật tài khoản</Text>
                    <View style={{ height: 12 }} />
                    {pwFields.map(({ key, label, showKey }) => (
                        <View key={key}>
                            <Text style={[styles.fieldLabel, { color: textMuted }]}>{label}</Text>
                            <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor }]}>
                                <Ionicons name="lock-closed-outline" size={17} color={textMuted} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.input, { flex: 1, color: textPrimary }]}
                                    value={pwForm[key]}
                                    onChangeText={(v) => setPwForm((p) => ({ ...p, [key]: v }))}
                                    secureTextEntry={!showPw[showKey]}
                                    placeholderTextColor={textMuted}
                                    placeholder="••••••••"
                                />
                                <TouchableOpacity onPress={() => setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))}>
                                    <Ionicons name={showPw[showKey] ? 'eye-off-outline' : 'eye-outline'} size={18} color={textMuted} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity style={[styles.saveBtn, { marginTop: 8 }, pwLoading && styles.btnDisabled]} onPress={handleChangePassword} disabled={pwLoading}>
                        {pwLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.saveBtnText}>Cập nhật mật khẩu</Text>}
                    </TouchableOpacity>
                </View>
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
    container: { padding: 14, paddingBottom: 40, gap: 12 },
    pageCard: { borderRadius: 14, borderWidth: 1, padding: 18 },
    pageBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
    pageBadgeText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
    pageTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    pageTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
    pageDesc: { fontSize: 13, lineHeight: 18 },
    editHeaderBtn: { backgroundColor: '#2563EB', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignSelf: 'flex-start' },
    editHeaderBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
    profileCard: { borderRadius: 14, borderWidth: 1, padding: 18 },
    avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    avatarCircle: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarImage: { width: 64, height: 64, borderRadius: 16 },
    avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
    avatarPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
    avatarCircleSmall: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    avatarImageSmall: { width: 52, height: 52, borderRadius: 12 },
    avatarTextSmall: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    pickBtnText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 18, fontWeight: '700', marginBottom: 3 },
    profileEmail: { fontSize: 13, marginBottom: 8 },
    badgeRow: { flexDirection: 'row', gap: 8 },
    roleBadge: { backgroundColor: '#EFF6FF', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    roleBadgeText: { color: '#2563EB', fontSize: 12, fontWeight: '600' },
    activeBadge: { backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    activeBadgeText: { color: '#16A34A', fontSize: 12, fontWeight: '600' },
    divider: { height: 1, marginBottom: 16 },
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    infoTile: { width: '47.5%', borderRadius: 10, borderWidth: 1, padding: 12 },
    infoTileHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    infoTileLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    infoTileValue: { fontSize: 14, fontWeight: '600' },
    editCard: { borderRadius: 14, borderWidth: 1, padding: 18 },
    editCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    editCardSub: { fontSize: 12, marginBottom: 4 },
    fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 8 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 4 },
    input: { flex: 1, fontSize: 14 },
    btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    cancelBtnText: { fontSize: 14, fontWeight: '600' },
    saveBtn: { flex: 1, backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    btnDisabled: { opacity: 0.6 },
});

export default AdminAccountScreen;
