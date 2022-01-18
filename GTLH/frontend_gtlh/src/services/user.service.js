import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://127.0.0.1:3002/api/';

class UserService {
    getPublicContent() {
        return axios.get(API_URL + 'profile');
    }

    getUserBoard() {
        return axios.get(API_URL + 'user', { headers: authHeader() });
    }

    getModeratorBoard() {
        return axios.get(API_URL + 'mod', { headers: authHeader() });
    }

    getAdminBoard() {
        return axios.get(API_URL + 'admin', { headers: authHeader() });
    }
}

export default new UserService();