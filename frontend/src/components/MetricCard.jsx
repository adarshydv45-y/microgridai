import React from 'react';

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  accent = 'cyan', // 'cyan', 'emerald', 'amber', 'rose'
  trend,
  trendDirection = 'neutral',
  progress, // 0 to 100 for battery or utilization
  progressLabel,
  className = '',
}) {
  const accentConfigs = {
    cyan: {
      border: 'hover:border-electric-cyan/40',
      iconBg: 'bg-cyan-500/10 text-electric-cyan border-cyan-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.25)]',
      progressFill: 'bg-gradient-to-r from-cyan-500 to-electric-cyan',
      textAccent: 'text-electric-cyan',
    },
    emerald: {
      border: 'hover:border-electric-emerald/40',
      iconBg: 'bg-emerald-500/10 text-electric-emerald border-emerald-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.25)]',
      progressFill: 'bg-gradient-to-r from-emerald-500 to-electric-emerald',
      textAccent: 'text-electric-emerald',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.25)]',
      progressFill: 'bg-gradient-to-r from-amber-500 to-amber-400',
      textAccent: 'text-amber-400',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.25)]',
      progressFill: 'bg-gradient-to-r from-rose-500 to-rose-400',
      textAccent: 'text-rose-400',
    },
  };

  const style = accentConfigs[accent] || accentConfigs.cyan;

  return (
    <div
      className={`group relative bg-dark-850/90 border border-dark-700/80 rounded-xl p-5 shadow-card-dark transition-all duration-200 ${style.border} ${style.glow} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
              {value}
            </span>
            {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg border ${style.iconBg} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center text-[11px] mb-1.5 text-slate-400">
            <span>{progressLabel || 'State'}</span>
            <span className="font-mono font-medium text-slate-300">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-dark-950/80 h-2 rounded-full overflow-hidden p-0.5 border border-dark-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.progressFill}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-dark-750/50">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trendDirection === 'up'
                  ? 'text-emerald-400'
                  : trendDirection === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
