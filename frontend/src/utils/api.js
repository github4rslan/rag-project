import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser    = (data) => api.post('/auth/login', data);

// Documents
export const uploadDocument = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) =>
      onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
};

export const getDocuments       = () => api.get('/documents');
export const deleteDocument     = (id) => api.delete(`/documents/${id}`);
export const sendMessage        = (message, conversationId) => api.post('/chat', { message, conversationId });
export const getConversations   = () => api.get('/chat/conversations');
export const getConversation    = (id) => api.get(`/chat/conversations/${id}`);
export const deleteConversation = (id) => api.delete(`/chat/conversations/${id}`);
// User profile
export const getProfile      = () => api.get('/user');
export const updateProfile   = (data) => api.put('/user/update', data);
export const changePassword  = (data) => api.put('/user/change-password', data);
export const deleteAccount   = () => api.delete('/user/delete');