import authorizedAxiosClient from '../../../utils/authorizedAxiosClient';
import apiClient from '../../../utils/apiClient';
import { API_ROOT } from '../../../utils/constants';
import {
    attachCookieHeader,
    clearAuthSession,
    debugLog,
    persistResponseCookies,
} from '../../../utils/authSession';

export const loginClientAPI = async (data) => {
    const payload = { email: data.email, password: data.password };
    const response = await apiClient.post('/v1/login', payload);
    await persistResponseCookies(response.headers, 'client');
    return response.data;
};

export const registerClientAPI = async (data) => {
    const payload = { fullName: data.fullName, email: data.email, password: data.password };
    const endpoint = '/v1/register';
    debugLog('[registerClientAPI] POST', `${API_ROOT}${endpoint}`, { ...payload, password: payload.password ? '[REDACTED]' : '' });
    try {
        const response = await apiClient.post(endpoint, payload);
        debugLog('[registerClientAPI] success', response.status, response.data);
        return response.data;
    } catch (error) {
        debugLog('[registerClientAPI] error', {
            url: `${API_ROOT}${endpoint}`,
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
            code: error?.code,
        });
        throw error;
    }
};

export const verifyEmailAPI = async (token) => {
    const response = await apiClient.get('/v1/verify-email', { params: { token } });
    return response.data;
};

export const resendVerificationEmailAPI = async (data) => {
    const response = await apiClient.post('/v1/resend-verification-email', { email: data.email });
    return response.data;
};

export const forgotPasswordAPI = async (data) => {
    const response = await apiClient.post('/v1/forgot-password', { email: data.email });
    return response.data;
};

export const resetPasswordAPI = async (data) => {
    const response = await apiClient.post('/v1/reset-password', {
        token: data.token,
        password: data.password,
        confirmPassword: data.confirmPassword,
    });
    return response.data;
};

export const logoutClientAPI = async () => {
    try {
        const response = await authorizedAxiosClient.delete('/v1/logout');
        return response.data;
    } finally {
        await clearAuthSession('client');
    }
};

export const refreshClientTokenAPI = async () => {
    const config = await attachCookieHeader({}, 'client');
    const response = await apiClient.post('/v1/refresh-token', {}, config);
    await persistResponseCookies(response.headers, 'client');
    return response.data;
};
