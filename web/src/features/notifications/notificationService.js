import api from "../../shared/services/api";

export const getMyNotifications = async () => {
  const response = await api.get("/api/notifications/me");
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await api.get("/api/notifications/me/unread-count");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};