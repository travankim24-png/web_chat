import axios from "axios";
import { getApiBase } from "../config";   // ✅ đúng

// ⚠️ KHÔNG set baseURL cứng ở đây
const api = axios.create();

// Attach token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // 🔥 set baseURL mỗi request (luôn là IP mới nhất)
  config.baseURL = getApiBase();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// -------------------------------
// AUTH APIs
// -------------------------------
export const register = (username, email, password) => {
  return api.post("/auth/register", { username, email, password });
};

export const login = (username, password) => {
  return api.post("/auth/login", { username, password });
};

export const getCurrentUser = () => api.get("/auth/me");


// -------------------------------
// USER APIs
// -------------------------------
export const getAllUsers = () => api.get("/users/all");

export const getMyProfile = () => api.get("/users/me");

export const updateMyProfile = (profileData) =>
  api.put("/users/me", profileData);

export const getUserProfile = (userId) => api.get(`/users/${userId}`);


// -------------------------------
// CONVERSATION APIs
// -------------------------------
export const getMyConversations = () => api.get("/conversations/mine");

export const createConversation = (name, is_group, member_ids) =>
  api.post("/conversations/", { name, is_group, member_ids });


// -------------------------------
// MESSAGE APIs
// -------------------------------
export const getMessages = (conversationId) =>
  api.get(`/messages/${conversationId}`);

export const sendMessage = (conversation_id, content, file_url = null) =>
  api.post("/messages/", { conversation_id, content, file_url });

export const searchMessages = (conversationId, query) =>
  api.get(`/messages/${conversationId}/search`, {
    params: { q: query }
  });


// -------------------------------
// FILE APIs
// -------------------------------
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


// -------------------------------
// SETTINGS APIs
// -------------------------------
export const updateNickname = (conversationId, userId, nickname) =>
  api.put(`/settings/nickname`, {
    conversation_id: conversationId,
    user_id: userId,
    nickname: nickname,
  });

export const changeTheme = (conversationId, themeId) =>
  api.put(`/settings/theme`, {
    conversation_id: conversationId,
    theme: themeId,
  });

export const leaveGroup = (conversationId) =>
  api.post(`/settings/leave`, {
    conversation_id: conversationId,
  });

export const deleteConversation = (conversationId) =>
  api.delete(`/settings/${conversationId}`);


// -------------------------------
// MEDIA APIs
// -------------------------------
export const getMedia = (conversationId) =>
  api.get(`/media/${conversationId}`);

export default api;
