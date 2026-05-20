import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_URL, STORAGE_KEYS } from './constants';

const COOKIE_NAMES_BY_ROLE = {
    client: ['accessTokenUser', 'refreshTokenUser'],
    admin: ['accessToken', 'refreshToken'],
};

const canUseSecureStore = Platform.OS !== 'web';

const storageGet = async (key) => {
    if (canUseSecureStore) {
        try {
            return await SecureStore.getItemAsync(key);
        } catch {
        }
    }
    return AsyncStorage.getItem(key);
};

const storageSet = async (key, value) => {
    if (canUseSecureStore) {
        try {
            await SecureStore.setItemAsync(key, value);
            return;
        } catch {
        }
    }
    await AsyncStorage.setItem(key, value);
};

const storageDelete = async (key) => {
    if (canUseSecureStore) {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch {
        }
    }
    await AsyncStorage.removeItem(key);
};

const getHeader = (headers, name) => {
    if (!headers) return null;
    if (typeof headers.get === 'function') return headers.get(name);
    return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || null;
};

const normalizeSetCookieHeader = (setCookie) => {
    if (!setCookie) return [];
    if (Array.isArray(setCookie)) return setCookie;
    return String(setCookie).split(/,(?=\s*[^;,=\s]+=[^;,]*)/g);
};

const parseCookiePair = (cookieLine) => {
    const pair = String(cookieLine || '').split(';')[0];
    const index = pair.indexOf('=');
    if (index <= 0) return null;
    return {
        name: pair.slice(0, index).trim(),
        value: pair.slice(index + 1).trim(),
    };
};

const getCookieStoreKey = (role) => role === 'admin'
    ? STORAGE_KEYS.ADMIN_COOKIE_HEADER
    : STORAGE_KEYS.CLIENT_COOKIE_HEADER;

export const persistResponseCookies = async (headers, role = 'client') => {
    const setCookieHeader = getHeader(headers, 'set-cookie');
    const allowedNames = COOKIE_NAMES_BY_ROLE[role] || COOKIE_NAMES_BY_ROLE.client;
    const nextCookies = {};

    const current = await getCookieHeader(role);
    current.split(';').forEach((part) => {
        const parsed = parseCookiePair(part.trim());
        if (parsed && allowedNames.includes(parsed.name)) nextCookies[parsed.name] = parsed.value;
    });

    normalizeSetCookieHeader(setCookieHeader).forEach((line) => {
        const parsed = parseCookiePair(line);
        if (!parsed || !allowedNames.includes(parsed.name)) return;
        if (parsed.value) nextCookies[parsed.name] = parsed.value;
        else delete nextCookies[parsed.name];
    });

    const cookieHeader = allowedNames
        .filter((name) => nextCookies[name])
        .map((name) => `${name}=${nextCookies[name]}`)
        .join('; ');

    if (cookieHeader) {
        await storageSet(getCookieStoreKey(role), cookieHeader);
    } else {
        await storageDelete(getCookieStoreKey(role));
    }

    return cookieHeader;
};

export const getCookieHeader = async (role = 'client') => (
    await storageGet(getCookieStoreKey(role))
) || '';

export const attachCookieHeader = async (config, role = 'client') => {
    const cookieHeader = await getCookieHeader(role);
    if (!cookieHeader) return config;

    config.headers = config.headers || {};
    if (!config.headers.Cookie && !config.headers.cookie) {
        config.headers.Cookie = cookieHeader;
    }
    return config;
};

export const clearAuthSession = async (role) => {
    const roles = role ? [role] : ['client', 'admin'];
    await Promise.all(roles.map((item) => storageDelete(getCookieStoreKey(item))));
    await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_INFO,
    ]);
};

export const withStoredCookie = async (headers = {}, role = 'client') => {
    const cookieHeader = await getCookieHeader(role);
    return {
        ...headers,
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    };
};

export const debugLog = (...args) => {
    if (__DEV__) console.log(...args);
};

export const getProductionApiUrl = () => API_URL;
