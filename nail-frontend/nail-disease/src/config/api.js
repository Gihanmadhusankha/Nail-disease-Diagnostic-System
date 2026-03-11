// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  PREDICT: `${API_BASE_URL}/predict`,
  HISTORY: `${API_BASE_URL}/history`,
  EXPLAIN: (disease) => `${API_BASE_URL}/explain/${encodeURIComponent(disease)}`,
  EXPLAIN_API: (disease) => `${API_BASE_URL}/api/explain/${encodeURIComponent(disease)}`,
  STATIC_UPLOADS: `${API_BASE_URL}/static/uploads`,
  STATIC_RESULTS: `${API_BASE_URL}/static/results`,
  STATIC_JSON: `${API_BASE_URL}/static/json`,
};

export default API_BASE_URL;
