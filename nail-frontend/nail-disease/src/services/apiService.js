import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const AI_EXPLAIN_ENABLED = import.meta.env.VITE_ENABLE_AI_EXPLAIN === 'true';

export const predictImage = async (formData) => {
  const response = await axios.post(API_ENDPOINTS.PREDICT, formData);
  return response.data;
};

export const fetchHistory = async () => {
  const response = await axios.get(API_ENDPOINTS.HISTORY);
  return response.data;
};

export const fetchDiseaseExplanation = async (diseaseName) => {
  if (!AI_EXPLAIN_ENABLED) {
    return {
      disease: diseaseName,
      explanation: '',
      source: 'fallback',
      unavailable: true,
    };
  }

  const endpoints = [
    API_ENDPOINTS.EXPLAIN(diseaseName),
    API_ENDPOINTS.EXPLAIN_API(diseaseName),
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint);
      return { ...response.data, unavailable: false };
    } catch (error) {
      if (error?.response?.status === 404) {
        continue;
      }
      throw error;
    }
  }

  return {
    disease: diseaseName,
    explanation: '',
    source: 'fallback',
    unavailable: true,
  };
};
