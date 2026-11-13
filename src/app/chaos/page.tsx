"use client";

import React, { useState } from 'react';
import { ArchitectureNav } from '@/components/layout/ArchitectureNav';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Zap, 
  Flame, 
  RotateCcw,
  Key,
  Radio,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Sliders,
  Trash2,
  Activity
} from 'lucide-react';
import { SecurityEvent } from '@/types';
import { simulateAttack, AttackType } from '@/lib/security-simulator';

interface AttackCardConfig {
  id: AttackType;
  title: string;
  category: string;
  desc: string;
  stage: string;
  colorBorder: string;
  colorBg: string;
  colorBadge: string;
  colorText: string;
  icon: React.ElementType;
}

const ATTACK_VECTORS: AttackCardConfig[] = [
  {
    id: 'tampered-vital',
    title: 'HMAC Byte Modification',
    category: 'Data Tampering',
    desc: 'Flips SpO₂ telemetry byte from 98% down to 74% in transit. Blocked by HMAC-SHA256 digest validation.',
    stage: 'HMAC Signature Verification',
    colorBorder: 'border-rose-400 hover:border-rose-600',
    colorBg: 'bg-rose-50/60 hover:bg-rose-50',
    colorBadge: 'bg-rose-500 text-white',
    colorText: 'text-rose-700',
    icon: Flame,
  },
  {
    id: 'replayed-request',
    title: 'Nonce Replay Storm',
    category: 'Replay Attack',
    desc: 'Re-transmits stale observation packet to mask acute decompensation. Blocked by sliding-window Bloom filter.',
    stage: 'Nonce / Replay Protection',
    colorBorder: 'border-amber-400 hover:border-amber-600',
    colorBg: 'bg-amber-50/60 hover:bg-amber-50',
    colorBadge: 'bg-amber-500 text-white',
    colorText: 'text-amber-700',
    icon: RotateCcw,
  },
  {
    id: 'forged-identity',
    title: 'Rogue Device JWT ("alg: none")',
    category: 'Identity Spoofing',
    desc: 'Forges wearable identity header with unverified signature. Blocked by strict RS256 JWT policy gate.',
    stage: 'JWT Validation',
    colorBorder: 'border-purple-400 hover:border-purple-600',
    colorBg: 'bg-purple-50/60 hover:bg-purple-50',
    colorBadge: 'bg-purple-600 text-white',
    colorText: 'text-purple-700',
    icon: Key,
  },
  {
    id: 'expired-timestamp',
    title: 'Clock Skew Delta Drift',
    category: 'Time Drift Attack',
    desc: 'Injects validly signed packet with clock skew delta >300 seconds. Blocked by timestamp freshness validator.',
    stage: 'Timestamp Validation',
    colorBorder: 'border-sky-400 hover:border-sky-600',
    colorBg: 'bg-sky-50/60 hover:bg-sky-50',
    colorBadge: 'bg-sky-600 text-white',
    colorText: 'text-sky-700',
    icon: Radio,
  },
];

export default function ChaosMonkeyHackerPage() {
  const [events, setEvents] = useState<SecurityEvent[]>(() => [simulateAttack('tampered-vital')]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent>(() => simulateAttack('tampered-vital'));
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[*] Chaos Monkey Cyber Engine v2.4 initialized",
    "[*] Target Gateway: gateway.healthguard.local:8443 (Zero-Trust Armed)",
    "[+] Defense Pipeline: HMAC-SHA256 + Bloom Filter Nonces + RS256 Tokens",
    "[i] Vibrant mode armed. Ready to fire adversarial test packets.",
  ]);
  const [noiseLevel, setNoiseLevel] = useState<number>(15);
  const [isFiring, setIsFiring] = useState<boolean>(false);

  const fireAttack = (type: AttackType, title: string) => {
    setIsFiring(true);
    const newEvent = simulateAttack(type);
    setEvents((prev) => [newEvent, ...prev]);
    setSelectedEvent(newEvent);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const log = `[${time}] [!] VECTOR INJECTED: [${title}] -> Intercepted at [${newEvent.detectionStage}] -> Result: REJECTED (0ms Impact)`;
    setTerminalLogs((prev) => [log, ...prev.slice(0, 30)]);
    setTimeout(() => setIsFiring(false), 250);
  };

  const fireStressTest = () => {
    setIsFiring(true);
    ATTACK_VECTORS.forEach((v, idx) => {
      setTimeout(() => {
        fireAttack(v.id, v.title);
      }, idx * 180);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased">
      <ArchitectureNav />

      {/* VIBRANT HACKER CONSOLE HEADER (Light & Vibrant Colors) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-10 z-40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-200 shrink-0">
            <Zap className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                CHAOS MONKEY CYBER HACKER CONSOLE
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200 uppercase">
                ADVERSARIAL WEAPONRY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live Edge Attack Generator • Cryptographic Tampering • Zero-Trust Edge Verification
            </p>
          </div>
        </div>

        {/* Action Gauges */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fireStressTest}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600 text-xs font-bold shadow-md shadow-rose-200 transition-all cursor-pointer active:scale-98"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Fire Full Attack Wave</span>
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Firewall: 100% BLOCKED</span>
          </div>
        </div>
      </header>

      {/* VIBRANT 3-STEP PIPELINE STATUS BAR */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Zero-Trust Verification Pipeline:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 text-rose-800 font-bold border border-rose-200">
              <span>1. Hostile Packet Injected</span>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold border border-amber-200">
              <span>2. Gateway Interception (42ms)</span>
            </div>
            <span className="text-slate-400 font-bold">➔</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              <span>3. Dropped (0% Clinical Impact)</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl mx-auto p-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLUMNS: ATTACK VECTOR LAUNCHER */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-500" />
              Attack Vector Injection Arsenal
            </span>
            <span className="text-[11px] text-slate-500">Click any vector card to inject packet live</span>
          </div>

          {/* 4 Vibrant Attack Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ATTACK_VECTORS.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.id}
                  onClick={() => fireAttack(v.id, v.title)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group active:scale-98 ${v.colorBorder} ${v.colorBg}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${v.colorBadge}`}>
                        {v.category}
                      </span>
                      <Icon className={`w-5 h-5 ${v.colorText} group-hover:scale-110 transition-transform`} />
                    </div>
                    <h3 className={`text-xs font-black ${v.colorText}`}>
                      {v.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-bold">
                    <span className={v.colorText}>FIRE VECTOR</span>
                    <span className="text-xs group-hover:translate-x-1 transition-transform">⚡</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continuous RF Telemetry Noise Generator */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-800 font-bold flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-600" /> Hostile RF Telemetry Noise Channel
              </span>
              <span className="text-purple-700 font-bold font-mono px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                {noiseLevel}% Jitter
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Simulates hostile Bluetooth/Wi-Fi electromagnetic jitter on connected smartwatch telemetry.
            </p>
          </div>

          {/* Clean Live Terminal Output Stream */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm space-y-2 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                Live Chaos Monkey Audit Stream
              </span>
              <button
                onClick={() => setTerminalLogs(["[*] Terminal cleared."])}
                className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <div className="h-44 overflow-y-auto space-y-1 text-[11px] text-slate-800">
              {terminalLogs.map((log, i) => (
                <div key={i} className={`leading-tight ${log.includes('ATTACK') ? 'text-rose-600 font-bold' : log.includes('Zero-Trust') ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS: INTERCEPTED PACKET INSPECTOR (VIBRANT LIGHT STYLING) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              Intercepted Packet Inspector
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
              ID: {selectedEvent.id}
            </span>
          </div>

          {/* Inspection Card with Vibrant Details */}
          <div className="p-5 rounded-2xl bg-white border-2 border-purple-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Attack Category:</span>
              <span className="text-rose-600 font-bold">{selectedEvent.attackCategory}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Interception Stage:</span>
              <span className="text-purple-700 font-bold">{selectedEvent.detectionStage}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Clinical Impact:</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                NONE (0% Contamination)
              </span>
            </div>

            {/* Before vs After Packet Diff Box */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-600 uppercase font-bold block">Tampered Telemetry Payload:</span>
              <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-800 overflow-x-auto leading-relaxed">
{selectedEvent.packetDump?.rawPayload || '{"patientId":"HG-001","vitals":{"hr":72,"rr":16,"spo2":74,"temp":36.8}}'}
              </pre>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-600 uppercase font-bold block">Zero-Trust Rejection Reason:</span>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs leading-relaxed">
                {selectedEvent.packetDump?.rejectionReason || 'Payload tampered in transit: HMAC digest validation failed.'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono space-y-1">
              <div>✓ Edge mTLS: Mutual TLS Authenticated</div>
              <div className="text-rose-600 font-bold">✗ Gateway Check: REJECTED AT FIREWALL</div>
              <div className="text-emerald-700 font-bold">✓ Clinical Quarantine: 100% Protected</div>
            </div>
          </div>

          {/* Recent Interception Queue */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-800 block mb-1">
              Recent Interceptions ({events.length})
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-all border ${
                    selectedEvent.id === evt.id
                      ? 'bg-purple-50 border-purple-400 font-bold text-purple-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate max-w-[180px]">{evt.attackCategory}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                    REJECTED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
