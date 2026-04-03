import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';
import { USE_MOCK } from '../../../utils/constants';
import * as mock from '../../mock/mockApi';

export const getAdminAccountAPI = async () => {
    if (USE_MOCK) return mock.getAdminAccountAPI();
    const response = await authorizedAxiosAdmin.get('/v1/admin/account');
    return response.data;
};

export const updateAdminAccountAPI = async (data) => {
    if (USE_MOCK) return mock.updateAdminAccountAPI(data);
    const response = await authorizedAxiosAdmin.put('/v1/admin/account', data);
    return response.data;
};

export const changeAdminPasswordAPI = async (data) => {
    if (USE_MOCK) return mock.changeAdminPasswordAPI(data);
    const response = await authorizedAxiosAdmin.put('/v1/admin/account/change-password', data);
    return response.data;
};
