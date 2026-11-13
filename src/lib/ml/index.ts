// Unified Entrypoint for MineArena 1.0 Architecture V4.1 ML & Cognitive Digital Twin Pipeline

import { PhysiologicalStateVector, ForecastHorizon } from './types';
import { getPatientKBRecord } from './patient-kb';
import { runAllExperts } from './experts';
import { buildPhysiologicalManifest } from './manifest-builder';
import { encodeContextAdaptiveVector } from './context-encoder';
import { solvePINNForecast } from './pinn-ode-solver';
import { runTrustworthyAssessment } from './trustworthy-intelligence';
import { evaluateClinicalDecision } from './safety-supervisor';

export * from './types';
export * from './patient-kb';
export * from './clinical-kb';
export * from './experts';
export * from './manifest-builder';
export * from './context-encoder';
export * from './neural-residual-model';
export * from './pinn-ode-solver';
export * from './trustworthy-intelligence';
export * from './safety-supervisor';

export interface CompleteTwinInferenceResult {
  patientId: string;
  patientKB: ReturnType<typeof getPatientKBRecord>;
  context: ReturnType<typeof runAllExperts>['context'];
  experts: ReturnType<typeof runAllExperts>['experts'];
  clinicalScore: ReturnType<typeof runAllExperts>['clinicalScore'];
  manifest: ReturnType<typeof buildPhysiologicalManifest>;
  encoderFrame: ReturnType<typeof encodeContextAdaptiveVector>;
  forecast: ReturnType<typeof solvePINNForecast>;
  trust: ReturnType<typeof runTrustworthyAssessment>;
  decision: ReturnType<typeof evaluateClinicalDecision>;
}

export function executeTwinPipeline(
  patientId: string,
  currentVitals: PhysiologicalStateVector,
  baselineVitals: PhysiologicalStateVector,
  stateVersion: number = 42,
  horizon: ForecastHorizon = '15m'
): CompleteTwinInferenceResult {
  // 1. Patient Knowledge Base Lookup
  const patientKB = getPatientKBRecord(patientId);

  // 2. Run All 7 Specialized Context-Adaptive Experts + Partial NEWS2
  const { context, experts, clinicalScore } = runAllExperts(patientId, currentVitals, baselineVitals);

  // 3. Construct Textual Physiological State Manifest (Layer 5)
  const manifest = buildPhysiologicalManifest(
    patientId,
    stateVersion,
    currentVitals,
    baselineVitals,
    context,
    experts,
    'original'
  );

  // 4. Encode 264-Dimensional Context-Adaptive Numerical Vector (Layer 6)
  const encoderFrame = encodeContextAdaptiveVector(manifest, context, experts);

  // 5. Solve Hybrid PINN-ODE Forecast with Continuous RK4 & Neural Residual f_theta (Layer 6)
  const forecast = solvePINNForecast(manifest, encoderFrame, horizon);

  // 6. Evaluate Trustworthy Intelligence & Counterfactual Branching Engine (Layer 7)
  const trust = runTrustworthyAssessment(manifest, encoderFrame);

  // 7. Independent Clinical Safety Supervisor & Decision Intelligence (Layer 8)
  const decision = evaluateClinicalDecision(
    patientId,
    context,
    clinicalScore,
    experts,
    forecast,
    trust
  );

  return {
    patientId,
    patientKB,
    context,
    experts,
    clinicalScore,
    manifest,
    encoderFrame,
    forecast,
    trust,
    decision,
  };
}

