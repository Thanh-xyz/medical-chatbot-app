import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { verifyEmailAPI } from '../../services/apis/Client/auth.api';
import { getApiErrorMessage } from '../../utils/apiClient';

const invalidLinkMessage = 'Link xác nhận không hợp lệ hoặc đã hết hạn!';

const extractTokenFromUrl = (url) => {
    if (!url) return '';
    try {
        return new URL(url).searchParams.get('token') || '';
    } catch {
        const match = String(url).match(/[?&]token=([^&]+)/);
        return match?.[1] ? decodeURIComponent(match[1]) : '';
    }
};

const VerifyEmailScreen = ({ navigation, route }) => {
    const initialToken = useMemo(() => route?.params?.token || '', [route?.params?.token]);
    const [token, setToken] = useState(initialToken);
    const [state, setState] = useState(() => (
        initialToken
            ? { loading: true, success: false, message: 'Đang xác nhận email...' }
            : { loading: false, success: false, message: invalidLinkMessage }
    ));

    useEffect(() => {
        if (initialToken) {
            setToken(initialToken);
            return undefined;
        }

        let mounted = true;
        Linking.getInitialURL().then((url) => {
            if (!mounted) return;
            const nextToken = extractTokenFromUrl(url);
            if (nextToken) setToken(nextToken);
        });

        return () => {
            mounted = false;
        };
    }, [initialToken]);

    useEffect(() => {
        if (!token) {
            setState({ loading: false, success: false, message: invalidLinkMessage });
            return undefined;
        }

        setState({ loading: true, success: false, message: 'Đang xác nhận email...' });
        let mounted = true;
        verifyEmailAPI(token)
            .then((res) => {
                if (!mounted) return;
                setState({ loading: false, success: true, message: res?.message || 'Xác nhận email thành công!' });
            })
            .catch((err) => {
                if (!mounted) return;
                setState({ loading: false, success: false, message: getApiErrorMessage(err, invalidLinkMessage) });
            });
        return () => {
            mounted = false;
        };
    }, [token]);

    const iconName = state.loading
        ? 'sync-outline'
        : state.success
            ? 'checkmark-circle-outline'
            : 'alert-circle-outline';
    const iconColor = state.loading ? '#2563EB' : state.success ? '#15803D' : '#B91C1C';

    return (
        <LinearGradient colors={['#E0F2FE', '#BAE6FD', '#E0F7FA']} style={styles.gradient}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.card}>
                    <View style={[styles.iconCircle, { backgroundColor: state.success ? '#F0FDF4' : state.loading ? '#EFF6FF' : '#FEF2F2' }]}>
                        {state.loading ? (
                            <ActivityIndicator color={iconColor} />
                        ) : (
                            <Ionicons name={iconName} size={32} color={iconColor} />
                        )}
                    </View>
                    <Text style={styles.heading}>Kích hoạt tài khoản</Text>
                    <Text style={styles.subheading}>
                        {state.loading ? 'Hệ thống đang kiểm tra link xác nhận đăng ký.' : state.message}
                    </Text>
                    {!state.loading && (
                        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('ClientLogin')}>
                            <Text style={styles.btnText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
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
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    iconCircle: {
        width: 66,
        height: 66,
        borderRadius: 33,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    heading: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
    subheading: { color: '#64748B', fontSize: 14, lineHeight: 21, marginBottom: 20, textAlign: 'center' },
    btn: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 13, paddingHorizontal: 24, alignItems: 'center' },
    btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

export default VerifyEmailScreen;
