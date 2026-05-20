import axios from 'axios';
import { API_ROOT, API_URL } from './constants';
import { persistResponseCookies, withStoredCookie } from './authSession';

export const createApiClient = (config = {}) => axios.create({
    baseURL: API_ROOT,
    timeout: 30000,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(config.headers || {}),
    },
    ...config,
});

const apiClient = createApiClient();

export const apiFetchJson = async (path, { method = 'GET', body, headers, timeout = 30000, role = 'client' } = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const requestHeaders = await withStoredCookie({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(headers || {}),
        }, role);

        const response = await fetch(`${API_ROOT}${path}`, {
            method,
            credentials: 'include',
            signal: controller.signal,
            headers: requestHeaders,
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        await persistResponseCookies(response.headers, role);

        const text = await response.text();
        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = { message: text || `API request failed with status ${response.status}` };
        }

        if (!response.ok) {
            const error = new Error(data?.message || `API request failed with status ${response.status}`);
            error.response = { status: response.status, data };
            throw error;
        }

        return data;
    } catch (error) {
        if (error?.name === 'AbortError') {
            error.code = 'ECONNABORTED';
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

export const getApiErrorMessage = (error, fallback = 'Không thể kết nối đến hệ thống.') => {
    const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
    if (serverMessage) return serverMessage;

    const status = error?.response?.status;
    if (status === 401) return 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.';
    if (status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (status === 404) return 'Không tìm thấy dữ liệu yêu cầu.';
    if (status === 422) return 'Dữ liệu nhập chưa hợp lệ.';
    if (status >= 500) return 'Hệ thống đang gặp lỗi, vui lòng thử lại sau.';

    if (error?.code === 'ECONNABORTED') {
        return `Kết nối đến API quá lâu. Vui lòng kiểm tra ${API_URL}.`;
    }

    if (error?.message === 'Network Error' || !error?.response) {
        return `Không kết nối được API ${API_URL}. Kiểm tra mạng máy ảo hoặc cấu hình HTTPS của backend.`;
    }

    return fallback;
};

export default apiClient;
