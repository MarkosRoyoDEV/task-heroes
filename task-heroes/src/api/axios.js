import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://192.168.1.150:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

axiosInstance.interceptors.request.use(
    config => {
        console.log('Making request to:', config.baseURL + config.url);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => {
        console.log('Response received:', response.status);
        return response;
    },
    error => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - server not responding');
        } else if (!error.response) {
            console.error('Network Error - Could not connect to server. Please check if the server is running at:', axiosInstance.defaults.baseURL);
        } else {
            console.error('API error:', {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers
            });
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;