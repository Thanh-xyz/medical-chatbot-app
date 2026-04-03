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
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../../hooks/useAuth';

const AdminLoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { handleAdminLogin } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await handleAdminLogin(email.trim(), password);
        } catch (err) {
            setError(err?.response?.data?.message ?? 'Invalid admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="chatbubble-ellipses" size={32} color="#22C55E" />
                        </View>
                        <Text style={styles.appName}>Medical Admin</Text>
                        <Text style={styles.tagline}>Sign in to admin portal</Text>
                    </View>

                    {/* Card */}
                    <View style={styles.card}>
                        {!!error && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#64748B"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View style={styles.passwordWrapper}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                placeholderTextColor="#64748B"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#64748B"
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
                                <Text style={styles.btnText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        {navigation && (
                            <TouchableOpacity
                                style={styles.link}
                                onPress={() => navigation.navigate('ClientLogin')}
                            >
                                <Text style={styles.linkText}>
                                    Back to client portal?{' '}
                                    <Text style={styles.linkBold}>Login</Text>
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#0F172A' },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
    logoContainer: { alignItems: 'center', marginBottom: 36 },
    logoCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#1E293B',
        borderWidth: 2,
        borderColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appName: { fontSize: 26, fontWeight: '800', color: '#F1F5F9' },
    tagline: { fontSize: 14, color: '#64748B', marginTop: 6 },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#334155',
    },
    errorBox: {
        backgroundColor: '#450A0A',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    errorText: { color: '#FCA5A5', fontSize: 14 },
    input: {
        backgroundColor: '#0F172A',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 13,
        fontSize: 15,
        color: '#F1F5F9',
        marginBottom: 14,
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0F172A',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    passwordInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: '#F1F5F9' },
    eyeBtn: { padding: 4 },
    btn: {
        backgroundColor: '#22C55E',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    link: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#64748B', fontSize: 14 },
    linkBold: { color: '#22C55E', fontWeight: '700' },
});

export default AdminLoginScreen;

