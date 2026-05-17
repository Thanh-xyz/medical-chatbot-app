import authorizedAxiosClient from '../../../utils/authorizedAxiosClient';

export const getClientAccountAPI = async () => {
    const response = await authorizedAxiosClient.get('/v1/my-profile');
    return response.data.user;
};

export const updateClientAccountAPI = async (data) => {
    const response = await authorizedAxiosClient.patch('/v1/my-profile', data);
    return response.data.user;
};

export const changeClientPasswordAPI = async (data) => {
    const response = await authorizedAxiosClient.patch('/v1/my-profile/change-password', data);
    return response.data;
};
