import React, { useState } from 'react';
import { 
  FileText, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  Download, 
  Copy, 
  Code2, 
  Layers, 
  Clock,
  Wifi,
  WifiOff,
  User,
  Activity,
  Pill,
  Calendar,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { 
  FHIR_PATIENT, 
  FHIR_OBSERVATIONS, 
  FHIR_DEVICE, 
  FHIR_AUDIT_EVENT 
} from '@/data/fhir-resources';
import { PATIENTS } from '@/data/patients';

interface FhirRecordsViewProps {
  fhirOutage: boolean;
  onSimulateSync: () => void;
}

interface PatientFhirProfile {
  id: string;
  displayId: string;
  name: string;
  gender: string;
  birthDate: string;
  mrn: string;
  conditions: Array<{ code: string; display: string; recordedDate: string; severity: string }>;
  medications: Array<{ code: string; display: string; dosage: string; status: string }>;
  labs: Array<{ code: string; display: string; value: string; unit: string; range: string; date: string }>;
  encounters: Array<{ type: string; class: string; period: string; diagnosis: string }>;
}

const PATIENT_FHIR_PROFILES: Record<string, PatientFhirProfile> = {
  'HG-001': {
    id: 'P001',
    displayId: 'HG-001',
    name: 'Eleanor Vance (Synthea Cohort P001)',
    gender: 'female',
    birthDate: '1964-06-15',
    mrn: 'MRN-84920-FHIR-01',
    conditions: [
      { code: '840539006', display: 'COVID-19 Acute Respiratory Distress', recordedDate: '2026-10-28', severity: 'High' },
      { code: '91302008', display: 'Viral Sepsis secondary to Pneumonia', recordedDate: '2026-10-30', severity: 'Severe' },
      { code: '38341003', display: 'Essential Hypertension', recordedDate: '2021-03-12', severity: 'Moderate' },
      { code: '414915002', display: 'Class I Obesity (BMI 31.4)', recordedDate: '2019-07-22', severity: 'Chronic' },
    ],
    medications: [
      { code: '197361', display: 'Dexamethasone 6mg Tablet', dosage: '6 mg oral QD x 10 days', status: 'active' },
      { code: '855332', display: 'Apixaban 5mg Film-Coated Tablet', dosage: '5 mg oral BID (post-discharge DVT prophylaxis)', status: 'active' },
      { code: '866514', display: 'Amlodipine Besylate 5mg Tablet', dosage: '5 mg oral daily in morning', status: 'active' },
      { code: '203567', display: 'Albuterol Sulfate Inhalation Aerosol', dosage: '2 puffs Q4H PRN wheezing/dyspnea', status: 'active' },
    ],
    labs: [
      { code: '1988-5', display: 'C-Reactive Protein (CRP)', value: '48.2', unit: 'mg/L', range: '< 5.0 mg/L', date: '2026-11-12' },
      { code: '48065-7', display: 'D-Dimer Quantitative', value: '1.42', unit: 'ug/mL FEU', range: '< 0.50 ug/mL', date: '2026-11-12' },
      { code: '26474-7', display: 'Total White Blood Cell Count', value: '14.8', unit: '10*3/uL', range: '4.5 - 11.0', date: '2026-11-12' },
      { code: '33959-8', display: 'Serum Procalcitonin', value: '0.84', unit: 'ng/mL', range: '< 0.10 ng/mL', date: '2026-11-12' },
      { code: '2160-0', display: 'Serum Creatinine', value: '1.08', unit: 'mg/dL', range: '0.59 - 1.04', date: '2026-11-12' },
    ],
    encounters: [
      { type: 'Inpatient Hospitalization', class: 'IMP', period: '2026-10-28 to 2026-11-09', diagnosis: 'Severe COVID-19 Pneumonia with Hypoxia' },
      { type: 'ICU Stepdown Transition', class: 'EMER', period: '2026-11-02 to 2026-11-06', diagnosis: 'High-flow nasal cannula de-escalation' },
      { type: 'Post-Discharge Remote Tele-Surveillance', class: 'VR', period: '2026-11-09 to Present', diagnosis: 'Wearable remote biotelemetry monitoring' },
    ],
  },
  'HG-002': {
    id: 'P002',
    displayId: 'HG-002',
    name: 'Arthur Pendelton (Synthea Cohort P002)',
    gender: 'male',
    birthDate: '1984-03-22',
    mrn: 'MRN-39182-FHIR-02',
    conditions: [
      { code: '13645005', display: 'Chronic Obstructive Pulmonary Disease (COPD Gold II)', recordedDate: '2023-01-14', severity: 'Moderate' },
      { code: '87433001', display: 'Pulmonary Emphysema with Bullae', recordedDate: '2023-04-10', severity: 'Moderate' },
      { code: '232717009', display: 'Coronary Artery Bypass Graft (CABG x2)', recordedDate: '2025-08-19', severity: 'Post-Surgical' },
    ],
    medications: [
      { code: '608932', display: 'Tiotropium Bromide Dry Powder Inhaler', dosage: '18 mcg inhalation once daily', status: 'active' },
      { code: '104377', display: 'Fluticasone / Salmeterol 250/50 mcg', dosage: '1 puff BID', status: 'active' },
      { code: '861007', display: 'Metoprolol Succinate ER 25mg', dosage: '25 mg oral once daily', status: 'active' },
    ],
    labs: [
      { code: '2703-7', display: 'Arterial Blood Gas: PaO2', value: '64', unit: 'mmHg', range: '75 - 100', date: '2026-11-11' },
      { code: '2019-8', display: 'Arterial Blood Gas: PaCO2', value: '47', unit: 'mmHg', range: '35 - 45 (Baseline Hypercapnia)', date: '2026-11-11' },
      { code: '2028-9', display: 'Serum Bicarbonate (HCO3)', value: '29', unit: 'mEq/L', range: '22 - 29', date: '2026-11-11' },
    ],
    encounters: [
      { type: 'Emergency Department Visit', class: 'EMER', period: '2026-11-04', diagnosis: 'Acute Exacerbation of COPD' },
      { type: 'Observation Unit Discharge', class: 'AMB', period: '2026-11-05 to 2026-11-07', diagnosis: 'Steroid & Bronchodilator Stabilization' },
    ],
  },
  'HG-003': {
    id: 'P003',
    displayId: 'HG-003',
    name: 'Marcus Brody (Synthea Cohort P003)',
    gender: 'male',
    birthDate: '1949-11-04',
    mrn: 'MRN-57193-FHIR-03',
    conditions: [
      { code: '84114007', display: 'Congestive Heart Failure (NYHA Class III)', recordedDate: '2020-05-18', severity: 'High' },
      { code: '49436004', display: 'Atrial Fibrillation with Rapid Ventricular Response', recordedDate: '2022-09-08', severity: 'High' },
      { code: '709044004', display: 'Chronic Kidney Disease Stage 3a', recordedDate: '2024-02-14', severity: 'Moderate' },
    ],
    medications: [
      { code: '316049', display: 'Furosemide 40mg Tablet', dosage: '40 mg oral BID with weight titration protocol', status: 'active' },
      { code: '1657980', display: 'Sacubitril / Valsartan 24/26mg Tablet', dosage: '1 tablet oral BID', status: 'active' },
      { code: '197573', display: 'Digoxin 0.125mg Tablet', dosage: '0.125 mg oral once daily (hold if HR < 60)', status: 'active' },
    ],
    labs: [
      { code: '33762-6', display: 'NT-proBNP Quantitative', value: '3,840', unit: 'pg/mL', range: '< 450 pg/mL', date: '2026-11-12' },
      { code: '2823-3', display: 'Serum Potassium (K+)', value: '4.2', unit: 'mmol/L', range: '3.5 - 5.1', date: '2026-11-12' },
      { code: '2160-0', display: 'Serum Creatinine', value: '1.68', unit: 'mg/dL', range: '0.74 - 1.35', date: '2026-11-12' },
      { code: '3094-0', display: 'Blood Urea Nitrogen (BUN)', value: '34', unit: 'mg/dL', range: '7 - 20', date: '2026-11-12' },
    ],
    encounters: [
      { type: 'Heart Failure Stepdown', class: 'IMP', period: '2026-10-30 to 2026-11-08', diagnosis: 'Acute Decompensated Heart Failure' },
      { type: 'Cardiology Tele-Surveillance', class: 'VR', period: '2026-11-08 to Present', diagnosis: 'Daily dry weight & vitals tracking' },
    ],
  },
};

// Fallback generator for remaining patients
for (let i = 4; i <= 10; i++) {
  const hgId = `HG-00${i}`;
  const pId = `P00${i}`;
  if (!PATIENT_FHIR_PROFILES[hgId]) {
    PATIENT_FHIR_PROFILES[hgId] = {
      id: pId,
      displayId: hgId,
      name: `Synthea Cohort Subject ${pId} (${hgId})`,
      gender: i % 2 === 0 ? 'female' : 'male',
      birthDate: `${1955 + i * 2}-05-1${i}`,
      mrn: `MRN-${48200 + i * 111}-FHIR`,
      conditions: [
        { code: '38341003', display: 'Essential Hypertension', recordedDate: '2024-01-10', severity: 'Moderate' },
        { code: '44054006', display: 'Type 2 Diabetes Mellitus', recordedDate: '2023-08-15', severity: 'Moderate' },
        { code: '233604007', display: 'Post-Surgical Convalescence', recordedDate: '2026-11-01', severity: 'Monitored' },
      ],
      medications: [
        { code: '866514', display: 'Amlodipine Besylate 5mg Tablet', dosage: '5 mg oral daily', status: 'active' },
        { code: '860975', display: 'Metformin Hydrochloride 500mg', dosage: '500 mg oral BID with meals', status: 'active' },
      ],
      labs: [
        { code: '26474-7', display: 'Total White Blood Cell Count', value: '7.4', unit: '10*3/uL', range: '4.5 - 11.0', date: '2026-11-12' },
        { code: '2345-7', display: 'Fasting Plasma Glucose', value: '118', unit: 'mg/dL', range: '70 - 99', date: '2026-11-12' },
        { code: '2160-0', display: 'Serum Creatinine', value: '0.92', unit: 'mg/dL', range: '0.60 - 1.20', date: '2026-11-12' },
      ],
      encounters: [
        { type: 'Post-Discharge Telemetry', class: 'VR', period: '2026-11-08 to Present', diagnosis: 'Wearable Recovery Tele-Surveillance' },
      ],
    };
  }
}

export const FhirRecordsView: React.FC<FhirRecordsViewProps> = ({
  fhirOutage,
  onSimulateSync
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('HG-001');
  const [activeMainMode, setActiveMainMode] = useState<'clinicalReport' | 'hapiExplorer'>('clinicalReport');
  const [activeTab, setActiveTab] = useState<'Patient' | 'Observation' | 'Device' | 'Provenance' | 'AuditEvent'>('Observation');
  const [selectedObsKey, setSelectedObsKey] = useState<'heartRate' | 'respiratoryRate' | 'spo2' | 'temperature'>('heartRate');
  const [copied, setCopied] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const currentProfile = PATIENT_FHIR_PROFILES[selectedPatientId] || PATIENT_FHIR_PROFILES['HG-001'];
  const patientRecord = PATIENTS.find((p) => p.id === selectedPatientId) || PATIENTS[0];

  // Construct complete HL7 FHIR Bundle for the current patient
  const generatePatientFhirBundle = () => {
    return {
      resourceType: 'Bundle',
      id: `bundle-patient-${currentProfile.id.toLowerCase()}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${currentProfile.id}`,
          resource: {
            resourceType: 'Patient',
            id: currentProfile.id,
            identifier: [
              { system: 'http://hospital.healthguard.org/mrn', value: currentProfile.mrn },
              { system: 'http://healthguard.org/patient-id', value: currentProfile.displayId },
            ],
            active: true,
            name: [{ use: 'official', text: currentProfile.name }],
            gender: currentProfile.gender,
            birthDate: currentProfile.birthDate,
            managingOrganization: { display: 'HealthGuard Clinical Command Center' },
          },
        },
        ...currentProfile.conditions.map((cond, idx) => ({
          fullUrl: `urn:uuid:condition-${currentProfile.id}-${idx}`,
          resource: {
            resourceType: 'Condition',
            id: `cond-${currentProfile.id}-${idx}`,
            clinicalStatus: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
            },
            verificationStatus: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
            },
            code: {
              coding: [{ system: 'http://snomed.info/sct', code: cond.code, display: cond.display }],
              text: cond.display,
            },
            subject: { reference: `Patient/${currentProfile.id}` },
            recordedDate: cond.recordedDate,
            severity: { text: cond.severity },
          },
        })),
        ...currentProfile.medications.map((med, idx) => ({
          fullUrl: `urn:uuid:medication-${currentProfile.id}-${idx}`,
          resource: {
            resourceType: 'MedicationRequest',
            id: `med-${currentProfile.id}-${idx}`,
            status: med.status,
            intent: 'order',
            medicationCodeableConcept: {
              coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: med.code, display: med.display }],
              text: med.display,
            },
            subject: { reference: `Patient/${currentProfile.id}` },
            dosageInstruction: [{ text: med.dosage }],
          },
        })),
        {
          fullUrl: `urn:uuid:observation-hr-${currentProfile.id}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-hr-${currentProfile.id}`,
            status: 'final',
            category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
            code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
            subject: { reference: `Patient/${currentProfile.id}` },
            valueQuantity: { value: patientRecord.currentVitals.heartRate, unit: 'beats/min', system: 'http://unitsofmeasure.org', code: '/min' },
            effectiveDateTime: patientRecord.lastObservation,
          },
        },
        {
          fullUrl: `urn:uuid:observation-spo2-${currentProfile.id}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-spo2-${currentProfile.id}`,
            status: 'final',
            category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
            code: { coding: [{ system: 'http://loinc.org', code: '59408-5', display: 'Oxygen saturation' }] },
            subject: { reference: `Patient/${currentProfile.id}` },
            valueQuantity: { value: patientRecord.currentVitals.spo2, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
            effectiveDateTime: patientRecord.lastObservation,
          },
        },
        ...currentProfile.encounters.map((enc, idx) => ({
          fullUrl: `urn:uuid:encounter-${currentProfile.id}-${idx}`,
          resource: {
            resourceType: 'Encounter',
            id: `enc-${currentProfile.id}-${idx}`,
            status: 'finished',
            class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: enc.class },
            type: [{ text: enc.type }],
            subject: { reference: `Patient/${currentProfile.id}` },
            period: { text: enc.period },
            reasonCode: [{ text: enc.diagnosis }],
          },
        })),
      ],
    };
  };

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

  const handleCopyBundle = () => {
    navigator.clipboard.writeText(JSON.stringify(generatePatientFhirBundle(), null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(generatePatientFhirBundle(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentProfile.displayId}_${currentProfile.id}_FHIR_R4_Bundle.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRefresh = () => {
    onSimulateSync();
    setLastSyncTime(new Date().toLocaleTimeString());
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A]/10 text-[#16866A] uppercase tracking-wider">
              HL7 FHIR R4 & Synthea Clinical Repository
            </span>
            <span className="text-xs text-[#697B73]">HAPI FHIR Clinical Repository · US Core Profiles</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">FHIR Patient Clinical Reports & Resource Engine</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            Synthea R4 electronic health records parsed into standardized FHIR Patient, Condition, MedicationRequest, Observation, and Encounter resources with LOINC and SNOMED-CT clinical coding.
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

      {/* Mode Navigation Bar */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#F7F8F3] p-1 rounded-xl border border-[#E7ECE6] w-full sm:w-auto">
          <button
            onClick={() => setActiveMainMode('clinicalReport')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMainMode === 'clinicalReport'
                ? 'bg-[#16866A] text-white shadow-xs'
                : 'text-[#697B73] hover:text-[#193B32]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Patient Clinical Report ({selectedPatientId})</span>
          </button>
          <button
            onClick={() => setActiveMainMode('hapiExplorer')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMainMode === 'hapiExplorer'
                ? 'bg-[#16866A] text-white shadow-xs'
                : 'text-[#697B73] hover:text-[#193B32]'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>HAPI FHIR R4 Explorer</span>
          </button>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-[#697B73] whitespace-nowrap">Select Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#F7F8F3] border border-[#E7ECE6] text-[#193B32] focus:outline-none focus:border-[#16866A]"
          >
            {PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · Age {p.age} · {p.priority} · {p.conditions[0]}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#16866A]/10 text-[#16866A] border border-[#16866A]/30 hover:bg-[#16866A] hover:text-white transition-all cursor-pointer"
            title="Download full valid HL7 FHIR JSON bundle"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export FHIR JSON</span>
          </button>
        </div>
      </div>

      {activeMainMode === 'clinicalReport' ? (
        /* PATIENT CLINICAL REPORT PANEL */
        <div className="space-y-6">
          {/* Demographics Card */}
          <div className="bg-white rounded-2xl border border-[#E7ECE6] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7ECE6] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#16866A]/10 text-[#16866A] flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#193B32] flex items-center gap-2">
                    {currentProfile.name}
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#16866A]/10 text-[#16866A]">
                      {currentProfile.displayId} ({currentProfile.id})
                    </span>
                  </h3>
                  <p className="text-xs text-[#697B73]">
                    MRN: <code className="font-mono text-[#193B32]">{currentProfile.mrn}</code> · Gender: {currentProfile.gender.toUpperCase()} · DOB: {currentProfile.birthDate} ({patientRecord.age} yrs)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBundle}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#F7F8F3] border border-[#E7ECE6] text-[#193B32] hover:bg-[#E7ECE6] transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#16866A]" />
                  <span>{copied ? 'Copied Bundle!' : 'Copy Bundle JSON'}</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6]">
                <span className="text-[10px] uppercase font-bold text-[#697B73] block">Discharge Protocol</span>
                <span className="font-semibold text-[#193B32] mt-0.5 block leading-tight">{patientRecord.dischargeContext}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6]">
                <span className="text-[10px] uppercase font-bold text-[#697B73] block">Recovery Stage</span>
                <span className="font-bold text-[#16866A] mt-0.5 block">{patientRecord.recoveryStage} Stage Post-Discharge</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6]">
                <span className="text-[10px] uppercase font-bold text-[#697B73] block">Recovery Baseline</span>
                <span className="font-mono text-[#193B32] mt-0.5 block font-semibold">{patientRecord.recoveryBaseline}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6]">
                <span className="text-[10px] uppercase font-bold text-[#697B73] block">Current Telemetry</span>
                <span className="font-mono text-[#193B32] mt-0.5 block font-semibold">
                  HR {patientRecord.currentVitals.heartRate} · SpO₂ {patientRecord.currentVitals.spo2}% · RR {patientRecord.currentVitals.respiratoryRate}
                </span>
              </div>
            </div>
          </div>

          {/* Conditions & Medications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Conditions (Condition Resources) */}
            <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
                <h4 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#16866A]" />
                  <span>Active Conditions & Diagnoses (HL7 Condition)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                  SNOMED-CT Coded
                </span>
              </div>
              <div className="space-y-2.5">
                {currentProfile.conditions.map((cond, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6] flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-[#193B32]">{cond.display}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#697B73] mt-1">
                        <span>SNOMED: <code className="font-mono text-[#16866A]">{cond.code}</code></span>
                        <span>·</span>
                        <span>Recorded: {cond.recordedDate}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cond.severity === 'Severe' || cond.severity === 'High'
                        ? 'bg-[#E45D58]/10 text-[#E45D58]'
                        : 'bg-[#E6A23C]/10 text-[#E6A23C]'
                    }`}>
                      {cond.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptions & Medications (MedicationRequest) */}
            <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
                <h4 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#16866A]" />
                  <span>Active Prescriptions (MedicationRequest)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                  RxNorm Coded
                </span>
              </div>
              <div className="space-y-2.5">
                {currentProfile.medications.map((med, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6] flex items-start justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-[#193B32]">{med.display}</p>
                      <p className="text-[11px] text-[#697B73] mt-0.5">{med.dosage}</p>
                      <span className="text-[10px] text-[#697B73] mt-1 block">RxNorm: <code className="font-mono text-[#16866A]">{med.code}</code></span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16866A]/10 text-[#16866A] capitalize">
                      {med.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Labs & Encounters Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Baseline Observations & Lab Results (Observation) */}
            <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
                <h4 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#16866A]" />
                  <span>Baseline Observations & Lab Panels (Observation)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                  LOINC Coded
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7F8F3] text-[#697B73] font-bold border-b border-[#E7ECE6]">
                    <tr>
                      <th className="p-2.5">Test / LOINC</th>
                      <th className="p-2.5">Value</th>
                      <th className="p-2.5">Reference Range</th>
                      <th className="p-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7ECE6]">
                    {currentProfile.labs.map((lab, idx) => (
                      <tr key={idx} className="hover:bg-[#F7F8F3]/50">
                        <td className="p-2.5 font-semibold text-[#193B32]">
                          <div>{lab.display}</div>
                          <span className="text-[10px] font-mono text-[#697B73]">LOINC: {lab.code}</span>
                        </td>
                        <td className="p-2.5 font-bold text-[#16866A]">{lab.value} <span className="text-[10px] text-[#697B73] font-normal">{lab.unit}</span></td>
                        <td className="p-2.5 text-[#697B73]">{lab.range}</td>
                        <td className="p-2.5 text-[#697B73] font-mono">{lab.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Encounter History (Encounter) */}
            <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
                <h4 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#16866A]" />
                  <span>Encounter History (Encounter Resources)</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16866A]/10 text-[#16866A]">
                  HL7 v3 ActCode
                </span>
              </div>
              <div className="space-y-3">
                {currentProfile.encounters.map((enc, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#193B32]">{enc.type}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16866A]/10 text-[#16866A]">
                        Class: {enc.class}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#697B73] mt-1 font-mono">{enc.period}</p>
                    <p className="text-xs text-[#193B32] font-semibold mt-1">Diagnosis: {enc.diagnosis}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* HAPI FHIR R4 EXPLORER PANEL */
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
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(getResourceJson(), null, 2));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
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
          <div className="relative rounded-xl bg-[#193B32] p-4 font-mono text-xs text-white overflow-x-auto shadow-inner max-h-[500px]">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-white/60">
              <span>Resource: {activeTab} R4 Format</span>
              <span>schema: http://hl7.org/fhir/StructureDefinition/{activeTab.toLowerCase()}</span>
            </div>
            <pre className="text-emerald-300 leading-relaxed">
              {JSON.stringify(getResourceJson(), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
