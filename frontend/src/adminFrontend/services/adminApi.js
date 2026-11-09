import axios from "axios";

// Create separate Axios instance for Admin APIs
const adminApi = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach Admin JWT token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Allow Axios to configure multipart headers for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (config.data) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default adminApi;
