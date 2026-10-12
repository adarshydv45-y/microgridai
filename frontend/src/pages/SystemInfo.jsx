import React, { useState } from 'react';
import {
  Server,
  Cpu,
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Info,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export function SystemInfo({ dashboard, isConnected, onRefresh, isRefreshing }) {
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const sys = dashboard?.system_info;

  const handleRefreshSimulation = async () => {
    setResetting(true);
    setResetMessage(null);
    try {
      const res = await api.refreshTelemetry();
      setResetMessage(res.message);
      if (onRefresh) onRefresh();
    } catch (err) {
      setResetMessage('Failed to reset dataset: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-dark-900 border border-dark-750">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-electric-cyan" />
            <h1 className="text-lg font-bold text-white tracking-tight">System & Deployment Architecture</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            MicrogridAI software stack, model registry, telemetry provenance, and Google Cloud Run specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={isConnected ? 'OPERATIONAL' : 'DISCONNECTED'} size="sm" />
          <span className="text-xs font-mono text-slate-400 bg-dark-950 px-2.5 py-1 rounded border border-dark-750">
            v1.0.0
          </span>
        </div>
      </div>

      {/* Primary System Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Backend & Cloud Services */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-electric-cyan" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Runtime Environment</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              Cloud Run Ready
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-dark-800/60">
              <span className="text-slate-400">Application Name</span>
              <span className="font-mono text-white font-semibold">MicrogridAI</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-dark-800/60">
              <span className="text-slate-400">Architecture Pattern</span>
              <span className="font-mono text-slate-200">Single Container (FastAPI + React SPA)</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-dark-800/60">
              <span className="text-slate-400">Backend Framework</span>
              <span className="font-mono text-slate-200">Python 3.11 / FastAPI (Uvicorn)</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-dark-800/60">
              <span className="text-slate-400">Frontend Technology</span>
              <span className="font-mono text-slate-200">React 18 + Vite + Tailwind CSS</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-dark-800/60">
              <span className="text-slate-400">API Documentation</span>
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-electric-cyan hover:underline"
              >
                FastAPI Swagger UI (/docs)
              </a>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400">Container Target</span>
              <span className="font-mono text-slate-200">Google Cloud Run (0.0.0.0:$PORT)</span>
            </div>
          </div>
        </div>

        {/* Card 2: ML Model Registry */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Machine Learning Registry</h2>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
              3 Active Models
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">Solar PV Forecast Regressor</span>
                <span className="text-[10px] text-emerald-400 font-mono">Joblib Serialized</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                HistGradientBoostingRegressor (150 trees, squared error, cyclical + lag features).
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">Facility Demand Forecast Regressor</span>
                <span className="text-[10px] text-emerald-400 font-mono">Joblib Serialized</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                HistGradientBoostingRegressor (150 trees, 24h & 48h autoregressive lags).
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-dark-950 border border-dark-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-200">Isolation Forest Anomaly Detector</span>
                <span className="text-[10px] text-emerald-400 font-mono">Joblib Serialized</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                150 estimators, 4% contamination, evaluated on multi-signal microgrid telemetry.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Provenance and Hardware Reality Notice */}
      <div className="p-5 rounded-xl bg-dark-850 border border-amber-500/30 shadow-card-dark">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">
              Data Transparency & Hardware Provenance Notice
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Demonstration Mode:</strong> The telemetry driving this platform is produced by a deterministic microgrid simulator running with a fixed random seed (<code className="font-mono text-cyan-300">seed=42</code>). 
              It incorporates realistic solar physics (clear-sky solar geometry, diurnal solar noon elevation, temperature derating) and authentic commercial facility load profiles with battery electrochemical limits.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>Hardware Independence:</strong> No physical hardware sensors, ESP32 microcontrollers, or live inverters are currently wired to this instance. The backend is designed with modular abstraction layers so live IoT telemetry or public datasets (e.g., Pecan Street Dataport, NREL PVWatts) can be integrated without frontend modifications.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Reset & Management Action */}
      <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Simulation Telemetry Management</h3>
          <p className="text-xs text-slate-400">
            Regenerate 90 days of deterministic telemetry data to reset historical trends and re-trigger model alignment.
          </p>
          {resetMessage && (
            <span className="text-xs text-emerald-400 mt-1 block font-mono">{resetMessage}</span>
          )}
        </div>

        <button
          onClick={handleRefreshSimulation}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-electric-cyan/20 hover:bg-electric-cyan/30 text-electric-cyan border border-electric-cyan/40 text-xs font-bold transition-all disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Regenerating...' : 'Re-generate Telemetry Dataset'}</span>
        </button>
      </div>
    </div>
  );
}
