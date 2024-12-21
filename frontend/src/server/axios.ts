import axios from 'axios';
import {objectToCamelCase, objectToSnakeCase} from "../utils/utils.ts";
import * as cookie from "../utils/cookie.ts";

const config = {
    baseURL: 'http://localhost:8000/',
    headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
    }
}

const instance = axios.create(config);

instance.interceptors.response.use((response) => {

    response.data = objectToCamelCase(response.data);

    return response;
})

instance.interceptors.request.use((config) => {

    const token = cookie.getCookie('token');

    if(config.params) config.params = objectToSnakeCase(config.params);
    if(config.data) config.data = objectToSnakeCase(config.data);

    if(token) config.headers.Authorization = `Bearer ${token}`;

    return config;
});

export default instance;