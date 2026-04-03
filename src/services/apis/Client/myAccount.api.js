import authorizedAxiosClient from '../../../utils/authorizedAxiosClient';
import { USE_MOCK } from '../../../utils/constants';
import * as mock from '../../mock/mockApi';

export const getClientAccountAPI = async () => {
    if (USE_MOCK) return mock.getClientAccountAPI();
    const response = await authorizedAxiosClient.get('/v1/client/account');
    return response.data;
};

export const updateClientAccountAPI = async (data) => {
    if (USE_MOCK) return mock.updateClientAccountAPI(data);
    const response = await authorizedAxiosClient.put('/v1/client/account', data);
    return response.data;
};

export const changeClientPasswordAPI = async (data) => {
    if (USE_MOCK) return mock.changeClientPasswordAPI(data);
    const response = await authorizedAxiosClient.put('/v1/client/account/change-password', data);
    return response.data;
};
