const BASE_URL = 'http://localhost:3001/api'; 

const makeRequest = async (endpoint, method = 'GET', data = null) => {
    const url = `${BASE_URL}/${endpoint}`;
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();

    } catch (error) {
        console.error("API Request Error:", error.message);
        throw error;
    }
};

export const registerUser = (userData) => {
    return makeRequest('users/register', 'POST', userData);
};

export const loginUser = (credentials) => {
    return makeRequest('users/login', 'POST', credentials);
};