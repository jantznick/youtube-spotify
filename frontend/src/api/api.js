// Use environment variable if set (for production), otherwise use relative path (for dev/proxy)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const authAPI = {
  register: (usernameOrEmail, password) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
  },

  login: (usernameOrEmail, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
  },

  requestMagicToken: async (usernameOrEmail) => {
    const response = await request('/auth/magic-token/request', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail }),
    });
    return response; // Return the full response including sixDigitCode and loginLink
  },

  requestRegisterToken: async (usernameOrEmail) => {
    const response = await request('/auth/magic-token/request-register', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail }),
    });
    return response;
  },

  loginWithMagicToken: (token) =>
    request('/auth/magic-token/login', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  registerWithMagicToken: (token) =>
    request('/auth/magic-token/register', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  forgotPassword: (email, username) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, username }),
    }),

  resetPassword: (token, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  me: () => request('/auth/me'),
};

export const songsAPI = {
  getAll: () => request('/songs'),
  getOne: (id) => request(`/songs/${id}`),
  update: (id, songData) =>
    request(`/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(songData),
    }),
};

export const playlistsAPI = {
  getAll: () => request('/playlists'),
  getOne: (id) => request(`/playlists/${id}`),
  create: (playlistData) =>
    request('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlistData),
    }),
  update: (id, playlistData) =>
    request(`/playlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(playlistData),
    }),
  delete: (id) =>
    request(`/playlists/${id}`, {
      method: 'DELETE',
    }),
  addSong: (playlistId, songId) =>
    request(`/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ songId }),
    }),
  removeSong: (playlistId, songId) =>
    request(`/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
    }),
  reorder: (playlistId, songIds) =>
    request(`/playlists/${playlistId}/songs/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ songIds }),
    }),
  importYouTube: (youtubeUrl, playlistName) =>
    request('/playlists/import-youtube', {
      method: 'POST',
      body: JSON.stringify({ youtubeUrl, playlistName }),
    }),
  importSpotify: (spotifyUrl, playlistName) =>
    request('/playlists/import-spotify', {
      method: 'POST',
      body: JSON.stringify({ spotifyUrl, playlistName }),
    }),
  refresh: (playlistId) =>
    request(`/playlists/${playlistId}/refresh`, {
      method: 'POST',
    }),
};

export const userAPI = {
  getMe: () => request('/user/me'),
  updateCredentials: (email, username) =>
    request('/user/update-credentials', {
      method: 'PUT',
      body: JSON.stringify({ email, username }),
    }),
};
