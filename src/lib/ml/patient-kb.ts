// Layer 3: Patient Knowledge Base (Patient KB)
// Stores runtime-safe contextual facts per patient (lookup key: patientId)

import { PatientKBRecordV1 } from './types';

export const PATIENT_KB_RECORDS: Record<string, PatientKBRecordV1> = {
  'HG-001': {
    patientId: 'HG-001',
    recordVersion: 3,
    demographics: { age: 71, gender: 'M', cohort: 'Post-CABG Recovery' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Coronary Artery Bypass Graft (3-vessel)', evidenceRef: 'Condition/COND-001-CABG', icd10: 'Z95.1' },
        { condition: 'Mild Chronic Kidney Disease (Stage 2)', evidenceRef: 'Condition/COND-001-CKD', icd10: 'N18.2' },
        { condition: 'Hypertension', evidenceRef: 'Condition/COND-001-HTN', icd10: 'I10' },
      ],
      verifiedProcedures: [
        { procedure: 'Coronary Artery Bypass Grafting x3', date: '2026-11-04', evidenceRef: 'Procedure/PROC-001' },
      ],
      allergyStatus: 'No known drug allergies',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-001',
      primaryCondition: 'Post-CABG day 8 surgical convalescence',
      recoveryPhase: 'early',
      dischargeDate: '2026-11-09',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-001-MET', 'MedicationRequest/MED-001-ASP'],
      activeMedications: [
        { name: 'Metoprolol Succinate', dosage: '50mg daily', class: 'Beta-1 Blocker', physiologicalImpact: 'Blunts chronotropic HR response under stress' },
        { name: 'Aspirin', dosage: '81mg daily', class: 'Antiplatelet', physiologicalImpact: 'Bleeding vigilance' },
        { name: 'Atorvastatin', dosage: '40mg daily', class: 'Statin', physiologicalImpact: 'Lipid stabilization' },
      ],
      currentAdherence: 'confirmed',
    },
    recoveryPlanRef: 'CarePlan/CP-001-CARDIAC',
    personalization: {
      oxygenScale: 1, // Standard oxygen target >= 96%
      baselineProfileRef: 'BASELINE-P001-V4',
    },
    careTeamRef: 'CareTeam/TEAM-CARDIO-ALPHA',
  },

  'HG-002': {
    patientId: 'HG-002',
    recordVersion: 2,
    demographics: { age: 68, gender: 'F', cohort: 'Severe COPD Post-Exacerbation' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Chronic Obstructive Pulmonary Disease (GOLD III)', evidenceRef: 'Condition/COND-002-COPD', icd10: 'J44.1' },
        { condition: 'Chronic Hypercapnic Respiratory Failure', evidenceRef: 'Condition/COND-002-HYPERCAP', icd10: 'J96.1' },
      ],
      verifiedProcedures: [
        { procedure: 'Non-invasive positive pressure ventilation weaning', date: '2026-11-06', evidenceRef: 'Procedure/PROC-002' },
      ],
      allergyStatus: 'Penicillin (mild cutaneous rash)',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-002',
      primaryCondition: 'Acute COPD Exacerbation',
      recoveryPhase: 'early',
      dischargeDate: '2026-11-08',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-002-TIOT', 'MedicationRequest/MED-002-PRED'],
      activeMedications: [
        { name: 'Tiotropium Inhaler', dosage: '18mcg daily', class: 'LAMA Bronchodilator', physiologicalImpact: 'Airway resistance reduction' },
        { name: 'Prednisone Taper', dosage: '20mg daily', class: 'Systemic Corticosteroid', physiologicalImpact: 'Inflammation control' },
      ],
      currentAdherence: 'reported',
    },
    recoveryPlanRef: 'CarePlan/CP-002-PULM',
    personalization: {
      oxygenScale: 2, // Authorized Target: 88-92% (NEWS2 Scale 2 to prevent hypoxic drive loss)
      baselineProfileRef: 'BASELINE-P002-V2',
    },
    careTeamRef: 'CareTeam/TEAM-PULM-BETA',
  },

  'HG-003': {
    patientId: 'HG-003',
    recordVersion: 1,
    demographics: { age: 59, gender: 'M', cohort: 'Post-Sepsis Convalescence' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Urosepsis (resolved)', evidenceRef: 'Condition/COND-003-SEPSIS', icd10: 'A41.9' },
        { condition: 'Type 2 Diabetes Mellitus', evidenceRef: 'Condition/COND-003-T2D', icd10: 'E11.9' },
      ],
      verifiedProcedures: [
        { procedure: 'IV Ceftriaxone 7-day course', date: '2026-11-07', evidenceRef: 'Procedure/PROC-003' },
      ],
      allergyStatus: 'No known allergies',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-003',
      primaryCondition: 'Post-septic inflammatory resolution',
      recoveryPhase: 'mid',
      dischargeDate: '2026-11-10',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-003-AUGM'],
      activeMedications: [
        { name: 'Amoxicillin-Clavulanate', dosage: '875mg BID', class: 'Oral Antibiotic', physiologicalImpact: 'Microbial eradication' },
        { name: 'Metformin', dosage: '500mg BID', class: 'Biguanide', physiologicalImpact: 'Glycemic control' },
      ],
      currentAdherence: 'confirmed',
    },
    recoveryPlanRef: 'CarePlan/CP-003-INFECTIOUS',
    personalization: {
      oxygenScale: 1,
      baselineProfileRef: 'BASELINE-P003-V1',
    },
    careTeamRef: 'CareTeam/TEAM-INFECT-GAMMA',
  },

  'HG-004': {
    patientId: 'HG-004',
    recordVersion: 2,
    demographics: { age: 74, gender: 'F', cohort: 'Congestive Heart Failure NYHA III' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Heart Failure with Reduced Ejection Fraction (EF 32%)', evidenceRef: 'Condition/COND-004-HFrEF', icd10: 'I50.22' },
        { condition: 'Atrial Fibrillation', evidenceRef: 'Condition/COND-004-AFIB', icd10: 'I48.0' },
      ],
      verifiedProcedures: [
        { procedure: 'Cardioversion and Diuresis Protocol', date: '2026-11-05', evidenceRef: 'Procedure/PROC-004' },
      ],
      allergyStatus: 'Sulfa drugs (hives)',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-004',
      primaryCondition: 'Acute Decompensated Heart Failure',
      recoveryPhase: 'early',
      dischargeDate: '2026-11-09',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-004-FUROS', 'MedicationRequest/MED-004-ENTR'],
      activeMedications: [
        { name: 'Furosemide', dosage: '40mg daily', class: 'Loop Diuretic', physiologicalImpact: 'Volume depletion monitoring' },
        { name: 'Sacubitril/Valsartan', dosage: '24/26mg BID', class: 'ARNI', physiologicalImpact: 'Hemodynamic unloading' },
      ],
      currentAdherence: 'confirmed',
    },
    recoveryPlanRef: 'CarePlan/CP-004-HF',
    personalization: {
      oxygenScale: 1,
      baselineProfileRef: 'BASELINE-P004-V2',
    },
    careTeamRef: 'CareTeam/TEAM-CARDIO-ALPHA',
  },

  'HG-005': {
    patientId: 'HG-005',
    recordVersion: 1,
    demographics: { age: 62, gender: 'M', cohort: 'Bacterial Pneumonia Post-Admission' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Community-Acquired Pneumonia (Right Middle Lobe)', evidenceRef: 'Condition/COND-005-PNEUM', icd10: 'J18.9' },
      ],
      verifiedProcedures: [
        { procedure: 'Supplemental O2 cannula titration', date: '2026-11-08', evidenceRef: 'Procedure/PROC-005' },
      ],
      allergyStatus: 'No known allergies',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-005',
      primaryCondition: 'Resolving Pneumonia',
      recoveryPhase: 'early',
      dischargeDate: '2026-11-10',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-005-LEVO'],
      activeMedications: [
        { name: 'Levofloxacin', dosage: '500mg daily', class: 'Fluoroquinolone', physiologicalImpact: 'Antimicrobial therapy' },
      ],
      currentAdherence: 'confirmed',
    },
    recoveryPlanRef: 'CarePlan/CP-005-PNEUM',
    personalization: {
      oxygenScale: 1,
      baselineProfileRef: 'BASELINE-P005-V1',
    },
    careTeamRef: 'CareTeam/TEAM-PULM-BETA',
  },

  'HG-006': {
    patientId: 'HG-006',
    recordVersion: 1,
    demographics: { age: 53, gender: 'F', cohort: 'Elective Laparoscopic Colectomy' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Sigmoid Diverticular Disease', evidenceRef: 'Condition/COND-006-DIV', icd10: 'K57.30' },
      ],
      verifiedProcedures: [
        { procedure: 'Laparoscopic Sigmoid Resection', date: '2026-11-06', evidenceRef: 'Procedure/PROC-006' },
      ],
      allergyStatus: 'Codeine (nausea)',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-006',
      primaryCondition: 'Post-operative Day 5 abdominal recovery',
      recoveryPhase: 'mid',
      dischargeDate: '2026-11-09',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-006-ACET'],
      activeMedications: [
        { name: 'Acetaminophen', dosage: '650mg Q6H PRN', class: 'Analgesic', physiologicalImpact: 'Mild antipyretic' },
      ],
      currentAdherence: 'reported',
    },
    recoveryPlanRef: 'CarePlan/CP-006-SURG',
    personalization: {
      oxygenScale: 1,
      baselineProfileRef: 'BASELINE-P006-V1',
    },
    careTeamRef: 'CareTeam/TEAM-SURG-DELTA',
  },

  'HG-007': {
    patientId: 'HG-007',
    recordVersion: 1,
    demographics: { age: 79, gender: 'M', cohort: 'Total Hip Arthroplasty (THA)' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Severe Osteoarthritis Right Hip', evidenceRef: 'Condition/COND-007-OA', icd10: 'M16.11' },
      ],
      verifiedProcedures: [
        { procedure: 'Right Total Hip Arthroplasty', date: '2026-11-07', evidenceRef: 'Procedure/PROC-007' },
      ],
      allergyStatus: 'No known allergies',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-007',
      primaryCondition: 'Post-THA Day 4 mobility protocol',
      recoveryPhase: 'early',
      dischargeDate: '2026-11-09',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-007-ENOX'],
      activeMedications: [
        { name: 'Enoxaparin', dosage: '40mg subQ daily', class: 'LMWH Anticoagulant', physiologicalImpact: 'DVT prophylaxis' },
      ],
      currentAdherence: 'confirmed',
    },
    recoveryPlanRef: 'CarePlan/CP-007-ORTHO',
    personalization: {
      oxygenScale: 1,
      baselineProfileRef: 'BASELINE-P007-V1',
    },
    careTeamRef: 'CareTeam/TEAM-ORTHO-EPSILON',
  },

  'HG-008': {
    patientId: 'HG-008',
    recordVersion: 2,
    demographics: { age: 66, gender: 'F', cohort: 'Pulmonary Embolism Post-Anticoagulation' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Submassive Segmental Pulmonary Embolism', evidenceRef: 'Condition/COND-008-PE', icd10: 'I26.92' },
      ],
      verifiedProcedures: [
        { procedure: 'CT Pulmonary Angiography', date: '2026-11-04', evidenceRef: 'Procedure/PROC-008' },
      ],
      allergyStatus: 'Iodinated contrast (pre-medicated)',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-008',
      primaryCondition: 'Resolving PE on Apixaban',
      recoveryPhase: 'early',
      dischargeDate: '2026-11-09',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-008-APIX'],
      activeMedications: [
        { name: 'Apixaban', dosage: '10mg BID load', class: 'Direct Factor Xa Inhibitor', physiologicalImpact: 'Anticoagulation' },
      ],
      currentAdherence: 'confirmed',
    },
    recoveryPlanRef: 'CarePlan/CP-008-VASCULAR',
    personalization: {
      oxygenScale: 1,
      baselineProfileRef: 'BASELINE-P008-V2',
    },
    careTeamRef: 'CareTeam/TEAM-CARDIO-ALPHA',
  },

  'HG-009': {
    patientId: 'HG-009',
    recordVersion: 1,
    demographics: { age: 48, gender: 'M', cohort: 'Diabetic Ketoacidosis Post-Stabilization' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'DKA precipitated by acute gastroenteritis', evidenceRef: 'Condition/COND-009-DKA', icd10: 'E10.10' },
      ],
      verifiedProcedures: [
        { procedure: 'IV Insulin protocol with electrolyte repletion', date: '2026-11-08', evidenceRef: 'Procedure/PROC-009' },
      ],
      allergyStatus: 'No known allergies',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-009',
      primaryCondition: 'Euglycemic post-DKA maintenance',
      recoveryPhase: 'early',
      dischargeDate: '2026-11-10',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-009-GLAR'],
      activeMedications: [
        { name: 'Insulin Glargine', dosage: '24 units QHS', class: 'Basal Insulin', physiologicalImpact: 'Ketogenesis suppression' },
      ],
      currentAdherence: 'confirmed',
    },
    recoveryPlanRef: 'CarePlan/CP-009-ENDO',
    personalization: {
      oxygenScale: 1,
      baselineProfileRef: 'BASELINE-P009-V1',
    },
    careTeamRef: 'CareTeam/TEAM-MED-ZETA',
  },

  'HG-010': {
    patientId: 'HG-010',
    recordVersion: 1,
    demographics: { age: 83, gender: 'F', cohort: 'Fragile Elderly Post-Fall with Concussion' },
    clinicalHistory: {
      documentedConditions: [
        { condition: 'Mild Traumatic Brain Injury / Concussion', evidenceRef: 'Condition/COND-010-TBI', icd10: 'S06.0X0A' },
        { condition: 'Orthostatic Hypotension', evidenceRef: 'Condition/COND-010-ORTHO', icd10: 'I95.1' },
      ],
      verifiedProcedures: [
        { procedure: 'Non-contrast Head CT (negative for hemorrhage)', date: '2026-11-09', evidenceRef: 'Procedure/PROC-010' },
      ],
      allergyStatus: 'Latex sensitivity',
    },
    dischargeContext: {
      encounterRef: 'Encounter/ENC-010',
      primaryCondition: 'Neurological observation and fall recovery',
      recoveryPhase: 'early',
      dischargeDate: '2026-11-11',
    },
    medicationContext: {
      prescriptionRefs: ['MedicationRequest/MED-010-FLUD'],
      activeMedications: [
        { name: 'Fludrocortisone', dosage: '0.1mg daily', class: 'Mineralocorticoid', physiologicalImpact: 'Intravascular volume expansion' },
      ],
      currentAdherence: 'reported',
    },
    recoveryPlanRef: 'CarePlan/CP-010-GERIATRIC',
    personalization: {
      oxygenScale: 1,
      baselineProfileRef: 'BASELINE-P010-V1',
    },
    careTeamRef: 'CareTeam/TEAM-GERI-ETA',
  },
};

export function getPatientKBRecord(patientId: string): PatientKBRecordV1 {
  return PATIENT_KB_RECORDS[patientId] || PATIENT_KB_RECORDS['HG-001'];
}

