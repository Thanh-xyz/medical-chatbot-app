import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { resetPasswordAPI } from '../../services/apis/Client/auth.api';
import { getApiErrorMessage } from '../../utils/apiClient';
import { validatePassword } from '../../utils/validation';

const ResetPasswordScreen = ({ navigation, route }) => {
    const [token, setToken] = useState(route?.params?.token || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async () => {
        const trimmedToken = token.trim();
        const passwordError = validatePassword(password);
        if (!trimmedToken) {
            setError('Token đặt lại mật khẩu không hợp lệ');
            return;
        }
        if (passwordError) {
            setError(passwordError);
            return;
        }
        if (!confirmPassword) {
            setError('Vui lòng xác nhận mật khẩu');
            return;
        }
        if (confirmPassword !== password) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await resetPasswordAPI({ token: trimmedToken, password, confirmPassword });
            setSuccess(res?.message || 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.');
            setTimeout(() => navigation.navigate('ClientLogin'), 1800);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Không thể đặt lại mật khẩu!'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#E0F7FA']} style={styles.gradient}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="lock-closed-outline" size={30} color="#2563EB" />
                        </View>
                        <Text style={styles.heading}>Tạo mật khẩu mới</Text>
                        <Text style={styles.subheading}>
                            Mật khẩu mới cần có ít nhất 8 ký tự, 1 chữ hoa và 1 chữ số.
                        </Text>

                        {!!error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={15} color="#B91C1C" style={{ marginRight: 6 }} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                        {!!success && (
                            <View style={styles.successBox}>
                                <Ionicons name="checkmark-circle-outline" size={15} color="#15803D" style={{ marginRight: 6 }} />
                                <Text style={styles.successText}>{success}</Text>
                            </View>
                        )}

                        {!route?.params?.token && (
                            <>
                                <Text style={styles.label}>Token</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Dán token trong link reset password"
                                    placeholderTextColor="#A0AEC0"
                                    value={token}
                                    onChangeText={setToken}
                                    autoCapitalize="none"
                                />
                            </>
                        )}

                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Tạo mật khẩu mạnh"
                                placeholderTextColor="#A0AEC0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword((current) => !current)} style={styles.eyeBtn}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Xác nhận mật khẩu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu mới"
                            placeholderTextColor="#A0AEC0"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showPassword}
                        />

                        <TouchableOpacity
                            style={[styles.btn, (loading || success) && styles.btnDisabled]}
                            onPress={handleSubmit}
                            disabled={loading || !!success}
                        >
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Đặt lại mật khẩu</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('ClientLogin')}>
                            <Text style={styles.backText}>Quay lại đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 26,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    iconCircle: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heading: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    subheading: { color: '#64748B', fontSize: 14, lineHeight: 20, marginBottom: 18 },
    label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 6 },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1E293B',
        marginBottom: 16,
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1E293B' },
    eyeBtn: { padding: 4 },
    btn: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
    backLink: { marginTop: 16, alignItems: 'center' },
    backText: { color: '#2563EB', fontWeight: '700' },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF2F2',
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        borderRadius: 8,
        padding: 12,
        marginBottom: 14,
    },
    errorText: { color: '#B91C1C', fontSize: 13, flex: 1, lineHeight: 18 },
    successBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F0FDF4',
        borderLeftWidth: 4,
        borderLeftColor: '#22C55E',
        borderRadius: 8,
        padding: 12,
        marginBottom: 14,
    },
    successText: { color: '#15803D', fontSize: 13, flex: 1, lineHeight: 18 },
});

export default ResetPasswordScreen;
