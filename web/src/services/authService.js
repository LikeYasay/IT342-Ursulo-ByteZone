import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/auth";

export const loginUser = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/login`, payload);
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/register`, payload);
  return response.data;
};