import React, { useState } from 'react';
import { 
  Building2, 
  Wallet, 
  PiggyBank, 
  HeartHandshake, 
  CheckCircle2, 
  Clock
} from 'lucide-react';

export type BucketStatus = 'done' | 'pending' | 'none';

export interface BucketData {
  amount: number;
  pct: number;
  status: BucketStatus;
}

export interface FlowTreeProps {
  income: number;
  buckets: {
    company?: BucketData;
    personal?: BucketData;
    savings?: BucketData;
    tithe?: BucketData;
    [key: string]: BucketData | undefined;
  };
  className?: string;
}

export function FlowTree({ income, buckets, className = '' }: FlowTreeProps) {
  const fmt = (n: number) => Number(n || 0).toLocaleString('en-KE');
  const [activeThorn, setActiveThorn] = useState<string | null>(null);

  const bCompany = buckets.company ?? { amount: 0, pct: 25, status: 'none' as BucketStatus };
  const bPersonal = buckets.personal ?? { amount: 0, pct: 25, status: 'none' as BucketStatus };
  const bSavings = buckets.savings ?? { amount: 0, pct: 10, status: 'none' as BucketStatus };
  const bTithe = buckets.tithe ?? { amount: 0, pct: 10, status: 'none' as BucketStatus };

  return (
    <div className={`flow-tree w-full flex flex-col items-center select-none ${className}`}>
      
      {/* MAIN VISUAL CANVAS: Pure transparent line-art floating directly on glass, with badges anchored on the thorns */}
      <div className="relative w-full max-w-4xl min-h-[300px] sm:min-h-[440px] md:min-h-[480px] flex items-center justify-center overflow-visible py-2 sm:py-4">
        
        {/* 1. CENTER: PURE TRANSPARENT LINE-ART ILLUSTRATION (NO BOX, NO FRAME, NO BORDER) */}
        <div className="relative z-10 w-full max-w-[240px] sm:max-w-[340px] md:max-w-[420px] flex items-center justify-center pointer-events-none">
          <picture className="w-full flex justify-center">
            <source srcSet="/christ-thorns-isolated.webp" type="image/webp" />
            <img 
              src="/christ-thorns-isolated.png" 
              alt="Authentic Jesus Christ Crown of Thorns Drawing - Shinzoo.com" 
              className="w-full h-auto max-h-[300px] sm:max-h-[440px] md:max-h-[500px] object-contain drop-shadow-xs opacity-95 transition-transform duration-500 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </picture>

          {/* Micro Thorn Anchor Nodes on the Crown itself */}
          {/* Thorn 1 Anchor: Top-Left Radiating Spikes (Company) */}
          <div 
            className={`absolute top-[20%] left-[23%] transition-all duration-300 ${
              activeThorn === 'company' ? 'scale-125' : 'opacity-85'
            }`}
          >
            <span className="absolute -inset-1 rounded-full bg-[var(--ok)]/25 animate-ping" />
            <span className="relative flex h-2.5 w-2.5 rounded-full bg-[var(--ok)] ring-2 ring-white/80" />
          </div>

          {/* Thorn 2 Anchor: Left Brow Forehead Thorns (Personal) */}
          <div 
            className={`absolute top-[27%] left-[32%] transition-all duration-300 ${
              activeThorn === 'personal' ? 'scale-125' : 'opacity-85'
            }`}
          >
            <span className="absolute -inset-1 rounded-full bg-[var(--line)]/25 animate-ping" />
            <span className="relative flex h-2.5 w-2.5 rounded-full bg-[var(--line)] ring-2 ring-white/80" />
          </div>

          {/* Thorn 3 Anchor: Upper-Right Crown Crest & Rising Thorns (Savings) */}
          <div 
            className={`absolute top-[18%] right-[30%] transition-all duration-300 ${
              activeThorn === 'savings' ? 'scale-125' : 'opacity-85'
            }`}
          >
            <span className="absolute -inset-1 rounded-full bg-[var(--pending)]/25 animate-ping" />
            <span className="relative flex h-2.5 w-2.5 rounded-full bg-[var(--pending)] ring-2 ring-white/80" />
          </div>

          {/* Thorn 4 Anchor: Right Cascading Crown Thorns (Tithe) */}
          <div 
            className={`absolute top-[26%] right-[22%] transition-all duration-300 ${
              activeThorn === 'tithe' ? 'scale-125' : 'opacity-85'
            }`}
          >
            <span className="absolute -inset-1 rounded-full bg-[var(--ok)]/25 animate-ping" />
            <span className="relative flex h-2.5 w-2.5 rounded-full bg-[var(--ok)] ring-2 ring-white/80" />
          </div>
        </div>

        {/* 2. DESKTOP / TABLET: FLOATING BADGES ANCHORED PRECISELY AROUND THE THORNS */}
        
        {/* --- BADGE 1: COMPANY RESERVE (Top-Left Thorn) --- */}
        <div 
          onMouseEnter={() => setActiveThorn('company')}
          onMouseLeave={() => setActiveThorn(null)}
          className={`hidden md:flex absolute top-[6%] left-[2%] lg:left-[5%] z-20 flex-col transition-all duration-200 cursor-pointer ${
            activeThorn === 'company' ? 'scale-[1.03]' : ''
          }`}
        >
          <div className="glass glass--pill px-4 py-2.5 flex items-center gap-3 border border-white/20 bg-white/06 backdrop-blur-xs shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:bg-white/14">
            <div className="w-8 h-8 rounded-full bg-[var(--ok)]/20 border border-[var(--ok)]/40 flex items-center justify-center text-[var(--ok)] shrink-0">
              <Building2 className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-bold tracking-wider text-[var(--text-3)] uppercase font-mono">
                  Company
                </span>
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/10 text-slate-900 font-bold">
                  {bCompany.pct}%
                </span>
                {bCompany.status === 'done' ? (
                  <CheckCircle2 className="w-3 h-3 text-[var(--ok)]" />
                ) : (
                  <Clock className="w-3 h-3 text-[var(--pending)]" />
                )}
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 tracking-tight">
                KES {fmt(bCompany.amount)}
              </div>
            </div>
          </div>
          {/* Subtle leader indicator pointing toward thorn anchor */}
          <div className="flex items-center justify-end pr-8 -mt-0.5">
            <svg width="40" height="20" viewBox="0 0 40 20" className="overflow-visible pointer-events-none opacity-60">
              <path d="M 10,0 L 32,18" fill="none" stroke="var(--line)" strokeWidth="1.2" strokeDasharray="2 2" />
              <circle cx="32" cy="18" r="2" fill="var(--ok)" />
            </svg>
          </div>
        </div>

        {/* --- BADGE 2: PERSONAL SALARY (Lower-Left Brow Thorn) --- */}
        <div 
          onMouseEnter={() => setActiveThorn('personal')}
          onMouseLeave={() => setActiveThorn(null)}
          className={`hidden md:flex absolute top-[36%] left-[0%] lg:left-[2%] z-20 flex-col transition-all duration-200 cursor-pointer ${
            activeThorn === 'personal' ? 'scale-[1.03]' : ''
          }`}
        >
          <div className="glass glass--pill px-4 py-2.5 flex items-center gap-3 border border-white/20 bg-white/06 backdrop-blur-xs shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:bg-white/14">
            <div className="w-8 h-8 rounded-full bg-slate-900/10 border border-slate-900/20 flex items-center justify-center text-slate-900 shrink-0">
              <Wallet className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-bold tracking-wider text-[var(--text-3)] uppercase font-mono">
                  Personal
                </span>
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/10 text-slate-900 font-bold">
                  {bPersonal.pct}%
                </span>
                {bPersonal.status === 'done' ? (
                  <CheckCircle2 className="w-3 h-3 text-[var(--ok)]" />
                ) : (
                  <Clock className="w-3 h-3 text-[var(--pending)]" />
                )}
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 tracking-tight">
                KES {fmt(bPersonal.amount)}
              </div>
            </div>
          </div>
          {/* Subtle leader indicator pointing toward brow thorn */}
          <div className="flex items-center justify-end pr-6 -mt-0.5">
            <svg width="45" height="15" viewBox="0 0 45 15" className="overflow-visible pointer-events-none opacity-60">
              <path d="M 8,0 L 40,12" fill="none" stroke="var(--line)" strokeWidth="1.2" strokeDasharray="2 2" />
              <circle cx="40" cy="12" r="2" fill="var(--line)" />
            </svg>
          </div>
        </div>

        {/* --- BADGE 3: BANKED SAVINGS (Upper-Right Crown Thorn) --- */}
        <div 
          onMouseEnter={() => setActiveThorn('savings')}
          onMouseLeave={() => setActiveThorn(null)}
          className={`hidden md:flex absolute top-[4%] right-[2%] lg:right-[5%] z-20 flex-col items-end transition-all duration-200 cursor-pointer ${
            activeThorn === 'savings' ? 'scale-[1.03]' : ''
          }`}
        >
          <div className="glass glass--pill px-4 py-2.5 flex items-center gap-3 border border-white/20 bg-white/06 backdrop-blur-xs shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:bg-white/14">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                {bSavings.status === 'done' ? (
                  <CheckCircle2 className="w-3 h-3 text-[var(--ok)]" />
                ) : (
                  <Clock className="w-3 h-3 text-[var(--pending)]" />
                )}
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/10 text-slate-900 font-bold">
                  {bSavings.pct}%
                </span>
                <span className="text-[10.5px] font-bold tracking-wider text-[var(--text-3)] uppercase font-mono">
                  Savings
                </span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 tracking-tight">
                KES {fmt(bSavings.amount)}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--pending)]/20 border border-[var(--pending)]/40 flex items-center justify-center text-[var(--pending)] shrink-0">
              <PiggyBank className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          {/* Subtle leader indicator pointing toward top-right thorn */}
          <div className="flex items-center justify-start pl-8 -mt-0.5">
            <svg width="40" height="20" viewBox="0 0 40 20" className="overflow-visible pointer-events-none opacity-60">
              <path d="M 30,0 L 8,18" fill="none" stroke="var(--line)" strokeWidth="1.2" strokeDasharray="2 2" />
              <circle cx="8" cy="18" r="2" fill="var(--pending)" />
            </svg>
          </div>
        </div>

        {/* --- BADGE 4: TITHE & GIVING (Right Cascade Thorn) --- */}
        <div 
          onMouseEnter={() => setActiveThorn('tithe')}
          onMouseLeave={() => setActiveThorn(null)}
          className={`hidden md:flex absolute top-[30%] right-[0%] lg:right-[2%] z-20 flex-col items-end transition-all duration-200 cursor-pointer ${
            activeThorn === 'tithe' ? 'scale-[1.03]' : ''
          }`}
        >
          <div className="glass glass--pill px-4 py-2.5 flex items-center gap-3 border border-white/20 bg-white/06 backdrop-blur-xs shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:bg-white/14">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                {bTithe.status === 'done' ? (
                  <CheckCircle2 className="w-3 h-3 text-[var(--ok)]" />
                ) : (
                  <Clock className="w-3 h-3 text-[var(--pending)]" />
                )}
                <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900/10 text-slate-900 font-bold">
                  {bTithe.pct}%
                </span>
                <span className="text-[10.5px] font-bold tracking-wider text-[var(--text-3)] uppercase font-mono">
                  Tithe
                </span>
              </div>
              <div className="text-sm font-bold font-mono text-slate-900 tracking-tight">
                KES {fmt(bTithe.amount)}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--ok)]/20 border border-[var(--ok)]/50 flex items-center justify-center text-[var(--ok)] shrink-0">
              <HeartHandshake className="w-4 h-4" strokeWidth={1.8} />
            </div>
          </div>
          {/* Subtle leader indicator pointing toward right thorn cascade */}
          <div className="flex items-center justify-start pl-6 -mt-0.5">
            <svg width="45" height="15" viewBox="0 0 45 15" className="overflow-visible pointer-events-none opacity-60">
              <path d="M 37,0 L 5,12" fill="none" stroke="var(--line)" strokeWidth="1.2" strokeDasharray="2 2" />
              <circle cx="5" cy="12" r="2" fill="var(--ok)" />
            </svg>
          </div>
        </div>

      </div>

      {/* 3. MOBILE (AND TABLET NARROW): CLEAN RESPONSIVE 4-BADGE PILL ROW */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:hidden pt-2">
        
        {/* Mobile Badge: Company */}
        <div className="glass glass--pill p-2.5 flex items-center gap-2 border border-white/20 bg-white/06 backdrop-blur-xs">
          <div className="w-6 h-6 rounded-full bg-[var(--ok)]/20 flex items-center justify-center text-[var(--ok)] shrink-0">
            <Building2 className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--text-3)] font-bold truncate">
              Company ({bCompany.pct}%)
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 truncate">
              KES {fmt(bCompany.amount)}
            </div>
          </div>
        </div>

        {/* Mobile Badge: Personal */}
        <div className="glass glass--pill p-2.5 flex items-center gap-2 border border-white/20 bg-white/06 backdrop-blur-xs">
          <div className="w-6 h-6 rounded-full bg-slate-900/10 flex items-center justify-center text-slate-900 shrink-0">
            <Wallet className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--text-3)] font-bold truncate">
              Personal ({bPersonal.pct}%)
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 truncate">
              KES {fmt(bPersonal.amount)}
            </div>
          </div>
        </div>

        {/* Mobile Badge: Savings */}
        <div className="glass glass--pill p-2.5 flex items-center gap-2 border border-white/20 bg-white/06 backdrop-blur-xs">
          <div className="w-6 h-6 rounded-full bg-[var(--pending)]/20 flex items-center justify-center text-[var(--pending)] shrink-0">
            <PiggyBank className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--text-3)] font-bold truncate">
              Savings ({bSavings.pct}%)
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 truncate">
              KES {fmt(bSavings.amount)}
            </div>
          </div>
        </div>

        {/* Mobile Badge: Tithe */}
        <div className="glass glass--pill p-2.5 flex items-center gap-2 border border-white/20 bg-white/06 backdrop-blur-xs">
          <div className="w-6 h-6 rounded-full bg-[var(--ok)]/20 flex items-center justify-center text-[var(--ok)] shrink-0">
            <HeartHandshake className="w-3 h-3" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--text-3)] font-bold truncate">
              Tithe ({bTithe.pct}%)
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 truncate">
              KES {fmt(bTithe.amount)}
            </div>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM FOOTER PILL: WEEKLY INFLOW ACCORDING TO SCRIPTURE */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/06 border border-white/20 backdrop-blur-xs mt-1">
        <span className="w-2 h-2 rounded-full bg-[var(--ok)] animate-pulse" />
        <span className="text-[11px] font-bold font-mono tracking-wider text-[var(--text-3)] uppercase">
          Weekly Inflow
        </span>
        <span className="text-xs text-[var(--text-3)] font-mono">·</span>
        <span className="text-xs font-bold font-mono text-slate-900">
          KES {fmt(income)}
        </span>
        <span className="text-[10px] text-slate-700 font-serif italic pl-1 border-l border-slate-300 hidden sm:inline">
          "Honor the Lord with your wealth" · Prov 3:9
        </span>
      </div>

    </div>
  );
}
