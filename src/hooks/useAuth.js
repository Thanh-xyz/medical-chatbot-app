import { useAuthContext } from '../store/AuthContext';
import { loginClientAPI, logoutClientAPI } from '../services/apis/Client/auth.api';
import { loginAdminAPI, logoutAdminAPI } from '../services/apis/Admin/auth.api';

const useAuth = () => {
    const { user, loading, login, logout, updateUser } = useAuthContext();

    const assertLoginResponse = (data, role) => {
        if (!data?.user && !data?.accountAdmin) {
            throw new Error(`Backend ${role} login must return user data.`);
        }
    };

    const handleClientLogin = async (email, password) => {
        const data = await loginClientAPI({ email, password });
        assertLoginResponse(data, 'client');
        await login(data.user, data.accessToken, data.refreshToken);
        return data;
    };

    const handleAdminLogin = async (email, password) => {
        const data = await loginAdminAPI({ email, password });
        assertLoginResponse(data, 'admin');
        const adminUser = data.user || data.accountAdmin;
        await login({ ...adminUser, role: 'admin' }, data.accessToken, data.refreshToken);
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
