import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export function useMicrogridData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  
  const [dashboard, setDashboard] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [historyRange, setHistoryRange] = useState('24h');
  const [history, setHistory] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);

  const fetchAllData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      setError(null);

      // Verify health first
      const health = await api.getHealth();
      setIsConnected(health.status === 'healthy');

      // Fetch primary datasets concurrently
      const [dashRes, foreRes, histRes, anomRes, recRes, metricsRes] = await Promise.all([
        api.getDashboard(),
        api.getForecast(),
        api.getEnergyHistory(historyRange),
        api.getAnomalies(),
        api.getRecommendations(),
        api.getModelMetrics(),
      ]);

      setDashboard(dashRes);
      setForecast(foreRes);
      setHistory(histRes);
      setAnomalies(anomRes);
      setRecommendations(recRes);
      setModelMetrics(metricsRes);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to load microgrid telemetry:', err);
      setError(err.message || 'Unable to connect to MicrogridAI backend.');
      setIsConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [historyRange]);

  // Refetch when history range filter changes
  useEffect(() => {
    let isMounted = true;
    api.getEnergyHistory(historyRange)
      .then((data) => {
        if (isMounted) setHistory(data);
      })
      .catch((err) => console.error('Failed to update history range:', err));

    return () => { isMounted = false; };
  }, [historyRange]);

  // Initial load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refreshAll = () => fetchAllData(true);

  return {
    loading,
    refreshing,
    error,
    isConnected,
    dashboard,
    forecast,
    history,
    historyRange,
    setHistoryRange,
    anomalies,
    recommendations,
    modelMetrics,
    refreshAll,
  };
}
