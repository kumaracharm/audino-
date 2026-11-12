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
  Sparkles
} from 'lucide-react';
import { Patient, Priority } from '@/types';
import { calculateScore } from '@/lib/scoring';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatTimeSafe, formatHourMinuteSafe } from '@/lib/date-utils';

interface PatientDetailDrawerProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullDetail: (patientId: string) => void;
  onSimulateNewObservation: () => void;
  onSimulateDeterioration: () => void;
  isMounted: boolean;
}

export const PatientDetailDrawer: React.FC<PatientDetailDrawerProps> = ({
  patient,
  isOpen,
  onClose,
  onNavigateToFullDetail,
  onSimulateNewObservation,
  onSimulateDeterioration,
  isMounted,
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
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E7ECE6] animate-in slide-in-from-right duration-250 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E7ECE6] bg-[#FAFBF8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16866A] to-[#3AA99B] flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              {patient.id.replace('HG-', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#193B32]">{patient.id}</h2>
                {renderBadge(patient.priority)}
              </div>
              <p className="text-xs text-[#697B73] mt-0.5">
                Age {patient.age}y • Stage: <strong className="text-[#193B32]">{patient.recoveryStage}</strong> • Status: <span className="text-[#16866A] font-semibold">{patient.monitoringStatus}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-[#E7ECE6] hover:bg-white text-[#697B73] hover:text-[#193B32] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Action Trigger Bar */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <button
              onClick={onSimulateNewObservation}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-[#16866A] text-white hover:bg-[#126b55] transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Normal Pulse</span>
            </button>
            <button
              onClick={onSimulateDeterioration}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-[#E45D58] text-white hover:bg-[#cf4d48] transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Inject Deterioration</span>
            </button>
          </div>

          {/* 4 Vital Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <div className="flex items-center justify-between text-xs text-[#697B73]">
                <span className="flex items-center gap-1 font-semibold text-[#193B32]">
                  <Heart className="w-3.5 h-3.5 text-[#E45D58]" /> Heart Rate
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${score.hrScore > 0 ? 'bg-[#E45D58]/10 text-[#E45D58]' : 'bg-[#16866A]/10 text-[#16866A]'}`}>
                  Score +{score.hrScore}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-[#193B32]">{patient.currentVitals.heartRate}</span>
                <span className="text-xs text-[#697B73]">bpm</span>
              </div>
              <span className="text-[10px] text-[#697B73] block mt-0.5">Ref: 51-90 bpm (baseline: 68)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <div className="flex items-center justify-between text-xs text-[#697B73]">
                <span className="flex items-center gap-1 font-semibold text-[#193B32]">
                  <Wind className="w-3.5 h-3.5 text-[#3AA99B]" /> Resp Rate
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${score.rrScore > 0 ? 'bg-[#E45D58]/10 text-[#E45D58]' : 'bg-[#16866A]/10 text-[#16866A]'}`}>
                  Score +{score.rrScore}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-[#193B32]">{patient.currentVitals.respiratoryRate}</span>
                <span className="text-xs text-[#697B73]">/min</span>
              </div>
              <span className="text-[10px] text-[#697B73] block mt-0.5">Ref: 12-20 /min (baseline: 16)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <div className="flex items-center justify-between text-xs text-[#697B73]">
                <span className="flex items-center gap-1 font-semibold text-[#193B32]">
                  <Droplets className="w-3.5 h-3.5 text-[#16866A]" /> Oxygen Saturation
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${score.spo2Score > 0 ? 'bg-[#E45D58]/10 text-[#E45D58]' : 'bg-[#16866A]/10 text-[#16866A]'}`}>
                  Score +{score.spo2Score}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-[#193B32]">{patient.currentVitals.spo2}%</span>
                <span className="text-xs text-[#697B73]">SpO₂</span>
              </div>
              <span className="text-[10px] text-[#697B73] block mt-0.5">Target: ≥96% (baseline: 97%)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <div className="flex items-center justify-between text-xs text-[#697B73]">
                <span className="flex items-center gap-1 font-semibold text-[#193B32]">
                  <Thermometer className="w-3.5 h-3.5 text-[#E6A23C]" /> Core Temp
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${score.tempScore > 0 ? 'bg-[#E45D58]/10 text-[#E45D58]' : 'bg-[#16866A]/10 text-[#16866A]'}`}>
                  Score +{score.tempScore}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono text-[#193B32]">{patient.currentVitals.temperature.toFixed(1)}°</span>
                <span className="text-xs text-[#697B73]">Celsius</span>
              </div>
              <span className="text-[10px] text-[#697B73] block mt-0.5">Norm: 36.1-38.0°C (baseline: 36.8)</span>
            </div>
          </div>

          {/* Partial NEWS2 Deterministic Score Details */}
          <div className="p-4 rounded-xl bg-[#16866A]/5 border border-[#16866A]/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#16866A] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Deterministic 4-Vital Assessment
              </span>
              <span className="text-xs font-bold text-[#193B32]">Max Component: {score.maxScore} / 3</span>
            </div>
            <p className="text-xs text-[#193B32] leading-relaxed">
              {score.explanation}
            </p>
          </div>

          {/* Multi-Vital Trend Area */}
          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#193B32]">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#16866A]" /> Observation Waveform Trend
              </span>
              <span className="text-[10px] text-[#697B73]">Last 20 Samples</span>
            </div>
            <div className="h-32 w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="drawerHrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16866A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16866A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 9, fill: '#697B73' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                    <Area type="monotone" dataKey="heartRate" stroke="#16866A" strokeWidth={2} fillOpacity={1} fill="url(#drawerHrGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Clinical Context & Comorbidities */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-[#193B32] block">Clinical Discharge Diagnosis:</span>
            <p className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-[#193B32] leading-relaxed">
              {patient.dischargeContext}
            </p>

            <span className="font-bold text-[#193B32] block pt-1">Active Comorbidities:</span>
            <div className="flex flex-wrap gap-1.5">
              {patient.conditions.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-[#16866A]/10 text-[#16866A] font-semibold text-xs border border-[#16866A]/20">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with Deep Navigation */}
        <div className="p-4 border-t border-[#E7ECE6] bg-[#FAFBF8] flex items-center justify-between">
          <span className="text-xs text-[#697B73]">Last Sync: {formatTimeSafe(patient.lastObservation)}</span>
          <button
            onClick={() => {
              onNavigateToFullDetail(patient.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#16866A] text-white hover:bg-[#126b55] transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <span>Open Comprehensive Record</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

