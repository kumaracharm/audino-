import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Terminal, 
  AlertOctagon,
  Layers
} from 'lucide-react';
import { SecurityEvent } from '@/types';
import { AttackType } from '@/lib/security-simulator';
import { formatTimeSafe } from '@/lib/date-utils';

interface SecurityOperationsViewProps {
  securityEvents: SecurityEvent[];
  onTriggerAttack: (type: AttackType) => void;
}

export const SecurityOperationsView: React.FC<SecurityOperationsViewProps> = ({
  securityEvents,
  onTriggerAttack,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(
    securityEvents[0] || null
  );

  const stats = useMemo(() => {
    const total = 4280 + securityEvents.length;
    const rejected = securityEvents.filter((e) => e.result === 'REJECTED').length + 84;
    const replay = securityEvents.filter((e) => e.attackCategory === 'Replayed Request').length + 38;
    const sigFailures = securityEvents.filter((e) => e.attackCategory === 'Tampered Vital Reading').length + 29;
    const activeDevices = 10;
    return { total, rejected, replay, sigFailures, activeDevices };
  }, [securityEvents]);

  const attackButtons: { id: AttackType; label: string; stage: string; desc: string }[] = [
    { id: 'forged-identity', label: 'Forged Device Identity', stage: 'JWT Validation', desc: 'Fabricated token signature & invalid issuer' },
    { id: 'tampered-vital', label: 'Tampered Vital Reading', stage: 'HMAC Signature Verification', desc: 'Payload byte modified after transmission' },
    { id: 'replayed-request', label: 'Replayed Request', stage: 'Nonce / Replay Protection', desc: 'Duplicate nonce caught in sliding window' },
    { id: 'expired-timestamp', label: 'Expired Timestamp', stage: 'Timestamp Validation', desc: 'Delta >300s clock skew rejection' },
    { id: 'unauthorized-patient', label: 'Unauthorized Patient Mapping', stage: 'Patient-Device Authorization', desc: 'Device not provisioned for target patient' },
    { id: 'duplicate-event', label: 'Duplicate Event', stage: 'Payload Validation', desc: 'Idempotency key collision detected' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E45D58]/10 text-[#E45D58] uppercase tracking-wider">
              Zero-Trust Clinical Edge Security
            </span>
            <span className="text-xs text-[#697B73]">Mutual TLS + HMAC-SHA256 Gateway</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">Clinical Data Security Operations</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            Protecting the authenticity, cryptographic integrity, and freshness of remote patient observations before any telemetry reaches clinical triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#16866A]/10 text-[#16866A] border border-[#16866A]/20">
            <ShieldCheck className="w-4 h-4 text-[#16866A]" />
            Gateway Firewall: ENFORCING
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Authenticated</span>
          <span className="text-2xl font-black text-[#16866A] mt-0.5 block">{stats.total}</span>
          <span className="text-[10px] text-[#697B73]">Verified telemetry frames</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E45D58]/30 shadow-xs bg-gradient-to-br from-white to-[#E45D58]/5">
          <span className="text-[10px] font-bold text-[#E45D58] uppercase tracking-wider block">Rejected Requests</span>
          <span className="text-2xl font-black text-[#E45D58] mt-0.5 block">{stats.rejected}</span>
          <span className="text-[10px] text-[#E45D58]">Blocked at edge</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Replay Attempts</span>
          <span className="text-2xl font-black text-[#193B32] mt-0.5 block">{stats.replay}</span>
          <span className="text-[10px] text-[#697B73]">Duplicate nonces caught</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Signature Failures</span>
          <span className="text-2xl font-black text-[#193B32] mt-0.5 block">{stats.sigFailures}</span>
          <span className="text-[10px] text-[#697B73]">HMAC-SHA256 mismatch</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Active Devices</span>
          <span className="text-2xl font-black text-[#16866A] mt-0.5 block">{stats.activeDevices}</span>
          <span className="text-[10px] text-[#16866A]">Paired medical sensors</span>
        </div>
      </div>

      {/* Security Validation Pipeline Flow */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
          <h3 className="text-xs font-bold text-[#193B32] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#16866A]" />
            Multi-Stage Zero-Trust Validation Pipeline
          </h3>
          <span className="text-[10px] text-[#697B73]">
            Untrusted telemetry is dropped before reaching clinical decision processing
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1 text-center">
          {[
            { step: '1', title: 'Device Identity', desc: 'Hardware GUID check' },
            { step: '2', title: 'JWT Validation', desc: 'RS256 token claim' },
            { step: '3', title: 'HMAC Signature', desc: 'SHA-256 integrity' },
            { step: '4', title: 'Timestamp Check', desc: 'Max 300s drift' },
            { step: '5', title: 'Nonce / Replay', desc: 'Sliding bloom filter' },
            { step: '6', title: 'Patient Auth', desc: 'Device-to-patient map' },
            { step: '7', title: 'Payload Validation', desc: 'JSON schema & range' },
            { step: '8', title: 'Clinical Queue', desc: 'Zero-queue dispatch' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                idx === 7
                  ? 'bg-[#16866A]/10 border-[#16866A]/30 text-[#16866A]'
                  : 'bg-[#FAFBF8] border-[#E7ECE6] text-[#193B32]'
              }`}
            >
              <span className="text-[9px] font-bold text-[#697B73] block">STAGE 0{item.step}</span>
              <p className="font-bold text-xs mt-0.5 leading-tight">{item.title}</p>
              <p className="text-[9px] text-[#697B73] mt-1 line-clamp-1">{item.desc}</p>
              <div className="mt-2 pt-1.5 border-t border-[#E7ECE6] flex items-center justify-center gap-1 text-[10px] font-bold text-[#16866A]">
                <CheckCircle2 className="w-3 h-3" />
                <span>Passed</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attacker Simulator Panel */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
          <div>
            <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#E45D58]" />
              Controlled Cyber-Physical Attack Simulator
            </h3>
            <p className="text-xs text-[#697B73] mt-0.5">
              Click any vector to inject simulated telemetry attacks against the edge validation pipeline:
            </p>
          </div>
          <span className="text-[10px] font-bold bg-[#E45D58]/10 text-[#E45D58] px-2 py-0.5 rounded">
            SIMULATED ATTACK CONSOLE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attackButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => onTriggerAttack(btn.id)}
              className="p-3 rounded-xl border border-[#E7ECE6] bg-[#FAFBF8] hover:bg-[#E45D58]/5 hover:border-[#E45D58]/40 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#193B32] group-hover:text-[#E45D58] transition-colors">
                  {btn.label}
                </span>
                <span className="text-[10px] text-[#697B73] group-hover:text-[#E45D58]">Inject →</span>
              </div>
              <p className="text-[11px] text-[#16866A] font-semibold mt-1">Interception: {btn.stage}</p>
              <p className="text-[10px] text-[#697B73] mt-0.5">{btn.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Defender Event Console (Left) & Cryptographic Proof Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security Event Log (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
              <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#16866A]" />
                Security Gateway Event Log ({securityEvents.length} Events)
              </h3>
              <span className="text-[10px] text-[#697B73]">Click event to inspect payload</span>
            </div>

            <div className="space-y-2 mt-3 max-h-[380px] overflow-y-auto pr-1">
              {securityEvents.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#E45D58]/10 border-[#E45D58]/40'
                        : 'bg-[#FAFBF8] border-[#E7ECE6] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#193B32]">{evt.id}</span>
                        <span className="text-[11px] font-semibold text-[#697B73]">({evt.deviceId})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E45D58] text-white">
                          {evt.result}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16866A]/10 text-[#16866A]">
                          Clinical: BLOCKED
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-[#193B32] mt-1">{evt.attackCategory}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#697B73] mt-1 pt-1 border-t border-gray-200/60">
                      <span>Interception: <strong>{evt.detectionStage}</strong></span>
                      <span>{formatTimeSafe(evt.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-[#697B73] pt-3 border-t border-[#E7ECE6] mt-3">
            Core Security Guarantee: Malicious or replay payloads are rejected at the edge gateway before reaching clinical decision processing.
          </p>
        </div>

        {/* Cryptographic Event Detail Drawer (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
            <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#16866A]" />
              Cryptographic Payload Proof Drawer
            </h3>
            <span className="text-[10px] font-mono text-[#697B73]">
              {selectedEvent ? selectedEvent.id : 'No selection'}
            </span>
          </div>

          {selectedEvent ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-1">
                <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Attack Category</span>
                <span className="text-sm font-bold text-[#E45D58] block">{selectedEvent.attackCategory}</span>
                <span className="text-[11px] text-[#697B73]">Caught at: {selectedEvent.detectionStage}</span>
              </div>

              {/* Masked Cryptographic fields */}
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block text-[9px] uppercase font-sans font-bold">HMAC-SHA256 Signature</span>
                  <span className="text-[#193B32] font-semibold break-all">
                    {selectedEvent.details.hmac || 'HMAC-SHA256: 7f83b1657ff1... [VALID MASKED]'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block text-[9px] uppercase font-sans font-bold">JWT Bearer Claim</span>
                  <span className="text-[#193B32] font-semibold break-all">
                    {selectedEvent.details.jwt || 'eyJhbGciOiJSUzI1NiJ9... [MASKED CLAIM]'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                    <span className="text-[#697B73] block text-[9px] uppercase font-sans font-bold">Nonce</span>
                    <span className="text-[#193B32] font-semibold truncate block">
                      {selectedEvent.details.nonce || 'nonce-99214'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                    <span className="text-[#697B73] block text-[9px] uppercase font-sans font-bold">Sequence Num</span>
                    <span className="text-[#193B32] font-semibold truncate block">
                      {selectedEvent.details.sequenceNumber || 'SEQ-00412'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                    <span className="text-[#697B73] block text-[9px] uppercase font-sans font-bold">Device Binding</span>
                    <span className={`font-semibold block ${
                      selectedEvent.details.deviceBinding === 'UNAUTHORIZED' || selectedEvent.details.deviceBinding === 'UNVERIFIED'
                        ? 'text-[#E45D58]'
                        : 'text-[#16866A]'
                    }`}>
                      {selectedEvent.details.deviceBinding || 'BOUND'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                    <span className="text-[#697B73] block text-[9px] uppercase font-sans font-bold">Idempotency Key</span>
                    <span className="text-[#193B32] font-semibold truncate block">
                      {selectedEvent.details.idempotencyKey || 'IK-9921'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#E45D58]/10 border border-[#E45D58]/30 text-[11px] text-[#193B32] flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-[#E45D58] shrink-0 mt-0.5" />
                <p>
                  <strong>Clinical Firewall Verdict:</strong> Telemetry was purged at edge API gateway. No patient parameters reached Redis priority triage or HAPI FHIR storage.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#697B73]">
              Select an event to inspect cryptographic verification proofs
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
