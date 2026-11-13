"use client";

import React from 'react';
import { Stethoscope, UserCheck, ShieldAlert, ExternalLink } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const ArchitectureNav: React.FC = () => {
  const pathname = usePathname();

  const portals = [
    {
      id: 'clinical',
      name: '1. Clinical Command Hub',
      role: 'Doctor / Nurse RBAC',
      localPort: 'http://localhost:3000',
      nextPath: '/',
      icon: Stethoscope,
      active: pathname === '/',
      badge: 'PORT 3000',
      color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/60',
    },
    {
      id: 'patient',
      name: '2. Patient Spatial Portal',
      role: 'Voice Check-in & Wave',
      localPort: 'http://localhost:3001',
      nextPath: '/patient',
      icon: UserCheck,
      active: pathname === '/patient',
      badge: 'PORT 3001',
      color: 'border-cyan-400 text-cyan-300 bg-cyan-950/60',
    },
    {
      id: 'chaos',
      name: '3. Chaos Monkey Hacker GUI',
      role: 'Adversarial Edge Simulator',
      localPort: 'http://localhost:3002',
      nextPath: '/chaos',
      icon: ShieldAlert,
      active: pathname === '/chaos',
      badge: 'PORT 3002',
      color: 'border-rose-500 text-rose-300 bg-rose-950/60',
    },
  ];

  return (
    <div className="bg-[#020617] text-white px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 text-xs shadow-lg">
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-white uppercase text-[11px]">
              PS-03 MULTI-PORT ISOLATED ARCHITECTURE
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ZERO-CRASH ISOLATION
            </span>
          </div>
          <span className="text-slate-400 text-[10px] hidden md:inline">
            Each portal runs on an independent port so attack loads or audio never impact clinical monitoring
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-2">
        {portals.map((p) => {
          const Icon = p.icon;
          return (
            <a
              key={p.id}
              href={p.localPort}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                p.active
                  ? `${p.color} font-bold shadow-xs`
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={`Switch to isolated service on ${p.badge}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.name}</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                :{p.badge.replace('PORT ', '')}
              </span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};
