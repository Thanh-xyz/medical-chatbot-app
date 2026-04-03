import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredUser();
    }, []);

    const loadStoredUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
            if (userJson) {
                setUser(JSON.parse(userJson));
            }
        } catch {
            // ignore parse errors
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData, accessToken, refreshToken) => {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (refreshToken) {
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        setUser(userData);
    };

    const logout = async () => {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_INFO,
        ]);
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
