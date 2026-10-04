import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_URL || 'http://localhost:5050/api', // ชี้ไปที่ Backend ของเรา
});

// แนบ Token ไปกับทุก Request อัตโนมัติถ้ามีการ Login ไว้
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;