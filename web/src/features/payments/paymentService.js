import api from "../../shared/services/api";

export const getMyPayments = async () => {
  const response = await api.get("/api/payments/me");
  return response.data;
};