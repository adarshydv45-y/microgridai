import React from 'react';
import { AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';

export function AlertBanner({ type = 'INFO', title, message, action, onClose }) {
  const configs = {
    INFO: {
      bg: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200',
      icon: Info,
      iconColor: 'text-electric-cyan',
    },
    WARNING: {
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    ALERT: {
      bg: 'bg-rose-950/40 border-rose-500/30 text-rose-200',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
    },
    SUCCESS: {
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
      icon: CheckCircle,
      iconColor: 'text-electric-emerald',
    },
  };

  const style = configs[type.toUpperCase()] || configs.INFO;
  const Icon = style.icon;

  return (
    <div className={`flex items-start justify-between gap-3 p-3.5 rounded-lg border backdrop-blur-sm ${style.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
        <div className="text-xs">
          {title && <span className="font-semibold block mb-0.5">{title}</span>}
          <span className="opacity-90">{message}</span>
        </div>
      </div>

      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
