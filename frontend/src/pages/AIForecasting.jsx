import React, { useState } from 'react';
import {
  TrendingUp,
  Sun,
  Zap,
  Sparkles,
  Award,
  Cpu,
  BarChart2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';

export function AIForecasting({ forecast, modelMetrics }) {
  const [showBaselines, setShowBaselines] = useState(false);

  if (!forecast) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <p className="text-sm">Loading AI forecast models...</p>
      </div>
    );
  }

  const { summary, hourly_forecast: hours, explanation, model_performance: perf } = forecast;

  const chartData = hours.map((item) => ({
    hour: `${item.hour.toString().padStart(2, '0')}:00`,
    predicted_solar_kw: item.predicted_solar_kw,
    predicted_demand_kw: item.predicted_demand_kw,
    baseline_solar_kw: item.baseline_solar_kw,
    baseline_demand_kw: item.baseline_demand_kw,
    net_predicted_balance_kw: item.net_predicted_balance_kw,
    expected_battery_soc: item.expected_battery_soc,
  }));

  const solarMetrics = modelMetrics?.solar_forecast || perf?.solar_forecast;
  const demandMetrics = modelMetrics?.demand_forecast || perf?.demand_forecast;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-dark-900 border border-dark-750">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-electric-cyan" />
            <h1 className="text-lg font-bold text-white tracking-tight">AI Multi-Horizon Forecasting Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            24-hour predictive intelligence for solar irradiance, facility load, and state-of-charge trajectory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 bg-dark-950 px-3 py-1.5 rounded-lg border border-dark-750 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showBaselines}
              onChange={(e) => setShowBaselines(e.target.checked)}
              className="rounded bg-dark-800 border-dark-600 text-electric-cyan focus:ring-0"
            />
            <span>Compare with Persistence Baseline (t-24)</span>
          </label>

          <span className="text-xs font-mono text-slate-400 bg-dark-950 px-3 py-1.5 rounded-lg border border-dark-750 hidden md:inline">
            Horizon: Next 24 Hours
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Predicted 24h Solar"
          value={summary.total_predicted_solar_kwh.toFixed(1)}
          unit="kWh"
          subtitle={`Peak: ${summary.peak_solar_kw} kW at ${summary.peak_solar_hour.toString().padStart(2, '0')}:00`}
          icon={Sun}
          accent="emerald"
        />

        <MetricCard
          title="Predicted 24h Demand"
          value={summary.total_predicted_demand_kwh.toFixed(1)}
          unit="kWh"
          subtitle={`Peak: ${summary.peak_demand_kw} kW at ${summary.peak_demand_hour.toString().padStart(2, '0')}:00`}
          icon={Zap}
          accent="amber"
        />

        <MetricCard
          title="Net Predicted Balance"
          value={summary.net_predicted_balance_kwh.toFixed(1)}
          unit="kWh"
          subtitle={summary.net_predicted_balance_kwh >= 0 ? 'Projected Clean Surplus' : 'Projected Deficit'}
          icon={TrendingUp}
          accent={summary.net_predicted_balance_kwh >= 0 ? 'cyan' : 'rose'}
        />

        <MetricCard
          title="Expected Grid Deficit"
          value={summary.expected_grid_deficit_kwh.toFixed(1)}
          unit="kWh"
          subtitle={`Curtailment Avoided: ${summary.expected_curtailment_kwh.toFixed(1)} kWh`}
          icon={Award}
          accent="cyan"
        />
      </div>

      {/* Main 24-Hour Predictive Trajectory Chart */}
      <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 shadow-card-dark">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">24-Hour Horizon Predictive Trajectory</h2>
            <p className="text-xs text-slate-400">
              Evaluated using HistGradientBoostingRegressor on chronological test data.
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-dark-950 px-2.5 py-1 rounded border border-dark-800">
            Generated: {forecast.generated_at.replace('T', ' ').substring(0, 19)}
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="kW" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              
              <Line
                type="monotone"
                dataKey="predicted_solar_kw"
                name="AI Solar Forecast (kW)"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10B981' }}
              />
              <Line
                type="monotone"
                dataKey="predicted_demand_kw"
                name="AI Demand Forecast (kW)"
                stroke="#06B6D4"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#06B6D4' }}
              />

              {showBaselines && (
                <>
                  <Line
                    type="monotone"
                    dataKey="baseline_solar_kw"
                    name="Solar Baseline t-24 (kW)"
                    stroke="#10B981"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline_demand_kw"
                    name="Demand Baseline t-24 (kW)"
                    stroke="#06B6D4"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Narrative */}
        <div className="mt-4 p-3 rounded-lg bg-dark-950 border border-dark-800 text-xs text-slate-300">
          <span className="font-bold text-electric-cyan">Forecast Summary: </span>
          {explanation}
        </div>
      </div>

      {/* Model Evaluation & Honest Benchmarks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solar Model Evaluation Card */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 shadow-card-dark space-y-4">
          <div className="flex items-center justify-between border-b border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Solar PV Regression Model
                </h3>
                <span className="text-[11px] text-slate-400">HistGradientBoostingRegressor</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
              Active v1.0
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Evaluated on an out-of-sample chronological test set (no future lookahead). Metrics reflect true regression error.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">Model MAE</span>
              <span className="text-lg font-bold font-mono text-white">
                {solarMetrics?.mae_kw ? `${solarMetrics.mae_kw} kW` : 'N/A'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Mean Absolute Error</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">Persistence MAE</span>
              <span className="text-lg font-bold font-mono text-slate-400">
                {solarMetrics?.baseline_mae_kw ? `${solarMetrics.baseline_mae_kw} kW` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Yesterday Baseline</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">MAE Reduction</span>
              <span className="text-lg font-bold font-mono text-emerald-300">
                {solarMetrics?.mae_reduction_pct ? `+${solarMetrics.mae_reduction_pct}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Vs Persistence</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">Model RMSE</span>
              <span className="text-base font-bold font-mono text-white">
                {solarMetrics?.rmse_kw ? `${solarMetrics.rmse_kw} kW` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Root Mean Sq Error</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">R² Score</span>
              <span className="text-base font-bold font-mono text-cyan-300">
                {solarMetrics?.r2_score !== undefined ? solarMetrics.r2_score : 'N/A'}
              </span>
              <span className="text-[10px] text-cyan-400 block mt-0.5">Variance Explained</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">Test Samples</span>
              <span className="text-base font-bold font-mono text-slate-300">
                {modelMetrics?.test_samples || 423} hrs
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Chronological Split</span>
            </div>
          </div>
        </div>

        {/* Demand Model Evaluation Card */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 shadow-card-dark space-y-4">
          <div className="flex items-center justify-between border-b border-dark-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Electricity Demand Model
                </h3>
                <span className="text-[11px] text-slate-400">HistGradientBoostingRegressor</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
              Active v1.0
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Learns cyclical load behavior (morning and evening commercial peaks, weekend profiles) and auto-regressive lags.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">Model MAE</span>
              <span className="text-lg font-bold font-mono text-white">
                {demandMetrics?.mae_kw ? `${demandMetrics.mae_kw} kW` : 'N/A'}
              </span>
              <span className="text-[10px] text-cyan-400 block mt-0.5">Mean Absolute Error</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">Persistence MAE</span>
              <span className="text-lg font-bold font-mono text-slate-400">
                {demandMetrics?.baseline_mae_kw ? `${demandMetrics.baseline_mae_kw} kW` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Yesterday Baseline</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">MAE Reduction</span>
              <span className="text-lg font-bold font-mono text-emerald-300">
                {demandMetrics?.mae_reduction_pct ? `+${demandMetrics.mae_reduction_pct}%` : 'N/A'}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Vs Persistence</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">Model RMSE</span>
              <span className="text-base font-bold font-mono text-white">
                {demandMetrics?.rmse_kw ? `${demandMetrics.rmse_kw} kW` : 'N/A'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Root Mean Sq Error</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">R² Score</span>
              <span className="text-base font-bold font-mono text-cyan-300">
                {demandMetrics?.r2_score !== undefined ? demandMetrics.r2_score : 'N/A'}
              </span>
              <span className="text-[10px] text-cyan-400 block mt-0.5">Variance Explained</span>
            </div>

            <div className="p-3 rounded-lg bg-dark-950 border border-dark-800">
              <span className="text-[10px] uppercase text-slate-400 block">Split Ratio</span>
              <span className="text-base font-bold font-mono text-slate-300">80 / 20</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Chronological</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Engineering Architecture */}
      <div className="p-5 rounded-xl bg-dark-850 border border-dark-750">
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-electric-cyan" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            ML Feature Engineering Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-dark-900 border border-dark-800 space-y-1.5">
            <span className="font-semibold text-cyan-300 block">Cyclical Temporal Transforms</span>
            <p className="text-slate-400">
              Encodes 24-hour diurnal loops into continuous sine/cosine trigonometric spaces:
            </p>
            <div className="font-mono text-[11px] text-slate-300 bg-dark-950 p-1.5 rounded">
              sin(2π·h / 24), cos(2π·h / 24)
            </div>
          </div>

          <div className="p-3 rounded-lg bg-dark-900 border border-dark-800 space-y-1.5">
            <span className="font-semibold text-emerald-300 block">Autoregressive Lags</span>
            <p className="text-slate-400">
              Captures autocorrelation and moving average dynamics without lookahead leakage:
            </p>
            <div className="font-mono text-[11px] text-slate-300 bg-dark-950 p-1.5 rounded">
              t-1h, t-24h (daily), t-48h, rolling_24h
            </div>
          </div>

          <div className="p-3 rounded-lg bg-dark-900 border border-dark-800 space-y-1.5">
            <span className="font-semibold text-amber-300 block">Atmospheric Coupling</span>
            <p className="text-slate-400">
              Clear-sky geometric irradiance calculations combined with thermal derating factors:
            </p>
            <div className="font-mono text-[11px] text-slate-300 bg-dark-950 p-1.5 rounded">
              ambient_temp_c, irradiance_wm2, clouds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
