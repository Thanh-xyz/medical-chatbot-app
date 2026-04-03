import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { registerClientAPI } from '../../services/apis/Client/auth.api';

const RegisterScreen = ({ navigation }) => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleRegister = async () => {
        const { fullName, email, password, confirmPassword } = form;
        if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await registerClientAPI({ fullName: fullName.trim(), email: email.trim(), password });
            Alert.alert('Success', 'Account created! Please sign in.', [
                { text: 'OK', onPress: () => navigation.navigate('ClientLogin') },
            ]);
        } catch (err) {
            Alert.alert('Registration Failed', err?.response?.data?.message ?? 'Something went wrong.');
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

                    <View style={styles.card}>
                        <Text style={styles.heading}>Đăng Ký</Text>

                        <Text style={styles.label}>Họ và tên</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập họ và tên..."
                            placeholderTextColor="#A0AEC0"
                            value={form.fullName}
                            onChangeText={(v) => handleChange('fullName', v)}
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập địa chỉ email..."
                            placeholderTextColor="#A0AEC0"
                            value={form.email}
                            onChangeText={(v) => handleChange('email', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Mật khẩu</Text>
                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Nhập mật khẩu..."
                                placeholderTextColor="#A0AEC0"
                                value={form.password}
                                onChangeText={(v) => handleChange('password', v)}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#718096" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Xác nhận mật khẩu</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu..."
                            placeholderTextColor="#A0AEC0"
                            value={form.confirmPassword}
                            onChangeText={(v) => handleChange('confirmPassword', v)}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.btn, loading && styles.btnDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.btnText}>Đăng Ký</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('ClientLogin')}>
                            <Text style={styles.linkText}>
                                Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text>
                            </Text>
                        </TouchableOpacity>
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
        borderRadius: 20,
        padding: 28,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    heading: { fontSize: 22, fontWeight: '700', color: '#2563EB', textAlign: 'center', marginBottom: 20 },
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
        marginBottom: 16,
    },
    passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1E293B' },
    eyeBtn: { padding: 4 },
    btn: {
        backgroundColor: '#2563EB',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    link: { marginTop: 16, alignItems: 'center' },
    linkText: { color: '#6B7280', fontSize: 14 },
    linkBold: { color: '#2563EB', fontWeight: '700' },
});

export default RegisterScreen;
