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
  
  // Dashboard endpoints
  DASHBOARD_OVERVIEW: `${API_BASE_URL}/api/dashboard/overview`,
  DASHBOARD_APPLICATIONS: `${API_BASE_URL}/api/dashboard/applications`,
  DASHBOARD_RECOMMENDATIONS: `${API_BASE_URL}/api/dashboard/recommendations`,
  DASHBOARD_COURSES: `${API_BASE_URL}/api/dashboard/courses`,
  
  // Community endpoints
  COMMUNITIES: `${API_BASE_URL}/api/communities`,
  COMMUNITY_BY_ID: (id: string) => `${API_BASE_URL}/api/communities/${id}`,
  COMMUNITY_JOIN: (id: string) => `${API_BASE_URL}/api/communities/${id}/join`,
  COMMUNITY_LEAVE: (id: string) => `${API_BASE_URL}/api/communities/${id}/leave`,
  COMMUNITY_POSTS: (id: string) => `${API_BASE_URL}/api/communities/${id}/posts`,
  COMMUNITY_POST: (communityId: string, postId: string) => `${API_BASE_URL}/api/communities/${communityId}/posts/${postId}`,
  COMMUNITY_POST_LIKE: (communityId: string, postId: string) => `${API_BASE_URL}/api/communities/${communityId}/posts/${postId}/like`,
  COMMUNITY_POST_COMMENT: (communityId: string, postId: string) => `${API_BASE_URL}/api/communities/${communityId}/posts/${postId}/comments`,
  
  // Feed endpoints
  FEED: `${API_BASE_URL}/api/feed`,
  FEED_POSTS: `${API_BASE_URL}/api/feed/posts`,
  FEED_POST_LIKE: (postId: string) => `${API_BASE_URL}/api/feed/posts/${postId}/like`,
  FEED_POST_COMMENT: (postId: string) => `${API_BASE_URL}/api/feed/posts/${postId}/comments`,
  
  // Application endpoints
  APPLICATIONS: `${API_BASE_URL}/api/applications`,
  APPLICATION_BY_ID: (id: string) => `${API_BASE_URL}/api/applications/${id}`,
  APPLICATION_STATUS: (id: string) => `${API_BASE_URL}/api/applications/${id}/status`,
  APPLICATION_INTERVIEWS: (id: string) => `${API_BASE_URL}/api/applications/${id}/interviews`,
  APPLICATION_FOLLOWUPS: (id: string) => `${API_BASE_URL}/api/applications/${id}/followups`,
  APPLICATION_NOTES: (id: string) => `${API_BASE_URL}/api/applications/${id}/notes`,
  APPLICATION_STATS: `${API_BASE_URL}/api/applications/stats/overview`,
};

export default API_BASE_URL;
