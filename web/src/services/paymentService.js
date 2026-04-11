import api from "./api";

export const getMyPayments = async () => {
  const response = await api.get("/api/payments/me");
  return response.data;
};