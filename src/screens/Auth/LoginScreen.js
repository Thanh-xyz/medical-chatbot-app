import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../../hooks/useAuth';
import { isAdminApp } from '../../config/appVariant';
import { getApiErrorMessage } from '../../utils/apiClient';
import { validateEmail } from '../../utils/validation';
import { formatLoginLockRemaining, getLoginLockRemainingSeconds } from '../../utils/authLock';
import { resendVerificationEmailAPI } from '../../services/apis/Client/auth.api';

const LoginScreen = ({ navigation }) => {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [canResendVerification, setCanResendVerification] = useState(false);
    const [resendingVerification, setResendingVerification] = useState(false);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);
    const { handleClientLogin } = useAuth();

    useEffect(() => {
        if (!lockedUntil) return undefined;
        const updateRemaining = () => {
            const remaining = getLoginLockRemainingSeconds(lockedUntil);
            setLockRemainingSeconds(remaining);
            if (remaining <= 0) setLockedUntil(null);
        };
        updateRemaining();
        const timer = setInterval(updateRemaining, 1000);
        return () => clearInterval(timer);
    }, [lockedUntil]);

    const handleLogin = async () => {
        if (lockRemainingSeconds > 0) {
            setError(`Tài khoản đang bị tạm khóa. Vui lòng thử lại sau ${formatLoginLockRemaining(lockRemainingSeconds)}.`);
            return;
        }
        const email = account.trim().toLowerCase();
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            setSuccess('');
            setCanResendVerification(false);
            return;
        }
        if (!password.trim()) {
            setError('Mật khẩu không được để trống');
            setSuccess('');
            setCanResendVerification(false);
            return;
        }
        setError('');
        setSuccess('');
        setCanResendVerification(false);
        setLoading(true);
        try {
            await handleClientLogin(email, password);
        } catch (err) {
            const lockedUntilValue = err?.response?.data?.lockedUntil;
            if (lockedUntilValue) {
                setLockedUntil(lockedUntilValue);
                setLockRemainingSeconds(getLoginLockRemainingSeconds(lockedUntilValue));
            }
            const message = getApiErrorMessage(err, 'Thông tin đăng nhập không đúng.');
            setCanResendVerification(err?.response?.status === 403 && message.includes('xác nhận email'));
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        const email = account.trim().toLowerCase();
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        setResendingVerification(true);
        setSuccess('');
        try {
            const res = await resendVerificationEmailAPI({ email });
            setSuccess(res?.message || 'Nếu tài khoản cần xác nhận, hệ thống đã gửi lại email xác nhận.');
            setCanResendVerification(false);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Không thể gửi lại email xác nhận.'));
        } finally {
            setResendingVerification(false);
        }
    };

    return (
        <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#E0F7FA']} style={styles.gradient}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="add" size={36} color="#FFFFFF" />
                        </View>
                        <Text style={styles.appName}>Bác Sĩ Ảo</Text>
                        <Text style={styles.tagline}>Chăm sóc sức khỏe gia đình bạn</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.badgeRow}>
                            <Ionicons name="shield-checkmark-outline" size={14} color="#0369A1" />
                            <Text style={styles.badgeText}>Đăng nhập bảo mật</Text>
                        </View>

                        <Text style={styles.heading}>Chào mừng trở lại</Text>
                        <Text style={styles.subheading}>
                            Tiếp tục cuộc trò chuyện với trợ lý y tế AI của bạn
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
                        {lockRemainingSeconds > 0 && (
                            <View style={styles.warningBox}>
                                <Ionicons name="time-outline" size={15} color="#B45309" style={{ marginRight: 6 }} />
                                <Text style={styles.warningText}>
                                    Tài khoản đang bị tạm khóa. Thử lại sau {formatLoginLockRemaining(lockRemainingSeconds)}.
                                </Text>
                            </View>
                        )}

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="example@email.com"
                            placeholderTextColor="#A0AEC0"
                            value={account}
                            onChangeText={setAccount}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>Mật khẩu</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nhập mật khẩu..."
                                placeholderTextColor="#A0AEC0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#718096"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.btn, loading && styles.btnDisabled]}
                            onPress={handleLogin}
                            disabled={loading || lockRemainingSeconds > 0}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.btnText}>Vào Khám Ngay</Text>
                            )}
                        </TouchableOpacity>

                        {canResendVerification && (
                            <TouchableOpacity
                                style={[styles.secondaryBtn, resendingVerification && styles.btnDisabled]}
                                onPress={handleResendVerification}
                                disabled={resendingVerification}
                            >
                                {resendingVerification ? (
                                    <ActivityIndicator color="#2563EB" />
                                ) : (
                                    <Text style={styles.secondaryBtnText}>Gửi lại email xác nhận</Text>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.forgotLink}
                            onPress={() => navigation.navigate('ClientForgotPassword')}
                            disabled={loading}
                        >
                            <Text style={styles.forgotLinkText}>Quên mật khẩu?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.link}
                            onPress={() => navigation.navigate('ClientRegister')}
                        >
                            <Text style={styles.linkText}>
                                Chưa có tài khoản?{' '}
                                <Text style={styles.linkBold}>Đăng ký mới</Text>
                            </Text>
                        </TouchableOpacity>

                        {isAdminApp && (
                            <TouchableOpacity
                                style={styles.adminLink}
                                onPress={() => navigation.navigate('AdminLogin')}
                            >
                                <Text style={styles.adminLinkText}>Trang quản trị →</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    logoContainer: { alignItems: 'center', marginBottom: 32 },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#60A5FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    appName: { fontSize: 26, fontWeight: '800', color: '#1E293B' },
    tagline: { fontSize: 14, color: '#64748B', marginTop: 4 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 28,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    heading: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },
    subheading: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
        marginBottom: 20,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#E0F2FE',
        borderWidth: 1,
        borderColor: '#BAE6FD',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 14,
        gap: 5,
    },
    badgeText: { fontSize: 12, fontWeight: '600', color: '#0369A1' },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF2F2',
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
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
        marginBottom: 16,
    },
    successText: { color: '#15803D', fontSize: 13, flex: 1, lineHeight: 18 },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFBEB',
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    warningText: { color: '#B45309', fontSize: 13, flex: 1, lineHeight: 18 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
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
        marginBottom: 20,
    },
    passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1E293B' },
    eyeBtn: { padding: 4 },
    btn: {
        backgroundColor: '#2563EB',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    secondaryBtn: {
        borderWidth: 1,
        borderColor: '#2563EB',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    secondaryBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 14 },
    link: { marginTop: 16, alignItems: 'center' },
    forgotLink: { marginTop: 12, alignItems: 'center' },
    forgotLinkText: { color: '#2563EB', fontSize: 14, fontWeight: '700' },
    linkText: { color: '#6B7280', fontSize: 14 },
    linkBold: { color: '#2563EB', fontWeight: '700' },
    adminLink: { marginTop: 12, alignItems: 'center' },
    adminLinkText: { color: '#9CA3AF', fontSize: 13 },
});

export default LoginScreen;
