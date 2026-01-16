import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 10000,
});

API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default API;
