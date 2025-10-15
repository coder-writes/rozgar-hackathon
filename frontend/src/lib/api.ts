// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_REGISTER: `${API_BASE_URL}/api/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_SEND_VERIFY_OTP: `${API_BASE_URL}/api/auth/send-verify-otp`,
  AUTH_VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  
  // Profile endpoints
  PROFILE: `${API_BASE_URL}/api/profile`,
  PROFILE_BY_EMAIL: (email: string) => `${API_BASE_URL}/api/profile/${email}`,
  PROFILE_RESUME: (email: string) => `${API_BASE_URL}/api/profile/resume/${email}`,
};

export default API_BASE_URL;
