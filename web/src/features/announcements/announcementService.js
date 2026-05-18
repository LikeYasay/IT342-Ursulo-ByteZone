import api from "../../shared/services/api";

export const getAnnouncements = async () => {
  const response = await api.get("/api/announcements");
  return response.data;
};

export const createAnnouncement = async (payload) => {
  const response = await api.post("/api/admin/announcements", payload);
  return response.data;
};

export const updateAnnouncement = async (announcementId, payload) => {
  const response = await api.put(
    `/api/admin/announcements/${announcementId}`,
    payload
  );
  return response.data;
};

export const deleteAnnouncement = async (announcementId) => {
  const response = await api.delete(
    `/api/admin/announcements/${announcementId}`
  );
  return response.data;
};