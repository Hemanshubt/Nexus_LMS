import axios from 'axios';

// API Client
export const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    withCredentials: true, // Important for cookies
});
