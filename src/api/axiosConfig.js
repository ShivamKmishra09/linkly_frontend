// src/api/axiosConfig.js

// 1. Get the environment variable. It should be '/api' on Vercel and 'http://...' locally.
const envBackendUrl = process.env.REACT_APP_BACKEND_URL;

// 2. Define the base URL defensively
let baseURL;

if (envBackendUrl && envBackendUrl.trim() !== "") {
  // If the variable is set (the correct Vercel or local scenario)
  baseURL = envBackendUrl;
} else if (process.env.NODE_ENV === "production") {
  // If running on Vercel but the variable is somehow missing or empty, assume the Vercel rewrite path
  baseURL = "/api";
} else {
  // Fallback for local development when no .env file is present
  baseURL = "http://localhost:8000";
}

const instance = axios.create({
  baseURL: baseURL,
  // This is crucial for sending your session cookies (JWT)
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default instance;
