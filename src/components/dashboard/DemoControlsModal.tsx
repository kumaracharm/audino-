import React from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Zap, 
  Activity, 
  ShieldAlert, 
  RotateCcw, 
  WifiOff, 
  AlertTriangle,
  Flame,
  CheckCircle2,
  Info
} from 'lucide-react';
import { AttackType } from '@/lib/security-simulator';

interface DemoControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationActive: boolean;
  onToggleSimulation: () => void;
  onGenerateNormal: () => void;
  onGenerateAbnormal: () => void;
  onTriggerUrgent: () => void;
  onSimulateReplayAttack: (type?: AttackType) => void;
  onToggleFhirOutage: () => void;
  fhirOutage: boolean;
  onResetDemo: () => void;
}

export const DemoControlsModal: React.FC<DemoControlsModalProps> = ({
  isOpen,
  onClose,
  simulationActive,
  onToggleSimulation,
  onGenerateNormal,
  onGenerateAbnormal,
  onTriggerUrgent,
  onSimulateReplayAttack,
  onToggleFhirOutage,
  fhirOutage,
  onResetDemo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-[#E7ECE6] shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#E7ECE6] flex items-center justify-between bg-[#F7F8F3]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#16866A] text-white flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#193B32]">Live Presentation Control Panel</h2>
              <p className="text-[11px] text-[#697B73]">Inject events & simulate real-world post-discharge scenarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#697B73] hover:text-[#193B32] hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Note */}
          <div className="p-3 rounded-xl bg-[#16866A]/5 border border-[#16866A]/20 flex items-start gap-2.5 text-xs text-[#193B32]">
            <Info className="w-4 h-4 text-[#16866A] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              All scenarios execute deterministic clinical priority routing and zero-queue bypass logic locally without external dependencies.
            </p>
          </div>

          {/* Section 1: Telemetry Stream Loop */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#193B32] uppercase tracking-wider block">
              1. Continuous Telemetry Stream
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E7ECE6] bg-[#FAFBF8]">
              <div>
                <p className="text-xs font-semibold text-[#193B32]">Simulated Vital Pulse (3s interval)</p>
                <p className="text-[11px] text-[#697B73]">Injects continuous randomized sensor ticks across cohort</p>
              </div>
              <button
                onClick={onToggleSimulation}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  simulationActive 
                    ? 'bg-[#E45D58] hover:bg-[#cf4d48] text-white' 
                    : 'bg-[#16866A] hover:bg-[#126b55] text-white'
                }`}
              >
                {simulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{simulationActive ? 'Pause Stream' : 'Start Stream'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Clinical Deterioration Injections */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#193B32] uppercase tracking-wider block">
              2. Clinical Vital Observation Injections
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => { onGenerateNormal(); onClose(); }}
                className="p-3 rounded-xl border border-[#E7ECE6] hover:border-[#16866A] hover:bg-[#16866A]/5 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#193B32]">Normal Reading</span>
                  <Activity className="w-3.5 h-3.5 text-[#16866A]" />
                </div>
                <p className="text-[10px] text-[#697B73]">HR 72, RR 16, SpO₂ 98%, Temp 36.8°C (P2/P3)</p>
              </button>

              <button
                onClick={() => { onGenerateAbnormal(); onClose(); }}
                className="p-3 rounded-xl border border-[#E7ECE6] hover:border-[#E6A23C] hover:bg-[#E6A23C]/5 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#E6A23C]">Mild Deviation</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E6A23C]" />
                </div>
                <p className="text-[10px] text-[#697B73]">Score 1-2 Component (Triggers P1 Nursing Review)</p>
              </button>

              <button
                onClick={() => { onTriggerUrgent(); onClose(); }}
                className="p-3 rounded-xl border border-[#E45D58]/40 bg-[#E45D58]/5 hover:bg-[#E45D58]/10 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#E45D58]">Trigger P0 Urgent</span>
                  <Flame className="w-3.5 h-3.5 text-[#E45D58]" />
                </div>
                <p className="text-[10px] text-[#697B73]">HR 136, RR 28, SpO₂ 89% (Zero-queue triage alert)</p>
              </button>
            </div>
          </div>

          {/* Section 3: Cyber-Security & Edge Injections */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#193B32] uppercase tracking-wider block">
              3. Cyber-Security Attack Interception
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => { onSimulateReplayAttack('replayed-request'); onClose(); }}
                className="p-2.5 rounded-xl border border-[#E7ECE6] hover:border-[#E45D58] hover:bg-[#E45D58]/5 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#E45D58]" />
                  <span className="text-xs font-bold text-[#193B32]">Simulate Replay Attack</span>
                </div>
                <p className="text-[10px] text-[#697B73]">Catches duplicate nonce before clinical engine</p>
              </button>

              <button
                onClick={() => { onSimulateReplayAttack('tampered-vital'); onClose(); }}
                className="p-2.5 rounded-xl border border-[#E7ECE6] hover:border-[#E45D58] hover:bg-[#E45D58]/5 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#E45D58]" />
                  <span className="text-xs font-bold text-[#193B32]">Tampered Telemetry HMAC</span>
                </div>
                <p className="text-[10px] text-[#697B73]">Simulates modified payload signature failure</p>
              </button>
            </div>
          </div>

          {/* Section 4: Infrastructure Chaos Simulation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#193B32] uppercase tracking-wider block">
              4. Interoperability & Resiliency Chaos
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E7ECE6] bg-[#FAFBF8]">
              <div>
                <p className="text-xs font-semibold text-[#193B32]">Simulate HAPI FHIR Server Outage</p>
                <p className="text-[11px] text-[#697B73]">
                  {fhirOutage 
                    ? 'FHIR outage simulated: Offline queue buffering active in Redis' 
                    : 'FHIR server online and actively processing bundles'}
                </p>
              </div>
              <button
                onClick={onToggleFhirOutage}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  fhirOutage
                    ? 'bg-[#E45D58] text-white'
                    : 'bg-[#F7F8F3] border border-[#E7ECE6] text-[#193B32] hover:bg-gray-100'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span>{fhirOutage ? 'Restore FHIR' : 'Simulate Outage'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E7ECE6] bg-[#F7F8F3] flex items-center justify-between">
          <button
            onClick={() => { onResetDemo(); onClose(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#697B73] hover:text-[#193B32] bg-white border border-[#E7ECE6] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#16866A] text-white hover:bg-[#126b55] transition-all cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
