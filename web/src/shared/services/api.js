import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  const isAuthRoute =
    config.url?.includes("/api/auth/login") ||
    config.url?.includes("/api/auth/register");

  if (token && !isAuthRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;