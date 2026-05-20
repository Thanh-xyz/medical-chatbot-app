import authorizedAxiosClient from '../../../utils/authorizedAxiosClient';

export const uploadImageAPI = async (imageUri) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    formData.append('file', { uri: imageUri, name: filename, type });
    const response = await authorizedAxiosClient.post('/v1/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // { message, url }
};
