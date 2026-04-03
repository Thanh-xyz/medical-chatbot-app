export const API_ROOT = 'http://10.0.2.2:8017'; // Android emulator localhost
// For iOS simulator use: 'http://localhost:8017'
// For physical device use your machine's local IP: 'http://192.168.x.x:8017'

// ─── Toggle mock mode ────────────────────────────────────────────────────────
// Set to true to use built-in demo data (no backend needed)
// Set to false to connect to the real API
export const USE_MOCK = true;
// Demo credentials (only used when USE_MOCK = true):
//   Admin  → admin@medbot.com  / admin123
//   Client → user@medbot.com   / user123
// ─────────────────────────────────────────────────────────────────────────────

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
