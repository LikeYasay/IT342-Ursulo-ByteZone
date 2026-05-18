import api from "../../shared/services/api";

export const getSnacks = async () => {
  const response = await api.get("/api/snacks");
  return response.data;
};

export const createOrder = async (payload) => {
  const response = await api.post("/api/orders", payload);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/api/orders/me");
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get("/api/orders");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/api/orders/${orderId}/status`, {
    status,
  });
  return response.data;
};