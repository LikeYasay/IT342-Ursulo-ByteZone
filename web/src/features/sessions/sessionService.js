import api from "../../shared/services/api";

export const startSession = async (payload) => {
  const response = await api.post("/api/sessions", payload);
  return response.data;
};

export const endSession = async (sessionId) => {
  const response = await api.put(`/api/sessions/${sessionId}/end`);
  return response.data;
};

export const extendSession = async (sessionId, payload) => {
  const response = await api.put(`/api/sessions/${sessionId}/extend`, payload);
  return response.data;
};