import api from "../../shared/services/api";

export const loginUser = async (payload) => {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/api/me");
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const uploadMyProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.put("/api/user/me/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const removeMyProfileImage = async () => {
  const response = await api.put("/api/user/me", {
    removeProfileImage: true,
  });

  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await api.put("/api/user/me", payload);
  return response.data;
};

export const googleLoginUser = async (googleIdToken) => {
  const response = await api.post("/api/auth/google", {
    googleIdToken,
  });

  return response.data;
};