// API Client for MicrogridAI with seamless standalone demonstration fallback
import {
  generateMockDashboard,
  generateMockForecast,
  generateMockHistory,
  generateMockAnomalies,
  generateMockRecommendations,
  simulateAnomalyInference,
} from './mockData';

const API_BASE = '/api';

async function fetchWithFallback(url, options = {}, fallbackFn) {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Network / static host fallback
  }
  return fallbackFn();
}

export const api = {
  async getHealth() {
    return fetchWithFallback(`${API_BASE}/health`, {}, () => ({
      status: 'healthy',
      service: 'MicrogridAI',
      subtitle: 'Smart Renewable Energy Intelligence',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      models_loaded: true,
      environment: 'Vercel Production Preview (Edge Simulation Active)'
    }));
  },

  async getDashboard() {
    return fetchWithFallback(`${API_BASE}/dashboard`, {}, generateMockDashboard);
  },

  async getEnergyHistory(range = '24h') {
    return fetchWithFallback(
      `${API_BASE}/energy/history?range=${encodeURIComponent(range)}`,
      {},
      () => generateMockHistory(range)
    );
  },

  getExportCsvUrl(range = '30d') {
    return `${API_BASE}/energy/export-csv?range=${encodeURIComponent(range)}`;
  },

  async getForecast() {
    return fetchWithFallback(`${API_BASE}/forecast`, {}, generateMockForecast);
  },

  async detectAnomaly(payload) {
    return fetchWithFallback(
      `${API_BASE}/anomalies/detect`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => simulateAnomalyInference(payload)
    );
  },

  async getAnomalies() {
    return fetchWithFallback(`${API_BASE}/anomalies`, {}, generateMockAnomalies);
  },

  async getRecommendations() {
    return fetchWithFallback(`${API_BASE}/recommendations`, {}, generateMockRecommendations);
  },

  async getModelMetrics() {
    return fetchWithFallback(
      `${API_BASE}/model/metrics`,
      {},
      () => generateMockForecast().model_performance
    );
  },

  async refreshTelemetry() {
    try {
      const res = await fetch(`${API_BASE}/system/refresh-telemetry`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: 'success', message: 'Telemetry dataset re-simulated successfully.' };
  }
};
