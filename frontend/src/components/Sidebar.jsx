import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Zap,
  Server,
  Sun,
  BatteryCharging,
  ArrowRightLeft,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

export function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, quickStats }) {
  const navItems = [
    { id: 'overview', label: 'Energy Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Energy Analytics', icon: BarChart3 },
    { id: 'forecast', label: 'AI Forecasting', icon: TrendingUp },
    { id: 'anomalies', label: 'Anomaly Detection', icon: ShieldAlert },
    { id: 'recommendations', label: 'Recommendations', icon: Zap },
    { id: 'system', label: 'System Information', icon: Server },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#0E1524] border-r border-slate-200/90 dark:border-slate-800/90 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800/80">
          <Logo size={30} />
          <button
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-r-full" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Microgrid Telemetry Widget */}
        {quickStats && (
          <div className="p-3.5 mx-3 mb-3 rounded-xl bg-slate-50 dark:bg-[#131C2E] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>Telemetry Snapshot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Solar
                </span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100 text-[11px]">
                  {quickStats.solar_kw.toFixed(1)} kW
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" /> Battery SoC
                </span>
                <span className="font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400 text-[11px]">
                  {quickStats.battery_soc.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-sky-500" /> Net Flow
                </span>
                <span
                  className={`font-mono font-semibold tabular-nums text-[11px] ${
                    quickStats.net_balance_kw >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {quickStats.net_balance_kw > 0 ? '+' : ''}
                  {quickStats.net_balance_kw.toFixed(1)} kW
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Attribution */}
        <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="font-medium">v1.0.0 Production</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono text-[9px] font-semibold">
            DEMO
          </span>
        </div>
      </aside>
    </>
  );
}
