import api from "../../shared/services/api";

export const getAdminMetrics = async () => {
  const response = await api.get("/api/admin/metrics");
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get("/api/admin/users");
  return response.data;
};

export const updateAdminUser = async (userId, payload) => {
  const response = await api.put(`/api/admin/users/${userId}`, payload);
  return response.data;
};

export const deleteAdminUser = async (userId) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};