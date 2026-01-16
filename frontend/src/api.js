api.interceptors.request.use((config) => {
    // ❗ Skip auth header untuk login & register
    if (config.url === '/login' || config.url === '/users') {
        return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
