import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.189:5276/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT access token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Use backticks for interpolation
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check for 401 error and avoid infinite loops by checking a retry flag.
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Get the refresh token from AsyncStorage
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
        if (storedRefreshToken) {
          // Call the refresh endpoint (adjust endpoint if necessary)
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: storedRefreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;
          // Save the new tokens in AsyncStorage
          await AsyncStorage.setItem('token', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          // Update the Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If token refresh fails, clear the stored tokens and optionally handle logout.
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
