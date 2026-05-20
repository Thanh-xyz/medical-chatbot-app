import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Linking } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import AdminNavigator from './AdminNavigator';
import { isAdminApp } from '../config/appVariant';
import { COLORS } from '../utils/constants';

const navigationRef = createNavigationContainerRef();

const linking = {
    prefixes: [
        'healthcare://',
        'https://healthcare-system.ntrthanh.io.vn',
        'http://localhost:5173',
    ],
    config: {
        screens: {
            ClientLogin: 'login',
            ClientRegister: 'register',
            ClientForgotPassword: 'forgot-password',
            ClientVerifyEmail: {
                path: 'verify-email',
                parse: { token: (token) => token },
            },
            ClientResetPassword: 'reset-password/:token',
        },
    },
};

const getAuthLinkTarget = (url) => {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        const pathname = parsed.pathname.replace(/^\/+/, '');
        const token = parsed.searchParams.get('token');

        if (pathname === 'verify-email') {
            return { screen: 'ClientVerifyEmail', params: { token } };
        }

        if (pathname.startsWith('reset-password/')) {
            return {
                screen: 'ClientResetPassword',
                params: { token: decodeURIComponent(pathname.replace('reset-password/', '')) },
            };
        }

        if (pathname === 'forgot-password') return { screen: 'ClientForgotPassword' };
        if (pathname === 'login') return { screen: 'ClientLogin' };
        if (pathname === 'register') return { screen: 'ClientRegister' };
    } catch {
    }

    return null;
};

const AppNavigator = () => {
    const { user, loading } = useAuth();
    const pendingLinkRef = useRef(null);

    const navigateToAuthLink = (target) => {
        if (!target || !navigationRef.isReady()) {
            pendingLinkRef.current = target;
            return;
        }
        navigationRef.navigate(target.screen, target.params);
    };

    useEffect(() => {
        const handleUrl = ({ url }) => {
            navigateToAuthLink(getAuthLinkTarget(url));
        };

        Linking.getInitialURL().then((url) => {
            const target = getAuthLinkTarget(url);
            if (target) navigateToAuthLink(target);
        });

        const subscription = Linking.addEventListener('url', handleUrl);
        return () => subscription.remove();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer
            ref={navigationRef}
            linking={linking}
            onReady={() => {
                if (pendingLinkRef.current) {
                    navigateToAuthLink(pendingLinkRef.current);
                    pendingLinkRef.current = null;
                }
            }}
        >
            {!user ? (
                <AuthNavigator />
            ) : isAdminApp && user.role === 'admin' ? (
                <AdminNavigator />
            ) : isAdminApp ? (
                <AuthNavigator />
            ) : (
                <ClientNavigator />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
