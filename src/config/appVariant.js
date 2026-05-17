export const APP_VARIANT = process.env.EXPO_PUBLIC_APP_VARIANT || 'user';
export const isAdminApp = APP_VARIANT === 'admin';
export const isUserApp = !isAdminApp;
