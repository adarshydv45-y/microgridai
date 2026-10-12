// API Client for MicrogridAI backend
const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }
  return response.json();
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getDashboard() {
    const res = await fetch(`${API_BASE}/dashboard`);
    return handleResponse(res);
  },

  async getEnergyHistory(range = '24h') {
    const res = await fetch(`${API_BASE}/energy/history?range=${encodeURIComponent(range)}`);
    return handleResponse(res);
  },

  getExportCsvUrl(range = '30d') {
    return `${API_BASE}/energy/export-csv?range=${encodeURIComponent(range)}`;
  },

  async getForecast() {
    const res = await fetch(`${API_BASE}/forecast`);
    return handleResponse(res);
  },

  async detectAnomaly(payload) {
    const res = await fetch(`${API_BASE}/anomalies/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getAnomalies() {
    const res = await fetch(`${API_BASE}/anomalies`);
    return handleResponse(res);
  },

  async getRecommendations() {
    const res = await fetch(`${API_BASE}/recommendations`);
    return handleResponse(res);
  },

  async getModelMetrics() {
    const res = await fetch(`${API_BASE}/model/metrics`);
    return handleResponse(res);
  },

  async refreshTelemetry() {
    const res = await fetch(`${API_BASE}/system/refresh-telemetry`, {
      method: 'POST',
    });
    return handleResponse(res);
  }
};
