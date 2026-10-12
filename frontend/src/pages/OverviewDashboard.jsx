import React from 'react';
import {
  Sun,
  Zap,
  BatteryCharging,
  Gauge,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { AlertBanner } from '../components/AlertBanner';

export function OverviewDashboard({ dashboard, history, forecast, onNavigate }) {
  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-electric-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading microgrid intelligence...</p>
        </div>
      </div>
    );
  }

  const { current_metrics: curr, forecast_preview: fPreview, top_recommendations: recs, recent_alerts: alerts } = dashboard;

  // Chart data: past 24h generation vs consumption
  const historySeries = history?.data?.map((item) => ({
    time: item.timestamp.split(' ')[1]?.substring(0, 5) || item.timestamp,
    solar_kw: item.solar_kw,
    demand_kw: item.demand_kw,
    battery_soc: item.battery_soc,
    grid_import_kw: item.grid_import_kw,
    grid_export_kw: item.grid_export_kw,
  })) || [];

  // 24h forecast preview chart
  const forecastSeries = forecast?.hourly_forecast?.map((item) => ({
    hour: `${item.hour.toString().padStart(2, '0')}:00`,
    predicted_solar_kw: item.predicted_solar_kw,
    predicted_demand_kw: item.predicted_demand_kw,
    net_predicted_balance_kw: item.net_predicted_balance_kw,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-dark-900 border border-dark-700/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-electric-emerald">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Microgrid System Status</h1>
              <StatusBadge status={curr.status_summary} size="xs" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time balance: Solar generation, local load, and electrochemical storage dispatch.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-dark-950 px-3 py-1.5 rounded-lg border border-dark-800">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Telemetry: {curr.timestamp}</span>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Solar Generation */}
        <MetricCard
          title="Solar PV Generation"
          value={curr.solar_kw.toFixed(1)}
          unit="kW"
          subtitle="Peak Capacity: 25.0 kW"
          icon={Sun}
          accent="emerald"
          trend={curr.solar_kw > 0 ? 'Active Daylight Generation' : 'Night-time (0.0 kW)'}
          trendDirection={curr.solar_kw > 0 ? 'up' : 'neutral'}
        />

        {/* 2. Facility Demand */}
        <MetricCard
          title="Electricity Demand"
          value={curr.demand_kw.toFixed(1)}
          unit="kW"
          subtitle="Facility Base + Dynamic Loads"
          icon={Zap}
          accent="amber"
          trend={curr.net_balance_kw >= 0 ? 'Fully Self-Sufficient' : 'Deficit Draw Active'}
          trendDirection={curr.net_balance_kw >= 0 ? 'up' : 'down'}
        />

        {/* 3. Battery State of Charge */}
        <MetricCard
          title="Battery State of Charge"
          value={curr.battery_soc.toFixed(1)}
          unit="%"
          subtitle={`Safe Limits: 15% – 95% (${(curr.battery_power_kw >= 0 ? '+' : '') + curr.battery_power_kw.toFixed(1)} kW)`}
          icon={BatteryCharging}
          accent="cyan"
          progress={curr.battery_soc}
          progressLabel={curr.battery_power_kw > 0 ? 'Charging from Solar' : curr.battery_power_kw < 0 ? 'Discharging to Load' : 'Idle Reserve'}
        />

        {/* 4. Renewable Utilization */}
        <MetricCard
          title="Renewable Utilization"
          value={curr.renewable_utilization_pct.toFixed(1)}
          unit="%"
          subtitle={`Grid Import: ${curr.grid_import_kw.toFixed(1)} kW`}
          icon={Gauge}
          accent={curr.renewable_utilization_pct >= 70 ? 'emerald' : 'cyan'}
          progress={curr.renewable_utilization_pct}
          progressLabel="Clean Energy Fraction"
        />
      </div>

      {/* Grid Flow and Power Balance Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-400">Net Power Balance</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-xl font-bold font-mono ${curr.net_balance_kw >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {curr.net_balance_kw > 0 ? `+${curr.net_balance_kw.toFixed(1)}` : curr.net_balance_kw.toFixed(1)} kW
              </span>
              <span className="text-xs text-slate-400">
                {curr.net_balance_kw >= 0 ? 'Surplus Available' : 'Deficit Required'}
              </span>
            </div>
          </div>
          <div className={`p-2 rounded-lg border ${curr.net_balance_kw >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {curr.net_balance_kw >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-400">Utility Grid Import</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-200">{curr.grid_import_kw.toFixed(1)} kW</span>
              <span className="text-xs text-slate-400">Supplemental Power</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-900 border border-dark-750 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-slate-400">Surplus Grid Export</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-cyan-400">{curr.grid_export_kw.toFixed(1)} kW</span>
              <span className="text-xs text-slate-400">Excess Fed to Utility</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-cyan-500/10 text-electric-cyan border border-cyan-500/20">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Real-time 24h Generation vs Demand */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Power Generation vs Demand (Past 24 Hours)</h2>
              <p className="text-xs text-slate-400">Instantaneous Power readings in kW</p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('analytics')}
              className="text-xs text-electric-cyan hover:underline font-medium"
            >
              Detailed Analytics &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="solar_kw"
                  name="Solar (kW)"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#solarGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="demand_kw"
                  name="Demand (kW)"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#demandGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 24h AI Forecast Preview */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-cyan" />
              <div>
                <h2 className="text-sm font-bold text-white">Upcoming 24-Hour Forecast Preview</h2>
                <p className="text-xs text-slate-400">ML Predicted Solar & Load Profiles</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('forecast')}
              className="text-xs text-electric-cyan hover:underline font-medium"
            >
              Model Metrics &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="kW" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="predicted_solar_kw"
                  name="Predicted Solar (kW)"
                  stroke="#00E676"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_demand_kw"
                  name="Predicted Demand (kW)"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Alerts & Top AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts & System Notifications */}
        <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Alerts</h3>
            <span className="text-[11px] text-slate-500 font-mono">{alerts?.length || 0} Events</span>
          </div>

          <div className="space-y-2">
            {alerts && alerts.length > 0 ? (
              alerts.map((alt) => (
                <AlertBanner
                  key={alt.id}
                  type={alt.type}
                  message={alt.message}
                />
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">No active system alerts.</p>
            )}
          </div>
        </div>

        {/* Top Recommendations Feed */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-dark-900 border border-dark-750 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-electric-cyan" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Priority Energy Actions
              </h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('recommendations')}
              className="text-xs text-electric-cyan hover:underline font-medium"
            >
              All Recommendations &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recs && recs.length > 0 ? (
              recs.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-lg bg-dark-850 border border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rec.title}</span>
                      <StatusBadge status={rec.priority} size="xs" pulse={false} />
                    </div>
                    <p className="text-xs text-slate-400">{rec.reasoning}</p>
                    <div className="text-[11px] font-mono text-cyan-300/80 bg-dark-950 px-2 py-0.5 rounded inline-block">
                      {rec.mathematical_basis}
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <span className="text-[11px] font-medium text-emerald-400 block">
                      {rec.impact_estimate}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No pending optimization actions.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
