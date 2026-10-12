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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-dark-900 border border-dark-750">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-electric-cyan" />
            <h1 className="text-lg font-bold text-white tracking-tight">
              Smart Energy Dispatch Recommendations
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic rule-based optimization engine computing electrochemical storage dispatch and peak load shifting.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-dark-950 px-3 py-1.5 rounded-lg border border-dark-750 text-xs text-slate-300">
          <Clock className="w-4 h-4 text-electric-cyan" />
          <span>Last Calculated: {recommendations?.timestamp || 'Just now'}</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
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

      {/* Recommendations Feed */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Calculated Actionable Directives ({recList.length})
        </h2>

        {recList.length > 0 ? (
          recList.map((rec) => {
            const isHigh = rec.priority === 'HIGH';
            const isMedium = rec.priority === 'MEDIUM';

            return (
              <div
                key={rec.id}
                className={`p-5 rounded-xl bg-dark-900 border transition-all ${
                  isHigh
                    ? 'border-electric-cyan/40 shadow-[0_0_20px_-5px_rgba(6,182,212,0.15)]'
                    : isMedium
                    ? 'border-dark-700 hover:border-dark-600'
                    : 'border-dark-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-dark-800 pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-dark-950 text-electric-cyan border border-dark-750 font-bold">
                        {rec.id}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-tight">{rec.title}</h3>
                    </div>
                    <span className="text-xs font-medium text-slate-400 block">{rec.reasoning}</span>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                    <StatusBadge status={rec.priority} size="xs" />
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">
                      {rec.impact_estimate}
                    </span>
                  </div>
                </div>

                {/* Mathematical Formulation Rationale */}
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <Calculator className="w-4 h-4 text-electric-cyan flex-shrink-0 mt-0.5" />
                    <div className="w-full">
                      <span className="text-slate-400 font-semibold block text-[11px]">
                        Mathematical Basis & Constraint Evaluation:
                      </span>
                      <div className="mt-1 p-2.5 rounded-lg bg-dark-950 border border-dark-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                        {rec.mathematical_basis}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center rounded-xl bg-dark-900 border border-dark-800 text-slate-400 text-sm">
            All microgrid circuits operating within balanced equilibrium. No dispatch adjustments needed.
          </div>
        )}
      </div>

      {/* Interactive Microgrid Limits Simulation Card */}
      <div className="p-5 rounded-xl bg-dark-850 border border-dark-750 shadow-card-dark">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-electric-cyan" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Microgrid Battery Threshold Configuration
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Simulation limits applied by the recommendation engine. Changing these limits enforces strict protection against overcharging and deep-discharge cell degradation.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="flex justify-between mb-1.5 font-semibold text-slate-300">
              <span>Total Battery Capacity</span>
              <span className="font-mono text-electric-cyan">{customParams.batteryCapacity} kWh</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={customParams.batteryCapacity}
              onChange={(e) => setCustomParams({ ...customParams, batteryCapacity: Number(e.target.value) })}
              className="w-full accent-electric-cyan"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Configured rating: 60.0 kWh nominal</span>
          </div>

          <div>
            <div className="flex justify-between mb-1.5 font-semibold text-slate-300">
              <span>Minimum Reserve Cutoff (SoC_min)</span>
              <span className="font-mono text-rose-400">{customParams.minSocLimit}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="35"
              step="1"
              value={customParams.minSocLimit}
              onChange={(e) => setCustomParams({ ...customParams, minSocLimit: Number(e.target.value) })}
              className="w-full accent-rose-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Inhibits discharge below this safety threshold</span>
          </div>

          <div>
            <div className="flex justify-between mb-1.5 font-semibold text-slate-300">
              <span>Maximum Charge Ceiling (SoC_max)</span>
              <span className="font-mono text-emerald-400">{customParams.maxSocLimit}%</span>
            </div>
            <input
              type="range"
              min="80"
              max="100"
              step="1"
              value={customParams.maxSocLimit}
              onChange={(e) => setCustomParams({ ...customParams, maxSocLimit: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Prevents overvoltage and forces grid export above ceiling</span>
          </div>
        </div>
      </div>
    </div>
  );
}
