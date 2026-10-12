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

export function EnergyAnalytics({ history, historyRange, setHistoryRange }) {
  const [downloading, setDownloading] = useState(false);

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

  const chartData = history?.data?.map((item) => ({
    time: historyRange === '24h' 
      ? item.timestamp.split(' ')[1]?.substring(0, 5) 
      : item.timestamp.split(' ')[0]?.substring(5),
    solar_kw: item.solar_kw,
    demand_kw: item.demand_kw,
    battery_power_kw: item.battery_power_kw,
    grid_import_kw: item.grid_import_kw,
    grid_export_kw: item.grid_export_kw,
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-dark-900 border border-dark-750">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Energy Analytics & Historical Performance</h1>
          <p className="text-xs text-slate-400">
            Historical generation patterns, grid interchange, and cumulative kWh summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex rounded-lg bg-dark-950 p-1 border border-dark-750">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => setHistoryRange(r.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  historyRange === r.id
                    ? 'bg-electric-cyan/20 text-electric-cyan font-bold border border-electric-cyan/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Download CSV Report */}
          <button
            onClick={handleDownloadCsv}
            disabled={downloading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-electric-emerald border border-emerald-500/30 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Energy Summaries (kWh) */}
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
          accent="amber"
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

      {/* Interactive Telemetry Chart */}
      <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 shadow-card-dark">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">Power Telemetry Profiles ({historyRange.toUpperCase()})</h2>
            <p className="text-xs text-slate-400">
              Solar generation (kW), Electricity Demand (kW), and Battery Dispatch (kW)
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-dark-950 px-2.5 py-1 rounded border border-dark-750">
            Interval: 60-minute resolution
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="kW" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="solar_kw"
                name="Solar Generation (kW)"
                fill="#10B981"
                fillOpacity={0.15}
                stroke="#10B981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="demand_kw"
                name="Facility Load (kW)"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
              />
              <Bar
                dataKey="grid_import_kw"
                name="Grid Import (kW)"
                fill="#EF4444"
                opacity={0.7}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Energy Aggregations Table */}
      <div className="p-5 rounded-xl bg-dark-900 border border-dark-750 shadow-card-dark">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-electric-cyan" />
            <h2 className="text-sm font-bold text-white">Daily Cumulative Energy Summaries (kWh)</h2>
          </div>
          <span className="text-xs text-slate-400">
            Calculated via numerical integration: E = ∫ P(t) dt
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-dark-750 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Solar (kWh)</th>
                <th className="py-2.5 px-3 text-right">Demand (kWh)</th>
                <th className="py-2.5 px-3 text-right">Battery Flow (kWh)</th>
                <th className="py-2.5 px-3 text-right">Grid Import (kWh)</th>
                <th className="py-2.5 px-3 text-right">Grid Export (kWh)</th>
                <th className="py-2.5 px-3 text-right">Renewable %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 font-mono">
              {history?.daily_summaries?.map((row) => (
                <tr key={row.date} className="hover:bg-dark-850 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{row.date}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">{row.solar_generated_kwh.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right text-amber-400">{row.demand_consumed_kwh.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right text-cyan-300">{row.battery_throughput_kwh.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400">{row.grid_imported_kwh.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right text-cyan-400">{row.grid_exported_kwh.toFixed(1)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-300">
                    {row.renewable_fraction_pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Guide: Power (kW) vs Energy (kWh) in Microgrids */}
      <div className="p-5 rounded-xl bg-dark-850 border border-electric-cyan/30 shadow-card-dark">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-electric-cyan border border-cyan-500/20 mt-0.5">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Engineering Guide: Demystifying Power (kW) vs. Energy (kWh) in Microgrids
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Understanding this fundamental thermodynamic and electrical distinction is essential for battery sizing and microgrid dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Power Column */}
              <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-750 space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>Power: Kilowatts (kW)</span>
                  <span className="font-mono text-[11px] bg-dark-950 px-2 py-0.5 rounded border border-dark-750">
                    Rate / Flow
                  </span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-white">Definition:</strong> The instantaneous rate at which electrical energy is generated or consumed at any single moment.
                </p>
                <div className="font-mono text-[11px] text-cyan-300 bg-dark-950 p-2 rounded border border-dark-800">
                  P = V × I &nbsp;&nbsp;(or dE / dt)
                </div>
                <p className="text-slate-400">
                  <strong>Microgrid Analogy:</strong> Like the speedometer of an electric vehicle or the diameter of a water hose. Tells you how fast energy is moving right now.
                </p>
              </div>

              {/* Energy Column */}
              <div className="p-3.5 rounded-lg bg-dark-900 border border-dark-750 space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Energy: Kilowatt-Hours (kWh)</span>
                  <span className="font-mono text-[11px] bg-dark-950 px-2 py-0.5 rounded border border-dark-750">
                    Volume / Quantity
                  </span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-white">Definition:</strong> The total amount of work performed or power accumulated over an elapsed duration of time.
                </p>
                <div className="font-mono text-[11px] text-emerald-300 bg-dark-950 p-2 rounded border border-dark-800">
                  E = ∫ P(t) dt &nbsp;≈&nbsp; ∑ (P_kW × Δt_hours)
                </div>
                <p className="text-slate-400">
                  <strong>Microgrid Analogy:</strong> Like the odometer of a vehicle or total gallons in a water reservoir. Dictates battery storage capacity and utility electricity bills.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-dark-900/60 border border-dark-750 text-xs text-slate-300">
              <strong className="text-electric-cyan">Practical Example in MicrogridAI:</strong> Running a 15 kW facility load for 2 hours consumes exactly <strong>30 kWh</strong> of energy. A 60 kWh battery storage system can sustain that 15 kW load for up to 4 continuous hours before reaching its low-voltage reserve limit.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
