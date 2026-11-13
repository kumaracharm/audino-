import React from 'react';
import { 
  X, 
  ChevronRight, 
  Activity, 
  Heart, 
  Wind, 
  Droplets, 
  Thermometer, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
  Download,
  Stethoscope
} from 'lucide-react';
import { Patient, Priority } from '@/types';
import { calculateScore } from '@/lib/scoring';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatTimeSafe, formatHourMinuteSafe } from '@/lib/date-utils';
import { MinecraftAvatar } from '../common/MinecraftAvatar';

interface PatientDetailDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullDetail: (patientId: string) => void;
  onSimulateNewObservation: () => void;
  onSimulateDeterioration: () => void;
  isMounted: boolean;
  onOpenDoctorFeedback?: (patientId: string) => void;
}

export const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({
  patient,
  isOpen,
  onClose,
  onNavigateToFullDetail,
  onSimulateNewObservation,
  onSimulateDeterioration,
  isMounted,
  onOpenDoctorFeedback,
}) => {
  if (!isOpen || !patient) return null;

  const score = calculateScore(
    patient.currentVitals.heartRate,
    patient.currentVitals.respiratoryRate,
    patient.currentVitals.spo2,
    patient.currentVitals.temperature,
    patient.age
  );

  const chartData = patient.vitalHistory.map((v, i) => ({
    idx: i + 1,
    time: formatHourMinuteSafe(v.timestamp),
    heartRate: v.heartRate,
    respiratoryRate: v.respiratoryRate,
    spo2: v.spo2,
    temperature: v.temperature,
  }));

  const renderBadge = (priority: Priority | 'Requires context') => {
    switch (priority) {
      case 'P0':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E45D58] text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            P0 Urgent Triage
          </span>
        );
      case 'P1':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6A23C] text-white">
            P1 Review
          </span>
        );
      case 'P2':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#16866A] text-white">
            P2 Routine
          </span>
        );
      case 'P3':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#3AA99B] text-white">
            P3 Background
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
            {priority}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/35 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl backdrop-blur-2xl bg-white/90 h-full shadow-2xl flex flex-col justify-between border-l border-white/80 animate-in slide-in-from-right duration-250 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Minecraft Avatar */}
        <div className="p-6 border-b border-[#E7ECE6]/80 bg-white/70 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MinecraftAvatar patientId={patient.id} size={48} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#193B32]">{patient.id}</h3>
                {renderBadge(patient.priority)}
              </div>
              <p className="text-xs text-[#697B73] mt-0.5">
                Age {patient.age}y • Recovery: <strong className="text-[#193B32]">{patient.recoveryStage}</strong> • Synced: {formatTimeSafe(patient.lastObservation)}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#697B73] hover:text-[#193B32] hover:bg-[#E7ECE6] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Vital Sign Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-center">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-[#E45D58]" /> HR
              </span>
              <span className="text-lg font-bold font-mono text-[#193B32] block mt-1">
                {patient.currentVitals.heartRate}
              </span>
              <span className="text-[9px] text-[#697B73]">bpm</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-center">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block flex items-center justify-center gap-1">
                <Wind className="w-3 h-3 text-[#3AA99B]" /> RR
              </span>
              <span className="text-lg font-bold font-mono text-[#193B32] block mt-1">
                {patient.currentVitals.respiratoryRate}
              </span>
              <span className="text-[9px] text-[#697B73]">/min</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-center">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block flex items-center justify-center gap-1">
                <Droplets className="w-3 h-3 text-[#16866A]" /> SpO₂
              </span>
              <span className="text-lg font-bold font-mono text-[#193B32] block mt-1">
                {patient.currentVitals.spo2}%
              </span>
              <span className="text-[9px] text-[#697B73]">sat</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-center">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block flex items-center justify-center gap-1">
                <Thermometer className="w-3 h-3 text-[#E6A23C]" /> Temp
              </span>
              <span className="text-lg font-bold font-mono text-[#193B32] block mt-1">
                {patient.currentVitals.temperature.toFixed(1)}°
              </span>
              <span className="text-[9px] text-[#697B73]">Celsius</span>
            </div>
          </div>

          {/* Quick NEWS2 Scoring Summary */}
          <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#193B32]">Partial NEWS2 Assessment</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#16866A]/10 text-[#16866A]">
                Max Score: +{score.maxScore}
              </span>
            </div>
            <p className="text-xs text-[#697B73] leading-relaxed">
              {score.explanation}
            </p>
          </div>

          {/* Sparkline Waveform */}
          <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] space-y-2">
            <span className="text-xs font-bold text-[#193B32] block">Telemetry Trend</span>
            <div className="h-28 w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="heartRate" stroke="#E45D58" strokeWidth={2} fill="#E45D58" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Clinical Discharge Summary */}
          <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-2 text-xs">
            <span className="font-bold text-[#193B32] block">Clinical Context</span>
            <p className="text-[#697B73] leading-relaxed">
              {patient.dischargeContext}
            </p>
            <div className="pt-2 border-t border-[#E7ECE6] flex flex-wrap gap-1.5">
              {patient.conditions.map((c, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white border border-[#E7ECE6] text-[10px] font-semibold text-[#193B32]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-5 border-t border-[#E7ECE6] bg-[#FAFBF8] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={`/api/patients/${patient.id}/fhir-export`}
              download={`fhir-bundle-${patient.id}.json`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
              title="Download authorized FHIR bundle"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>FHIR R4</span>
            </a>

            {onOpenDoctorFeedback && (
              <button
                onClick={() => {
                  onOpenDoctorFeedback(patient.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#16866A]/10 text-[#16866A] border border-[#16866A]/30 hover:bg-[#16866A] hover:text-white transition-all cursor-pointer"
                title="Enter physician impression & action directives"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Provide Shift Feedback</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onNavigateToFullDetail(patient.id);
              onClose();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16866A] text-white hover:bg-[#126b55] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <span>Open Dedicated Patient Workspace</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
