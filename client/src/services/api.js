// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Request Interceptor: Inject Auth Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Auto-unwrap { success, data, message } ─────────
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Surface the backend's error message so callers reading err.message
    // get the real reason (e.g. 'Invalid email or password') instead of
    // the generic Axios string ('Request failed with status code 401').
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

// ─── Auth Services ───────────────────────────────────────────
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// ─── User Services ────────────────────────────────────────────
export const userService = {
  // Profile
  getProfile: async (username) => {
    const response = await api.get(`/users/profile/${username}`);
    return response.data;
  },
  updateProfile: async (formData) => {
    // Do NOT set Content-Type — Axios sets multipart/form-data + boundary automatically
    const response = await api.patch('/users/profile', formData);
    return response.data;
  },

  // Posts by user (dedicated endpoint — avoids the explore filter hack)
  getUserPosts: async (username) => {
    const response = await api.get(`/users/profile/${username}/posts`);
    return response.data;
  },

  // Follow / Unfollow
  followUser: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },
  unfollowUser: async (userId) => {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },

  // Search
  searchUsers: async (query, limit = 10) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  },

  // Followers / Following lists
  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },
  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },
};

// ─── Post Services ────────────────────────────────────────────
export const postService = {
  getFeed: async (cursor, limit = 10) => {
    const response = await api.get('/posts/feed', {
  params: { limit, ...(cursor ? { cursor } : {}) },
 });
    return response.data;
  },
  getExplore: async (page = 1, limit = 18) => {
    const response = await api.get(`/posts/explore?page=${page}&limit=${limit}`);
    return response.data;
  },
  getPostDetails: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },
  createPost: async (formData) => {
    const response = await api.post('/posts', formData);
    return response.data;
  },
  // Edit post — PATCH caption only (matches backend updateCaption)
  updatePost: async (postId, postData) => {
    const response = await api.patch(`/posts/${postId}`, postData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
  like: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },
  unlike: async (postId) => {
  const response = await api.delete(`/posts/${postId}/like`);
  return response.data;
},
  addComment: async (postId, commentData) => {
    const response = await api.post(`/posts/${postId}/comments`, commentData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
};

// ─── Notification Services ────────────────────────────────────
export const notificationService = {
  getNotifications: async (page = 1, limit = 20) => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

export default api;