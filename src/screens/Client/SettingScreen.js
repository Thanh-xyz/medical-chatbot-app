import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useAuth from '../../hooks/useAuth';
import { useSettings } from '../../store/SettingsContext';
import { useChatContext } from '../../store/ChatContext';
import { updateClientAccountAPI } from '../../services/apis/Client/myAccount.api';
import { uploadImageAPI } from '../../services/apis/Client/upload.api';
import { validateFullName, validatePhone } from '../../utils/validation';
import { goBackOrNavigate } from '../../utils/navigation';

const SettingScreen = ({ navigation, route }) => {
    const { user, handleLogout, updateUser } = useAuth();
    const { fontSize, setFontSize, isDarkMode, setIsDarkMode } = useSettings();
    const { deleteAllConversations } = useChatContext();

    const [fullName, setFullName] = useState(user?.fullName ?? '');
    const [yearOfBirth, setYearOfBirth] = useState(user?.yearOfBirth ?? '');
    const [sex, setSex] = useState(user?.sex ?? 'MALE');
    const [address, setAddress] = useState(user?.address ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [avatarUri, setAvatarUri] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    useEffect(() => {
        if (user?.fullName) setFullName(user.fullName);
        setYearOfBirth(user?.yearOfBirth ?? '');
        setSex(user?.sex || 'MALE');
        setAddress(user?.address ?? '');
        setPhone(user?.phone ?? '');
    }, [user]);

    const bg = isDarkMode ? '#0F172A' : '#F5F9FC';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const cardBorder = isDarkMode ? '#334155' : '#E2F4FF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const inputBg = isDarkMode ? '#334155' : '#F9FAFB';
    const inputBorder = isDarkMode ? '#475569' : '#E5E7EB';
    const inputText = isDarkMode ? '#F1F5F9' : '#1E293B';

    const handlePickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.length > 0) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSaveProfile = async () => {
        const fullNameError = validateFullName(fullName);
        if (fullNameError) {
            Alert.alert('Lỗi', fullNameError);
            return;
        }
        const phoneError = validatePhone(phone);
        if (phoneError) {
            Alert.alert('Lỗi', phoneError);
            return;
        }
        if (yearOfBirth.trim() && !/^\d{4}$/.test(yearOfBirth.trim())) {
            Alert.alert('Lỗi', 'Năm sinh phải gồm 4 chữ số.');
            return;
        }
        const payload = {
            fullName: fullName.trim(),
            yearOfBirth: yearOfBirth.trim(),
            sex,
            address: address.trim(),
            phone: phone.trim(),
        };
        const hasProfileChange = Object.keys(payload).some((key) => String(payload[key] || '') !== String(user?.[key] || ''));
        if (!hasProfileChange && !avatarUri) {
            Alert.alert('Thông báo', 'Thông tin không có gì thay đổi!');
            return;
        }
        setIsSaving(true);
        try {
            if (avatarUri) {
                const uploadRes = await uploadImageAPI(avatarUri);
                payload.avatar = uploadRes.url;
                setAvatarUri(null);
            }
            const updated = await updateClientAccountAPI(payload);
            await updateUser(updated);
            Alert.alert('Thành công', 'Lưu thông tin thành công!');
        } catch (err) {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể cập nhật thông tin.');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteAll = () => {
        Alert.alert(
            'Xóa tất cả lịch sử chat',
            'Hành động này không thể hoàn tác. Bạn có chắc muốn xóa tất cả lịch sử khám không?',
            [
                { text: 'Huỷ', style: 'cancel' },
                {
                    text: 'Xóa tất cả',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeletingAll(true);
                        try {
                            await deleteAllConversations();
                            Alert.alert('Thành công', 'Đã xóa toàn bộ lịch sử chat.');
                        } catch {
                            Alert.alert('Lỗi', 'Xóa thất bại, vui lòng thử lại.');
                        } finally {
                            setIsDeletingAll(false);
                        }
                    },
                },
            ]
        );
    };

    const confirmLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Huỷ', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    setIsLoggingOut(true);
                    await handleLogout('client');
                },
            },
        ]);
    };

    const fontSizeOptions = [
        { key: 'small', label: 'Nhỏ', textStyle: { fontSize: 13 } },
        { key: 'medium', label: 'Vừa', textStyle: { fontSize: 15 } },
        { key: 'large', label: 'To', textStyle: { fontSize: 17 } },
    ];

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
            <View style={[styles.header, { backgroundColor: cardBg, borderBottomColor: cardBorder }]}>
                {!!route?.params?.from && (
                    <TouchableOpacity
                        style={styles.headerBackBtn}
                        onPress={() => goBackOrNavigate(navigation, route.params.from)}
                    >
                        <Ionicons name="arrow-back-outline" size={18} color={textPrimary} />
                    </TouchableOpacity>
                )}
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: textPrimary }]}>Cài đặt</Text>
                    <Text style={[styles.headerSubtitle, { color: textMuted }]}>
                        Quản lý hồ sơ, giao diện và dữ liệu của bạn.
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={styles.userRow}>
                        <View style={[styles.avatarCircle, { overflow: 'hidden' }]}>
                            {(avatarUri || user?.avatar) ? (
                                <Image source={{ uri: avatarUri || user.avatar }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
                                </Text>
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.userName, { color: textPrimary }]} numberOfLines={1}>
                                {user?.fullName ?? 'Người dùng'}
                            </Text>
                            <Text style={[styles.userAccount, { color: textMuted }]} numberOfLines={1}>
                                {user?.email || user?.phone || 'Tài khoản miễn phí'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.changeAvatarBtn, { borderColor: isDarkMode ? '#475569' : '#BAE6FD', backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF' }]}
                            onPress={handlePickAvatar}
                        >
                            <Ionicons name="camera-outline" size={16} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                    {avatarUri && (
                        <Text style={[styles.avatarHint, { color: '#2563EB' }]}>Ảnh mới đã chọn. Nhấn "Lưu thông tin" để cập nhật.</Text>
                    )}
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBox}>
                            <Ionicons name="person-outline" size={20} color="#2563EB" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Thông tin của bạn</Text>
                            <Text style={[styles.sectionDesc, { color: textMuted }]}>
                                Cập nhật hồ sơ cá nhân dùng trong ứng dụng.
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.label, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>Họ và tên</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: inputText }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Nhập họ và tên..."
                            placeholderTextColor={textMuted}
                        />
                    </View>

                    <Text style={[styles.label, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>Tài khoản</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', borderColor: inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: textMuted }]}
                            value={user?.email || user?.phone || ''}
                            editable={false}
                        />
                    </View>
                    <Text style={[styles.hintText, { color: textMuted }]}>Tên tài khoản không thể thay đổi.</Text>

                    <Text style={[styles.label, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>Số điện thoại</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: inputText }]}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Nhập số điện thoại..."
                            placeholderTextColor={textMuted}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Text style={[styles.label, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>Năm sinh</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: inputText }]}
                            value={yearOfBirth}
                            onChangeText={setYearOfBirth}
                            placeholder="Ví dụ: 1995"
                            placeholderTextColor={textMuted}
                            keyboardType="number-pad"
                            maxLength={4}
                        />
                    </View>

                    <Text style={[styles.label, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>Giới tính</Text>
                    <View style={styles.sexRow}>
                        {[
                            { value: 'MALE', label: 'Nam' },
                            { value: 'FEMALE', label: 'Nữ' },
                            { value: 'OTHER', label: 'Khác' },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.sexBtn,
                                    sex === option.value
                                        ? styles.sexBtnActive
                                        : [styles.sexBtnNormal, { borderColor: inputBorder, backgroundColor: inputBg }],
                                ]}
                                onPress={() => setSex(option.value)}
                            >
                                <Text style={[
                                    styles.sexBtnText,
                                    { color: sex === option.value ? '#FFFFFF' : inputText },
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: isDarkMode ? '#CBD5E1' : '#374151' }]}>Địa chỉ</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                        <TextInput
                            style={[styles.input, { color: inputText }]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Nhập địa chỉ..."
                            placeholderTextColor={textMuted}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                        onPress={handleSaveProfile}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                <Text style={styles.saveBtnText}>Lưu thông tin</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBox}>
                            <Ionicons name="settings-outline" size={20} color="#2563EB" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sectionTitle, { color: textPrimary }]}>Tùy chỉnh hiển thị</Text>
                            <Text style={[styles.sectionDesc, { color: textMuted }]}>
                                Điều chỉnh giao diện theo thói quen của bạn.
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.optionBox, { backgroundColor: isDarkMode ? '#334155' : '#F0F9FF', borderColor: isDarkMode ? '#475569' : '#BAE6FD' }]}>
                        <View style={styles.optionLabelRow}>
                            <Ionicons name="text-outline" size={16} color="#2563EB" />
                            <Text style={[styles.optionLabel, { color: textPrimary }]}>Kích thước chữ trong chat</Text>
                        </View>
                        <View style={styles.fontSizeRow}>
                            {fontSizeOptions.map((opt) => (
                                <TouchableOpacity
                                    key={opt.key}
                                    style={[
                                        styles.fontSizeBtn,
                                        fontSize === opt.key
                                            ? styles.fontSizeBtnActive
                                            : [styles.fontSizeBtnNormal, { borderColor: isDarkMode ? '#475569' : '#BAE6FD' }],
                                    ]}
                                    onPress={() => setFontSize(opt.key)}
                                >
                                    <Text
                                        style={[
                                            opt.textStyle,
                                            { fontWeight: '700', color: fontSize === opt.key ? '#FFFFFF' : (isDarkMode ? '#94A3B8' : '#64748B') },
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={[styles.optionBox, { backgroundColor: isDarkMode ? '#334155' : '#F0F9FF', borderColor: isDarkMode ? '#475569' : '#BAE6FD' }]}>
                        <View style={styles.optionLabelRow}>
                            <Text style={[styles.optionLabel, { color: textPrimary }]}>Giao diện</Text>
                        </View>
                        <Text style={[styles.optionDesc, { color: textMuted }]}>Chọn chế độ sáng hoặc tối.</Text>
                        <View style={[styles.modeToggle, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: isDarkMode ? '#475569' : '#BAE6FD' }]}>
                            <TouchableOpacity
                                style={[styles.modeBtn, !isDarkMode && styles.modeBtnActive]}
                                onPress={() => setIsDarkMode(false)}
                            >
                                <Ionicons name="sunny-outline" size={15} color={!isDarkMode ? '#FFFFFF' : (isDarkMode ? '#94A3B8' : '#64748B')} style={{ marginRight: 4 }} />
                                <Text style={[styles.modeBtnText, !isDarkMode && { color: '#FFFFFF' }, isDarkMode && { color: '#94A3B8' }]}>
                                    Sáng
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modeBtn, isDarkMode && styles.modeBtnActive]}
                                onPress={() => setIsDarkMode(true)}
                            >
                                <Ionicons name="moon-outline" size={15} color={isDarkMode ? '#FFFFFF' : '#64748B'} style={{ marginRight: 4 }} />
                                <Text style={[styles.modeBtnText, isDarkMode && { color: '#FFFFFF' }]}>Tối</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={[styles.card, styles.dangerCard, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.08)' : '#FFF5F5', borderColor: isDarkMode ? 'rgba(239,68,68,0.3)' : '#FECACA' }]}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Vùng nguy hiểm</Text>
                            <Text style={[styles.sectionDesc, { color: isDarkMode ? '#FCA5A5' : '#B91C1C', opacity: 0.8 }]}>
                                Các hành động dưới đây không thể hoàn tác.
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[styles.deleteAllBtn, isDeletingAll && { opacity: 0.6 }]}
                        onPress={confirmDeleteAll}
                        disabled={isDeletingAll}
                    >
                        {isDeletingAll ? (
                            <ActivityIndicator color="#EF4444" size="small" />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                                <Text style={styles.deleteAllText}>Xóa tất cả lịch sử chat</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: textPrimary }]}>Tìm hiểu thêm</Text>
                    <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('ClientUpgrade', { from: 'ClientSettings' })}>
                        <Ionicons name="rocket-outline" size={18} color={textMuted} style={{ marginRight: 10 }} />
                        <Text style={[styles.linkText, { color: textPrimary }]}>Nâng cấp gói</Text>
                        <Ionicons name="chevron-forward-outline" size={16} color={textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('ClientUsagePolicy', { from: 'ClientSettings' })}>
                        <Ionicons name="document-text-outline" size={18} color={textMuted} style={{ marginRight: 10 }} />
                        <Text style={[styles.linkText, { color: textPrimary }]}>Chính sách sử dụng</Text>
                        <Ionicons name="chevron-forward-outline" size={16} color={textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('ClientPrivacyPolicy', { from: 'ClientSettings' })}>
                        <Ionicons name="shield-outline" size={18} color={textMuted} style={{ marginRight: 10 }} />
                        <Text style={[styles.linkText, { color: textPrimary }]}>Chính sách quyền riêng tư</Text>
                        <Ionicons name="chevron-forward-outline" size={16} color={textMuted} />
                    </TouchableOpacity>
                </View>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <TouchableOpacity
                        style={[styles.logoutBtn, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}
                        onPress={confirmLogout}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? (
                            <ActivityIndicator color="#EF4444" size="small" />
                        ) : (
                            <>
                                <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
                                <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerBackBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    headerTitle: { fontSize: 22, fontWeight: '700' },
    headerSubtitle: { fontSize: 13, marginTop: 2 },
    container: { padding: 16, paddingBottom: 32 },

    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 14,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    dangerCard: {},

    userRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: { width: 52, height: 52, borderRadius: 26 },
    avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
    changeAvatarBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    avatarHint: { fontSize: 12, marginTop: 10, fontStyle: 'italic' },
    userName: { fontSize: 15, fontWeight: '700' },
    userAccount: { fontSize: 13, marginTop: 2 },

    sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 18 },
    sectionIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    sectionDesc: { fontSize: 13, lineHeight: 18 },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.06)',
        marginTop: 4,
    },
    linkText: { flex: 1, fontSize: 15 },

    label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
    inputWrapper: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
    },
    input: { paddingVertical: 12, fontSize: 15 },
    hintText: { fontSize: 11, marginBottom: 16, marginTop: -8 },
    sexRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    sexBtn: {
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 10,
    },
    sexBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    sexBtnNormal: {},
    sexBtnText: { fontSize: 13, fontWeight: '700' },

    saveBtn: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
        shadowColor: '#2563EB',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

    optionBox: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        marginBottom: 12,
    },
    optionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    optionLabel: { fontSize: 14, fontWeight: '600' },
    optionDesc: { fontSize: 13, marginBottom: 10, marginTop: -6 },

    fontSizeRow: { flexDirection: 'row', gap: 8 },
    fontSizeBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1 },
    fontSizeBtnActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    fontSizeBtnNormal: { backgroundColor: 'transparent' },

    modeToggle: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 14,
        padding: 4,
        alignSelf: 'flex-start',
    },
    modeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    modeBtnActive: { backgroundColor: '#2563EB' },
    modeBtnText: { fontSize: 13, fontWeight: '700', color: '#64748B' },

    deleteAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 12,
    },
    deleteAllText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 14,
    },
    logoutText: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
});

export default SettingScreen;
