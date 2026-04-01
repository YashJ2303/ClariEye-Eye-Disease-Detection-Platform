const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_URLS = {
  BASE: API_BASE_URL,
  AUTH: `${API_BASE_URL}/api/auth`,
  PATIENTS: `${API_BASE_URL}/api/patients`,
  SCANS: `${API_BASE_URL}/api/scans`,
  APPOINTMENTS: `${API_BASE_URL}/api/appointments`,
  AI: `${API_BASE_URL}/api/ai`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  UPLOADS: API_BASE_URL
};

export default API_URLS;
