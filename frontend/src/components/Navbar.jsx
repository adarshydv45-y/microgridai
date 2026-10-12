import React from 'react';
import { Menu, RefreshCw, Radio, Sun, Moon, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from './StatusBadge';

export function Navbar({ onMenuToggle, onRefresh, isRefreshing, isConnected, lastUpdated }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header className="h-16 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Mobile trigger & System Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Microgrid Supervisory Control & Intelligence
          </span>
        </div>
      </div>

      {/* Right: Operational Controls & Theme Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Synthetic Demonstration Data Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
          <Radio className="w-3 h-3 text-sky-500" />
          <span className="font-medium">Deterministic Seed 42</span>
        </div>

        {/* API Connection Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-[11px]">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                Live Backend
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-sky-700 dark:text-sky-400 font-medium">
                Offline Simulation
              </span>
            </>
          )}
        </div>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh telemetry data"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all disabled:opacity-50"
          title="Refresh telemetry and re-evaluate ML models"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-300 ${
              isRefreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''
            }`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Theme Switcher Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-all"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline text-[11px] font-semibold text-slate-300">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden md:inline text-[11px] font-semibold text-slate-700">Dark</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
