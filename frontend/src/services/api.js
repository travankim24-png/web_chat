import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (username, email, password) => {
  return api.post('/auth/register', { username, email, password });
};

export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

// User APIs
export const getCurrentUser = () => {
  return api.get('/auth/me');   // FIXED
};

export const getAllUsers = () => {
  return api.get('/users/all');
};

export const getMyProfile = () => {
  return api.get('/users/me');
};

export const updateMyProfile = (profileData) => {
  return api.put('/users/me', profileData);
};

export const getUserProfile = (userId) => {
  return api.get(`/users/${userId}`);
};

// Conversation APIs
export const getMyConversations = () => {
  return api.get('/conversations/mine');
};

export const createConversation = (name, is_group, member_ids) => {
  return api.post('/conversations/', { name, is_group, member_ids });
};

// Message APIs
export const getMessages = (conversationId) => {
  return api.get(`/messages/${conversationId}`);
};

export const sendMessage = (conversation_id, content, file_url = null) => {
  return api.post('/messages/', { conversation_id, content, file_url }); // FIXED
};

// File APIs
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;
