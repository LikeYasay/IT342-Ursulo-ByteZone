import api from "../../shared/services/api";

export const uploadLinkedFile = async ({ file, recordType, recordId }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("recordType", recordType);
  formData.append("recordId", recordId);

  const response = await api.post("/api/files/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getMyFiles = async () => {
  const response = await api.get("/api/files/mine");
  return response.data;
};

export const getFilesByRecord = async ({ recordType, recordId }) => {
  const response = await api.get("/api/files", {
    params: {
      recordType,
      recordId,
    },
  });

  return response.data;
};