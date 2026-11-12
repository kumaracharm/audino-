import React, { useState, useEffect } from 'react';
import { Search, Bell, SlidersHorizontal, Sparkles } from 'lucide-react';
import { NavPage } from './Sidebar';

interface TopNavProps {
  currentPage: NavPage;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onOpenDemoControls: () => void;
  unreadAlertCount: number;
  onTriggerAlertView: () => void;
  onNavigateToShowcase: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onSearchChange,
  searchQuery,
  onOpenDemoControls,
  unreadAlertCount,
  onTriggerAlertView,
  onNavigateToShowcase,
}) => {
  const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
    overview: {
      title: 'Clinical Command Center',
      subtitle: 'Real-time cohort monitoring, telemetry ingestion & deterministic priority triage',
    },
    showcase: {
      title: 'Executive Showcase Demonstration',
      subtitle: '7-Act end-to-end clinical decompensation, zero-queue triage, PINN forecast & attack defense',
    },
    patients: {
      title: 'Individual Patient Tele-Surveillance',
      subtitle: 'Detailed physiological vitals, baseline delta & 4-vital component scoring',
    },
    clinical: {
      title: 'Clinical Intelligence Pipeline',
      subtitle: 'Expert physiological analysis & context-aware deterministic decision engine',
    },
    'digital-twin': {
      title: 'Physiological Digital Twin',
      subtitle: 'Hybrid physics-informed neural ODE telemetry forecasting & confidence bounds',
    },
    security: {
      title: 'Clinical Data Security Operations',
      subtitle: 'Edge HMAC verification, nonce replay defense & zero-trust payload validation',
    },
    fhir: {
      title: 'HL7 FHIR R4 Interoperability',
      subtitle: 'HAPI FHIR compliant resource explorer with live observation sync status',
    },
    recovery: {
      title: 'Post-Discharge Recovery Plans',
      subtitle: 'Milestone adherence, patient-reported symptoms & nurse care-protocol checklist',
    },
    performance: {
      title: 'System Architecture & Telemetry Throughput',
      subtitle: 'Ingestion pipeline latency (p50/p95/p99), worker queue health & Redis Streams',
    },
  };

  const currentMeta = pageTitles[currentPage] || { title: 'HealthGuard', subtitle: '' };

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds} UTC+5:30`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-[#E7ECE6] bg-white sticky top-0 z-20 px-6 flex items-center justify-between gap-4">
      {/* Title & subtitle */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-[#193B32] truncate flex items-center gap-2">
          {currentMeta.title}
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A] border border-[#16866A]/20">
            DEMO STREAM
          </span>
        </h1>
        <p className="text-xs text-[#697B73] truncate hidden sm:block">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Right toolbar controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Showcase Demonstration Pill */}
        {currentPage !== 'showcase' && (
          <button
            onClick={onNavigateToShowcase}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16866A]/10 text-[#16866A] hover:bg-[#16866A] hover:text-white border border-[#16866A]/30 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Showcase</span>
          </button>
        )}

        {/* Search bar */}
        <div className="relative w-52 hidden md:block">
          <Search className="w-3.5 h-3.5 text-[#697B73] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F7F8F3] border border-[#E7ECE6] focus:outline-none focus:border-[#16866A] transition-colors text-[#193B32] placeholder-[#697B73]"
          />
        </div>

        {/* Current Time Display */}
        <div className="text-[11px] font-mono font-medium text-[#697B73] px-2.5 py-1 rounded-lg bg-[#F7F8F3] border border-[#E7ECE6] hidden lg:block min-w-[125px] text-center">
          {currentTime || '18:00:00 UTC'}
        </div>

        {/* Notification Bell */}
        <button
          onClick={onTriggerAlertView}
          className="relative p-2 rounded-xl text-[#697B73] hover:text-[#193B32] hover:bg-[#F7F8F3] transition-colors cursor-pointer border border-[#E7ECE6]"
          title="Clinical Priority Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E45D58] text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadAlertCount}
            </span>
          )}
        </button>

        {/* Global Demo Controls Button */}
        <button
          onClick={onOpenDemoControls}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16866A] text-white hover:bg-[#126b55] text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Demo Controls</span>
        </button>
      </div>
    </header>
  );
};
