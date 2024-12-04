import axios from 'axios';

const config = {
    baseURL: 'http://localhost:8000/',
    headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
    }
}

const instance = axios.create(config);

instance.interceptors.request.use((config) => {

    const token = localStorage.getItem('token');

    if(token) config.headers.Authorization = `Bearer ${token}`;

    return config;
});

export default instance;