import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { Patient } from '@/types';
import { calculateScore } from '@/lib/scoring';

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
  const score = calculateScore(v.heartRate, v.respiratoryRate, v.spo2, v.temperature, selectedPatient.age);

  // Interpretation helpers
  const hrTrend = v.heartRate > 100 ? 'Sinus Tachycardia tendency detected' : v.heartRate < 60 ? 'Relative Bradycardia noted' : 'Normal physiological resting rate';
  const rrTrend = v.respiratoryRate > 22 ? 'Increased work of breathing / tachypnea' : v.respiratoryRate < 10 ? 'Hypoventilation risk' : 'Eupneic regular respiratory rate';
  const spo2Trend = v.spo2 < 94 ? 'Compromised gas exchange / mild hypoxia' : 'Adequate arterial oxygenation';
  const tempTrend = v.temperature >= 38.0 ? 'Systemic inflammatory or pyrexic response' : v.temperature <= 35.5 ? 'Mild hypothermic trend' : 'Normothermia within recovery bounds';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#A99ACB]/20 text-[#193B32] uppercase tracking-wider">
              Clinical Decision Support Pipeline
            </span>
            <span className="text-xs text-[#697B73]">Context-Aware Safety Engine</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">Multi-Expert Physiological Intelligence</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            HEALTHGUARD pairs deterministic bedside safety rules with specialized physiological domain evaluators, providing explainable deterioration alerts to the clinical team.
          </p>
        </div>

        {/* Patient Selector dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#697B73]">Evaluate Patient:</span>
          <select
            value={selectedPatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E7ECE6] bg-[#FAFBF8] text-xs font-bold text-[#193B32] focus:outline-none focus:border-[#16866A] cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.priority} • Age {p.age})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Pipeline Sequence Strip */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-[#193B32] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#16866A]" />
          Deterministic Clinical Assessment Pipeline Flow
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-2">
          {[
            { step: '1', title: 'Incoming Vitals', desc: 'Simulink / BLE feed' },
            { step: '2', title: 'Data Validation', desc: 'HMAC & bounds check' },
            { step: '3', title: 'Context Retrieval', desc: 'Baseline & diagnosis' },
            { step: '4', title: 'Safety Assessment', desc: 'NEWS2 partial score' },
            { step: '5', title: 'Expert Analysis', desc: '4 physiological agents' },
            { step: '6', title: 'Priority Routing', desc: 'Zero-queue triage' },
            { step: '7', title: 'Clinician Alert', desc: 'Push notification & SMS' },
          ].map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] relative flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold text-[#16866A] block">PHASE 0{item.step}</span>
                <p className="text-xs font-bold text-[#193B32] mt-0.5">{item.title}</p>
                <p className="text-[10px] text-[#697B73] mt-0.5">{item.desc}</p>
              </div>
              <div className="mt-2 pt-2 border-t border-[#E7ECE6] flex items-center justify-between text-[10px]">
                <span className="text-[#16866A] font-semibold">Active</span>
                <CheckCircle2 className="w-3 h-3 text-[#16866A]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Four Physiological Expert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate Expert */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
              <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#E45D58]" /> Heart Rate Expert
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                High Quality (99%)
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-[#193B32]">{v.heartRate}</span>
                <span className="text-xs text-[#697B73] ml-1">bpm</span>
              </div>
              <span className="text-[11px] text-[#697B73]">Baseline: 68-76</span>
            </div>
            <p className="text-xs text-[#193B32] mt-2 font-medium bg-[#FAFBF8] p-2.5 rounded-xl border border-[#E7ECE6]">
              {hrTrend}
            </p>
          </div>
          <div className="text-[10px] text-[#697B73] pt-2 border-t border-[#E7ECE6] flex items-center justify-between">
            <span>Score Weight: +{score.hrScore}</span>
            <span className="text-[#16866A] font-semibold">R-wave Confirmed</span>
          </div>
        </div>

        {/* Respiratory Expert */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
              <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-[#3AA99B]" /> Respiratory Expert
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                High Quality (97%)
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-[#193B32]">{v.respiratoryRate}</span>
                <span className="text-xs text-[#697B73] ml-1">/min</span>
              </div>
              <span className="text-[11px] text-[#697B73]">Baseline: 15-18</span>
            </div>
            <p className="text-xs text-[#193B32] mt-2 font-medium bg-[#FAFBF8] p-2.5 rounded-xl border border-[#E7ECE6]">
              {rrTrend}
            </p>
          </div>
          <div className="text-[10px] text-[#697B73] pt-2 border-t border-[#E7ECE6] flex items-center justify-between">
            <span>Score Weight: +{score.rrScore}</span>
            <span className="text-[#16866A] font-semibold">Thoracic Impedance</span>
          </div>
        </div>

        {/* Oxygenation Expert */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
              <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#16866A]" /> Oxygenation Expert
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                High Quality (98%)
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-[#193B32]">{v.spo2}%</span>
                <span className="text-xs text-[#697B73] ml-1">SpO₂</span>
              </div>
              <span className="text-[11px] text-[#697B73]">Baseline: 96-98%</span>
            </div>
            <p className="text-xs text-[#193B32] mt-2 font-medium bg-[#FAFBF8] p-2.5 rounded-xl border border-[#E7ECE6]">
              {spo2Trend}
            </p>
          </div>
          <div className="text-[10px] text-[#697B73] pt-2 border-t border-[#E7ECE6] flex items-center justify-between">
            <span>Score Weight: +{score.spo2Score}</span>
            <span className="text-[#16866A] font-semibold">PPG Signal Lock</span>
          </div>
        </div>

        {/* Temperature Expert */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
              <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-[#E6A23C]" /> Temperature Expert
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                Calibrated (99%)
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black font-mono text-[#193B32]">{v.temperature.toFixed(1)}°</span>
                <span className="text-xs text-[#697B73] ml-1">Celsius</span>
              </div>
              <span className="text-[11px] text-[#697B73]">Baseline: 36.8°C</span>
            </div>
            <p className="text-xs text-[#193B32] mt-2 font-medium bg-[#FAFBF8] p-2.5 rounded-xl border border-[#E7ECE6]">
              {tempTrend}
            </p>
          </div>
          <div className="text-[10px] text-[#697B73] pt-2 border-t border-[#E7ECE6] flex items-center justify-between">
            <span>Score Weight: +{score.tempScore}</span>
            <span className="text-[#16866A] font-semibold">Infrared Core Est.</span>
          </div>
        </div>
      </div>

      {/* Patient Context Expert Panel & Decision Explanation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Context Expert (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
            <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#16866A]" />
              Patient Context Expert Service
            </h3>
            <span className="text-[10px] font-bold text-[#16866A] bg-[#16866A]/10 px-2 py-0.5 rounded">
              v2.4 Context Model
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <span className="text-[#697B73]">Patient Age Band:</span>
              <span className="font-bold text-[#193B32]">{selectedPatient.age} years old ({score.ageGroup})</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <span className="text-[#697B73]">Medical Context Available:</span>
              <span className="font-bold text-[#16866A] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Full Discharge Summary
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <span className="text-[#697B73]">Baseline Calibration:</span>
              <span className="font-bold text-[#193B32]">Verified at Discharge</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <span className="text-[#697B73]">Data Stream Completeness:</span>
              <span className="font-bold text-[#16866A]">100% (4 of 4 Vitals)</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-[11px] text-[#697B73]">
              <span className="font-bold text-[#193B32] block mb-1">Clinical Context Binding:</span>
              {selectedPatient.dischargeContext}
            </div>
          </div>
        </div>

        {/* Decision Explanation Panel (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
            <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A99ACB]" />
              Explainable Decision & Priority Rationale
            </h3>
            <span className={`text-xs font-bold px-3 py-0.5 rounded-full ${
              score.priority === 'P0' ? 'bg-[#E45D58] text-white' :
              score.priority === 'P1' ? 'bg-[#E6A23C] text-white' :
              'bg-[#16866A] text-white'
            }`}>
              Assigned: {score.priority}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-2">
            <span className="text-xs font-bold text-[#193B32] block">Contributing Clinical Evidence:</span>
            <p className="text-xs text-[#193B32] leading-relaxed">
              {score.explanation}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-[#E7ECE6] bg-white">
              <span className="text-[11px] text-[#697B73] block uppercase tracking-wider">Maximum Single Component</span>
              <span className="text-xl font-black text-[#193B32] mt-0.5 block">{score.maxScore} / 3</span>
              <p className="text-[10px] text-[#697B73] mt-1">Evaluated against prototype partial NEWS2 thresholds</p>
            </div>
            <div className="p-3 rounded-xl border border-[#E7ECE6] bg-white">
              <span className="text-[11px] text-[#697B73] block uppercase tracking-wider">Dispatcher Action</span>
              <span className="text-sm font-bold text-[#16866A] mt-1 block">
                {score.priority === 'P0' ? 'Dedicated zero-queue alert' : score.priority === 'P1' ? 'Nurse queue flagged (60m)' : 'Standard hourly stream'}
              </span>
              <p className="text-[10px] text-[#697B73] mt-1">Deterministic routing without AI black-box delays</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#16866A]/5 border border-[#16866A]/20 text-[11px] text-[#697B73] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#16866A] shrink-0 mt-0.5" />
            <p>
              <strong>Governance Statement:</strong> HEALTHGUARD does not produce automated pharmacological prescriptions or definitive diagnostic labels. All decision recommendations are auditable and require licensed clinical oversight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

