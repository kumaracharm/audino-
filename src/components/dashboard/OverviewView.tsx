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
    if (currentUser?.role === 'doctor' || currentUser?.role === 'senior_doctor') {
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E45D58] text-white shadow-sm ring-2 ring-[#E45D58]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            P0 Urgent
          </span>
        );
      case 'P1':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E6A23C] text-white shadow-xs">
            P1 Review
          </span>
        );
      case 'P2':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#16866A] text-white shadow-xs">
            P2 Stable
          </span>
        );
      case 'P3':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#3AA99B] text-white shadow-xs">
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
    <div className="space-y-7">
      {/* 1. HERO BRANDING & ACTION PANEL (Spatial Frosted Glass) */}
      <div className="spatial-card p-6 md:p-7 relative overflow-hidden backdrop-blur-2xl bg-white/80 border border-white/90 shadow-[0_12px_40px_-8px_rgba(25,59,50,0.06)] rounded-3xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-14 px-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/90 shadow-sm flex items-center justify-center shrink-0">
              <img 
                src="/avoflare_logo.jpg" 
                alt="AvoFlare" 
                className="h-10 w-auto object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16866A] text-white uppercase tracking-wider shadow-xs">
                  Spatial Intelligence Platform
                </span>
                <span className="text-xs font-bold text-[#16866A]">
                  Post-Discharge Deterioration Surveillance
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-[#193B32] mt-1 tracking-tight">
                {currentUser ? `Welcome back, ${currentUser.name}` : 'Clinical Command Center'}
              </h2>
              <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl leading-relaxed">
                Personalized tele-surveillance of 10 home patients powered by hybrid PINN-ODE neural digital twins, deterministic 4-vital safety supervisor, and edge cryptographic validation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={onNavigateToShowcase}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#16866A] text-white hover:bg-[#126b55] transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch 7-Act Showcase</span>
            </button>
            <button
              onClick={onSimulateUrgentEvent}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-[#E45D58] text-white hover:bg-[#cf4d48] transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98"
              title="Inject acute P0 critical deterioration & trigger clinical alarm buzzer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Inject P0 Critical</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI METRICS (6 Spatial Frosted Glass Cards with Beautiful Spacing) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
        {/* Total Patients */}
        <div className="spatial-kpi p-5 relative overflow-hidden backdrop-blur-xl bg-white/80 border border-white/90 shadow-[0_8px_24px_-4px_rgba(25,59,50,0.04)] rounded-2xl">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Total Patients</span>
          <span className="text-3xl font-black text-[#193B32] mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-[#697B73] mt-0.5 block font-medium">Remote home cohort</span>
        </div>

        {/* P0 Urgent */}
        <div className="spatial-kpi p-5 relative overflow-hidden backdrop-blur-xl bg-white/85 border border-[#E45D58]/30 shadow-[0_8px_24px_-4px_rgba(228,93,88,0.08)] rounded-2xl">
          <span className="text-[10px] font-bold text-[#E45D58] uppercase tracking-wider block">P0 Urgent</span>
          <span className="text-3xl font-black text-[#E45D58] mt-1 block flex items-center gap-2">
            {stats.urgent}
            {stats.urgent > 0 && <span className="w-2.5 h-2.5 rounded-full bg-[#E45D58] animate-ping" />}
          </span>
          <span className="text-[10px] text-[#E45D58] mt-0.5 block font-bold">Immediate review</span>
        </div>

        {/* P1 Review */}
        <div className="spatial-kpi p-5 relative overflow-hidden backdrop-blur-xl bg-white/85 border border-[#E6A23C]/30 shadow-[0_8px_24px_-4px_rgba(230,162,60,0.08)] rounded-2xl">
          <span className="text-[10px] font-bold text-[#E6A23C] uppercase tracking-wider block">P1 Review</span>
          <span className="text-3xl font-black text-[#E6A23C] mt-1 block">{stats.review}</span>
          <span className="text-[10px] text-[#E6A23C] mt-0.5 block font-semibold">Clinician attention</span>
        </div>

        {/* P2 / P3 Stable */}
        <div className="spatial-kpi p-5 relative overflow-hidden backdrop-blur-xl bg-white/85 border border-[#16866A]/30 shadow-[0_8px_24px_-4px_rgba(22,134,106,0.08)] rounded-2xl">
          <span className="text-[10px] font-bold text-[#16866A] uppercase tracking-wider block">P2 / P3 Stable</span>
          <span className="text-3xl font-black text-[#16866A] mt-1 block">{stats.routine}</span>
          <span className="text-[10px] text-[#16866A] mt-0.5 block font-medium">On recovery track</span>
        </div>

        {/* HMAC Validation */}
        <div className="spatial-kpi p-5 relative overflow-hidden backdrop-blur-xl bg-white/80 border border-white/90 shadow-[0_8px_24px_-4px_rgba(25,59,50,0.04)] rounded-2xl">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">HMAC Valid</span>
          <span className="text-3xl font-black text-[#16866A] mt-1 block">100%</span>
          <span className="text-[10px] text-[#697B73] mt-0.5 block font-medium">Zero replay taint</span>
        </div>

        {/* Ingestion Latency */}
        <div className="spatial-kpi p-5 relative overflow-hidden backdrop-blur-xl bg-white/80 border border-white/90 shadow-[0_8px_24px_-4px_rgba(25,59,50,0.04)] rounded-2xl">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">P0 Latency</span>
          <span className="text-3xl font-black text-[#16866A] mt-1 block">48ms</span>
          <span className="text-[10px] text-[#697B73] mt-0.5 block font-medium">Zero-queue fast path</span>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID: Cohort Table (Left 8) + Telemetry Waveform & Activity (Right 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left 8 Columns: Cohort Table Card */}
        <div className="lg:col-span-8 space-y-5">
          <div className="spatial-card p-6 backdrop-blur-2xl bg-white/85 border border-white/90 shadow-[0_10px_35px_-5px_rgba(25,59,50,0.05)] rounded-3xl space-y-4">
            
            {/* Table Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7ECE6]/80">
              <div>
                <h3 className="text-sm font-black text-[#193B32] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#16866A]" />
                  <span>Post-Discharge Patient Surveillance Cohort ({filteredCohort.length} Patients)</span>
                </h3>
                <p className="text-xs text-[#697B73] mt-0.5">
                  Glanceable physiological status · Click row to inspect telemetry waves and launch shift review
                </p>
              </div>

              {/* Priority Filter Pills */}
              <div className="flex items-center gap-1 bg-white/70 backdrop-blur-md p-1 rounded-xl border border-[#E7ECE6]/80 text-[11px] font-bold shadow-xs">
                {(['ALL', 'P0', 'P1', 'P2', 'P3'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setPriorityFilter(lvl)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      priorityFilter === lvl
                        ? 'bg-[#16866A] text-white shadow-xs'
                        : 'text-[#697B73] hover:text-[#193B32]'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFBF8]/70 backdrop-blur-xs text-[#697B73] font-bold border-b border-[#E7ECE6]/80">
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
                <tbody className="divide-y divide-[#E7ECE6]/60">
                  {filteredCohort.map((p) => {
                    const isSelected = p.id === selectedPatient.id;
                    const isP0 = p.priority === 'P0';
                    return (
                      <tr
                        key={p.id}
                        onClick={() => {
                          onSelectPatient(p.id);
                          onOpenPatientDrawer(p);
                        }}
                        className={`cursor-pointer transition-all duration-150 ${
                          isSelected 
                            ? 'bg-[#16866A]/10 font-medium' 
                            : isP0 
                            ? 'bg-[#E45D58]/05 hover:bg-[#E45D58]/10' 
                            : 'hover:bg-white/70'
                        }`}
                      >
                        {/* Patient ID with Avatar */}
                        <td className="py-3 px-3 font-bold text-[#193B32]">
                          <div className="flex items-center gap-3">
                            <MinecraftAvatar patientId={p.id} size={32} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#16866A]" />}
                                <span className="font-bold text-xs">{p.id}</span>
                              </div>
                              <span className="text-[10px] text-[#697B73] font-normal block truncate max-w-[130px]">
                                {p.conditions[0]}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-[#697B73] font-semibold">{p.age}y</td>
                        <td className="py-3 px-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/80 text-[#193B32] border border-[#E7ECE6]/80 shadow-xs">
                            {p.recoveryStage}
                          </span>
                        </td>
                        <td className={`py-3 px-2 text-right font-mono font-bold ${
                          p.currentVitals.heartRate > 110 || p.currentVitals.heartRate < 50 ? 'text-[#E45D58]' : 'text-[#193B32]'
                        }`}>
                          {p.currentVitals.heartRate}
                        </td>
                        <td className={`py-3 px-2 text-right font-mono font-bold ${
                          p.currentVitals.respiratoryRate >= 24 || p.currentVitals.respiratoryRate <= 9 ? 'text-[#E45D58]' : 'text-[#193B32]'
                        }`}>
                          {p.currentVitals.respiratoryRate}
                        </td>
                        <td className={`py-3 px-2 text-right font-mono font-bold ${
                          p.currentVitals.spo2 <= 91 ? 'text-[#E45D58]' : p.currentVitals.spo2 <= 94 ? 'text-[#E6A23C]' : 'text-[#16866A]'
                        }`}>
                          {p.currentVitals.spo2}%
                        </td>
                        <td className={`py-3 px-2 text-right font-mono font-bold ${
                          p.currentVitals.temperature >= 38.3 || p.currentVitals.temperature <= 35.5 ? 'text-[#E45D58]' : 'text-[#193B32]'
                        }`}>
                          {p.currentVitals.temperature.toFixed(1)}°
                        </td>
                        <td className="py-3 px-3 text-center">
                          {renderPriorityBadge(p.priority)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToPatientDetail(p.id);
                            }}
                            className="p-1.5 rounded-xl text-[#697B73] hover:text-[#16866A] hover:bg-white border border-transparent hover:border-[#E7ECE6] transition-all cursor-pointer shadow-xs"
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

        {/* Right 4 Columns: Waveform Telemetry & Live Activity Feed */}
        <div className="lg:col-span-4 space-y-5">
          {/* Waveform Card */}
          <div className="spatial-card p-6 backdrop-blur-2xl bg-white/85 border border-white/90 shadow-[0_10px_35px_-5px_rgba(25,59,50,0.05)] rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]/80">
              <div className="flex items-center gap-3">
                <MinecraftAvatar patientId={selectedPatient.id} size={38} />
                <div>
                  <h4 className="text-xs font-bold text-[#193B32]">{selectedPatient.id} Telemetry Stream</h4>
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
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="heartRate" stroke="#16866A" strokeWidth={2.5} fill="#16866A" fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 4 Vitals Quick Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E7ECE6]/80">
              <div className="p-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-[#E7ECE6]/80 shadow-xs">
                <span className="text-[#697B73] block text-[10px] font-semibold">Heart Rate</span>
                <span className="font-bold text-[#193B32] font-mono text-sm">{selectedPatient.currentVitals.heartRate} bpm</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-[#E7ECE6]/80 shadow-xs">
                <span className="text-[#697B73] block text-[10px] font-semibold">Oxygen (SpO₂)</span>
                <span className="font-bold text-[#16866A] font-mono text-sm">{selectedPatient.currentVitals.spo2}%</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateToPatientDetail(selectedPatient.id)}
              className="w-full py-2.5 rounded-2xl bg-[#16866A] text-white text-xs font-bold hover:bg-[#126b55] transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer active:scale-98"
            >
              <span>Open Patient Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Activity Events Feed Card */}
          <div className="spatial-card p-5 backdrop-blur-2xl bg-white/80 border border-white/90 shadow-[0_8px_30px_-5px_rgba(25,59,50,0.04)] rounded-3xl space-y-3">
            <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#16866A]" /> 
              <span>Real-Time Telemetry Stream</span>
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activityEvents.slice(0, 6).map((evt) => (
                <div key={evt.id} className="p-2.5 rounded-xl bg-white/60 backdrop-blur-md border border-[#E7ECE6]/70 text-[11px] flex items-center justify-between gap-2 shadow-xs">
                  <span className="text-[#193B32] font-medium truncate max-w-[210px]">{evt.message}</span>
                  <span className="text-[9px] text-[#697B73] font-mono shrink-0">{formatTimeSafe(evt.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
