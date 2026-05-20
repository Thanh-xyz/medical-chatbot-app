import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { STORAGE_KEYS } from '../utils/constants';
import { clearAuthSession } from '../utils/authSession';
import { isAdminApp } from '../config/appVariant';
import { getClientAccountAPI } from '../services/apis/Client/myAccount.api';
import { getAdminAccountAPI } from '../services/apis/Admin/myAccount.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredUser();
    }, []);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('auth:logout', () => {
            setUser(null);
        });

        return () => subscription.remove();
    }, []);

    const loadStoredUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
            if (userJson) {
                const storedUser = JSON.parse(userJson);
                setUser(storedUser);
                try {
                    const freshUser = isAdminApp ? await getAdminAccountAPI() : await getClientAccountAPI();
                    const nextUser = isAdminApp ? { ...freshUser, role: 'admin' } : freshUser;
                    await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(nextUser));
                    setUser(nextUser);
                } catch {
                    await clearAuthSession(isAdminApp ? 'admin' : 'client');
                    setUser(null);
                }
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, accessToken, refreshToken) => {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
        if (accessToken) {
            await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        }
        if (refreshToken) {
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }
        setUser(userData);
    };

    const logout = async () => {
        await clearAuthSession();
        setUser(null);
    };

    const updateUser = async (updatedUser) => {
        const merged = { ...user, ...updatedUser };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuthContext must be used inside AuthProvider');
    return context;
};

export default AuthContext;
