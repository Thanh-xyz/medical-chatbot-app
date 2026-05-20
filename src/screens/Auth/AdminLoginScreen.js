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
import { SafeAreaView } from 'react-native-safe-area-context';
import useAuth from '../../hooks/useAuth';
import { isUserApp } from '../../config/appVariant';
import { getApiErrorMessage } from '../../utils/apiClient';
import { validateEmail } from '../../utils/validation';
import { formatLoginLockRemaining, getLoginLockRemainingSeconds } from '../../utils/authLock';

const FEATURES = [
    { icon: 'hardware-chip-outline', label: 'AI', desc: 'Quy trình trợ lý AI', color: '#2563EB', bg: '#EFF6FF' },
    { icon: 'pulse-outline', label: '24/7', desc: 'Sẵn sàng giám sát', color: '#10B981', bg: '#ECFDF5' },
    { icon: 'shield-checkmark-outline', label: 'Bảo mật', desc: 'Truy cập quản trị', color: '#7C3AED', bg: '#F5F3FF' },
];

const AdminLoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lockedUntil, setLockedUntil] = useState(null);
    const [lockRemainingSeconds, setLockRemainingSeconds] = useState(0);
    const { handleAdminLogin } = useAuth();

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
        const normalizedEmail = email.trim().toLowerCase();
        const emailError = validateEmail(normalizedEmail);
        if (emailError) {
            setError(emailError);
            return;
        }
        if (!password.trim()) {
            setError('Mật khẩu không được để trống');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await handleAdminLogin(normalizedEmail, password);
        } catch (err) {
            const lockedUntilValue = err?.response?.data?.lockedUntil;
            if (lockedUntilValue) {
                setLockedUntil(lockedUntilValue);
                setLockRemainingSeconds(getLoginLockRemainingSeconds(lockedUntilValue));
            }
            setError(getApiErrorMessage(err, 'Thông tin đăng nhập không hợp lệ.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#EFF6FF', '#F0F9FF', '#F5F3FF']} style={styles.gradient}>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <View style={styles.heroSection}>
                            <View style={styles.heroBadge}>
                                <Ionicons name="settings-outline" size={13} color="#2563EB" />
                                <Text style={styles.heroBadgeText}>Quản trị AI y tế</Text>
                            </View>

                            <Text style={styles.brandLabel}>MEDICAL CHATBOT</Text>

                            <Text style={styles.heroHeading}>
                                Trung tâm quản trị cho nền tảng tư vấn y tế thông minh
                            </Text>

                            <Text style={styles.heroSubtitle}>
                                Theo dõi người dùng, hội thoại và cấu hình hệ thống trong một giao diện sạch, bảo mật và dễ vận hành.
                            </Text>

                            <View style={styles.featureRow}>
                                {FEATURES.map((f) => (
                                    <View key={f.label} style={[styles.featureCard, { backgroundColor: f.bg }]}>
                                        <View style={[styles.featureIconBox, { backgroundColor: f.bg }]}>
                                            <Ionicons name={f.icon} size={22} color={f.color} />
                                        </View>
                                        <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
                                        <Text style={styles.featureDesc}>{f.desc}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formCard}>
                            <View style={styles.authBadge}>
                                <Ionicons name="checkmark-circle-outline" size={13} color="#10B981" />
                                <Text style={styles.authBadgeText}>Chỉ dành cho nhân sự được cấp quyền</Text>
                            </View>

                            <Text style={styles.formHeading}>Đăng nhập quản trị</Text>
                            <Text style={styles.formSubtitle}>
                                Truy cập bảng điều khiển để quản lý dữ liệu hội thoại, người dùng và cấu hình nền tảng.
                            </Text>

                            {!!error && (
                                <View style={styles.errorBox}>
                                    <Ionicons name="alert-circle-outline" size={15} color="#B91C1C" style={{ marginRight: 6 }} />
                                    <Text style={styles.errorText}>{error}</Text>
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

                            <Text style={styles.label}>Email quản trị</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="admin@medicalchatbot.com"
                                    placeholderTextColor="#CBD5E1"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <Text style={styles.label}>Mật khẩu</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor="#CBD5E1"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#94A3B8"
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
                                    <>
                                        <Text style={styles.btnText}>Đăng nhập</Text>
                                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.noteBox}>
                                <Text style={styles.noteText}>
                                    <Text style={styles.noteBold}>Chưa có tài khoản quản trị?{' '}</Text>
                                    Vui lòng liên hệ Quản trị viên để được cấp quyền truy cập.
                                </Text>
                            </View>

                            {isUserApp && navigation && (
                                <TouchableOpacity
                                    style={styles.clientLink}
                                    onPress={() => navigation.navigate('ClientLogin')}
                                >
                                    <Ionicons name="arrow-back-outline" size={14} color="#64748B" style={{ marginRight: 4 }} />
                                    <Text style={styles.clientLinkText}>Truy cập trang người dùng</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
    heroSection: { marginBottom: 20 },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 16,
        gap: 6,
    },
    heroBadgeText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
    brandLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563EB',
        letterSpacing: 2,
        marginBottom: 10,
    },
    heroHeading: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        lineHeight: 32,
        marginBottom: 10,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 22,
        marginBottom: 20,
    },
    featureRow: { flexDirection: 'row', gap: 10 },
    featureCard: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'flex-start',
    },
    featureIconBox: { marginBottom: 8 },
    featureLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    featureDesc: { fontSize: 11, color: '#64748B', lineHeight: 16 },
    formCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    authBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 16,
        gap: 5,
    },
    authBadgeText: { fontSize: 11, fontWeight: '600', color: '#065F46' },
    formHeading: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
    formSubtitle: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 20 },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF2F2',
        borderLeftWidth: 3,
        borderLeftColor: '#EF4444',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: { color: '#B91C1C', fontSize: 13, flex: 1, lineHeight: 18 },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFBEB',
        borderLeftWidth: 3,
        borderLeftColor: '#F59E0B',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    warningText: { color: '#B45309', fontSize: 13, flex: 1, lineHeight: 18 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#0F172A' },
    eyeBtn: { padding: 4 },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 15,
        marginBottom: 16,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    noteBox: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 14,
        marginBottom: 16,
    },
    noteText: { fontSize: 13, color: '#64748B', lineHeight: 20 },
    noteBold: { fontWeight: '600', color: '#374151' },
    clientLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 4,
    },
    clientLinkText: { fontSize: 13, color: '#64748B' },
});

export default AdminLoginScreen;
