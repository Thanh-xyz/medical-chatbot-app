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
import { forgotPasswordAPI } from '../../services/apis/Client/auth.api';
import { getApiErrorMessage } from '../../utils/apiClient';
import { validateEmail } from '../../utils/validation';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        const emailError = validateEmail(normalizedEmail);
        if (emailError) {
            setError(emailError);
            setSuccess('');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await forgotPasswordAPI({ email: normalizedEmail });
            setSuccess(res?.message || 'Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Không thể gửi email đặt lại mật khẩu!'));
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
                            <Ionicons name="mail-outline" size={30} color="#2563EB" />
                        </View>
                        <Text style={styles.heading}>Quên mật khẩu</Text>
                        <Text style={styles.subheading}>
                            Nhập email tài khoản, hệ thống sẽ gửi link đặt lại mật khẩu có thời hạn.
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

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="example@email.com"
                            placeholderTextColor="#A0AEC0"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <TouchableOpacity
                            style={[styles.btn, loading && styles.btnDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnText}>Gửi link đặt lại</Text>}
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
        marginBottom: 18,
    },
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

export default ForgotPasswordScreen;
