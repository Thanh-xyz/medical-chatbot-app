import axios from 'axios';
import { API_ROOT } from './constants';
const aiClient = axios.create({
    baseURL: API_ROOT,
    timeout: 1000 * 60 * 10,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default aiClient;
