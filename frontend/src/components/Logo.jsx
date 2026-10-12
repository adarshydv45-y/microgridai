import React from 'react';

export function Logo({ size = 36, showText = true }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.45)]"
        >
          {/* Outer Hexagon Shield */}
          <polygon
            points="24,3 43,14 43,34 24,45 5,34 5,14"
            className="fill-dark-900 stroke-dark-600"
            strokeWidth="1.5"
          />
          {/* Glowing Hexagon Border */}
          <polygon
            points="24,6 40,15.5 40,32.5 24,42 8,32.5 8,15.5"
            className="stroke-electric-cyan"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          {/* Microgrid Nodes and Grid Lines */}
          <circle cx="24" cy="14" r="2.5" className="fill-electric-emerald" />
          <circle cx="15" cy="30" r="2.5" className="fill-electric-cyan" />
          <circle cx="33" cy="30" r="2.5" className="fill-electric-green" />
          
          <line x1="24" y1="14" x2="15" y2="30" className="stroke-slate-600" strokeWidth="1.5" />
          <line x1="24" y1="14" x2="33" y2="30" className="stroke-slate-600" strokeWidth="1.5" />
          <line x1="15" y1="30" x2="33" y2="30" className="stroke-slate-600" strokeWidth="1.5" />

          {/* Central Energy Lightning Bolt */}
          <path
            d="M25 11L18 24H24L22 36L30 22H24L25 11Z"
            className="fill-electric-emerald drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg text-white">
            <span>Microgrid</span>
            <span className="text-electric-cyan font-black bg-gradient-to-r from-electric-cyan to-electric-emerald bg-clip-text text-transparent">
              AI
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
            Renewable Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
