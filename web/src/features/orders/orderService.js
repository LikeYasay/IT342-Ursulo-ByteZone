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

export const createSnack = async (payload) => {
  const response = await api.post("/api/admin/snacks", payload);
  return response.data;
};

export const updateSnack = async (snackId, payload) => {
  const response = await api.put(`/api/admin/snacks/${snackId}`, payload);
  return response.data;
};

export const deleteSnack = async (snackId) => {
  const response = await api.delete(`/api/admin/snacks/${snackId}`);
  return response.data;
};

export const uploadSnackImage = async (snackId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.put(
    `/api/admin/snacks/${snackId}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};