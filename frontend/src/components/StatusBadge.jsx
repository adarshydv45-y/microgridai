import React from 'react';

export function StatusBadge({ status, size = 'sm', pulse = false }) {
  const norm = (status || '').toUpperCase();

  let style = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dotColor = 'bg-slate-500';

  if (['NORMAL', 'OPTIMAL', 'HEALTHY', 'ONLINE', 'OPERATIONAL', 'LOW', 'CONNECTED'].includes(norm)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    dotColor = 'bg-emerald-500';
  } else if (['WARNING', 'SUSPICIOUS', 'MEDIUM', 'ACTION_RECOMMENDED', 'MODERATE'].includes(norm)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
    dotColor = 'bg-amber-500';
  } else if (['ANOMALOUS', 'CRITICAL', 'HIGH', 'ERROR', 'ALERT', 'FAIL', 'DISCONNECTED'].includes(norm)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
    dotColor = 'bg-rose-500';
  } else if (['DEMO', 'SYNTHETIC', 'INFO', 'BASELINE'].includes(norm)) {
    style = 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60';
    dotColor = 'bg-sky-500';
  }

  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-2 py-0.5'
      : size === 'lg'
      ? 'text-sm px-3.5 py-1.5'
      : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${style} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'animate-pulse' : ''}`}
      />
      <span>{status}</span>
    </span>
  );
}
