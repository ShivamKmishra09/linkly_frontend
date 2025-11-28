import axios from "axios";
import { toast } from "react-hot-toast";

const client = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 1. Auto-Attach Token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Global Error Handler
client.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";

    if (error.response?.status === 401) {
      // Session expired
      localStorage.removeItem("jwtToken");
      window.location.href = "/login";
    } else {
      // Show error toast
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default client;
