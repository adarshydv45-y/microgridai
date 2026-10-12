import React, { useState } from 'react';
import {
  Download,
  Calendar,
  Zap,
  Sun,
  Battery,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  Gauge,
  TrendingDown,
  Layers,
} from 'lucide-react';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { useTheme } from '../context/ThemeContext';

export function EnergyAnalytics({ history, historyRange, setHistoryRange }) {
  const [downloading, setDownloading] = useState(false);
  const { isDark } = useTheme();

  const ranges = [
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
  ];

  const handleDownloadCsv = () => {
    setDownloading(true);
    const url = api.getExportCsvUrl(historyRange);
    window.open(url, '_blank');
    setTimeout(() => setDownloading(false), 1500);
  };

  const chartData =
    history?.data?.map((item) => ({
      time:
        historyRange === '24h'
          ? item.timestamp.split(' ')[1]?.substring(0, 5)
          : item.timestamp.split(' ')[0]?.substring(5),
      solar_kw: item.solar_kw,
      demand_kw: item.demand_kw,
      battery_power_kw: item.battery_power_kw,
      grid_import_kw: item.grid_import_kw,
      grid_export_kw: item.grid_export_kw,
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
  const gridColor = isDark ? '#F43F5E' : '#DC2626';

  return (
    <div className="space-y-6">
      {/* 1. Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Energy Analytics & Historical Performance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical generation patterns, grid interchange, and numerical kWh energy integrals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector Tabs */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-[#151F30] p-1 border border-slate-200 dark:border-slate-800">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setHistoryRange(r.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  historyRange === r.id
                    ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Export CSV Report Button */}
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* 2. Aggregate Energy Summaries (kWh) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Solar Energy"
          value={history?.total_solar_kwh?.toFixed(1) || '0.0'}
          unit="kWh"
          subtitle={`Across ${historyRange.toUpperCase()} interval`}
          icon={Sun}
          accent="emerald"
        />

        <MetricCard
          title="Total Demand Energy"
          value={history?.total_demand_kwh?.toFixed(1) || '0.0'}
          unit="kWh"
          subtitle="Cumulative facility electricity load"
          icon={Zap}
          accent="blue"
        />

        <MetricCard
          title="Grid Energy Imported"
          value={history?.total_grid_import_kwh?.toFixed(1) || '0.0'}
          unit="kWh"
          subtitle="Utility grid supplemental import"
          icon={TrendingDown}
          accent="rose"
        />

        <MetricCard
          title="Renewable Fraction"
          value={history?.renewable_fraction_pct?.toFixed(1) || '0.0'}
          unit="%"
          subtitle="Self-generated clean energy share"
          icon={Gauge}
          accent="cyan"
          progress={history?.renewable_fraction_pct || 0}
        />
      </div>

      {/* 3. Interactive Telemetry Chart */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Power Telemetry Profiles ({historyRange.toUpperCase()})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Solar generation (kW), Electricity Demand (kW), and Grid Import (kW)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#151F30] px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800">
            60-minute resolution
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" stroke={axisColor} fontSize={11} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={11} tickLine={false} unit="kW" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="solar_kw"
                name="Solar Generation (kW)"
                fill={solarColor}
                fillOpacity={0.12}
                stroke={solarColor}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="demand_kw"
                name="Facility Load (kW)"
                stroke={demandColor}
                strokeWidth={2}
                dot={false}
              />
              <Bar
                dataKey="grid_import_kw"
                name="Grid Import (kW)"
                fill={gridColor}
                opacity={0.65}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Daily Energy Aggregations Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Cumulative Energy Integrals (kWh)
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            E = ∫ P(t) dt
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-[#151F30]">
                <th className="py-2.5 px-3 rounded-l">Date</th>
                <th className="py-2.5 px-3 text-right">Solar (kWh)</th>
                <th className="py-2.5 px-3 text-right">Demand (kWh)</th>
                <th className="py-2.5 px-3 text-right">Battery Flow (kWh)</th>
                <th className="py-2.5 px-3 text-right">Grid Import (kWh)</th>
                <th className="py-2.5 px-3 text-right">Grid Export (kWh)</th>
                <th className="py-2.5 px-3 text-right rounded-r">Renewable %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
              {history?.daily_summaries?.map((row) => (
                <tr
                  key={row.date}
                  className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                >
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-200">
                    {row.date}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                    {row.solar_generated_kwh.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-sky-700 dark:text-sky-400">
                    {row.demand_consumed_kwh.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                    {row.battery_throughput_kwh.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-700 dark:text-rose-400">
                    {row.grid_imported_kwh.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400">
                    {row.grid_exported_kwh.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-300">
                    {row.renewable_fraction_pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Educational Guide: Power (kW) vs Energy (kWh) in Microgrids */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Engineering Guide: Demystifying Power (kW) vs. Energy (kWh) in Microgrids
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Understanding this fundamental thermodynamic and electrical distinction is essential for battery sizing and microgrid dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Power Column */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 font-bold">
                  <span>Power: Kilowatts (kW)</span>
                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Rate / Flow
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Definition:</strong> The instantaneous rate at which electrical energy is generated or consumed at any single moment.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#151F30] p-2 rounded border border-slate-200 dark:border-slate-800">
                  P = V × I &nbsp;&nbsp;(or dE / dt)
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  <strong>Microgrid Analogy:</strong> Like the speedometer of an electric vehicle. Dictates wire gauge and inverter sizing.
                </p>
              </div>

              {/* Energy Column */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>Energy: Kilowatt-Hours (kWh)</span>
                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Volume / Quantity
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Definition:</strong> The total amount of work performed or power accumulated over an elapsed duration of time.
                </p>
                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#151F30] p-2 rounded border border-slate-200 dark:border-slate-800">
                  E = ∫ P(t) dt &nbsp;≈&nbsp; ∑ (P_kW × Δt_hours)
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  <strong>Microgrid Analogy:</strong> Like the total gallons in a reservoir or battery state of charge. Dictates utility billing.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-slate-700 dark:text-slate-300">
              <strong className="text-emerald-800 dark:text-emerald-300">Practical Example:</strong> Running a 15 kW facility load for 2 hours consumes exactly <strong>30 kWh</strong> of energy. A 60 kWh battery storage system can sustain that 15 kW load for up to 4 continuous hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
