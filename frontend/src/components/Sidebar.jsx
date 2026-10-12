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
  X
} from 'lucide-react';
import { Logo } from './Logo';

export function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, quickStats }) {
  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
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
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-dark-750">
          <Logo size={32} />
          <button
            className="lg:hidden p-1 text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Control Center
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
                    ? 'bg-dark-800 text-electric-cyan font-semibold border border-electric-cyan/30 shadow-[0_0_15px_-4px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-electric-cyan rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-electric-cyan' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Microgrid Telemetry Widget */}
        {quickStats && (
          <div className="p-3 mx-3 mb-4 rounded-xl bg-dark-850 border border-dark-750">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Telemetry Snapshot</span>
              <span className="w-2 h-2 rounded-full bg-electric-emerald animate-ping" />
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Solar
                </span>
                <span className="font-mono font-medium text-amber-300">{quickStats.solar_kw} kW</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <BatteryCharging className="w-3.5 h-3.5 text-electric-emerald" /> Battery SoC
                </span>
                <span className="font-mono font-medium text-emerald-400">{quickStats.battery_soc}%</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-electric-cyan" /> Net Flow
                </span>
                <span
                  className={`font-mono font-medium ${
                    quickStats.net_balance_kw >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {quickStats.net_balance_kw > 0 ? '+' : ''}
                  {quickStats.net_balance_kw} kW
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Attribution */}
        <div className="px-5 py-3 border-t border-dark-750 text-[11px] text-slate-400 flex items-center justify-between">
          <span>v1.0.0 Final Year</span>
          <span className="px-1.5 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700 font-mono text-[9px]">
            DEMO
          </span>
        </div>
      </aside>
    </>
  );
}
