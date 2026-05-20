import api from "../../shared/services/api";

export const getGamingHighlights = async () => {
  const response = await api.get("/api/public/gaming-highlights");
  return response.data;
};