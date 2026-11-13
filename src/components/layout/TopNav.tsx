import React, { useState, useEffect } from 'react';
import { Search, Bell, SlidersHorizontal, Sparkles, LogOut, UserCheck, AlertTriangle, Volume2, VolumeX, Stethoscope, Clock } from 'lucide-react';
import { NavPage } from './Sidebar';
import { UserSession, DoctorShiftSession } from '@/types';

interface TopNavProps {
  currentPage: NavPage;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onOpenDemoControls: () => void;
  unreadAlertCount: number;
  onTriggerAlertView: () => void;
  onNavigateToShowcase: () => void;
  currentUser?: UserSession | null;
  onLogout?: () => void;
  onInjectP0?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  currentShift?: DoctorShiftSession;
  onOpenShiftModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onSearchChange,
  searchQuery,
  onOpenDemoControls,
  unreadAlertCount,
  onTriggerAlertView,
  onNavigateToShowcase,
  currentUser,
  onLogout,
  onInjectP0,
  isMuted = false,
  onToggleMute,
  currentShift,
  onOpenShiftModal,
}) => {
  const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
    overview: {
      title: 'AvoFlare Command Center',
      subtitle: 'Spatial tele-surveillance, PINN-ODE trajectory predictions & deterministic triage',
    },
    showcase: {
      title: 'AvoFlare Showcase Experience',
      subtitle: '7-Act clinical decompensation, zero-queue triage, PINN digital twin & security defense',
    },
    patients: {
      title: 'Individual Patient Tele-Surveillance',
      subtitle: 'Detailed physiological vitals, baseline delta & 4-vital component scoring',
    },
    clinical: {
      title: 'AvoFlare Clinical Intelligence Engine',
      subtitle: 'Context-adaptive clinical experts & deterministic decision pipeline',
    },
    'digital-twin': {
      title: 'AvoFlare Physiological Digital Twin',
      subtitle: 'Hybrid physics-informed neural ODE telemetry forecasting & 95% confidence corridors',
    },
    security: {
      title: 'Zero-Trust Clinical Security Operations',
      subtitle: 'Edge HMAC verification, nonce replay defense & signed telemetry payloads',
    },
    fhir: {
      title: 'HL7 FHIR R4 Interoperability & Synthea Clinical Reports',
      subtitle: 'Standardized US Core resources, structured diagnostic reports & full JSON export',
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

  const currentMeta = pageTitles[currentPage] || { title: 'AvoFlare', subtitle: '' };

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
    <header className="h-16 border-b border-[#E7ECE6]/80 backdrop-blur-2xl bg-white/80 sticky top-0 z-20 px-6 flex items-center justify-between gap-4 shadow-[0_4px_20px_-2px_rgba(25,59,50,0.03)]">
      {/* Title & subtitle */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-black text-[#193B32] truncate flex items-center gap-2">
          {currentMeta.title}
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A] border border-[#16866A]/20">
            LIVE STREAM
          </span>
        </h1>
        <p className="text-xs text-[#697B73] truncate hidden sm:block">
          {currentMeta.subtitle}
        </p>
      </div>

      {/* Right toolbar controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Showcase Demonstration Pill */}
        {currentPage !== 'showcase' && currentUser?.role === 'senior_doctor' && (
          <button
            onClick={onNavigateToShowcase}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16866A]/10 text-[#16866A] hover:bg-[#16866A] hover:text-white border border-[#16866A]/30 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Showcase</span>
          </button>
        )}

        {/* Search bar */}
        <div className="relative w-48 hidden md:block">
          <Search className="w-3.5 h-3.5 text-[#697B73] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/70 backdrop-blur-md border border-[#E7ECE6]/80 focus:outline-none focus:border-[#16866A] transition-colors text-[#193B32] placeholder-[#697B73]"
          />
        </div>

        {/* Current Time Display */}
        <div className="text-[11px] font-mono font-semibold text-[#697B73] px-2.5 py-1 rounded-xl bg-white/70 backdrop-blur-md border border-[#E7ECE6]/80 hidden lg:block min-w-[125px] text-center shadow-xs">
          {currentTime || '18:00:00 UTC'}
        </div>

        {/* Buzzer Sound Mute/Unmute Toggle */}
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
              isMuted 
                ? 'bg-[#F7F8F3] text-[#697B73] border-[#E7ECE6]' 
                : 'bg-[#16866A]/10 text-[#16866A] border-[#16866A]/30'
            }`}
            title={isMuted ? 'Alert buzzer muted — Click to unmute' : 'Alert buzzer active — Click to mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onTriggerAlertView}
          className="relative p-2 rounded-xl text-[#697B73] hover:text-[#193B32] hover:bg-[#F7F8F3] transition-colors cursor-pointer border border-[#E7ECE6]"
          title="Clinical Priority Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E45D58] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
              {unreadAlertCount}
            </span>
          )}
        </button>

        {/* Doctor Shift Session & Feedback Button */}
        {onOpenShiftModal && (
          <button
            onClick={onOpenShiftModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] hover:border-[#16866A] text-xs font-bold text-[#193B32] transition-all cursor-pointer shadow-xs active:scale-98"
            title="Open Shift Session & Provide Clinical Feedback"
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#16866A]" />
            <span className="hidden sm:inline">Doctor Shift</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#16866A]/10 text-[#16866A]">
              Active
            </span>
          </button>
        )}

        {/* 1-Click Inject P0 Critical Deterioration */}
        {onInjectP0 && (
          <button
            onClick={onInjectP0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E45D58] text-white hover:bg-[#c94540] text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
            title="Inject acute physiological decompensation on HG-001 (triggers P0 Urgent alert & buzzer)"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Inject P0 Urgent</span>
          </button>
        )}

        {/* Global Demo Controls Button */}
        <button
          onClick={onOpenDemoControls}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16866A] text-white hover:bg-[#126b55] text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Demo Controls</span>
        </button>

        {/* Role & Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Log out or switch RBAC role"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch Role</span>
          </button>
        )}
      </div>
    </header>
  );
};
