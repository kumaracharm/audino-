import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldAlert, 
  Activity, 
  FileText, 
  GitFork, 
  AlertTriangle, 
  CheckCircle2, 
  Zap,
  ArrowRight,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import { SHOWCASE_ACTS } from '@/data/showcase-acts';
import { ShowcaseAct, Patient, Priority } from '@/types';
import { NavPage } from '@/components/layout/Sidebar';

interface ShowcaseExperienceProps {
  currentActIndex: number;
  onSelectAct: (index: number) => void;
  onExecuteActAction: (act: ShowcaseAct) => void;
  onNavigateToModule: (module: NavPage) => void;
  onResetShowcase: () => void;
  patients: Patient[];
  selectedPatientId: string;
}

export const ShowcaseExperience: React.FC<ShowcaseExperienceProps> = ({
  currentActIndex,
  onSelectAct,
  onExecuteActAction,
  onNavigateToModule,
  onResetShowcase,
  patients,
  selectedPatientId,
}) => {
  const currentAct = SHOWCASE_ACTS[currentActIndex] || SHOWCASE_ACTS[0];
  const targetPatient = patients.find((p) => p.id === currentAct.targetPatientId) || patients[0];
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleNext = () => {
    if (currentActIndex < SHOWCASE_ACTS.length - 1) {
      onSelectAct(currentActIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentActIndex > 0) {
      onSelectAct(currentActIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Showcase Presentation Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#16866A]/10 rounded-2xl border border-[#E7ECE6] p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#16866A] text-white shadow-xs tracking-wider uppercase">
                EXECUTIVE SHOWCASE STORY
              </span>
              <span className="text-xs font-semibold text-[#16866A]">
                Deterministic 7-Act Clinical Walkthrough
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#193B32] mt-2 tracking-tight">
              A Patient Deteriorates After Discharge
            </h1>
            <p className="text-xs text-[#697B73] mt-1 max-w-2xl leading-relaxed">
              Step through the complete HEALTHGUARD clinical, intelligence, and edge-security journey from post-op baseline to acute decompensation, zero-queue emergency triage, digital-twin trajectory forecast, cyber attack interception, and HL7 FHIR R4 synchronization.
            </p>
          </div>

          {/* Stepper Navigation Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentActIndex === 0}
              className="p-2 rounded-xl border border-[#E7ECE6] bg-white hover:bg-[#FAFBF8] text-[#193B32] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
              title="Previous Act"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E7ECE6] text-xs font-bold font-mono text-[#193B32] shadow-xs">
              Act {currentActIndex + 1} of {SHOWCASE_ACTS.length}
            </div>
            <button
              onClick={handleNext}
              disabled={currentActIndex === SHOWCASE_ACTS.length - 1}
              className="p-2 rounded-xl border border-[#E7ECE6] bg-white hover:bg-[#FAFBF8] text-[#193B32] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
              title="Next Act"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onResetShowcase}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E7ECE6] bg-white hover:bg-[#FAFBF8] text-xs font-semibold text-[#697B73] hover:text-[#193B32] transition-all cursor-pointer shadow-xs ml-1"
              title="Reset Story"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* 7-Step Act Indicator Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {SHOWCASE_ACTS.map((act, idx) => {
            const isActive = idx === currentActIndex;
            const isCompleted = idx < currentActIndex;
            return (
              <button
                key={act.id}
                onClick={() => onSelectAct(idx)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#16866A] text-white border-[#16866A] shadow-sm'
                    : isCompleted
                    ? 'bg-white text-[#193B32] border-[#16866A]/40'
                    : 'bg-[#FAFBF8] text-[#697B73] border-[#E7ECE6] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>{act.actNumber}</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-[#16866A]" />}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                </div>
                <p className={`text-xs font-bold mt-1 line-clamp-1 ${isActive ? 'text-white' : 'text-[#193B32]'}`}>
                  {act.title.replace('The ', '')}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Act Detail Card */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[#E7ECE6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-[#16866A]/10 text-[#16866A]">
                {currentAct.actNumber} • {currentAct.tagline}
              </span>
              <span className="text-xs text-[#697B73]">
                Target: <strong>{currentAct.targetPatientId}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#193B32] mt-1.5">{currentAct.title}</h2>
            <p className="text-xs text-[#697B73] mt-1 max-w-3xl leading-relaxed">
              {currentAct.description}
            </p>
          </div>

          {currentAct.metricHighlight && (
            <div className="p-3.5 rounded-xl border border-[#E7ECE6] bg-[#FAFBF8] shrink-0 text-right min-w-[200px]">
              <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">
                {currentAct.metricHighlight.label}
              </span>
              <span className={`text-sm font-extrabold mt-0.5 block ${
                currentAct.metricHighlight.variant === 'coral' ? 'text-[#E45D58]' :
                currentAct.metricHighlight.variant === 'amber' ? 'text-[#E6A23C]' :
                'text-[#16866A]'
              }`}>
                {currentAct.metricHighlight.value}
              </span>
            </div>
          )}
        </div>

        {/* Narrative Bullets & Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#193B32] uppercase tracking-wider block">
              Clinical & Architectural Evidence
            </span>
            <div className="space-y-2">
              {currentAct.narrativeBullets.map((bullet, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16866A] shrink-0 mt-0.5" />
                  <span className="text-[#193B32] leading-relaxed">{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Patient Quick Telemetry State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#193B32] uppercase tracking-wider">
                Current Sensor Telemetry ({targetPatient.id})
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                targetPatient.priority === 'P0' ? 'bg-[#E45D58] text-white' :
                targetPatient.priority === 'P1' ? 'bg-[#E6A23C] text-white' :
                'bg-[#16866A] text-white'
              }`}>
                Priority: {targetPatient.priority}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
                <span className="text-[10px] text-[#697B73] block">Heart Rate</span>
                <span className={`text-xl font-black font-mono mt-0.5 block ${targetPatient.currentVitals.heartRate > 110 ? 'text-[#E45D58]' : 'text-[#193B32]'}`}>
                  {targetPatient.currentVitals.heartRate} bpm
                </span>
                <span className="text-[9px] text-[#697B73]">Baseline: 68</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
                <span className="text-[10px] text-[#697B73] block">Respiratory Rate</span>
                <span className={`text-xl font-black font-mono mt-0.5 block ${targetPatient.currentVitals.respiratoryRate >= 24 ? 'text-[#E45D58]' : 'text-[#193B32]'}`}>
                  {targetPatient.currentVitals.respiratoryRate} /min
                </span>
                <span className="text-[9px] text-[#697B73]">Baseline: 16</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
                <span className="text-[10px] text-[#697B73] block">Oxygen Saturation</span>
                <span className={`text-xl font-black font-mono mt-0.5 block ${targetPatient.currentVitals.spo2 <= 92 ? 'text-[#E45D58]' : 'text-[#16866A]'}`}>
                  {targetPatient.currentVitals.spo2}%
                </span>
                <span className="text-[9px] text-[#697B73]">Target: ≥96%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
                <span className="text-[10px] text-[#697B73] block">Body Temp</span>
                <span className={`text-xl font-black font-mono mt-0.5 block ${targetPatient.currentVitals.temperature >= 38.3 ? 'text-[#E45D58]' : 'text-[#193B32]'}`}>
                  {targetPatient.currentVitals.temperature.toFixed(1)}°C
                </span>
                <span className="text-[9px] text-[#697B73]">Norm: 36.8°C</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-[11px] text-[#697B73]">
              <strong className="text-[#193B32]">Discharge Summary:</strong> {targetPatient.dischargeContext}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-4 border-t border-[#E7ECE6] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExecuteActAction(currentAct)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#16866A] text-white hover:bg-[#126b55] transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Zap className="w-4 h-4" />
              <span>{currentAct.actionLabel}</span>
            </button>
            <button
              onClick={() => onNavigateToModule(currentAct.targetModule)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-[#E7ECE6] text-[#193B32] hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
            >
              <span>Explore {currentAct.targetModule.toUpperCase()} View</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#16866A]" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentActIndex < SHOWCASE_ACTS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#193B32] text-white hover:bg-[#254f43] transition-all cursor-pointer shadow-xs"
              >
                <span>Advance to Act {currentActIndex + 2}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onResetShowcase}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#16866A] text-white hover:bg-[#126b55] transition-all cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Showcase Complete • Restart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

