import React, { useState } from 'react';
import { Menu, RefreshCw, Radio, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function Navbar({ onMenuToggle, onRefresh, isRefreshing, isConnected, lastUpdated }) {
  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-dark-705 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-electric-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-xs font-medium text-slate-300">
            Smart Microgrid Telemetry & Dispatch System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Synthetic Demonstration Data Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-800 border border-dark-700 text-[11px] text-slate-300">
          <Radio className="w-3 h-3 text-cyan-400" />
          <span>Demo Data (Seed 42)</span>
        </div>

        {/* API Connection Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-800 border border-dark-700 text-[11px]">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-emerald-400 font-medium">API Connected</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-400 font-medium">API Disconnected</span>
            </>
          )}
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white border border-dark-700 text-xs font-medium transition-all disabled:opacity-50"
          title="Refresh Telemetry and Recompute Forecasts"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-electric-cyan ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
