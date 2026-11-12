import React, { useState } from 'react';
import { 
  FileText, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Code2, 
  Layers, 
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  FHIR_PATIENT, 
  FHIR_OBSERVATIONS, 
  FHIR_DEVICE, 
  FHIR_AUDIT_EVENT 
} from '@/data/fhir-resources';

interface FhirRecordsViewProps {
  fhirOutage: boolean;
  onSimulateSync: () => void;
}

export const FhirRecordsView: React.FC<FhirRecordsViewProps> = ({
  fhirOutage,
  onSimulateSync
}) => {
  const [activeTab, setActiveTab] = useState<'Patient' | 'Observation' | 'Device' | 'Provenance' | 'AuditEvent'>('Observation');
  const [selectedObsKey, setSelectedObsKey] = useState<'heartRate' | 'respiratoryRate' | 'spo2' | 'temperature'>('heartRate');
  const [copied, setCopied] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const getResourceJson = () => {
    switch (activeTab) {
      case 'Patient':
        return FHIR_PATIENT;
      case 'Observation':
        return FHIR_OBSERVATIONS[selectedObsKey];
      case 'Device':
        return FHIR_DEVICE;
      case 'AuditEvent':
        return FHIR_AUDIT_EVENT;
      case 'Provenance':
        return {
          resourceType: 'Provenance',
          id: 'hg-prov-001',
          target: [{ reference: 'Observation/hg-obs-hr-001' }],
          recorded: new Date().toISOString(),
          reason: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ActReason', code: 'CLINNOTEE', display: 'clinical note entry' }] }],
          agent: [{ type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/provenance-participant-type', code: 'author' }] }, who: { reference: 'Device/hg-device-001' } }],
          signature: [{ type: [{ system: 'urn:iso-astm:E1762-95:2013', code: '1.2.840.10065.1.12.1.1', display: 'Author\'s Signature' }], when: new Date().toISOString(), who: { reference: 'Device/hg-device-001' }, data: 'ZXlKaGJHY2lPaUpTVXpJMU5pSjkuLi4=' }],
        };
      default:
        return {};
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(getResourceJson(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    onSimulateSync();
    setLastSyncTime(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A]/10 text-[#16866A] uppercase tracking-wider">
              HL7 FHIR R4 Compliant
            </span>
            <span className="text-xs text-[#697B73]">HAPI FHIR Clinical Repository</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">Clinical Interoperability</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            HL7 FHIR R4 resource management through HAPI FHIR. All synthetic observations are standardized with LOINC coding and SNOMED categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            fhirOutage
              ? 'bg-[#E45D58]/10 border-[#E45D58]/30 text-[#E45D58]'
              : 'bg-[#16866A]/10 border-[#16866A]/30 text-[#16866A]'
          }`}>
            {fhirOutage ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{fhirOutage ? 'FHIR Server: OFFLINE (Buffered)' : 'FHIR Server: CONNECTED'}</span>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#16866A] text-white hover:bg-[#126b55] transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulate Sync</span>
          </button>
        </div>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Resource Count</span>
          <span className="text-2xl font-black text-[#193B32] mt-0.5 block">1,480</span>
          <span className="text-[10px] text-[#16866A]">Observations, Patients, Devices</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Last Synchronization</span>
          <span className="text-2xl font-black text-[#193B32] mt-0.5 block">{lastSyncTime}</span>
          <span className="text-[10px] text-[#697B73]">Auto-sync on observation commit</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">FHIR Validation</span>
          <span className="text-2xl font-black text-[#16866A] mt-0.5 block">100% Valid</span>
          <span className="text-[10px] text-[#697B73]">StructureDefinition adherence</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Standardized Codings</span>
          <span className="text-2xl font-black text-[#193B32] mt-0.5 block">LOINC + SNOMED</span>
          <span className="text-[10px] text-[#697B73]">Standard US Core / Vital Signs</span>
        </div>
      </div>

      {/* FHIR Resource Explorer */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
        {/* Resource Type Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#E7ECE6]">
          <div className="flex items-center gap-1.5 bg-[#FAFBF8] p-1 rounded-xl border border-[#E7ECE6]">
            {(['Observation', 'Patient', 'Device', 'Provenance', 'AuditEvent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#16866A] text-white shadow-xs'
                    : 'text-[#697B73] hover:text-[#193B32]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAFBF8] border border-[#E7ECE6] text-[#193B32] hover:bg-gray-100 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#16866A]" />
              <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        {/* Observation Sub-selector */}
        {activeTab === 'Observation' && (
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-xs font-semibold text-[#697B73]">Select Observation Type:</span>
            {[
              { key: 'heartRate', label: 'Heart Rate (LOINC 8867-4)' },
              { key: 'respiratoryRate', label: 'Respiratory Rate (LOINC 9279-1)' },
              { key: 'spo2', label: 'Oxygen Saturation (LOINC 59408-5)' },
              { key: 'temperature', label: 'Body Temperature (LOINC 8310-5)' },
            ].map((obs) => (
              <button
                key={obs.key}
                onClick={() => setSelectedObsKey(obs.key as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedObsKey === obs.key
                    ? 'bg-[#16866A]/10 text-[#16866A] border border-[#16866A]/30 font-bold'
                    : 'bg-[#FAFBF8] text-[#697B73] border border-[#E7ECE6] hover:text-[#193B32]'
                }`}
              >
                {obs.label}
              </button>
            ))}
          </div>
        )}

        {/* Formatted JSON Syntax Viewer */}
        <div className="relative rounded-xl bg-[#193B32] p-4 font-mono text-xs text-white overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-white/60">
            <span>Resource: {activeTab} R4 Format</span>
            <span>schema: http://hl7.org/fhir/StructureDefinition/{activeTab.toLowerCase()}</span>
          </div>
          <pre className="text-emerald-300 leading-relaxed">
            {JSON.stringify(getResourceJson(), null, 2)}
          </pre>
        </div>

        {/* Interoperability Details */}
        <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-xs space-y-1.5 text-[#193B32]">
          <p className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16866A]" />
            HL7 FHIR R4 Integration Guarantee
          </p>
          <p className="text-[11px] text-[#697B73] leading-relaxed">
            All synthetic vitals map directly into standardized HL7 FHIR R4 Observation resources with validated UCUM units (e.g. <code>beats/min</code>, <code>breaths/min</code>, <code>%</code>, <code>Cel</code>). In production mode, bundles are committed transactionally to a HAPI FHIR JPA server.
          </p>
        </div>
      </div>
    </div>
  );
};

