import React, { useState } from 'react';
import { useMicrogridData } from './hooks/useMicrogridData';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { EnergyAnalytics } from './pages/EnergyAnalytics';
import { AIForecasting } from './pages/AIForecasting';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { Recommendations } from './pages/Recommendations';
import { SystemInfo } from './pages/SystemInfo';
import { AlertBanner } from './components/AlertBanner';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
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
  } = useMicrogridData();

  const quickStats = dashboard?.current_metrics;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        quickStats={quickStats}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Sticky Top Navbar */}
        <Navbar
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          onRefresh={refreshAll}
          isRefreshing={refreshing}
          isConnected={isConnected}
          lastUpdated={dashboard?.current_metrics?.timestamp}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Error Notification Banner */}
          {error && (
            <AlertBanner
              type="ALERT"
              title="Connection Warning"
              message={`Backend communication error: ${error}. Retrying automatically or click Refresh.`}
              action={
                <button
                  onClick={refreshAll}
                  className="text-xs underline text-rose-300 hover:text-white"
                >
                  Retry Connection
                </button>
              }
            />
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-dark-800 border-t-electric-cyan rounded-full animate-spin" />
                <div className="w-6 h-6 border-2 border-dark-700 border-b-electric-emerald rounded-full animate-spin absolute" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Initializing MicrogridAI Intelligence...</p>
                <p className="text-xs text-slate-400 mt-1">
                  Loading telemetry data, model predictions, and dispatch recommendations.
                </p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewDashboard
                  dashboard={dashboard}
                  history={history}
                  forecast={forecast}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'analytics' && (
                <EnergyAnalytics
                  history={history}
                  historyRange={historyRange}
                  setHistoryRange={setHistoryRange}
                />
              )}

              {activeTab === 'forecast' && (
                <AIForecasting
                  forecast={forecast}
                  modelMetrics={modelMetrics}
                />
              )}

              {activeTab === 'anomalies' && (
                <AnomalyDetection
                  anomalies={anomalies}
                />
              )}

              {activeTab === 'recommendations' && (
                <Recommendations
                  recommendations={recommendations}
                  dashboard={dashboard}
                />
              )}

              {activeTab === 'system' && (
                <SystemInfo
                  dashboard={dashboard}
                  isConnected={isConnected}
                  onRefresh={refreshAll}
                  isRefreshing={refreshing}
                />
              )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-dark-800/80 py-4 px-6 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
          <span>
            <strong>MicrogridAI</strong> — Smart Renewable Energy Intelligence Platform
          </span>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Deterministic Seed 42 Simulation</span>
            <span>•</span>
            <span>Google Cloud Run Ready</span>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
