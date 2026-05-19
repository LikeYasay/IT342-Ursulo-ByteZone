import api from "../../shared/services/api";

export const getMyPayments = async () => {
  const response = await api.get("/api/payments/me");
  return response.data;
};

export const getAllPayments = async () => {
  const response = await api.get("/api/payments");
  return response.data;
};

export const getPendingPayments = async () => {
  const response = await api.get("/api/payments/pending");
  return response.data;
};

export const startSandboxPayment = async (paymentId) => {
  const response = await api.put(`/api/payments/${paymentId}/sandbox/process`);
  return response.data;
};

export const submitSandboxPaymentResult = async (paymentId, payload) => {
  const response = await api.put(
    `/api/payments/${paymentId}/sandbox/result`,
    payload
  );
  return response.data;
};

export const confirmPayment = async (paymentId, payload) => {
  const response = await api.put(`/api/payments/${paymentId}/confirm`, payload);
  return response.data;
};