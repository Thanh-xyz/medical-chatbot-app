import { useAuthContext } from '../store/AuthContext';
import { loginClientAPI, logoutClientAPI } from '../services/apis/Client/auth.api';
import { loginAdminAPI, logoutAdminAPI } from '../services/apis/Admin/auth.api';

const useAuth = () => {
    const { user, loading, login, logout, updateUser } = useAuthContext();

    const handleClientLogin = async (email, password) => {
        const data = await loginClientAPI({ email, password });
        await login(data.user, data.accessToken, data.refreshToken);
        return data;
    };

    const handleAdminLogin = async (email, password) => {
        const data = await loginAdminAPI({ email, password });
        await login(data.user, data.accessToken, data.refreshToken);
        return data;
    };

    const handleLogout = async (role = 'client') => {
        try {
            if (role === 'admin') {
                await logoutAdminAPI();
            } else {
                await logoutClientAPI();
            }
        } catch {
            // still clear local state even if API fails
        } finally {
            await logout();
        }
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        handleClientLogin,
        handleAdminLogin,
        handleLogout,
        updateUser,
    };
};

export default useAuth;
