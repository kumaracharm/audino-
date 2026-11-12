import React from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Heart, 
  Wind, 
  Droplets, 
  Thermometer, 
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Patient, Priority, VitalReading } from '@/types';
import { calculateScore, ScoreResult } from '@/lib/scoring';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface PatientMonitoringViewProps {
  patient: Patient;
  onReturnToOverview: () => void;
  onSimulateNewObservation: () => void;
  onSimulateAbnormalObservation: () => void;
  isMounted: boolean;
}

export const PatientMonitoringView: React.FC<PatientMonitoringViewProps> = ({
  patient,
  onReturnToOverview,
  onSimulateNewObservation,
  onSimulateAbnormalObservation,
  isMounted
}) => {
  const clinicalScore: ScoreResult = React.useMemo(() => {
    const v = patient.currentVitals;
    return calculateScore(v.heartRate, v.respiratoryRate, v.spo2, v.temperature, patient.age);
  }, [patient]);

  const chartData = React.useMemo(() => {
    return patient.vitalHistory.map((v, i) => {
      const date = new Date(v.timestamp);
      return {
        idx: i + 1,
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        heartRate: v.heartRate,
        respiratoryRate: v.respiratoryRate,
        spo2: v.spo2,
        temperature: v.temperature,
      };
    });
  }, [patient]);

  const renderPriorityBadge = (priority: Priority | 'Requires context') => {
    switch (priority) {
      case 'P0':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E45D58] text-white shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            P0 Urgent Triage
          </span>
        );
      case 'P1':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6A23C] text-white">
            P1 Clinician Review
          </span>
        );
      case 'P2':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#16866A] text-white">
            P2 Routine Monitoring
          </span>
        );
      case 'P3':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#3AA99B] text-white">
            P3 Background Surveillance
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
    <div className="space-y-6">
      {/* Top Patient Header Bar */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onReturnToOverview}
            className="p-2 rounded-xl border border-[#E7ECE6] hover:bg-[#F7F8F3] text-[#697B73] hover:text-[#193B32] transition-colors cursor-pointer"
            title="Return to Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-[#193B32]">{patient.id}</h2>
              {renderPriorityBadge(patient.priority)}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                Age {patient.age}y • Group: {clinicalScore.ageGroup}
              </span>
            </div>
            <p className="text-xs text-[#697B73] mt-1">
              Recovery Stage: <strong className="text-[#193B32]">{patient.recoveryStage}</strong> • Monitoring Status: <span className="text-[#16866A] font-semibold">{patient.monitoringStatus}</span> • Last Sync: {new Date(patient.lastObservation).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateNewObservation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#16866A] text-white hover:bg-[#126b55] transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Generate Reading</span>
          </button>
          <button
            onClick={onSimulateAbnormalObservation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E45D58] text-white hover:bg-[#cf4d48] transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Deterioration</span>
          </button>
        </div>
      </div>

      {/* 4 Large Vital Sign Cards with Reference Ranges and Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#697B73] uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#E45D58]" /> Heart Rate
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              clinicalScore.hrScore > 0 ? 'bg-[#E45D58]/10 text-[#E45D58]' : 'bg-[#16866A]/10 text-[#16866A]'
            }`}>
              Score: +{clinicalScore.hrScore}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#193B32]">
              {patient.currentVitals.heartRate}
            </span>
            <span className="text-xs font-semibold text-[#697B73]">beats / min</span>
          </div>
          <p className="text-[11px] text-[#697B73]">Ref range: 51–90 bpm (score 0)</p>
          <div className="h-14 w-full pt-1">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="heartRate" stroke="#E45D58" strokeWidth={2} fill="#E45D58" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#697B73] uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-[#3AA99B]" /> Resp Rate
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              clinicalScore.rrScore > 0 ? 'bg-[#E45D58]/10 text-[#E45D58]' : 'bg-[#16866A]/10 text-[#16866A]'
            }`}>
              Score: +{clinicalScore.rrScore}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#193B32]">
              {patient.currentVitals.respiratoryRate}
            </span>
            <span className="text-xs font-semibold text-[#697B73]">breaths / min</span>
          </div>
          <p className="text-[11px] text-[#697B73]">Ref range: 12–20 bpm (score 0)</p>
          <div className="h-14 w-full pt-1">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="respiratoryRate" stroke="#3AA99B" strokeWidth={2} fill="#3AA99B" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SpO2 */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#697B73] uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#16866A]" /> Oxygen Saturation
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              clinicalScore.spo2Score > 0 ? 'bg-[#E45D58]/10 text-[#E45D58]' : 'bg-[#16866A]/10 text-[#16866A]'
            }`}>
              Score: +{clinicalScore.spo2Score}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#193B32]">
              {patient.currentVitals.spo2}%
            </span>
            <span className="text-xs font-semibold text-[#697B73]">SpO₂</span>
          </div>
          <p className="text-[11px] text-[#697B73]">Target range: ≥96% (score 0)</p>
          <div className="h-14 w-full pt-1">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="spo2" stroke="#16866A" strokeWidth={2} fill="#16866A" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#697B73] uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-[#E6A23C]" /> Temperature
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              clinicalScore.tempScore > 0 ? 'bg-[#E45D58]/10 text-[#E45D58]' : 'bg-[#16866A]/10 text-[#16866A]'
            }`}>
              Score: +{clinicalScore.tempScore}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-[#193B32]">
              {patient.currentVitals.temperature.toFixed(1)}°
            </span>
            <span className="text-xs font-semibold text-[#697B73]">Celsius</span>
          </div>
          <p className="text-[11px] text-[#697B73]">Ref range: 36.1–38.0°C (score 0)</p>
          <div className="h-14 w-full pt-1">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Area type="monotone" dataKey="temperature" stroke="#E6A23C" strokeWidth={2} fill="#E6A23C" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Split: Patient Medical Context (Left) + Deterministic Clinical Assessment Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Context & Baseline */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
              <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#16866A]" />
                Patient Medical Context & Baseline Profile
              </h3>
              <span className="text-[11px] font-semibold text-[#16866A] bg-[#16866A]/10 px-2 py-0.5 rounded">
                EHR Synchronized
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#193B32] block mb-1">Discharge Context & Clinical Summary:</span>
                <p className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-[#193B32] leading-relaxed">
                  {patient.dischargeContext}
                </p>
              </div>

              <div>
                <span className="font-bold text-[#193B32] block mb-1">Diagnosed Comorbidities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {patient.conditions.map((cond, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#16866A]/10 text-[#16866A] font-semibold text-xs border border-[#16866A]/20"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-[#193B32] block mb-1">Discharge Recovery Baseline:</span>
                <div className="p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] font-mono text-[11px] text-[#193B32]">
                  {patient.recoveryBaseline}
                </div>
              </div>

              <div>
                <span className="font-bold text-[#193B32] block mb-1">Clinical Surveillance Instructions:</span>
                <p className="text-[11px] text-[#697B73] italic">
                  {patient.monitoringNotes}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline of Recent Clinical Observations */}
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#193B32] mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#16866A]" />
              Observation History Audit Trail (Latest 5 Events)
            </h3>
            <div className="space-y-2">
              {patient.vitalHistory.slice(-5).reverse().map((reading, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-xs flex items-center justify-between font-mono"
                >
                  <span className="text-[#697B73]">{new Date(reading.timestamp).toLocaleTimeString()}</span>
                  <span className="text-[#193B32] font-semibold">
                    HR {reading.heartRate} | RR {reading.respiratoryRate} | SpO₂ {reading.spo2}% | {reading.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-[10px] text-[#16866A] bg-white px-2 py-0.5 rounded border border-[#E7ECE6]">
                    Signed HMAC-SHA256
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Deterministic 4-Vital Partial NEWS2 Assessment Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
              <div>
                <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#16866A]" />
                  Partial NEWS2 Component Assessment
                </h3>
                <p className="text-[11px] text-[#697B73] mt-0.5">
                  Calculated using max individual component score (0-3 scale)
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-[#16866A]/10 text-[#16866A]">
                Max Score: {clinicalScore.maxScore} / 3
              </span>
            </div>

            {/* Individual component scoring breakdown */}
            <div className="space-y-2.5">
              {clinicalScore.components.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#193B32]">{comp.name}</span>
                      <span className="font-mono text-[#697B73] font-semibold">{comp.value}</span>
                    </div>
                    <p className="text-[10px] text-[#697B73] mt-0.5">{comp.range}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                      comp.score === 3 ? 'bg-[#E45D58] text-white' :
                      comp.score === 2 ? 'bg-[#E6A23C] text-white' :
                      comp.score === 1 ? 'bg-amber-100 text-amber-800' :
                      'bg-[#16866A]/10 text-[#16866A]'
                    }`}>
                      +{comp.score} points
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Routing Result Explanation Box */}
            <div className="p-4 rounded-xl bg-[#16866A]/5 border border-[#16866A]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16866A] uppercase tracking-wider">
                  Deterministic Priority Routing Result
                </span>
                {renderPriorityBadge(clinicalScore.priority)}
              </div>
              <p className="text-xs text-[#193B32] leading-relaxed">
                {clinicalScore.explanation}
              </p>
              <div className="pt-2 border-t border-[#16866A]/15 text-[10px] text-[#697B73]">
                * Prototype Policy Rule: Max component 3 → P0; Score 2 & age 50+ → P0; Score 2 & age &lt;50 → P1; Score 1 & age 50+ → P1; Score ≤1 & age &lt;50 → P2.
              </div>
            </div>

            {/* Important Clinical Disclaimer */}
            <div className="p-3 rounded-xl bg-gray-50 border border-[#E7ECE6] text-[11px] text-[#697B73] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16866A] shrink-0 mt-0.5" />
              <p>
                <strong>Evaluation Protocol Notice:</strong> This is a 4-vital partial NEWS2 component demonstration calculation. It does not replace full clinical evaluation and is not validated for unsupervised diagnostic treatment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
