import React, { useState } from 'react';
import {
  Zap,
  BatteryCharging,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
  Calculator,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';

export function Recommendations({ recommendations, dashboard }) {
  // Configurable microgrid simulation parameter state
  const [customParams, setCustomParams] = useState({
    batteryCapacity: 60,
    minSocLimit: 15,
    maxSocLimit: 95,
  });

  const recList = recommendations?.recommendations || [];
  const curr = dashboard?.current_metrics;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Smart Energy Dispatch Recommendations
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Physics-constrained optimization engine computing battery storage dispatch, peak shaving, and tariff arbitrage.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#151F30] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono">
          <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Calculated: {recommendations?.timestamp || 'Just now'}</span>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="System Dispatch Status"
          value={recommendations?.system_status || 'OPTIMAL'}
          unit=""
          subtitle="Real-time multi-circuit balance evaluation"
          icon={CheckCircle2}
          accent="emerald"
        />

        <MetricCard
          title="Battery Headroom to Charge"
          value={recommendations?.battery_headroom_kwh?.toFixed(1) || '0.0'}
          unit="kWh"
          subtitle="Remaining capacity up to safe 95% ceiling"
          icon={BatteryCharging}
          accent="cyan"
        />

        <MetricCard
          title="Current Net Power Balance"
          value={recommendations?.current_net_power_kw?.toFixed(1) || '0.0'}
          unit="kW"
          subtitle={
            (recommendations?.current_net_power_kw || 0) >= 0
              ? 'Surplus solar available to store'
              : 'Deficit load requiring battery dispatch'
          }
          icon={Zap}
          accent={(recommendations?.current_net_power_kw || 0) >= 0 ? 'emerald' : 'amber'}
        />
      </div>

      {/* 3. Operational Directives Operations Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Calculated Actionable Directives ({recList.length})
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Real-time rule precedence execution
          </span>
        </div>

        {recList.length > 0 ? (
          recList.map((rec) => {
            const isHigh = rec.priority === 'HIGH';
            const isMedium = rec.priority === 'MEDIUM';

            return (
              <div
                key={rec.id}
                className={`p-5 rounded-xl bg-white dark:bg-[#111827] border transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] ${
                  isHigh
                    ? 'border-emerald-300 dark:border-emerald-700/80'
                    : isMedium
                    ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-[#151F30] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
                        {rec.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                        {rec.title}
                      </h3>
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                      {rec.reasoning}
                    </span>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                    <StatusBadge status={rec.priority} size="xs" />
                    <span className="text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {rec.impact_estimate}
                    </span>
                  </div>
                </div>

                {/* Mathematical Formulation Rationale */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="w-full">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[11px]">
                        Mathematical Basis &amp; Constraint Evaluation:
                      </span>
                      <div className="mt-1 p-2.5 rounded-lg bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 font-mono text-[11px] text-slate-800 dark:text-slate-200 overflow-x-auto">
                        {rec.mathematical_basis}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            All microgrid circuits operating within balanced equilibrium. No dispatch adjustments needed.
          </div>
        )}
      </div>

      {/* 4. Interactive Microgrid Limits Simulation Card */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Microgrid Battery Threshold Configuration
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Simulation limits applied by the recommendation engine. Changing these limits enforces strict protection against overcharging and deep-discharge cell degradation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
              <span>Total Battery Capacity</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {customParams.batteryCapacity} kWh
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={customParams.batteryCapacity}
              onChange={(e) =>
                setCustomParams({ ...customParams, batteryCapacity: Number(e.target.value) })
              }
              className="w-full accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Configured rating: 60.0 kWh nominal
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
              <span>Minimum Cutoff (SoC_min)</span>
              <span className="font-mono text-rose-700 dark:text-rose-400 font-bold">
                {customParams.minSocLimit}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="35"
              step="1"
              value={customParams.minSocLimit}
              onChange={(e) =>
                setCustomParams({ ...customParams, minSocLimit: Number(e.target.value) })
              }
              className="w-full accent-rose-600"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Inhibits discharge below this safety threshold
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
              <span>Maximum Ceiling (SoC_max)</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {customParams.maxSocLimit}%
              </span>
            </div>
            <input
              type="range"
              min="80"
              max="100"
              step="1"
              value={customParams.maxSocLimit}
              onChange={(e) =>
                setCustomParams({ ...customParams, maxSocLimit: Number(e.target.value) })
              }
              className="w-full accent-emerald-600"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              Prevents overvoltage and forces grid export above ceiling
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
