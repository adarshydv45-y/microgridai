import React from 'react';
import { AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export function AlertBanner({ type = 'INFO', title, message, action }) {
  const configs = {
    INFO: {
      container:
        'bg-sky-50/80 border-sky-200 text-sky-900 dark:bg-sky-950/30 dark:border-sky-800/60 dark:text-sky-200',
      icon: Info,
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    WARNING: {
      container:
        'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/60 dark:text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    ALERT: {
      container:
        'bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/60 dark:text-rose-200',
      icon: ShieldAlert,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    SUCCESS: {
      container:
        'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  };

  const style = configs[type.toUpperCase()] || configs.INFO;
  const Icon = style.icon;

  return (
    <div
      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border text-xs transition-colors ${style.container}`}
    >
      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
        <div>
          {title && <span className="font-semibold block mb-0.5">{title}</span>}
          <span className="opacity-95 leading-relaxed">{message}</span>
        </div>
      </div>

      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
