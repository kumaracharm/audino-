import React from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Sparkles,
  Zap,
  Clock,
  ChevronRight,
  Heart,
  Wind,
  Droplets,
  Thermometer
} from 'lucide-react';
import { Patient, Priority, ActivityEvent } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface OverviewViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  onNavigateToPatientDetail: (id: string) => void;
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
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onNavigateToPatientDetail,
  activityEvents,
  stats,
  onSimulateNewObservation,
  onSimulateUrgentEvent,
  isMounted
}) => {
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const renderPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'P0':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E45D58] text-white shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
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
            P2 Routine
          </span>
        );
      case 'P3':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#3AA99B] text-white">
            P3 Background
          </span>
        );
      default:
        return null;
    }
  };

  const chartData = React.useMemo(() => {
    if (!selectedPatient) return [];
    return selectedPatient.vitalHistory.map((v, i) => {
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
  }, [selectedPatient]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-white via-white to-[#16866A]/5 rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A]/10 text-[#16866A] uppercase tracking-wider">
              Clinical Command Center
            </span>
            <span className="text-xs text-[#697B73]">Live Synthetic Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">Good evening, Clinical Team</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            Patient recovery intelligence and early deterioration monitoring. Tracking 10 synthetic post-discharge patients with deterministic partial NEWS2 safety routing.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onSimulateNewObservation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E7ECE6] text-[#193B32] hover:bg-gray-50 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Activity className="w-3.5 h-3.5 text-[#16866A]" />
            <span>Generate Observation</span>
          </button>
          <button
            onClick={onSimulateUrgentEvent}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E45D58] text-white hover:bg-[#cf4d48] transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Urgent Deterioration</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#697B73] uppercase tracking-wider">Monitored Patients</span>
            <div className="w-8 h-8 rounded-xl bg-[#16866A]/10 text-[#16866A] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#193B32]">{stats.total}</span>
            <span className="text-xs font-medium text-[#16866A]">100% telemetry stream</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#697B73]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16866A]" />
            <span>All 10 synthetic devices active</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E45D58]/30 p-4 shadow-xs bg-gradient-to-br from-white to-[#E45D58]/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E45D58] uppercase tracking-wider">Active Urgent Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-[#E45D58]/10 text-[#E45D58] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#E45D58]">{stats.urgent}</span>
            <span className="text-xs font-medium text-[#E45D58]">P0 Immediate</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#E45D58]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E45D58] animate-ping" />
            <span>Zero-queue bypass triggered</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6A23C]/30 p-4 shadow-xs bg-gradient-to-br from-white to-[#E6A23C]/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E6A23C] uppercase tracking-wider">Requiring Review</span>
            <div className="w-8 h-8 rounded-xl bg-[#E6A23C]/10 text-[#E6A23C] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#E6A23C]">{stats.review}</span>
            <span className="text-xs font-medium text-[#697B73]">P1 moderate risk</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#697B73]">
            <span>Clinician review within 60m</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#697B73] uppercase tracking-wider">System Availability</span>
            <div className="w-8 h-8 rounded-xl bg-[#3AA99B]/10 text-[#3AA99B] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#16866A]">99.9%</span>
            <span className="text-xs font-medium text-[#697B73]">simulated</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#16866A]">
            <Activity className="w-3.5 h-3.5" />
            <span>Redis Streams: 0 lag</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Patient Surveillance Table (Left) & Real-time Live Activity Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Patient Table - 8 Columns */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E7ECE6] shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E7ECE6] flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#16866A]" />
                Synthetic Cohort Surveillance (10 Patients)
              </h3>
              <p className="text-xs text-[#697B73]">
                Click row to view physiological charts below • Click button for full patient record
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#697B73]">
              <span className="w-2 h-2 rounded-full bg-[#16866A] animate-pulse" />
              <span>Real-time polling</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF8] text-[#697B73] font-semibold border-b border-[#E7ECE6]">
                <tr>
                  <th className="py-3 px-3">Patient ID</th>
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
                {patients.map((p) => {
                  const isSelected = p.id === selectedPatient.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectPatient(p.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#16866A]/10 font-medium' : 'hover:bg-[#FAFBF8]'
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-[#193B32]">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#16866A]" />}
                          {p.id}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[#697B73]">{p.age}y</td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F7F8F3] text-[#193B32] border border-[#E7ECE6]">
                          {p.recoveryStage}
                        </span>
                      </td>
                      <td className={`py-3 px-2 text-right font-mono ${p.currentVitals.heartRate > 110 || p.currentVitals.heartRate < 50 ? 'text-[#E45D58] font-bold' : 'text-[#193B32]'}`}>
                        {p.currentVitals.heartRate}
                      </td>
                      <td className={`py-3 px-2 text-right font-mono ${p.currentVitals.respiratoryRate >= 24 || p.currentVitals.respiratoryRate <= 9 ? 'text-[#E45D58] font-bold' : 'text-[#193B32]'}`}>
                        {p.currentVitals.respiratoryRate}
                      </td>
                      <td className={`py-3 px-2 text-right font-mono ${p.currentVitals.spo2 <= 92 ? 'text-[#E45D58] font-bold' : p.currentVitals.spo2 <= 94 ? 'text-[#E6A23C] font-bold' : 'text-[#16866A]'}`}>
                        {p.currentVitals.spo2}%
                      </td>
                      <td className={`py-3 px-2 text-right font-mono ${p.currentVitals.temperature >= 38.3 || p.currentVitals.temperature <= 35.5 ? 'text-[#E45D58] font-bold' : 'text-[#193B32]'}`}>
                        {p.currentVitals.temperature.toFixed(1)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {renderPriorityBadge(p.priority)}
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onNavigateToPatientDetail(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#16866A]/10 hover:bg-[#16866A] text-[#16866A] hover:text-white transition-all cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed - 4 Columns */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
              <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#16866A]" />
                Live Ingestion Activity
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                DEMO FEED
              </span>
            </div>
            <p className="text-[11px] text-[#697B73] mt-2 mb-3">
              Real-time audit log of telemetry verification, safety assessments and FHIR sync events:
            </p>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {activityEvents.slice(0, 8).map((evt) => (
                <div
                  key={evt.id}
                  className="p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-xs space-y-1 hover:border-[#16866A]/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#697B73]">
                    <span className="font-mono font-semibold">{evt.id}</span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="font-semibold text-[#193B32] text-xs">{evt.message}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#16866A] font-medium uppercase tracking-wide">
                      {evt.type}
                    </span>
                    <span className="text-[#697B73] bg-white px-1.5 py-0.5 rounded border border-[#E7ECE6]">
                      Passed HMAC
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7ECE6] text-[11px] text-[#697B73] flex items-center justify-between">
            <span>Continuous simulated broker</span>
            <span className="font-semibold text-[#16866A]">Redis Streams: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Selected Patient Live Telemetry Waveforms */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#E7ECE6]">
          <div>
            <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16866A]" />
              Real-Time Physiological Telemetry Waveforms — Patient {selectedPatient.id}
            </h3>
            <p className="text-xs text-[#697B73] mt-0.5">
              Diagnosis: <strong className="text-[#193B32]">{selectedPatient.dischargeContext}</strong> • Baseline: {selectedPatient.recoveryBaseline}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {renderPriorityBadge(selectedPatient.priority)}
            <button
              onClick={() => onNavigateToPatientDetail(selectedPatient.id)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#16866A] text-white hover:bg-[#126b55] transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Full Patient Record</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Heart Rate */}
          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#193B32] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#E45D58]" /> Heart Rate
              </span>
              <span className="text-sm font-bold font-mono text-[#193B32]">
                {selectedPatient.currentVitals.heartRate} <span className="text-[10px] text-[#697B73]">bpm</span>
              </span>
            </div>
            <div className="h-28 w-full">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E45D58" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E45D58" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 9, fill: '#697B73' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                    <Area type="monotone" dataKey="heartRate" stroke="#E45D58" strokeWidth={2} fillOpacity={1} fill="url(#hrGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#697B73] mt-2 pt-2 border-t border-[#E7ECE6]">
              <span>Ref: 60-100 bpm</span>
              <span className={selectedPatient.currentVitals.heartRate > 100 || selectedPatient.currentVitals.heartRate < 60 ? 'text-[#E45D58] font-bold' : 'text-[#16866A]'}>
                {selectedPatient.currentVitals.heartRate > 100 ? 'Tachycardic' : selectedPatient.currentVitals.heartRate < 60 ? 'Bradycardic' : 'Normal'}
              </span>
            </div>
          </div>

          {/* Respiratory Rate */}
          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#193B32] flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-[#3AA99B]" /> Respiratory Rate
              </span>
              <span className="text-sm font-bold font-mono text-[#193B32]">
                {selectedPatient.currentVitals.respiratoryRate} <span className="text-[10px] text-[#697B73]">/min</span>
              </span>
            </div>
            <div className="h-28 w-full">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="rrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3AA99B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3AA99B" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['dataMin - 3', 'dataMax + 3']} tick={{ fontSize: 9, fill: '#697B73' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                    <Area type="monotone" dataKey="respiratoryRate" stroke="#3AA99B" strokeWidth={2} fillOpacity={1} fill="url(#rrGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#697B73] mt-2 pt-2 border-t border-[#E7ECE6]">
              <span>Ref: 12-20 /min</span>
              <span className={selectedPatient.currentVitals.respiratoryRate >= 21 ? 'text-[#E45D58] font-bold' : 'text-[#16866A]'}>
                {selectedPatient.currentVitals.respiratoryRate >= 21 ? 'Tachypnea' : 'Normal'}
              </span>
            </div>
          </div>

          {/* SpO2 */}
          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#193B32] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#16866A]" /> Oxygen Saturation
              </span>
              <span className="text-sm font-bold font-mono text-[#193B32]">
                {selectedPatient.currentVitals.spo2}%
              </span>
            </div>
            <div className="h-28 w-full">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16866A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16866A" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[85, 100]} tick={{ fontSize: 9, fill: '#697B73' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                    <Area type="monotone" dataKey="spo2" stroke="#16866A" strokeWidth={2} fillOpacity={1} fill="url(#spo2Grad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#697B73] mt-2 pt-2 border-t border-[#E7ECE6]">
              <span>Target: ≥96%</span>
              <span className={selectedPatient.currentVitals.spo2 < 94 ? 'text-[#E45D58] font-bold' : 'text-[#16866A]'}>
                {selectedPatient.currentVitals.spo2 <= 91 ? 'Severe Hypoxia' : selectedPatient.currentVitals.spo2 <= 93 ? 'Moderate Hypoxia' : 'Adequate'}
              </span>
            </div>
          </div>

          {/* Body Temperature */}
          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#193B32] flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-[#E6A23C]" /> Temperature
              </span>
              <span className="text-sm font-bold font-mono text-[#193B32]">
                {selectedPatient.currentVitals.temperature.toFixed(1)}°C
              </span>
            </div>
            <div className="h-28 w-full">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E6A23C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E6A23C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[34.5, 41.0]} tick={{ fontSize: 9, fill: '#697B73' }} />
                    <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                    <Area type="monotone" dataKey="temperature" stroke="#E6A23C" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#697B73] mt-2 pt-2 border-t border-[#E7ECE6]">
              <span>Norm: 36.1-38.0°C</span>
              <span className={selectedPatient.currentVitals.temperature >= 38.1 ? 'text-[#E45D58] font-bold' : 'text-[#16866A]'}>
                {selectedPatient.currentVitals.temperature >= 38.1 ? 'Pyrexic (Fever)' : 'Normothermic'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
