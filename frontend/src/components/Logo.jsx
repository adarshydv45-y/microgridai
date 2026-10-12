import React from 'react';

export function Logo({ size = 32, showText = true }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Rounded Hexagonal Base */}
          <rect
            x="2"
            y="2"
            width="32"
            height="32"
            rx="8"
            className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-600/30 dark:stroke-emerald-500/30"
            strokeWidth="1.5"
          />

          {/* Microgrid Interconnection Paths */}
          <path
            d="M10 18H26M18 10V26"
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Central Energy Hub */}
          <circle
            cx="18"
            cy="18"
            r="3.5"
            className="fill-emerald-600 dark:fill-emerald-400"
          />

          {/* Asset Telemetry Nodes (Solar, Battery, Grid, Load) */}
          <circle cx="18" cy="8" r="2" className="fill-amber-500 dark:fill-amber-400" />
          <circle cx="28" cy="18" r="2" className="fill-blue-500 dark:fill-blue-400" />
          <circle cx="18" cy="28" r="2" className="fill-emerald-500 dark:fill-emerald-400" />
          <circle cx="8" cy="18" r="2" className="fill-slate-500 dark:fill-slate-400" />

          {/* Dynamic Arc Flow */}
          <path
            d="M18 12C21.3137 12 24 14.6863 24 18"
            className="stroke-emerald-600 dark:stroke-emerald-400"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              Microgrid
            </span>
            <span className="font-extrabold text-base tracking-tight text-emerald-600 dark:text-emerald-400">
              AI
            </span>
          </div>
          <span className="text-[10px] tracking-wider uppercase font-medium text-slate-500 dark:text-slate-400">
            Smart Renewable Energy Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
