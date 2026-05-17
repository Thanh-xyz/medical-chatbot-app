import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUserByIdAPI, updateUserAPI } from '../../services/apis/Admin/user.api';
import { useSettings } from '../../store/SettingsContext';

const UserEditScreen = ({ route, navigation }) => {
    const { userId } = route.params;
    const [form, setForm] = useState({ fullName: '', phone: '', status: 'active' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { isDarkMode } = useSettings();

    const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
    const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const headerBg = isDarkMode ? '#1E293B' : '#FFFFFF';
    const textPrimary = isDarkMode ? '#F1F5F9' : '#0F172A';
    const textMuted = isDarkMode ? '#94A3B8' : '#64748B';
    const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
    const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

    useEffect(() => {
        (async () => {
            try {
                const data = await getUserByIdAPI(userId);
                setForm({ fullName: data.fullName ?? '', phone: data.phone ?? '', status: data.status ?? 'active' });
            } catch {
                Alert.alert('Lỗi', 'Không thể tải thông tin người dùng.');
                navigation.goBack();
            } finally { setLoading(false); }
        })();
    }, [userId]);

    const handleSave = async () => {
        if (!form.fullName.trim()) {
            Alert.alert('Lỗi', 'Họ tên là bắt buộc.');
            return;
        }
        setSaving(true);
        try {
            await updateUserAPI(userId, form);
            Alert.alert('Thành công', 'Đã cập nhật người dùng.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (err) {
            Alert.alert('Lỗi', err?.response?.data?.message ?? 'Không thể cập nhật.');
        } finally { setSaving(false); }
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
                <Text style={[styles.headerTitle, { color: textPrimary }]}>Chỉnh sửa người dùng</Text>
                <View style={{ width: 34 }} />
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    {[
                        { key: 'fullName', label: 'Họ và tên', icon: 'person-outline', type: 'default' },
                        { key: 'phone', label: 'Số điện thoại', icon: 'call-outline', type: 'phone-pad' },
                    ].map(({ key, label, icon, type }) => (
                        <View key={key} style={styles.fieldGroup}>
                            <Text style={[styles.fieldLabel, { color: textMuted }]}>{label}</Text>
                            <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor }]}>
                                <Ionicons name={icon} size={17} color={textMuted} style={{ marginRight: 8 }} />
                                <TextInput
                                    style={[styles.input, { color: textPrimary }]}
                                    value={form[key]}
                                    onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
                                    keyboardType={type}
                                    autoCapitalize={key === 'fullName' ? 'words' : 'none'}
                                    placeholderTextColor={textMuted}
                                />
                            </View>
                        </View>
                    ))}
                    <View style={styles.fieldGroup}>
                        <Text style={[styles.fieldLabel, { color: textMuted }]}>Trạng thái</Text>
                        <View style={styles.roleRow}>
                            {[{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Khoá' }].map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    style={[styles.roleChip, { borderColor, backgroundColor: form.status === opt.value ? '#2563EB' : inputBg }, form.status === opt.value && styles.roleChipActive]}
                                    onPress={() => setForm((p) => ({ ...p, status: opt.value }))}
                                >
                                    <Text style={[styles.roleChipText, { color: form.status === opt.value ? '#FFFFFF' : textMuted }]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.btnDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
    backBtn: { marginRight: 8, padding: 4 },
    headerTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
    container: { padding: 16 },
    card: { borderRadius: 14, borderWidth: 1, padding: 20, marginBottom: 16 },
    fieldGroup: { marginBottom: 16 },
    fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1 },
    input: { flex: 1, fontSize: 14 },
    roleRow: { flexDirection: 'row', gap: 12 },
    roleChip: { paddingVertical: 9, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1 },
    roleChipActive: { borderColor: '#2563EB' },
    roleChipText: { fontWeight: '600', fontSize: 14 },
    saveBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    btnDisabled: { opacity: 0.6 },
    saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});

export default UserEditScreen;
