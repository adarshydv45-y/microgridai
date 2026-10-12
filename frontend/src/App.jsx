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
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
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
                  className="text-xs font-semibold underline text-rose-700 dark:text-rose-300 hover:opacity-80"
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
                <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Loading Microgrid Intelligence...
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Synchronizing telemetry, machine learning forecasts, and dispatch recommendations.
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
        <footer className="border-t border-slate-200/90 dark:border-slate-800/90 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
          <span>
            <strong className="text-slate-700 dark:text-slate-300">MicrogridAI</strong> — Smart Renewable Energy Intelligence
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
            <span>Deterministic Seed 42 Simulation</span>
            <span>•</span>
            <span>FastAPI &amp; React Architecture</span>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
