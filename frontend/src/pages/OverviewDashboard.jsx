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
  ArrowRight,
  RefreshCw,
  Sliders,
  Layers,
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
import { useTheme } from '../context/ThemeContext';

export function OverviewDashboard({ dashboard, history, forecast, onNavigate }) {
  const { isDark } = useTheme();

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Energy Overview...</p>
        </div>
      </div>
    );
  }

  const {
    current_metrics: curr,
    forecast_preview: fPreview,
    top_recommendations: recs,
    recent_alerts: alerts,
  } = dashboard;

  // Chart data: past 24h generation vs consumption
  const historySeries =
    history?.data?.map((item) => ({
      time: item.timestamp.split(' ')[1]?.substring(0, 5) || item.timestamp,
      solar_kw: item.solar_kw,
      demand_kw: item.demand_kw,
      battery_soc: item.battery_soc,
      grid_import_kw: item.grid_import_kw,
      grid_export_kw: item.grid_export_kw,
    })) || [];

  // 24h forecast preview chart
  const forecastSeries =
    forecast?.hourly_forecast?.map((item) => ({
      hour: `${item.hour.toString().padStart(2, '0')}:00`,
      predicted_solar_kw: item.predicted_solar_kw,
      predicted_demand_kw: item.predicted_demand_kw,
      net_predicted_balance_kw: item.net_predicted_balance_kw,
    })) || [];

  // Theme-aware chart colors
  const gridStroke = isDark ? '#1E293B' : '#E2E8F0';
  const axisColor = isDark ? '#64748B' : '#94A3B8';
  const tooltipStyle = {
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderColor: isDark ? '#1E293B' : '#E2E8F0',
    color: isDark ? '#F8FAFC' : '#0F172A',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontSize: '12px',
  };

  const solarColor = isDark ? '#10B981' : '#059669';
  const demandColor = isDark ? '#3B82F6' : '#2563EB';

  return (
    <div className="space-y-6">
      {/* 1. Header: Page Title, Context, System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Energy Overview
            </h1>
            <StatusBadge status={curr.status_summary} size="xs" pulse={curr.status_summary === 'NORMAL'} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time microgrid power balance, telemetry status, and dispatch optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-[#151F30] px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Telemetry: {curr.timestamp}</span>
          </div>
        </div>
      </div>

      {/* 2. Primary Metrics: Differentiated Visual Treatments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Solar Generation */}
        <MetricCard
          title="Solar PV Generation"
          value={curr.solar_kw.toFixed(1)}
          unit="kW"
          subtitle="Peak Array Capacity: 25.0 kW"
          icon={Sun}
          accent="emerald"
          trend={curr.solar_kw > 0 ? 'Active Solar Production' : 'Night-time (0.0 kW)'}
          trendDirection={curr.solar_kw > 0 ? 'up' : 'neutral'}
          badge={
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
              Photovoltaic
            </span>
          }
        />

        {/* Metric 2: Facility Demand */}
        <MetricCard
          title="Facility Demand"
          value={curr.demand_kw.toFixed(1)}
          unit="kW"
          subtitle="Commercial Base & Dynamic Load"
          icon={Zap}
          accent="blue"
          trend={curr.net_balance_kw >= 0 ? '100% Self-Supplied' : 'Supplemental Draw Active'}
          trendDirection={curr.net_balance_kw >= 0 ? 'up' : 'down'}
          badge={
            <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-200/60 dark:border-sky-800/60">
              Load
            </span>
          }
        />

        {/* Metric 3: Battery State of Charge */}
        <MetricCard
          title="Battery Storage (SoC)"
          value={curr.battery_soc.toFixed(1)}
          unit="%"
          subtitle={`Current Flow: ${(curr.battery_power_kw >= 0 ? '+' : '') + curr.battery_power_kw.toFixed(1)} kW (Safe 15%–95%)`}
          icon={BatteryCharging}
          accent={curr.battery_soc < 20 ? 'amber' : 'emerald'}
          progress={curr.battery_soc}
          progressLabel={
            curr.battery_power_kw > 0
              ? 'Charging (Storing Surplus)'
              : curr.battery_power_kw < 0
              ? 'Discharging (Supplying Load)'
              : 'Idle (Standby Reserve)'
          }
          badge={
            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              60 kWh BESS
            </span>
          }
        />

        {/* Metric 4: Renewable Utilization */}
        <MetricCard
          title="Renewable Utilization"
          value={curr.renewable_utilization_pct.toFixed(1)}
          unit="%"
          subtitle={`Utility Grid Import: ${curr.grid_import_kw.toFixed(1)} kW`}
          icon={Gauge}
          accent={curr.renewable_utilization_pct >= 70 ? 'emerald' : 'cyan'}
          progress={curr.renewable_utilization_pct}
          progressLabel="Clean Energy Fraction"
          badge={
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
              Efficiency
            </span>
          }
        />
      </div>

      {/* 3. Real-Time Energy Flow Architecture Diagram */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Instantaneous Power Flow Topology
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active bidirectional power distribution across microgrid assets and utility interconnection.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#151F30] px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800">
              Net Balance: {curr.net_balance_kw > 0 ? `+${curr.net_balance_kw.toFixed(1)}` : curr.net_balance_kw.toFixed(1)} kW
            </span>
          </div>
        </div>

        {/* Flow Topology Visual Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
          {/* Node 1: Solar PV */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">1. Solar PV</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="my-2.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {curr.solar_kw.toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">kW</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Feeding Microgrid Bus</span>
            </div>
          </div>

          {/* Node 2: Battery Storage */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">2. Battery BESS</span>
              <BatteryCharging className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="my-2.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {curr.battery_power_kw > 0 ? `+${curr.battery_power_kw.toFixed(1)}` : curr.battery_power_kw.toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">kW</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {curr.battery_power_kw > 0 ? (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Absorbing Solar</span>
                </>
              ) : curr.battery_power_kw < 0 ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Discharging to Load</span>
                </>
              ) : (
                <span>Storage In Standby</span>
              )}
            </div>
          </div>

          {/* Node 3: Facility Demand */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">3. Facility Demand</span>
              <Zap className="w-4 h-4 text-sky-500" />
            </div>
            <div className="my-2.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {curr.demand_kw.toFixed(1)}
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">kW</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-700 dark:text-sky-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Active Consumption</span>
            </div>
          </div>

          {/* Node 4: Utility Grid */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">4. Grid Interchange</span>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="my-2.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                {curr.grid_import_kw > 0
                  ? `-${curr.grid_import_kw.toFixed(1)}`
                  : `+${curr.grid_export_kw.toFixed(1)}`}
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">kW</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {curr.grid_import_kw > 0 ? (
                <span className="text-rose-600 dark:text-rose-400">Importing Grid Power</span>
              ) : curr.grid_export_kw > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">Exporting Clean Power</span>
              ) : (
                <span className="text-slate-500">Zero Grid Exchange</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Historical Analytics & Forecast Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Historical Generation vs Demand */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Power Generation vs Demand (Past 24 Hours)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantaneous telemetry in kilowatts (kW)
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('analytics')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              Full Analytics &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={solarColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={solarColor} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={demandColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={demandColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} unit="kW" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area
                  type="monotone"
                  dataKey="solar_kw"
                  name="Solar PV (kW)"
                  stroke={solarColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#solarGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="demand_kw"
                  name="Demand Load (kW)"
                  stroke={demandColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#demandGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: 24h AI Forecast Preview */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upcoming 24-Hour Forecast Preview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  GradientBoostingRegressor predictive trajectories
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('forecast')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              Model Metrics &rarr;
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="hour" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} unit="kW" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="predicted_solar_kw"
                  name="Predicted Solar (kW)"
                  stroke={solarColor}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_demand_kw"
                  name="Predicted Demand (kW)"
                  stroke={demandColor}
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Priority Energy Recommendations & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts Feed */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Alerts
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              {alerts?.length || 0} Registered
            </span>
          </div>

          <div className="space-y-2">
            {alerts && alerts.length > 0 ? (
              alerts.map((alt) => (
                <AlertBanner key={alt.id} type={alt.type} message={alt.message} />
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">
                All sensory circuits within standard tolerance.
              </p>
            )}
          </div>
        </div>

        {/* Priority Recommendations Feed */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Priority Dispatch Directives
              </h3>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('recommendations')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              All Directives &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recs && recs.length > 0 ? (
              recs.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#151F30] border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rec.title}
                      </span>
                      <StatusBadge status={rec.priority} size="xs" pulse={false} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{rec.reasoning}</p>
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-white dark:bg-[#0B0F19] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 inline-block">
                      {rec.mathematical_basis}
                    </div>
                  </div>

                  <div className="flex-shrink-0 sm:text-right">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block font-mono">
                      {rec.impact_estimate}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">
                System in equilibrium. No active intervention required.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
