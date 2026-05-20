const trimTrailingSlashes = (value) => value.replace(/\/+$/, '');

export const API_URL = trimTrailingSlashes(
    process.env.EXPO_PUBLIC_API_ROOT || 'https://api.ntrthanh.io.vn'
);

export const API_ROOT = `${API_URL}/api`;

export const DEFAULT_PAGE = 1;
export const DEFAULT_ITEMS_PER_PAGE = 10;

export const ROLES = {
    ADMIN: 'admin',
    CLIENT: 'client',
};

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_INFO: 'userInfo',
    CLIENT_COOKIE_HEADER: 'clientCookieHeader',
    ADMIN_COOKIE_HEADER: 'adminCookieHeader',
};

export const CHAT_LIMITS = {
    MAX_MESSAGE_LENGTH: 1000,
};

export const COLORS = {
    primary: '#2563EB',
    secondary: '#64748B',
    success: '#16A34A',
    danger: '#DC2626',
    warning: '#D97706',
    background: '#F8FAFC',
    white: '#FFFFFF',
    black: '#0F172A',
    border: '#E2E8F0',
    text: '#1E293B',
    textLight: '#94A3B8',
    inputBg: '#F1F5F9',
    messageSent: '#2563EB',
    messageReceived: '#F1F5F9',
};
