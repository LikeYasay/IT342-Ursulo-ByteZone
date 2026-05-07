import api from "../../shared/services/api";

export const loginUser = async (payload) => {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/me");
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};