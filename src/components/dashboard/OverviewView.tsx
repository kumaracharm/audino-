import React, { useMemo, useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ShieldCheck,
  Clock,
  ChevronRight,
  Heart,
  Wind,
  Droplets,
  Thermometer,
  Zap,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  ShieldAlert,
  Sliders,
  Filter,
  Stethoscope,
  BellRing,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { Patient, Priority, ActivityEvent, UserSession } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { formatTimeSafe, formatHourMinuteSafe } from '@/lib/date-utils';
import { MinecraftAvatar } from '../common/MinecraftAvatar';

interface OverviewViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  onOpenPatientDrawer: (patient: Patient) => void;
  onNavigateToPatientDetail: (id: string) => void;
  onNavigateToShowcase: () => void;
  activityEvents: ActivityEvent[];
  stats: {
    total: number;
    urgent: number;
    review: number;
    routine: number;
  };
  onSimulateNewObservation: () => void;
  onSimulateUrgentEvent: () => void;
  isMounted: boolean;
  currentUser?: UserSession | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onOpenPatientDrawer,
  onNavigateToPatientDetail,
  onNavigateToShowcase,
  activityEvents,
  stats,
  onSimulateNewObservation,
  onSimulateUrgentEvent,
  isMounted,
  currentUser,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'P0' | 'P1' | 'P2' | 'P3'>('ALL');
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Role-Aware Patient Sorting: Doctors see high-risk (P0/P1) first!
  const sortedPatients = useMemo(() => {
    if (currentUser?.role === 'doctor') {
      const priorityOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return [...patients].sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));
    }
    return patients;
  }, [patients, currentUser]);

  const filteredCohort = useMemo(() => {
    if (priorityFilter === 'ALL') return sortedPatients;
    return sortedPatients.filter(p => p.priority === priorityFilter);
  }, [sortedPatients, priorityFilter]);

  const renderPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'P0':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E45D58] text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            P0 Urgent
          </span>
        );
      case 'P1':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6A23C] text-white">
            P1 Review
          </span>
        );
      case 'P2':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#16866A] text-white">
            P2 Stable
          </span>
        );
      case 'P3':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3AA99B] text-white">
            P3 Routine
          </span>
        );
      default:
        return null;
    }
  };

  const chartData = useMemo(() => {
    if (!selectedPatient) return [];
    return selectedPatient.vitalHistory.map((v, i) => {
      return {
        idx: i + 1,
        time: formatHourMinuteSafe(v.timestamp),
        heartRate: v.heartRate,
        respiratoryRate: v.respiratoryRate,
        spo2: v.spo2,
        temperature: v.temperature,
      };
    });
  }, [selectedPatient]);

  return (
    <div className="space-y-6">
      {/* ROLE-AWARE TAILORED DECISION SUPPORT BANNERS (Reduced text, glanceable in 5s) */}

      {/* 1. DOCTOR QUICK DECISION SUPPORT (High Risk Focus, Zero Fluff) */}
      {currentUser?.role === 'doctor' && (
        <div className="bg-gradient-to-r from-purple-50 via-white to-blue-50 border-2 border-purple-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-purple-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Attending Physician Rapid Triage (Glanceable in &lt;10s)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              P0 High-Acuity Sorted First
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-rose-600 block uppercase">Critical Decompensation</span>
              <p className="font-bold text-slate-800 mt-0.5">HG-001 (Clora) • SpO₂ 90% (↓8%)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">CHF exacerbation. HR 136 bpm, RR 27.</p>
              <button
                onClick={() => onNavigateToPatientDetail('HG-001')}
                className="mt-2 text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Review & Order Adjustment →</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-amber-600 block uppercase">Check-in Symptom Flag</span>
              <p className="font-bold text-slate-800 mt-0.5">HG-003 (Dennis) • Dyspnea via Voice</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Reported skipped evening diuretic.</p>
              <button
                onClick={() => onNavigateToPatientDetail('HG-003')}
                className="mt-2 text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Inspect Correlated Wave →</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white border border-purple-100 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 block uppercase">Stable Stepdown Cohort</span>
              <p className="font-bold text-slate-800 mt-0.5">8 Patients Baseline Maintained</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No acute neural ODE drift forecasted.</p>
              <div className="mt-2 text-[10px] text-slate-400 font-medium">All vital guardrails intact</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PHEON / WARD ATTENDANT SIMPLE OPERATIONAL BAR */}
      {currentUser?.role === 'pheon' && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold text-emerald-900 text-xs block">
                Ward A Operational First-Response: 4 Patients Assigned
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Monitor wearable connectivity and missed morning updates. Do not diagnose — escalate urgent alerts immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => alert("Nurse Sarah Jenkins, RN notified: Attendant Marcus Ward flagged Ward A review.")}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>1-Click Escalate to Nurse</span>
          </button>
        </div>
      )}

      {/* 3. NURSE CLINICAL TRIAGE BAR */}
      {currentUser?.role === 'nurse' && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-blue-700 shrink-0" />
            <div>
              <span className="font-bold text-blue-900 text-xs block">
                Clinical Triage Queue: 1 Urgent P0 Alert • 1 P1 Review
              </span>
              <p className="text-[11px] text-blue-800 mt-0.5">
                Review morning patient check-in symptoms, verify smart wearable signal quality, and acknowledge or escalate alerts.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToPatientDetail('HG-001')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow shrink-0 cursor-pointer"
          >
            Review Urgent Triage Case (HG-001) →
          </button>
        </div>
      )}

      {/* Hero Showcase Callout Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#16866A]/10 rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A] text-white uppercase tracking-wider shadow-xs">
              COMMAND CENTER HERO
            </span>
            <span className="text-xs font-semibold text-[#16866A]">
              Post-Discharge Deterioration Intelligence
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">
            {currentUser ? `Welcome, ${currentUser.name}` : 'Clinical Team Surveillance'}
          </h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            Surveillance of 10 synthetic post-discharge patients with deterministic 4-vital safety routing, zero-queue critical dispatch, and edge cryptographic validation.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onNavigateToShowcase}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#16866A] text-white hover:bg-[#126b55] transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch 7-Act Showcase</span>
          </button>
          <button
            onClick={onSimulateUrgentEvent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E45D58] text-white hover:bg-[#cf4d48] transition-all shadow-xs cursor-pointer active:scale-98"
            title="Inject acute P0 critical deterioration & trigger clinical alarm buzzer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>🚨 Inject P0 Deterioration</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Metrics (6 Cards) with Expanded Breathing Room Gap */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5">
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 lg:p-5 shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Total Patients</span>
          <span className="text-2xl font-black text-[#193B32] mt-0.5 block">{stats.total}</span>
          <span className="text-[10px] text-[#697B73]">Remote cohort</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E45D58]/30 p-4 lg:p-5 shadow-xs bg-gradient-to-br from-white to-[#E45D58]/5">
          <span className="text-[10px] font-bold text-[#E45D58] uppercase tracking-wider block">P0 Urgent</span>
          <span className="text-2xl font-black text-[#E45D58] mt-0.5 block flex items-center gap-1.5">
            {stats.urgent}
            {stats.urgent > 0 && <span className="w-2 h-2 rounded-full bg-[#E45D58]" />}
          </span>
          <span className="text-[10px] text-[#E45D58]">Immediate review</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6A23C]/30 p-4 lg:p-5 shadow-xs bg-gradient-to-br from-white to-[#E6A23C]/5">
          <span className="text-[10px] font-bold text-[#E6A23C] uppercase tracking-wider block">P1 Review</span>
          <span className="text-2xl font-black text-[#E6A23C] mt-0.5 block">{stats.review}</span>
          <span className="text-[10px] text-[#E6A23C]">Clinician attention</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#16866A]/30 p-4 lg:p-5 shadow-xs bg-gradient-to-br from-white to-[#16866A]/5">
          <span className="text-[10px] font-bold text-[#16866A] uppercase tracking-wider block">P2 / P3 Stable</span>
          <span className="text-2xl font-black text-[#16866A] mt-0.5 block">{stats.routine}</span>
          <span className="text-[10px] text-[#16866A]">On recovery track</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 lg:p-5 shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">HMAC Valid</span>
          <span className="text-2xl font-black text-[#16866A] mt-0.5 block">100%</span>
          <span className="text-[10px] text-[#697B73]">Zero telemetry poison</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 lg:p-5 shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">P0 Latency</span>
          <span className="text-2xl font-black text-[#16866A] mt-0.5 block">48ms</span>
          <span className="text-[10px] text-[#697B73]">Zero-queue lane</span>
        </div>
      </div>

      {/* Main Split: Cohort Table with Minecraft Avatars (Left 8) + Telemetry Wave (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Columns: Cohort Table with Minecraft Avatars */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7ECE6]">
              <div>
                <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#16866A]" />
                  Post-Discharge Patient Surveillance Cohort ({filteredCohort.length} Patients)
                </h3>
                <p className="text-xs text-[#697B73]">
                  Immediate identification with Minecraft avatars • Click row to inspect telemetry waves below
                </p>
              </div>

              {/* Priority Filter Pills */}
              <div className="flex items-center gap-1 bg-[#FAFBF8] p-1 rounded-xl border border-[#E7ECE6] text-[11px] font-bold">
                {(['ALL', 'P0', 'P1', 'P2', 'P3'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setPriorityFilter(lvl)}
                    className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${priorityFilter === lvl
                        ? 'bg-[#16866A] text-white shadow-xs'
                        : 'text-[#697B73] hover:text-[#193B32]'
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFBF8] text-[#697B73] font-semibold border-b border-[#E7ECE6]">
                  <tr>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-2">Age</th>
                    <th className="py-3 px-2">Stage</th>
                    <th className="py-3 px-2 text-right">HR (bpm)</th>
                    <th className="py-3 px-2 text-right">RR (/min)</th>
                    <th className="py-3 px-2 text-right">SpO₂ (%)</th>
                    <th className="py-3 px-2 text-right">Temp (°C)</th>
                    <th className="py-3 px-3 text-center">Priority</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7ECE6]">
                  {filteredCohort.map((p) => {
                    const isSelected = p.id === selectedPatient.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          onSelectPatient(p.id);
                          onOpenPatientDrawer(p);
                        }}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-[#16866A]/10 font-medium' : 'hover:bg-[#FAFBF8]'
                          }`}
                      >
                        {/* Patient ID with Deterministic Minecraft Profile Avatar */}
                        <td className="py-2.5 px-3 font-bold text-[#193B32]">
                          <div className="flex items-center gap-2.5">
                            <MinecraftAvatar patientId={p.id} size={30} />
                            <div>
                              <div className="flex items-center gap-1">
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#16866A]" />}
                                <span>{p.id}</span>
                              </div>
                              <span className="text-[10px] text-[#697B73] font-normal block truncate max-w-[110px]">
                                {p.dischargeContext.split('—')[0].replace('Post-discharge ', '')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-[#697B73]">{p.age}y</td>
                        <td className="py-2.5 px-2">
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F7F8F3] text-[#193B32] border border-[#E7ECE6]">
                            {p.recoveryStage}
                          </span>
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono ${p.currentVitals.heartRate > 110 || p.currentVitals.heartRate < 50 ? 'text-[#E45D58] font-bold' : 'text-[#193B32]'}`}>
                          {p.currentVitals.heartRate}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono ${p.currentVitals.respiratoryRate >= 24 || p.currentVitals.respiratoryRate <= 9 ? 'text-[#E45D58] font-bold' : 'text-[#193B32]'}`}>
                          {p.currentVitals.respiratoryRate}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono ${p.currentVitals.spo2 <= 92 ? 'text-[#E45D58] font-bold' : p.currentVitals.spo2 <= 94 ? 'text-[#E6A23C] font-bold' : 'text-[#16866A]'}`}>
                          {p.currentVitals.spo2}%
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono ${p.currentVitals.temperature >= 38.3 || p.currentVitals.temperature <= 35.5 ? 'text-[#E45D58] font-bold' : 'text-[#193B32]'}`}>
                          {p.currentVitals.temperature.toFixed(1)}°
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {renderPriorityBadge(p.priority)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToPatientDetail(p.id);
                            }}
                            className="p-1 rounded-lg text-[#697B73] hover:text-[#16866A] hover:bg-[#F7F8F3] transition-colors cursor-pointer"
                            title="Inspect Patient Detail"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Selected Patient Telemetry Wave & Live Feed */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
              <div className="flex items-center gap-2.5">
                <MinecraftAvatar patientId={selectedPatient.id} size={36} />
                <div>
                  <h4 className="text-xs font-bold text-[#193B32]">{selectedPatient.id} Waveform</h4>
                  <p className="text-[10px] text-[#697B73]">Synced: {formatTimeSafe(selectedPatient.lastObservation)}</p>
                </div>
              </div>
              {renderPriorityBadge(selectedPatient.priority)}
            </div>

            <div className="h-32 w-full pt-1">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 9, fill: '#697B73' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                    <Area type="monotone" dataKey="heartRate" stroke="#16866A" strokeWidth={2} fill="#16866A" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#E7ECE6]">
              <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                <span className="text-[#697B73] block text-[10px]">Heart Rate</span>
                <span className="font-bold text-[#193B32] font-mono text-sm">{selectedPatient.currentVitals.heartRate} bpm</span>
              </div>
              <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                <span className="text-[#697B73] block text-[10px]">Oxygen (SpO₂)</span>
                <span className="font-bold text-[#16866A] font-mono text-sm">{selectedPatient.currentVitals.spo2}%</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToPatientDetail(selectedPatient.id)}
              className="w-full py-2 rounded-xl bg-[#16866A] text-white text-xs font-bold hover:bg-[#126b55] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Open Patient Workspace</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Activity Events Feed */}
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#16866A]" /> Real-Time Telemetry Stream
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {activityEvents.slice(0, 6).map((evt) => (
                <div key={evt.id} className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6] text-[11px] flex items-center justify-between">
                  <span className="text-[#193B32] font-medium truncate max-w-[200px]">{evt.message}</span>
                  <span className="text-[9px] text-[#697B73] font-mono">{formatTimeSafe(evt.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
