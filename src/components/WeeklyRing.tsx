import React from 'react';

export interface RingProgressData {
  done: number;
  due: number;
}

export interface WeeklyRingProps {
  save: RingProgressData;
  tithe: RingProgressData;
  salary: RingProgressData;
  weekClosed: boolean;
  weekStatus: 'complete' | 'action' | 'not_closed';
  className?: string;
}

const RINGS: Array<{ key: 'save' | 'tithe' | 'salary'; label: string; r: number }> = [
  { key: 'save',   label: 'SAVE',   r: 70 },
  { key: 'tithe',  label: 'TITHE',  r: 55 },
  { key: 'salary', label: 'SALARY', r: 40 },
];

export function WeeklyRing({ save, tithe, salary, weekClosed, weekStatus, className = '' }: WeeklyRingProps) {
  const data = { save, tithe, salary };
  
  return (
    <div className={`weekly-ring is-${weekStatus} ${className}`}>
      <svg 
        viewBox="0 0 180 180" 
        role="img"
        aria-label={`Weekly status: ${weekStatus.replace('_', ' ')}`}
      >
        {RINGS.map(({ key, r }) => {
          const c = 2 * Math.PI * r;
          const d = data[key] ?? { done: 0, due: 0 };
          const p = d.due > 0 ? Math.min(1, d.done / d.due) : 0;
          return (
            <g key={key} transform="rotate(-90 90 90)">
              <circle className="ring-track" cx="90" cy="90" r={r} />
              <circle 
                className="ring-fill" 
                cx="90" 
                cy="90" 
                r={r}
                strokeDasharray={c} 
                strokeDashoffset={c * (1 - p)} 
              />
            </g>
          );
        })}
        <g className="ring-lock" transform="translate(90 90)">
          <rect x="-9" y="-2" width="18" height="14" rx="3.5" />
          <path 
            className={weekClosed ? 'shackle is-open' : 'shackle'}
            d="M-5 -2 V-7 a5 5 0 0 1 10 0 V-2" 
          />
        </g>
      </svg>
      <ul className="ring-legend">
        {RINGS.map(({ key, label }) => (
          <li key={key} className="t-caption">{label}</li>
        ))}
      </ul>
    </div>
  );
}
