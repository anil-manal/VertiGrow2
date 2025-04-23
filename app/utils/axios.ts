// utils/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://192.168.29.56:1337/api', // Use your local IP and append /api
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
