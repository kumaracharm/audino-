// MineArena 1.0 — Architecture V4.1 Shared Contracts & ML Types

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type DecisionTier = 'Watch' | 'Review' | 'Urgent';
export type ForecastHorizon = '5m' | '15m' | '30m';
export type ForecastStatus = 'Validated' | 'Experimental' | 'Abstained' | 'Failed';
export type EvidenceReliability = 'Low' | 'Moderate' | 'High' | 'Unknown';
export type PhysiologicalConcern = 'None' | 'Mild' | 'Moderate' | 'High' | 'Unknown';

// 4-Vital Physiological State Vector x(t) = [HR, RR, SpO2, Temp]^T
export interface PhysiologicalStateVector {
  heartRate: number;       // bpm
  respiratoryRate: number; // breaths/min
  spo2: number;            // %
  temperature: number;     // °C
}

// Layer 1 & 2: Observation Event
export interface ObservationEventV1 {
  observationId: string;
  patientId: string;
  sourceNamespace: 'MATLAB_VirtualWearable' | 'BIDMC_PhysioNet' | 'Synthea_Registry';
  timestamp: string;
  sourceTimeS: number;
  vitals: PhysiologicalStateVector;
  signalQualityIndex: {
    hr: number;   // 0.0 - 1.0
    rr: number;
    spo2: number;
    temp: number;
  };
  missingnessMask: {
    hr: boolean;
    rr: boolean;
    spo2: boolean;
    temp: boolean;
  };
}

// Layer 3: Patient KB Record
export interface PatientKBRecordV1 {
  patientId: string;
  recordVersion: number;
  demographics: {
    age: number;
    gender: 'M' | 'F' | 'Other';
    cohort: string;
  };
  clinicalHistory: {
    documentedConditions: Array<{
      condition: string;
      evidenceRef: string;
      icd10?: string;
    }>;
    verifiedProcedures: Array<{
      procedure: string;
      date: string;
      evidenceRef: string;
    }>;
    allergyStatus: string;
  };
  dischargeContext: {
    encounterRef: string;
    primaryCondition: string;
    recoveryPhase: 'early' | 'mid' | 'late' | 'rehabilitation';
    dischargeDate: string;
  };
  medicationContext: {
    prescriptionRefs: string[];
    activeMedications: Array<{
      name: string;
      dosage: string;
      class: string;
      physiologicalImpact: string;
    }>;
    currentAdherence: 'confirmed' | 'reported' | 'unknown';
  };
  recoveryPlanRef: string;
  personalization: {
    oxygenScale: 1 | 2; // Scale 1: standard 96-99%, Scale 2: hypercapnic COPD 88-92%
    baselineProfileRef: string;
  };
  careTeamRef: string;
}

// Layer 3: ClinicalContextV1 (Patient Context Expert Output)
export interface ClinicalContextV1 {
  contextId: string;
  patientId: string;
  patientRecordVersion: number;
  clinicalContext: {
    documentedCondition: string;
    clinicalDomain: 'respiratory' | 'cardiovascular' | 'post_surgical' | 'metabolic';
    recoveryPhase: 'early' | 'mid' | 'late' | 'rehabilitation';
    riskProfile: string;
  };
  applicableKnowledgeRefs: string[];
  personalization: {
    oxygenScale: 1 | 2;
    baselineProfileRef: string;
    targetSpo2Range: [number, number];
  };
  modelContext: {
    equationSet: string;
    parameterProfileRef: string;
    bluntedBetaBlockerResponse: boolean;
  };
  unknownInformation: string[];
}

// Layer 4: Partial NEWS2 Clinical Score (Max 12)
export interface ClinicalScoreV1 {
  hrScore: number;    // 0-3
  rrScore: number;    // 0-3
  spo2Score: number;  // 0-3
  tempScore: number;  // 0-3
  subtotal: number;   // 0-12
  isPartial: true;
  maxPossible: 12;
  dominantComponents: string[];
  explanation: string;
}

// Layer 4: Physiological Expert Finding
export interface ExpertFindingV1 {
  expertId: 'EXPERT_1_CONTEXT' | 'EXPERT_2_HR' | 'EXPERT_3_RR' | 'EXPERT_4_SPO2' | 'EXPERT_5_TEMP' | 'EXPERT_6_MED' | 'EXPERT_7_RECOVERY';
  expertName: string;
  domain: string;
  componentScore?: number;
  contextualConcern: PhysiologicalConcern;
  baselineDeviation: number;
  trendSlope: number; // rate of change per minute
  abnormalDurationMin: number;
  crossSignalSupport: string[];
  evidenceReliability: EvidenceReliability;
  interpretationUncertainty: number; // 0.0 - 1.0
  evidenceReferences: string[];
  knowledgeReferences: string[];
  findingsSummary: string;
}

// Layer 5: Textual Physiological State Manifest
export interface PhysiologicalManifestV1 {
  manifestId: string;
  schemaVersion: '1.0';
  stateVersion: number;
  identity: {
    patientId: string;
    sessionId: string;
    variantId: 'original' | 'counterfactual_a' | 'counterfactual_b' | 'counterfactual_c' | 'counterfactual_d';
  };
  sourceTimeS: number;
  contextRef: string;
  observedState: {
    hr: { value: number; unit: 'bpm'; quality: 'valid' | 'degraded' | 'artifact'; observationRef: string };
    rr: { value: number; unit: 'breaths/min'; quality: 'valid' | 'degraded' | 'artifact'; observationRef: string };
    spo2: { value: number; unit: '%'; quality: 'valid' | 'degraded' | 'artifact'; observationRef: string };
    temperature: { value: number; unit: 'Cel'; quality: 'valid' | 'degraded' | 'artifact'; observationRef: string };
  };
  baselineState: {
    hr: number;
    rr: number;
    spo2: number;
    temperature: number;
    adaptationStatus: 'active' | 'frozen';
    baselineRef: string;
  };
  physiologicalRelationships: Array<{
    relationship: 'cardiorespiratory_coupling' | 'thermal_cardiovascular_coupling' | 'hypoxic_ventilatory_response';
    status: 'supported' | 'possible' | 'unsupported';
    evidenceRef: string;
  }>;
  modelConfiguration: {
    equationSet: 'CARDIORESP_THERMAL_V1';
    parameterProfileRef: string;
    parameterStatus: 'provisional' | 'calibrated';
  };
  expertEvidenceRefs: string[];
  uncertainty: {
    missingVitals: string[];
    parameterUncertainty: 'low' | 'moderate' | 'high';
    unobservedPhysiology: string;
  };
  estimatedStateRef: string;
  checkpointRef: string;
  parentManifestRef: string;
}

// Layer 6: 264-Dimensional Context-Adaptive Vector
export interface EncoderFrameV1 {
  dimensions: 264;
  featureGroups: {
    physiologicalFeatures: number[];       // 48 dims
    physiologicalAvailabilityMasks: number[]; // 48 dims
    signalQualityFeatures: number[];        // 24 dims
    expertDerivedFeatures: number[];        // 32 dims
    expertFeatureMasks: number[];           // 32 dims
    patientContextFeatures: number[];       // 32 dims
    contextAvailabilityMasks: number[];     // 32 dims
    temporalAndBaselineFeatures: number[];   // 16 dims
  };
  rawVector: number[]; // Flat Float64Array of 264 numbers
}

// Layer 6: PINN-ODE Forecast Trajectory
export interface PINNTrajectoryPoint {
  tMinutes: number; // 0, 1, 2, ... 5, 15, 30
  timestamp: string;
  state: PhysiologicalStateVector;
  confidenceLower: PhysiologicalStateVector;
  confidenceUpper: PhysiologicalStateVector;
  components: {
    fPhys: PhysiologicalStateVector; // Mechanistic derivative dx_phys/dt
    fTheta: PhysiologicalStateVector; // Neural residual dx_theta/dt
  };
}

export interface NeuralForecastV1 {
  patientId: string;
  manifestId: string;
  forecastGeneratedAt: string;
  horizonMinutes: 5 | 15 | 30;
  status: ForecastStatus;
  trajectories: PINNTrajectoryPoint[];
  summaryMetrics: {
    predictedHrDrift: number;
    predictedRrDrift: number;
    predictedSpo2Drift: number;
    predictedTempDrift: number;
    meanResidualMagnitude: number;
    uncertaintyCoveragePct: number;
  };
}

// Layer 7: Trustworthy Intelligence & Counterfactuals
export interface CounterfactualBranchResult {
  branchId: 'A' | 'B' | 'C' | 'D';
  branchLabel: string;
  description: string;
  manipulation: string;
  endpoint5m: PhysiologicalStateVector;
  decisionDivergence: 'Consistent' | 'Slight Drift' | 'Significant Divergence';
  robustnessScore: number; // 0.0 - 1.0
}

export interface TrustAssessmentV1 {
  patientId: string;
  uncertaintyBreakdown: {
    measurement: number; // 0-1
    context: number;
    baseline: number;
    parameter: number;
    model: number;
    forecast: number;
  };
  trustEngineScore: number; // 0.0 - 1.0
  evidenceCompletenessScore: number; // 0.0 - 1.0
  physiologicalConsistency: 'Within Bounds' | 'Boundary Violation' | 'Unstable';
  modelValidityGate: 'Eligible' | 'Out-of-Distribution' | 'Abstained';
  counterfactualBranches: CounterfactualBranchResult[];
}

// Layer 8: Independent Clinical Safety Supervisor & Decision System
export interface SafetyAssessmentV1 {
  safetyFloorTriggered: boolean;
  mandatoryEscalationRequirement: boolean;
  reason: string;
  partialNews2Score: number;
  neuralOverrideAttempted: boolean;
  overrideBlocked: boolean; // Cannot downgrade if safety floor active
}

export interface ClinicalDecisionV1 {
  decisionId: string;
  patientId: string;
  timestamp: string;
  clinicalPriority: DecisionTier;
  priorityCode: Priority;
  physiologicalConcern: PhysiologicalConcern;
  evidenceReliability: EvidenceReliability;
  monitoringStatus: 'Normal' | 'Degraded' | 'Interrupted';
  forecastStatus: ForecastStatus;
  recommendedAction: 'Continue monitoring' | 'Verify sensors' | 'Clinical Review' | 'Immediate Escalation';
  supportingEvidence: string[];
  limitations: string[];
  safetySupervisor: SafetyAssessmentV1;
}

