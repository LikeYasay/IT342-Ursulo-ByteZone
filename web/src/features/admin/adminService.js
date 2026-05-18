import api from "../../shared/services/api";

export const getAdminMetrics = async () => {
  const response = await api.get("/api/admin/metrics");
  return response.data;
};