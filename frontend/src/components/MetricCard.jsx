import React from 'react';

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  accent = 'emerald', // 'emerald', 'amber', 'cyan', 'blue', 'rose', 'slate'
  trend,
  trendDirection = 'neutral',
  progress, // 0 to 100
  progressLabel,
  badge,
  className = '',
}) {
  const accentConfigs = {
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/50',
      progressFill: 'bg-emerald-600 dark:bg-emerald-500',
      accentBorder: 'border-l-4 border-l-emerald-500 dark:border-l-emerald-400',
      metricColor: 'text-slate-900 dark:text-white',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/50',
      progressFill: 'bg-amber-500 dark:bg-amber-400',
      accentBorder: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
      metricColor: 'text-slate-900 dark:text-white',
    },
    cyan: {
      iconBg: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/50',
      progressFill: 'bg-cyan-500 dark:bg-cyan-400',
      accentBorder: 'border-l-4 border-l-cyan-500 dark:border-l-cyan-400',
      metricColor: 'text-slate-900 dark:text-white',
    },
    blue: {
      iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/50',
      progressFill: 'bg-sky-500 dark:bg-sky-400',
      accentBorder: 'border-l-4 border-l-sky-500 dark:border-l-sky-400',
      metricColor: 'text-slate-900 dark:text-white',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/50',
      progressFill: 'bg-rose-500 dark:bg-rose-400',
      accentBorder: 'border-l-4 border-l-rose-500 dark:border-l-rose-400',
      metricColor: 'text-slate-900 dark:text-white',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      progressFill: 'bg-slate-500 dark:bg-slate-400',
      accentBorder: 'border-l-4 border-l-slate-400 dark:border-l-slate-500',
      metricColor: 'text-slate-900 dark:text-white',
    },
  };

  const style = accentConfigs[accent] || accentConfigs.emerald;

  return (
    <div
      className={`bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {title}
            </p>
            {badge && <div>{badge}</div>}
          </div>

          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums ${style.metricColor}`}
            >
              {value}
            </span>
            {unit && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`p-2.5 rounded-lg border flex-shrink-0 transition-colors ${style.iconBg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Progress Bar (Battery SoC, Renewable Fraction, etc.) */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between items-center text-[11px] mb-1.5 text-slate-500 dark:text-slate-400">
            <span>{progressLabel || 'Operating Level'}</span>
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.progressFill}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtitle / Contextual Status */}
      {(subtitle || trend) && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium flex-shrink-0 ${
                trendDirection === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trendDirection === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 dark:text-slate-400'
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
