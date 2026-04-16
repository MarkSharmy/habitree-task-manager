import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.REACT_APP_API_CALL || 'https://habitree-server.vercel.app/api',
    headers: {
        'Content-Type': 'application/json'
    },
});

//REQUEST INTERCEPTOR: Attach Token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('habitree_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//RESPONSE INTERCEPTOR: Handle Global Error
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 500) {
            //Internal Server Error
            localStorage.removeItem('habitree_token');
            window.location.href = '/server-error';
        }
        else if (error.response && error.response.status === 401) {
            //Token expired or unauthorized
            localStorage.removeItem('habitree_token');
            window.location.href = '/login'
        }
    }
);

export default API;