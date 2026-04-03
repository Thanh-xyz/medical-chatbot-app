import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserByIdAPI, updateUserAPI } from '../../services/apis/Admin/user.api';
import { COLORS } from '../../utils/constants';

const UserEditScreen = ({ route, navigation }) => {
    const { userId } = route.params;
    const [form, setForm] = useState({ fullName: '', email: '', role: 'client' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getUserByIdAPI(userId);
                setForm({ fullName: data.fullName ?? '', email: data.email ?? '', role: data.role ?? 'client' });
            } catch {
                Alert.alert('Error', 'Failed to load user.');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [userId]);

    const handleSave = async () => {
        if (!form.fullName.trim() || !form.email.trim()) {
            Alert.alert('Error', 'Name and email are required.');
            return;
        }
        setSaving(true);
        try {
            await updateUserAPI(userId, form);
            Alert.alert('Success', 'User updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (err) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update user.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit User</Text>
                <View style={{ width: 30 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    {[
                        { key: 'fullName', label: 'Full Name', icon: 'person-outline', type: 'default' },
                        { key: 'email', label: 'Email', icon: 'mail-outline', type: 'email-address' },
                    ].map(({ key, label, icon, type }) => (
                        <View key={key} style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>{label}</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name={icon} size={18} color={COLORS.textLight} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={form[key]}
                                    onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
                                    keyboardType={type}
                                    autoCapitalize={key === 'email' ? 'none' : 'words'}
                                    placeholderTextColor={COLORS.textLight}
                                />
                            </View>
                        </View>
                    ))}

                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>Role</Text>
                        <View style={styles.roleRow}>
                            {['client', 'admin'].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[styles.roleChip, form.role === role && styles.roleChipActive]}
                                    onPress={() => setForm((p) => ({ ...p, role }))}
                                >
                                    <Text style={[styles.roleChipText, form.role === role && styles.roleChipTextActive]}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
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
                        <ActivityIndicator color={COLORS.white} />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    headerBar: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backBtn: { marginRight: 12 },
    headerTitle: { flex: 1, color: COLORS.white, fontSize: 18, fontWeight: '700' },
    container: { padding: 16 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    fieldGroup: { marginBottom: 16 },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 6 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 15, color: COLORS.text },
    roleRow: { flexDirection: 'row', gap: 12 },
    roleChip: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
    },
    roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    roleChipText: { color: COLORS.textLight, fontWeight: '600' },
    roleChipTextActive: { color: COLORS.white },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.6 },
    saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});

export default UserEditScreen;
