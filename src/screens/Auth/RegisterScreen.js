import React, { useState } from 'react';
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
import { registerClientAPI } from '../../services/apis/Client/auth.api';

const RegisterScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validate = () => {
        if (!fullName.trim()) {
            setError('Vui lòng nhập họ và tên.');
            return false;
        }
        if (fullName.trim().length < 2) {
            setError('Họ và tên phải có ít nhất 2 ký tự.');
            return false;
        }
        if (!identifier.trim()) {
            setError('Vui lòng nhập số điện thoại hoặc email.');
            return false;
        }
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
        const isPhone = /^(0|\+84)[0-9]{9}$/.test(identifier.trim());
        if (!isEmail && !isPhone) {
            setError('Vui lòng nhập đúng định dạng email hoặc số điện thoại.');
            return false;
        }
        if (!password) {
            setError('Vui lòng nhập mật khẩu.');
            return false;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        setError('');
        if (!validate()) return;
        setLoading(true);
        try {
            await registerClientAPI({ fullName: fullName.trim(), identifier: identifier.trim(), password });
            setSuccess(true);
            setTimeout(() => navigation.navigate('ClientLogin'), 2000);
        } catch (err) {
            setError(err?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
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
                            <Text style={styles.badgeText}>Hồ sơ sức khỏe cá nhân</Text>
                        </View>

                        <Text style={styles.heading}>Tạo tài khoản mới</Text>
                        <Text style={styles.subheading}>
                            Bắt đầu sử dụng trợ lý y tế AI với một tài khoản đơn giản, bảo mật.
                        </Text>

                        {!!error && (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={15} color="#B91C1C" style={{ marginRight: 6 }} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {success && (
                            <View style={styles.successBox}>
                                <Ionicons name="checkmark-circle-outline" size={15} color="#15803D" style={{ marginRight: 6 }} />
                                <Text style={styles.successText}>
                                    Tài khoản đã được tạo. Đang chuyển về trang đăng nhập...
                                </Text>
                            </View>
                        )}

                        <Text style={styles.label}>Họ và tên</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={18} color="#A0AEC0" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Nguyễn Văn A"
                                placeholderTextColor="#A0AEC0"
                                value={fullName}
                                onChangeText={setFullName}
                                autoCapitalize="words"
                            />
                        </View>

                        <Text style={styles.label}>Số điện thoại hoặc Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={18} color="#A0AEC0" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="0909... hoặc example@email.com"
                                placeholderTextColor="#A0AEC0"
                                value={identifier}
                                onChangeText={setIdentifier}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <Text style={styles.label}>Mật khẩu</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color="#A0AEC0" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Tạo mật khẩu tối thiểu 6 ký tự"
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
                            style={[styles.btn, (loading || success) && styles.btnDisabled]}
                            onPress={handleRegister}
                            disabled={loading || success}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : success ? (
                                <>
                                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                                    <Text style={styles.btnText}>Thành công</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.btnText}>Đăng ký tài khoản</Text>
                                    <Ionicons name="arrow-forward-outline" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('ClientLogin')}>
                                <Text style={styles.footerLink}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
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
        borderRadius: 24,
        padding: 28,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
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
    heading: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
    subheading: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 20 },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FEF2F2',
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        borderRadius: 10,
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
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    successText: { color: '#15803D', fontSize: 13, flex: 1, lineHeight: 18, fontWeight: '600' },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 14,
    },
    inputIcon: { marginRight: 8 },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1E293B',
    },
    eyeBtn: { padding: 4 },
    btn: {
        flexDirection: 'row',
        backgroundColor: '#2563EB',
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#2563EB',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    btnDisabled: { opacity: 0.6, shadowOpacity: 0 },
    btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingVertical: 12,
    },
    footerText: { color: '#64748B', fontSize: 14 },
    footerLink: { color: '#2563EB', fontWeight: '700', fontSize: 14 },
});

export default RegisterScreen;
