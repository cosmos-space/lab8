const API_BASE_URL = 'http://localhost:5000/api';

const api = {
    async request(endpoint, method = 'GET', body = null) {
        const config = {
            method,
            headers: {}
        };

        if (body) {
            if (body instanceof FormData) {
                config.body = body;
            } else {
                config.headers['Content-Type'] = 'application/json';
                config.body = JSON.stringify(body);
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Request failed');
            return data;
        } catch (error) {
            console.error('API Error:', error.message);
            throw error;
        }
    }
};

window.api = api;