import authorizedAxiosAdmin from '../../../utils/authorizedAxiosAdmin';

export const getBIDashboardsAPI = async () => {
    const response = await authorizedAxiosAdmin.get('/admin/v1/bi/dashboards');
    return response.data;
};

export const getBIGuestTokenAPI = async (dashboardKey) => {
    const response = await authorizedAxiosAdmin.post(`/admin/v1/bi/guest-token/${dashboardKey}`);
    return response.data;
};
