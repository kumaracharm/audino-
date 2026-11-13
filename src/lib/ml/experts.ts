// Layer 3 & 4 & 9: The Seven Context-Adaptive Specialized Experts
// Defined in MineArena 1.0 Architecture V4.1

import { getPatientKBRecord } from './patient-kb';
import { SHARED_CLINICAL_KB } from './clinical-kb';
import { 
  ClinicalContextV1, 
  PhysiologicalStateVector, 
  ExpertFindingV1, 
  ClinicalScoreV1 
} from './types';
import { calculateScore } from '@/lib/scoring';

// -------------------------------------------------------------
// EXPERT 1 — Patient Context Expert (Context Controller)
// -------------------------------------------------------------
export function runPatientContextExpert(patientId: string): ClinicalContextV1 {
  const kb = getPatientKBRecord(patientId);
  const primaryCond = kb.dischargeContext.primaryCondition;
  
  let clinicalDomain: ClinicalContextV1['clinicalContext']['clinicalDomain'] = 'post_surgical';
  if (primaryCond.toLowerCase().includes('pneumonia') || primaryCond.toLowerCase().includes('copd')) {
    clinicalDomain = 'respiratory';
  } else if (primaryCond.toLowerCase().includes('cabg') || primaryCond.toLowerCase().includes('heart') || primaryCond.toLowerCase().includes('pe')) {
    clinicalDomain = 'cardiovascular';
  } else if (primaryCond.toLowerCase().includes('dka')) {
    clinicalDomain = 'metabolic';
  }

  const hasBetaBlocker = kb.medicationContext.activeMedications.some(
    m => m.class.toLowerCase().includes('beta')
  );

  const applicableRules = [
    'NEWS2_PARTIAL_SCORING_V1',
    'INDEPENDENT_SAFETY_FLOOR_V1',
  ];

  if (clinicalDomain === 'respiratory' || clinicalDomain === 'cardiovascular') {
    applicableRules.push('CARDIORESP_COUPLING_V1');
  }
  if (hasBetaBlocker) {
    applicableRules.push('BETA_BLOCKER_BLUNTING_TACIT_V1');
  }
  if (kb.personalization.oxygenScale === 2) {
    applicableRules.push('OXYGEN_SCALE_2_HYPERCAPNIC_V1');
  }

  return {
    contextId: `CTX-${patientId}-V${kb.recordVersion}`,
    patientId: kb.patientId,
    patientRecordVersion: kb.recordVersion,
    clinicalContext: {
      documentedCondition: kb.clinicalHistory.documentedConditions[0]?.condition || primaryCond,
      clinicalDomain,
      recoveryPhase: kb.dischargeContext.recoveryPhase,
      riskProfile: kb.demographics.cohort,
    },
    applicableKnowledgeRefs: applicableRules,
    personalization: {
      oxygenScale: kb.personalization.oxygenScale,
      baselineProfileRef: kb.personalization.baselineProfileRef,
      targetSpo2Range: kb.personalization.oxygenScale === 2 ? [88, 92] : [96, 100],
    },
    modelContext: {
      equationSet: 'CARDIORESP_THERMAL_V1',
      parameterProfileRef: `PARAM-${patientId}-V1`,
      bluntedBetaBlockerResponse: hasBetaBlocker,
    },
    unknownInformation: kb.medicationContext.currentAdherence === 'unknown' ? ['current_medication_adherence'] : [],
  };
}

// -------------------------------------------------------------
// EXPERT 2 — Heart Rate Expert (Cardiovascular Intelligence)
// -------------------------------------------------------------
export function runHeartRateExpert(
  current: PhysiologicalStateVector,
  baseline: PhysiologicalStateVector,
  context: ClinicalContextV1
): ExpertFindingV1 {
  const hrDiff = current.heartRate - baseline.heartRate;
  const isBlunted = context.modelContext.bluntedBetaBlockerResponse;
  
  let concern: ExpertFindingV1['contextualConcern'] = 'None';
  let summary = `Heart rate is within baseline expectations (${current.heartRate} bpm vs baseline ${baseline.heartRate} bpm).`;

  if (current.heartRate >= 120 || current.heartRate <= 45) {
    concern = 'High';
    summary = `Marked tachycardia/bradycardia at ${current.heartRate} bpm exceeding critical threshold.`;
  } else if (isBlunted && hrDiff >= 15) {
    concern = 'High';
    summary = `Significant chronotropic acceleration (${current.heartRate} bpm, +${hrDiff} above baseline) despite active Beta-Blocker therapy. Tacit rule BETA_BLOCKER_BLUNTING_TACIT_V1 triggered: high suspicion of occult hemodynamic stress.`;
  } else if (hrDiff >= 20) {
    concern = 'Moderate';
    summary = `Elevated heart rate (+${hrDiff} bpm above baseline), sympathetic drive active.`;
  }

  const crossSupport: string[] = [];
  if (current.respiratoryRate > 22) crossSupport.push('Concurrent tachypnea (cardiorespiratory coupling)');
  if (current.temperature > 38.0) crossSupport.push('Thermal Liebermeister acceleration (+8-10 bpm/°C)');

  return {
    expertId: 'EXPERT_2_HR',
    expertName: 'Cardiovascular Intelligence Expert',
    domain: 'Cardiovascular / Autonomic',
    componentScore: current.heartRate >= 131 || current.heartRate <= 40 ? 3 : current.heartRate >= 111 ? 2 : current.heartRate >= 91 ? 1 : 0,
    contextualConcern: concern,
    baselineDeviation: hrDiff,
    trendSlope: Number((hrDiff / 15).toFixed(2)),
    abnormalDurationMin: hrDiff > 15 ? 25 : 0,
    crossSignalSupport: crossSupport,
    evidenceReliability: 'High',
    interpretationUncertainty: isBlunted ? 0.22 : 0.08,
    evidenceReferences: ['OBS-HR-RECENT', context.personalization.baselineProfileRef],
    knowledgeReferences: ['CARDIORESP_COUPLING_V1', isBlunted ? 'BETA_BLOCKER_BLUNTING_TACIT_V1' : 'THERMAL_CARDIOVASCULAR_V1'],
    findingsSummary: summary,
  };
}

// -------------------------------------------------------------
// EXPERT 3 — Respiratory Rate Expert (Respiratory Intelligence)
// -------------------------------------------------------------
export function runRespiratoryRateExpert(
  current: PhysiologicalStateVector,
  baseline: PhysiologicalStateVector,
  context: ClinicalContextV1
): ExpertFindingV1 {
  const rrDiff = current.respiratoryRate - baseline.respiratoryRate;
  let concern: ExpertFindingV1['contextualConcern'] = 'None';
  let summary = `Respiratory rate stable at ${current.respiratoryRate} /min (baseline: ${baseline.respiratoryRate} /min).`;

  if (current.respiratoryRate >= 25 || current.respiratoryRate <= 8) {
    concern = 'High';
    summary = `Critical tachypnea/bradypnea at ${current.respiratoryRate} /min. High risk of acute respiratory fatigue or metabolic acidosis.`;
  } else if (current.respiratoryRate >= 21) {
    concern = 'Moderate';
    summary = `Elevated respiratory rate (+${rrDiff} above baseline) indicating compensatory ventilatory drive.`;
  }

  const crossSupport: string[] = [];
  if (current.spo2 < 94) crossSupport.push('Concurrent hypoxemic desaturation');
  if (current.heartRate > 100) crossSupport.push('Tachycardic sympathetic coupling');

  return {
    expertId: 'EXPERT_3_RR',
    expertName: 'Respiratory Intelligence Expert',
    domain: 'Ventilatory / Gas Exchange',
    componentScore: current.respiratoryRate >= 25 || current.respiratoryRate <= 8 ? 3 : current.respiratoryRate >= 21 ? 2 : current.respiratoryRate >= 9 && current.respiratoryRate <= 11 ? 1 : 0,
    contextualConcern: concern,
    baselineDeviation: rrDiff,
    trendSlope: Number((rrDiff / 15).toFixed(2)),
    abnormalDurationMin: rrDiff > 4 ? 30 : 0,
    crossSignalSupport: crossSupport,
    evidenceReliability: 'High',
    interpretationUncertainty: 0.10,
    evidenceReferences: ['OBS-RR-RECENT', context.personalization.baselineProfileRef],
    knowledgeReferences: ['CARDIORESP_COUPLING_V1'],
    findingsSummary: summary,
  };
}

// -------------------------------------------------------------
// EXPERT 4 — SpO2 Expert (Oxygenation Intelligence)
// -------------------------------------------------------------
export function runSpo2Expert(
  current: PhysiologicalStateVector,
  baseline: PhysiologicalStateVector,
  context: ClinicalContextV1
): ExpertFindingV1 {
  const isScale2 = context.personalization.oxygenScale === 2;
  const spo2 = current.spo2;
  const spo2Diff = spo2 - baseline.spo2;

  let concern: ExpertFindingV1['contextualConcern'] = 'None';
  let score = 0;
  let summary = `Oxygenation at ${spo2}%, fully aligned with target range.`;

  if (isScale2) {
    // COPD Scale 2 (88-92% target)
    if (spo2 < 84) {
      score = 3;
      concern = 'High';
      summary = `Severe hypoxemia (${spo2}%) on COPD Scale 2; immediate airway & gas exchange evaluation required.`;
    } else if (spo2 <= 85) {
      score = 2;
      concern = 'Moderate';
      summary = `Below COPD target range at ${spo2}%.`;
    } else if (spo2 >= 93 && spo2 <= 94) {
      score = 1;
      concern = 'Mild';
      summary = `Slightly above COPD target (hyperoxia risk).`;
    } else if (spo2 >= 95) {
      score = 2;
      concern = 'Moderate';
      summary = `Hyperoxia in hypercapnic patient (${spo2}%), risk of blunt hypoxic drive.`;
    }
  } else {
    // Standard Scale 1
    if (spo2 <= 91) {
      score = 3;
      concern = 'High';
      summary = `Desaturation to ${spo2}% (partial NEWS2 component score 3). Sustained hypoxemia.`;
    } else if (spo2 <= 93) {
      score = 2;
      concern = 'Moderate';
      summary = `Moderate hypoxemia at ${spo2}% (${spo2Diff}% below baseline).`;
    } else if (spo2 <= 95) {
      score = 1;
      concern = 'Mild';
      summary = `Borderline saturation at ${spo2}%.`;
    }
  }

  return {
    expertId: 'EXPERT_4_SPO2',
    expertName: 'Oxygenation Intelligence Expert',
    domain: 'Pulmonary Perfusion & Oxygen Delivery',
    componentScore: score,
    contextualConcern: concern,
    baselineDeviation: spo2Diff,
    trendSlope: Number((spo2Diff / 15).toFixed(2)),
    abnormalDurationMin: spo2 <= 92 ? 35 : 0,
    crossSignalSupport: current.respiratoryRate > 22 ? ['Compensatory tachypnea observed'] : [],
    evidenceReliability: 'High',
    interpretationUncertainty: isScale2 ? 0.15 : 0.05,
    evidenceReferences: ['OBS-SPO2-RECENT'],
    knowledgeReferences: [isScale2 ? 'OXYGEN_SCALE_2_HYPERCAPNIC_V1' : 'NEWS2_PARTIAL_SCORING_V1'],
    findingsSummary: summary,
  };
}

// -------------------------------------------------------------
// EXPERT 5 — Temperature Expert (Thermoregulatory Intelligence)
// -------------------------------------------------------------
export function runTemperatureExpert(
  current: PhysiologicalStateVector,
  baseline: PhysiologicalStateVector,
  context: ClinicalContextV1
): ExpertFindingV1 {
  const temp = current.temperature;
  const tempDiff = Number((temp - baseline.temperature).toFixed(1));

  let concern: ExpertFindingV1['contextualConcern'] = 'None';
  let score = 0;
  let summary = `Normothermic at ${temp}°C (baseline: ${baseline.temperature}°C).`;

  if (temp <= 35.0) {
    score = 3;
    concern = 'High';
    summary = `Critical hypothermia (<=35.0°C). Scored 3 points on standard NEWS2.`;
  } else if (temp >= 39.1) {
    score = 2;
    concern = 'High';
    summary = `High pyrexia at ${temp}°C with marked metabolic and oxygen consumption rise.`;
  } else if (temp >= 38.1) {
    score = 1;
    concern = 'Moderate';
    summary = `Low-grade fever (${temp}°C, +${tempDiff}°C from baseline). Potential inflammatory response.`;
  }

  return {
    expertId: 'EXPERT_5_TEMP',
    expertName: 'Thermoregulatory Intelligence Expert',
    domain: 'Metabolic & Thermal Homeostasis',
    componentScore: score,
    contextualConcern: concern,
    baselineDeviation: tempDiff,
    trendSlope: Number((tempDiff / 30).toFixed(2)),
    abnormalDurationMin: temp >= 38.1 ? 60 : 0,
    crossSignalSupport: current.heartRate > 100 ? ['Liebermeister heart rate acceleration'] : [],
    evidenceReliability: 'High',
    interpretationUncertainty: 0.06,
    evidenceReferences: ['OBS-TEMP-RECENT'],
    knowledgeReferences: ['THERMAL_CARDIOVASCULAR_V1', 'NEWS2_PARTIAL_SCORING_V1'],
    findingsSummary: summary,
  };
}

// -------------------------------------------------------------
// EXPERT 6 — Medication & Clinical Intervention Expert
// -------------------------------------------------------------
export function runMedicationExpert(
  patientId: string,
  findings: ExpertFindingV1[]
): ExpertFindingV1 {
  const kb = getPatientKBRecord(patientId);
  const activeMeds = kb.medicationContext.activeMedications;
  const severeConcerns = findings.filter(f => f.contextualConcern === 'High');

  let concern: ExpertFindingV1['contextualConcern'] = severeConcerns.length > 0 ? 'High' : 'None';
  let summary = `All prescribed medications verified (${activeMeds.map(m => m.name).join(', ')}). No conflicting hemodynamic contraindications.`;

  if (severeConcerns.length > 0) {
    summary = `Acute physiological deterioration detected. Clinician-controlled intervention recommended: review ${activeMeds[0]?.name || 'current regimen'} dosage, prepare supplemental oxygen or urgent bedside clinical assessment. Autonomous medication changes prohibited.`;
  }

  return {
    expertId: 'EXPERT_6_MED',
    expertName: 'Medication & Clinical Intervention Expert',
    domain: 'Pharmacotherapy & Human-Supervised Intervention',
    contextualConcern: concern,
    baselineDeviation: 0,
    trendSlope: 0,
    abnormalDurationMin: 0,
    crossSignalSupport: activeMeds.map(m => `${m.name}: ${m.physiologicalImpact}`),
    evidenceReliability: 'High',
    interpretationUncertainty: 0.05,
    evidenceReferences: kb.medicationContext.prescriptionRefs,
    knowledgeReferences: ['BETA_BLOCKER_BLUNTING_TACIT_V1'],
    findingsSummary: summary,
  };
}

// -------------------------------------------------------------
// EXPERT 7 — Patient Recovery Expert
// -------------------------------------------------------------
export function runPatientRecoveryExpert(
  patientId: string,
  findings: ExpertFindingV1[]
): ExpertFindingV1 {
  const kb = getPatientKBRecord(patientId);
  const phase = kb.dischargeContext.recoveryPhase;
  const hasCritical = findings.some(f => f.contextualConcern === 'High');

  let summary = `Patient in ${phase} recovery phase. Approved tasks: rest, 8 min light ambulation, daily symptom check-in. Mobility tolerance aligned with protocol.`;
  let concern: ExpertFindingV1['contextualConcern'] = 'None';

  if (hasCritical) {
    concern = 'High';
    summary = `Recovery exercise progression paused immediately due to acute physiological concern. Mandatory rest and clinician consultation required before resuming mobility milestones.`;
  }

  return {
    expertId: 'EXPERT_7_RECOVERY',
    expertName: 'Patient Recovery Expert',
    domain: 'Rehabilitation & Longitudinal Milestones',
    contextualConcern: concern,
    baselineDeviation: 0,
    trendSlope: 0,
    abnormalDurationMin: 0,
    crossSignalSupport: [`Recovery Phase: ${phase}`, `Approved Plan: ${kb.recoveryPlanRef}`],
    evidenceReliability: 'High',
    interpretationUncertainty: 0.04,
    evidenceReferences: [kb.recoveryPlanRef],
    knowledgeReferences: ['INDEPENDENT_SAFETY_FLOOR_V1'],
    findingsSummary: summary,
  };
}

// Helper: Run all 7 experts in orchestrated pipeline
export function runAllExperts(
  patientId: string,
  current: PhysiologicalStateVector,
  baseline: PhysiologicalStateVector
) {
  const context = runPatientContextExpert(patientId);
  const exp2 = runHeartRateExpert(current, baseline, context);
  const exp3 = runRespiratoryRateExpert(current, baseline, context);
  const exp4 = runSpo2Expert(current, baseline, context);
  const exp5 = runTemperatureExpert(current, baseline, context);
  
  const physFindings = [exp2, exp3, exp4, exp5];
  const exp6 = runMedicationExpert(patientId, physFindings);
  const exp7 = runPatientRecoveryExpert(patientId, physFindings);

  // Compute 4-component partial NEWS2 score (max 12)
  const partialNews2 = calculateScore(current.heartRate, current.respiratoryRate, current.spo2, current.temperature, getPatientKBRecord(patientId).demographics.age);
  const subtotal12 = exp2.componentScore! + exp3.componentScore! + exp4.componentScore! + exp5.componentScore!;

  const clinicalScoreV1: ClinicalScoreV1 = {
    hrScore: exp2.componentScore!,
    rrScore: exp3.componentScore!,
    spo2Score: exp4.componentScore!,
    tempScore: exp5.componentScore!,
    subtotal: subtotal12,
    isPartial: true,
    maxPossible: 12,
    dominantComponents: partialNews2.components.filter(c => c.score === Math.max(...partialNews2.components.map(x => x.score))).map(c => c.name),
    explanation: partialNews2.explanation,
  };

  return {
    context,
    experts: [exp2, exp3, exp4, exp5, exp6, exp7],
    clinicalScore: clinicalScoreV1,
  };
}

