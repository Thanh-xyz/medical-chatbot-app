import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
    FONT_SIZE: 'chatFontSize',
    DARK_MODE: 'clientTheme',
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [fontSize, setFontSizeState] = useState('medium');
    const [isDarkMode, setIsDarkModeState] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const results = await AsyncStorage.multiGet([
                    SETTINGS_KEYS.FONT_SIZE,
                    SETTINGS_KEYS.DARK_MODE,
                ]);
                const fs = results[0][1];
                const dm = results[1][1];
                if (fs) setFontSizeState(fs);
                if (dm) setIsDarkModeState(dm === 'dark');
            } catch {
            }
        };
        loadSettings();
    }, []);

    const setFontSize = async (size) => {
        setFontSizeState(size);
        try {
            await AsyncStorage.setItem(SETTINGS_KEYS.FONT_SIZE, size);
        } catch { }
    };

    const setIsDarkMode = async (dark) => {
        setIsDarkModeState(dark);
        try {
            await AsyncStorage.setItem(SETTINGS_KEYS.DARK_MODE, dark ? 'dark' : 'light');
        } catch { }
    };

    return (
        <SettingsContext.Provider value={{ fontSize, setFontSize, isDarkMode, setIsDarkMode, toggleDarkMode: () => setIsDarkMode(!isDarkMode) }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
    return ctx;
};

export default SettingsContext;
