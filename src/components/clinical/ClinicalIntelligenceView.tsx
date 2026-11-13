import React, { useMemo } from 'react';
import { 
  BrainCircuit, 
  Heart, 
  Wind, 
  Droplets, 
  Thermometer, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Bell, 
  Info, 
  Clock, 
  Sparkles,
  Pill,
  Activity,
  AlertTriangle,
  Database
} from 'lucide-react';
import { Patient } from '@/types';
import { executeTwinPipeline } from '@/lib/ml';

interface ClinicalIntelligenceViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
}

export const ClinicalIntelligenceView: React.FC<ClinicalIntelligenceViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
}) => {
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const v = selectedPatient.currentVitals;

  const baselineVitals = useMemo(() => {
    const firstHist = selectedPatient.vitalHistory[0] || selectedPatient.currentVitals;
    return {
      heartRate: firstHist.heartRate || 75,
      respiratoryRate: firstHist.respiratoryRate || 16,
      spo2: Math.max(92, firstHist.spo2 || 97),
      temperature: firstHist.temperature || 37.0,
    };
  }, [selectedPatient]);

  // Execute full V4.1 7-Expert Clinical Pipeline
  const pipeline = useMemo(() => {
    return executeTwinPipeline(
      selectedPatient.id,
      {
        heartRate: v.heartRate,
        respiratoryRate: v.respiratoryRate,
        spo2: v.spo2,
        temperature: v.temperature,
      },
      baselineVitals,
      42,
      '15m'
    );
  }, [selectedPatient, v, baselineVitals]);

  const { context, experts, clinicalScore, patientKB, decision } = pipeline;
  const expHR = experts.find(e => e.expertId === 'EXPERT_2_HR')!;
  const expRR = experts.find(e => e.expertId === 'EXPERT_3_RR')!;
  const expSpO2 = experts.find(e => e.expertId === 'EXPERT_4_SPO2')!;
  const expTemp = experts.find(e => e.expertId === 'EXPERT_5_TEMP')!;
  const expMed = experts.find(e => e.expertId === 'EXPERT_6_MED')!;
  const expRec = experts.find(e => e.expertId === 'EXPERT_7_RECOVERY')!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="spatial-card backdrop-blur-2xl bg-white/85 border border-white/90 p-6 shadow-sm rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A]/10 text-[#16866A] uppercase tracking-wider">
              AvoFlare V4.1 · Clinical Intelligence
            </span>
            <span className="text-xs text-[#697B73]">7 Context-Adaptive Specialized Experts</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">AvoFlare Physiological Decision Engine</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            AvoFlare pairs dual knowledge bases (Patient KB + Shared Clinical KB) with 7 specialized domain experts and an independent safety supervisor.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#697B73]">Evaluate Patient:</span>
          <select
            value={selectedPatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E7ECE6]/80 bg-white/80 backdrop-blur-md text-xs font-bold text-[#193B32] focus:outline-none focus:border-[#16866A] cursor-pointer shadow-xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.priority} • Age {p.age})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Layer 3: Expert 1 — Patient Context Expert (Context Controller) */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7ECE6]">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#16866A]" />
            <h3 className="text-sm font-bold text-[#193B32]">
              Expert 1 — Patient Context Expert (Context Controller)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-[#16866A]/10 text-[#16866A] font-bold px-2 py-0.5 rounded">
              {context.contextId}
            </span>
            <span className="text-[10px] font-bold bg-[#FAFBF8] border border-[#E7ECE6] text-[#697B73] px-2 py-0.5 rounded">
              Record v{context.patientRecordVersion}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <span className="text-[10px] font-bold text-[#697B73] uppercase block">Primary Condition & Domain</span>
            <span className="font-bold text-[#193B32] mt-0.5 block">{context.clinicalContext.documentedCondition}</span>
            <span className="text-[10px] font-mono text-[#16866A] uppercase mt-0.5 block">Domain: {context.clinicalContext.clinicalDomain}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <span className="text-[10px] font-bold text-[#697B73] uppercase block">Recovery Phase & Cohort</span>
            <span className="font-bold text-[#193B32] mt-0.5 block capitalize">{context.clinicalContext.recoveryPhase} Recovery</span>
            <span className="text-[10px] text-[#697B73] mt-0.5 block">{patientKB.demographics.cohort}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <span className="text-[10px] font-bold text-[#697B73] uppercase block">Oxygen Scale Target</span>
            <span className="font-bold text-[#16866A] mt-0.5 block">
              Scale {context.personalization.oxygenScale} ({context.personalization.targetSpo2Range[0]}–{context.personalization.targetSpo2Range[1]}%)
            </span>
            <span className="text-[10px] text-[#697B73] mt-0.5 block">
              {context.personalization.oxygenScale === 2 ? 'Hypercapnic respiratory drive guard' : 'Standard oxygenation target'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
            <span className="text-[10px] font-bold text-[#697B73] uppercase block">Physiological Tacit Heuristics</span>
            <span className="font-bold text-[#193B32] mt-0.5 block">
              {context.modelContext.bluntedBetaBlockerResponse ? 'Beta-Blocker Blunting Active' : 'Normal Autonomic Tone'}
            </span>
            <span className="text-[10px] text-[#697B73] mt-0.5 block font-mono">
              Profile: {context.modelContext.parameterProfileRef}
            </span>
          </div>
        </div>

        {/* Applied Knowledge Base Rules */}
        <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] flex flex-wrap items-center gap-2 text-xs">
          <Database className="w-3.5 h-3.5 text-[#16866A]" />
          <span className="font-bold text-[#193B32]">Clinical KB Retrieved Rules:</span>
          {context.applicableKnowledgeRefs.map((ref, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-[#E7ECE6] text-[#16866A] font-semibold">
              {ref}
            </span>
          ))}
        </div>
      </div>

      {/* Layer 4: Experts 2–5 — Physiological Expert Intelligence */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#16866A]" />
            Experts 2–5 — Parallel Context-Adaptive Physiological Intelligence
          </h3>
          <span className="text-xs font-mono text-[#697B73]">
            Partial NEWS2 Subtotal: <strong className="text-[#193B32]">{clinicalScore.subtotal} / 12</strong> (Max 12)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Expert 2: Heart Rate Expert */}
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
                <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#E45D58]" /> Expert 2 — HR
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  expHR.contextualConcern === 'High' ? 'bg-rose-100 text-rose-800' :
                  expHR.contextualConcern === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  Concern: {expHR.contextualConcern}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-[#193B32]">{v.heartRate}</span>
                  <span className="text-xs text-[#697B73] ml-1">bpm</span>
                </div>
                <span className="text-[11px] text-[#697B73]">Baseline: {baselineVitals.heartRate}</span>
              </div>
              <p className="text-xs text-[#193B32] mt-2 font-medium bg-[#FAFBF8] p-2.5 rounded-xl border border-[#E7ECE6] leading-relaxed">
                {expHR.findingsSummary}
              </p>
            </div>
            <div className="text-[10px] text-[#697B73] pt-2 border-t border-[#E7ECE6] flex items-center justify-between">
              <span>NEWS2 Points: <strong className="text-[#193B32]">+{expHR.componentScore}</strong></span>
              <span className="font-mono text-[#16866A]">Slope: {expHR.trendSlope > 0 ? '+' : ''}{expHR.trendSlope}/min</span>
            </div>
          </div>

          {/* Expert 3: Respiratory Rate Expert */}
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
                <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-[#3AA99B]" /> Expert 3 — RR
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  expRR.contextualConcern === 'High' ? 'bg-rose-100 text-rose-800' :
                  expRR.contextualConcern === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  Concern: {expRR.contextualConcern}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-[#193B32]">{v.respiratoryRate}</span>
                  <span className="text-xs text-[#697B73] ml-1">/min</span>
                </div>
                <span className="text-[11px] text-[#697B73]">Baseline: {baselineVitals.respiratoryRate}</span>
              </div>
              <p className="text-xs text-[#193B32] mt-2 font-medium bg-[#FAFBF8] p-2.5 rounded-xl border border-[#E7ECE6] leading-relaxed">
                {expRR.findingsSummary}
              </p>
            </div>
            <div className="text-[10px] text-[#697B73] pt-2 border-t border-[#E7ECE6] flex items-center justify-between">
              <span>NEWS2 Points: <strong className="text-[#193B32]">+{expRR.componentScore}</strong></span>
              <span className="font-mono text-[#3AA99B]">Slope: {expRR.trendSlope > 0 ? '+' : ''}{expRR.trendSlope}/min</span>
            </div>
          </div>

          {/* Expert 4: SpO2 Expert */}
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
                <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#16866A]" /> Expert 4 — SpO₂
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  expSpO2.contextualConcern === 'High' ? 'bg-rose-100 text-rose-800' :
                  expSpO2.contextualConcern === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  Concern: {expSpO2.contextualConcern}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-[#193B32]">{v.spo2}%</span>
                  <span className="text-xs text-[#697B73] ml-1">SpO₂</span>
                </div>
                <span className="text-[11px] text-[#697B73]">Baseline: {baselineVitals.spo2}%</span>
              </div>
              <p className="text-xs text-[#193B32] mt-2 font-medium bg-[#FAFBF8] p-2.5 rounded-xl border border-[#E7ECE6] leading-relaxed">
                {expSpO2.findingsSummary}
              </p>
            </div>
            <div className="text-[10px] text-[#697B73] pt-2 border-t border-[#E7ECE6] flex items-center justify-between">
              <span>NEWS2 Points: <strong className="text-[#193B32]">+{expSpO2.componentScore}</strong></span>
              <span className="font-mono text-[#16866A]">Slope: {expSpO2.trendSlope > 0 ? '+' : ''}{expSpO2.trendSlope}/min</span>
            </div>
          </div>

          {/* Expert 5: Temperature Expert */}
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
                <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-[#E6A23C]" /> Expert 5 — Temp
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  expTemp.contextualConcern === 'High' ? 'bg-rose-100 text-rose-800' :
                  expTemp.contextualConcern === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  Concern: {expTemp.contextualConcern}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black font-mono text-[#193B32]">{v.temperature.toFixed(1)}°</span>
                  <span className="text-xs text-[#697B73] ml-1">Celsius</span>
                </div>
                <span className="text-[11px] text-[#697B73]">Baseline: {baselineVitals.temperature.toFixed(1)}°</span>
              </div>
              <p className="text-xs text-[#193B32] mt-2 font-medium bg-[#FAFBF8] p-2.5 rounded-xl border border-[#E7ECE6] leading-relaxed">
                {expTemp.findingsSummary}
              </p>
            </div>
            <div className="text-[10px] text-[#697B73] pt-2 border-t border-[#E7ECE6] flex items-center justify-between">
              <span>NEWS2 Points: <strong className="text-[#193B32]">+{expTemp.componentScore}</strong></span>
              <span className="font-mono text-[#E6A23C]">Diff: {expTemp.baselineDeviation > 0 ? '+' : ''}{expTemp.baselineDeviation}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 9: Experts 6 & 7 — Medication & Recovery Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expert 6: Medication & Clinical Intervention Expert */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
            <h3 className="text-xs font-bold text-[#193B32] flex items-center gap-1.5 uppercase tracking-wider">
              <Pill className="w-4 h-4 text-[#16866A]" /> Expert 6 — Medication & Clinical Intervention
            </h3>
            <span className="text-[10px] font-bold text-[#16866A] bg-[#16866A]/10 px-2 py-0.5 rounded">
              Human-Supervised Only
            </span>
          </div>
          <p className="text-xs text-[#193B32] leading-relaxed bg-[#FAFBF8] p-3 rounded-xl border border-[#E7ECE6]">
            {expMed.findingsSummary}
          </p>
          <div className="space-y-1.5 text-xs">
            <span className="text-[11px] font-bold text-[#697B73] block">Active Prescribed Regimen:</span>
            {patientKB.medicationContext.activeMedications.map((m, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E7ECE6] text-[11px]">
                <span className="font-bold text-[#193B32]">{m.name} ({m.dosage})</span>
                <span className="text-[#697B73]">{m.class}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#697B73] italic">
            * Governance: Neither autonomously prescribes nor authorizes treatment. Clinician sign-off mandatory.
          </p>
        </div>

        {/* Expert 7: Patient Recovery Expert */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
            <h3 className="text-xs font-bold text-[#193B32] flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-[#3AA99B]" /> Expert 7 — Patient Recovery Expert
            </h3>
            <span className="text-[10px] font-bold text-[#3AA99B] bg-[#3AA99B]/10 px-2 py-0.5 rounded">
              Milestone Surveillance
            </span>
          </div>
          <p className="text-xs text-[#193B32] leading-relaxed bg-[#FAFBF8] p-3 rounded-xl border border-[#E7ECE6]">
            {expRec.findingsSummary}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-[#E7ECE6]">
              <span className="text-[10px] font-bold text-[#697B73] block uppercase">Current Timeline</span>
              <span className="font-bold text-[#193B32] mt-0.5 block">Day 4 of 30-Day Recovery</span>
              <span className="text-[10px] text-[#16866A]">Functional recovery stage</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-[#E7ECE6]">
              <span className="text-[10px] font-bold text-[#697B73] block uppercase">Approved Mobility</span>
              <span className="font-bold text-[#193B32] mt-0.5 block">8 min walking tolerance</span>
              <span className="text-[10px] text-[#697B73]">Rest periods strictly enforced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 8: Evidence-Constrained Decision & Safety Supervisor Summary */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
          <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#A99ACB]" />
            Layer 8 — Evidence-Constrained Decision Rationale: D_t = F(C_t, S_t, E_t, B_t, P_t, U_t, R_t)
          </h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            decision.priorityCode === 'P0' ? 'bg-[#E45D58] text-white' :
            decision.priorityCode === 'P1' ? 'bg-[#E6A23C] text-white' :
            'bg-[#16866A] text-white'
          }`}>
            Tier: {decision.clinicalPriority} ({decision.priorityCode})
          </span>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#193B32] block">Verified Supporting Evidence:</span>
          <ul className="space-y-1 text-xs text-[#193B32]">
            {decision.supportingEvidence.map((ev, i) => (
              <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16866A] shrink-0" />
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
