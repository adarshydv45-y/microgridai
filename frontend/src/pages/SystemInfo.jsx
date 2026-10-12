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
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              System &amp; Deployment Architecture
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            MicrogridAI software stack, model registry, telemetry provenance, and cloud runtime specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={isConnected ? 'OPERATIONAL' : 'OFFLINE_DEMO'} size="sm" />
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#151F30] px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 font-semibold">
            v1.0.0
          </span>
        </div>
      </div>

      {/* 2. Primary System Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Backend & Cloud Services */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Runtime Environment
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-semibold">
              FastAPI / Vite
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Application Name</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                MicrogridAI
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Architecture Pattern</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                FastAPI REST + React 18 SPA
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Backend Framework</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                Python 3.11 / FastAPI (Uvicorn)
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Frontend Technology</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                React 18 + Vite + Tailwind CSS
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">API Documentation</span>
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                FastAPI Swagger UI (/docs)
              </a>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500 dark:text-slate-400">Deployment Target</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                Vercel (Edge SPA) + Render / Cloud Run
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: ML Model Registry */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Machine Learning Registry
              </h2>
            </div>
            <span className="text-[11px] font-mono text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded font-semibold">
              3 Serialized Models
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">
                  Solar PV Forecast Regressor
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                  Joblib Serialized
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                GradientBoostingRegressor (80 estimators, max depth 5, diurnal trigonometric features).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">
                  Facility Demand Forecast Regressor
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                  Joblib Serialized
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                GradientBoostingRegressor (80 estimators, autoregressive 24h/48h moving lag features).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">
                  Isolation Forest Anomaly Detector
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                  Joblib Serialized
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                IsolationForest (150 trees, 5% contamination, multidimensional isolation depth).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Telemetry Provenance and Hardware Reality Notice */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Transparency &amp; Hardware Provenance Notice
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Demonstration Mode:</strong> The telemetry driving this platform is produced by a deterministic microgrid simulator running with a fixed random seed (<code className="font-mono text-emerald-700 dark:text-emerald-300 bg-white dark:bg-black/40 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">seed=42</code>). 
              It incorporates realistic solar physics (clear-sky solar geometry, diurnal solar noon elevation, temperature derating) and authentic commercial facility load profiles with battery electrochemical limits.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Hardware Independence:</strong> No physical hardware sensors, ESP32 microcontrollers, or live inverters are currently wired to this instance. The backend is designed with modular abstraction layers so live IoT telemetry or public datasets (e.g., Pecan Street Dataport, NREL PVWatts) can be integrated without frontend modifications.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Dataset Reset & Management Action */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Simulation Telemetry Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Regenerate 90 days of deterministic telemetry data to reset historical trends and re-trigger model alignment.
          </p>
          {resetMessage && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
              {resetMessage}
            </span>
          )}
        </div>

        <button
          onClick={handleRefreshSimulation}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Regenerating...' : 'Regenerate Telemetry Dataset'}</span>
        </button>
      </div>
    </div>
  );
}
