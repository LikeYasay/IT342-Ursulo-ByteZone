import api from "../../shared/services/api";

export const getStations = async () => {
  const response = await api.get("/api/stations");
  return response.data;
};

export const createReservation = async (payload) => {
  const response = await api.post("/api/reservations", payload);
  return response.data;
};

export const getMyReservations = async () => {
  const response = await api.get("/api/reservations/me");
  return response.data;
};