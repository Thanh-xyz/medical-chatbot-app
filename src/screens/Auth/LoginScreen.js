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
import useAuth from '../../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { handleClientLogin } = useAuth();

    const handleLogin = async () => {
        if (!account.trim() || !password.trim()) {
            setError('Bác/cháu vui lòng nhập Email hoặc Số điện thoại ạ.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await handleClientLogin(account.trim(), password);
        } catch (err) {
            setError(err?.response?.data?.message ?? 'Thông tin đăng nhập không đúng.');
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
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="add" size={36} color="#FFFFFF" />
                        </View>
                        <Text style={styles.appName}>Bác Sĩ Ảo</Text>
                        <Text style={styles.tagline}>Chăm sóc sức khỏe gia đình bạn</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.heading}>Đăng Nhập</Text>

                        {!!error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>⚠️ {error}</Text>
                            </View>
                        )}

                        <Text style={styles.label}>Tài khoản (Email / SĐT)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập email hoặc số điện thoại..."
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
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.btnText}>Vào Khám Ngay</Text>
                            )}
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

                        <TouchableOpacity
                            style={styles.adminLink}
                            onPress={() => navigation.navigate('AdminLogin')}
                        >
                            <Text style={styles.adminLinkText}>Trang quản trị →</Text>
                        </TouchableOpacity>
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
        color: '#2563EB',
        textAlign: 'center',
        marginBottom: 20,
    },
    errorBox: {
        backgroundColor: '#FEF2F2',
        borderLeftWidth: 4,
        borderLeftColor: '#EF4444',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: { color: '#B91C1C', fontSize: 14, lineHeight: 20 },
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
    link: { marginTop: 16, alignItems: 'center' },
    linkText: { color: '#6B7280', fontSize: 14 },
    linkBold: { color: '#2563EB', fontWeight: '700' },
    adminLink: { marginTop: 12, alignItems: 'center' },
    adminLinkText: { color: '#9CA3AF', fontSize: 13 },
});

export default LoginScreen;
