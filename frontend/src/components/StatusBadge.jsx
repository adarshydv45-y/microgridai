import React from 'react';

export function StatusBadge({ status, size = 'sm', pulse = true }) {
  const norm = (status || '').toUpperCase();
  
  let bg = 'bg-slate-800 text-slate-300 border-slate-700';
  let dot = 'bg-slate-400';

  if (['NORMAL', 'OPTIMAL', 'HEALTHY', 'ONLINE', 'OPERATIONAL', 'LOW'].includes(norm)) {
    bg = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
    dot = 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
  } else if (['WARNING', 'SUSPICIOUS', 'MEDIUM', 'ACTION_RECOMMENDED'].includes(norm)) {
    bg = 'bg-amber-950/60 text-amber-400 border-amber-500/30';
    dot = 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
  } else if (['ANOMALOUS', 'CRITICAL', 'HIGH', 'ERROR', 'ALERT', 'FAIL'].includes(norm)) {
    bg = 'bg-rose-950/60 text-rose-400 border-rose-500/30';
    dot = 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
  } else if (['DEMO', 'SYNTHETIC', 'INFO'].includes(norm)) {
    bg = 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30';
    dot = 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]';
  }

  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : size === 'lg' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-all ${bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{status}</span>
    </span>
  );
}
