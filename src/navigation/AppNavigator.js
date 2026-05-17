import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import AdminNavigator from './AdminNavigator';
import { isAdminApp } from '../config/appVariant';
import { COLORS } from '../utils/constants';

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
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
