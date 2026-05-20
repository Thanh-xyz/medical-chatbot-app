export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
    const value = String(email || '').trim().toLowerCase();
    if (!value) return 'Email không được để trống';
    if (!EMAIL_REGEX.test(value)) return 'Email không hợp lệ';
    return '';
};

export const validatePassword = (password, label = 'Mật khẩu') => {
    if (!password) return `${label} không được để trống`;
    if (password.length < 8) return `${label} phải có ít nhất 8 ký tự`;
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return `${label} phải có ít nhất 1 chữ hoa và 1 chữ số`;
    }
    return '';
};

export const validateFullName = (fullName) => {
    const value = String(fullName || '').trim();
    if (!value) return 'Họ tên không được để trống';
    if (value.length < 2) return 'Họ tên phải có ít nhất 2 ký tự';
    if (value.length > 50) return 'Họ tên không được quá 50 ký tự';
    return '';
};

export const validatePhone = (phone) => {
    const value = String(phone || '').trim();
    if (!value) return '';
    if (!/^[0-9+\-\s()]{8,20}$/.test(value)) return 'Số điện thoại không hợp lệ';
    return '';
};
