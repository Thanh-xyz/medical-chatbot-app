import React, { useState } from 'react';
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
import useAuth from '../../hooks/useAuth';
import { updateClientAccountAPI, changeClientPasswordAPI } from '../../services/apis/Client/myAccount.api';
import { COLORS } from '../../utils/constants';

const SettingScreen = () => {
    const { user, handleLogout, updateUser } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [fullName, setFullName] = useState(user?.fullName ?? '');
    const [loading, setLoading] = useState(false);

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);

    const handleSaveProfile = async () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Name cannot be empty.');
            return;
        }
        setLoading(true);
        try {
            const updated = await updateClientAccountAPI({ fullName: fullName.trim() });
            await updateUser(updated);
            setEditMode(false);
            Alert.alert('Success', 'Profile updated.');
        } catch (err) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        const { currentPassword, newPassword, confirmPassword } = pwForm;
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        setPwLoading(true);
        try {
            await changeClientPasswordAPI({ currentPassword, newPassword });
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            Alert.alert('Success', 'Password changed.');
        } catch (err) {
            Alert.alert('Error', err?.response?.data?.message ?? 'Failed to change password.');
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Profile Card */}
                <View style={styles.card}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{user?.fullName?.[0]?.toUpperCase() ?? 'U'}</Text>
                    </View>
                    <Text style={styles.emailText}>{user?.email}</Text>

                    <Text style={styles.sectionTitle}>Profile</Text>

                    <View style={styles.inputWrapper}>
                        <Ionicons name="person-outline" size={18} color={COLORS.textLight} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            editable={editMode}
                            placeholder="Full name"
                            placeholderTextColor={COLORS.textLight}
                        />
                        {!editMode && (
                            <TouchableOpacity onPress={() => setEditMode(true)}>
                                <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {editMode && (
                        <View style={styles.row}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditMode(false); setFullName(user?.fullName ?? ''); }}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, loading && styles.btnDisabled]} onPress={handleSaveProfile} disabled={loading}>
                                {loading ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Change Password */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Change Password</Text>

                    {[
                        { key: 'currentPassword', placeholder: 'Current password' },
                        { key: 'newPassword', placeholder: 'New password' },
                        { key: 'confirmPassword', placeholder: 'Confirm new password' },
                    ].map(({ key, placeholder }) => (
                        <View key={key} style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={placeholder}
                                placeholderTextColor={COLORS.textLight}
                                value={pwForm[key]}
                                onChangeText={(v) => setPwForm((p) => ({ ...p, [key]: v }))}
                                secureTextEntry
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.saveBtn, pwLoading && styles.btnDisabled]}
                        onPress={handleChangePassword}
                        disabled={pwLoading}
                    >
                        {pwLoading ? <ActivityIndicator color={COLORS.white} size="small" /> : <Text style={styles.saveBtnText}>Update Password</Text>}
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={() => handleLogout('client')}>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    container: { padding: 16 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    avatarText: { color: COLORS.white, fontSize: 28, fontWeight: '700' },
    emailText: { textAlign: 'center', color: COLORS.textLight, fontSize: 14, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, fontSize: 15, color: COLORS.text },
    row: { flexDirection: 'row', gap: 12 },
    cancelBtn: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelBtnText: { color: COLORS.text, fontWeight: '600' },
    saveBtn: {
        flex: 1,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveBtnText: { color: COLORS.white, fontWeight: '700' },
    btnDisabled: { opacity: 0.6 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: COLORS.danger,
        gap: 8,
    },
    logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
});

export default SettingScreen;
