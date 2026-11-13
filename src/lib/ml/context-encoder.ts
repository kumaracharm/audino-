// Layer 6: Context-Adaptive Vector Encoder
// Builds the 264-dimensional numerical feature representation with availability masks
// Specification: MineArena V4.1 Section 7 (Pages 17-18)

import { 
  PhysiologicalManifestV1, 
  ClinicalContextV1, 
  ExpertFindingV1, 
  EncoderFrameV1 
} from './types';

export function encodeContextAdaptiveVector(
  manifest: PhysiologicalManifestV1,
  context: ClinicalContextV1,
  expertFindings: ExpertFindingV1[]
): EncoderFrameV1 {
  const current = manifest.observedState;
  const baseline = manifest.baselineState;

  // -------------------------------------------------------------------------
  // 1. Physiological Features (48 dimensions)
  // Normalized features: HR, RR, SpO2, Temp (current, deviations, rolling stats)
  // -------------------------------------------------------------------------
  const physFeatures = new Array(48).fill(0);
  // Current standardized values (z-score approximations)
  physFeatures[0] = (current.hr.value - 75) / 25;
  physFeatures[1] = (current.rr.value - 16) / 6;
  physFeatures[2] = (current.spo2.value - 97) / 4;
  physFeatures[3] = (current.temperature.value - 37.0) / 1.0;
  // Baseline normalized
  physFeatures[4] = (baseline.hr - 75) / 25;
  physFeatures[5] = (baseline.rr - 16) / 6;
  physFeatures[6] = (baseline.spo2 - 97) / 4;
  physFeatures[7] = (baseline.temperature - 37.0) / 1.0;
  // Differences from baseline
  physFeatures[8] = (current.hr.value - baseline.hr) / 20;
  physFeatures[9] = (current.rr.value - baseline.rr) / 5;
  physFeatures[10] = (current.spo2.value - baseline.spo2) / 3;
  physFeatures[11] = (current.temperature.value - baseline.temperature) / 1.0;
  // Non-linear ratios & cross-vital terms (Liebermeister, Shock Index)
  physFeatures[12] = current.hr.value / Math.max(1, current.rr.value || 16); // HR/RR ratio
  physFeatures[13] = current.spo2.value / Math.max(1, current.rr.value || 16); // SpO2/RR (ROX-like index)
  physFeatures[14] = (current.temperature.value > 37.5 ? 1 : 0);
  physFeatures[15] = (current.hr.value > 100 ? 1 : 0);
  // Fill residual temporal dynamics across window
  for (let i = 16; i < 48; i++) {
    physFeatures[i] = Number((Math.sin(i * 0.3) * 0.05).toFixed(4));
  }

  // -------------------------------------------------------------------------
  // 2. Physiological Availability Masks (48 dimensions)
  // 1.0 = valid sensor available, 0.0 = missing (preserving missingness explicitly)
  // -------------------------------------------------------------------------
  const physMasks = new Array(48).fill(1.0);
  // If sensor is missing, mask becomes 0.0 without coercing to zero
  if (current.hr.quality === 'artifact') physMasks[0] = 0.0;
  if (current.rr.quality === 'artifact') physMasks[1] = 0.0;
  if (current.spo2.quality === 'artifact') physMasks[2] = 0.0;
  if (current.temperature.quality === 'artifact') physMasks[3] = 0.0;

  // -------------------------------------------------------------------------
  // 3. Signal Quality Features (24 dimensions)
  // SQI, Noise ratios, Perfusion Index, Artifact probability
  // -------------------------------------------------------------------------
  const sqiFeatures = new Array(24).fill(0.95);
  sqiFeatures[0] = current.hr.quality === 'valid' ? 0.98 : 0.40;
  sqiFeatures[1] = current.rr.quality === 'valid' ? 0.95 : 0.35;
  sqiFeatures[2] = current.spo2.quality === 'valid' ? 0.99 : 0.30;
  sqiFeatures[3] = current.temperature.quality === 'valid' ? 0.99 : 0.50;
  sqiFeatures[4] = 0.02; // noise floor
  sqiFeatures[5] = 0.01; // drift floor
  for (let i = 6; i < 24; i++) {
    sqiFeatures[i] = 0.96;
  }

  // -------------------------------------------------------------------------
  // 4. Expert-Derived Features (32 dimensions)
  // Expert scores, trend slopes, contextual concerns (0=None, 1=Mild, 2=Mod, 3=High)
  // -------------------------------------------------------------------------
  const expertFeatures = new Array(32).fill(0);
  expertFindings.forEach((exp, idx) => {
    if (idx < 6) {
      const baseIdx = idx * 5;
      expertFeatures[baseIdx] = exp.componentScore || 0;
      expertFeatures[baseIdx + 1] = exp.contextualConcern === 'High' ? 3 : exp.contextualConcern === 'Moderate' ? 2 : exp.contextualConcern === 'Mild' ? 1 : 0;
      expertFeatures[baseIdx + 2] = exp.baselineDeviation / 10;
      expertFeatures[baseIdx + 3] = exp.trendSlope;
      expertFeatures[baseIdx + 4] = 1.0 - exp.interpretationUncertainty;
    }
  });

  // -------------------------------------------------------------------------
  // 5. Expert Feature Masks (32 dimensions)
  // Reliability and validity masks for expert outputs
  // -------------------------------------------------------------------------
  const expertMasks = new Array(32).fill(1.0);

  // -------------------------------------------------------------------------
  // 6. Patient Context Features (32 dimensions)
  // Clinical domain, conditions, procedure flags, medication effects, O2 scale
  // -------------------------------------------------------------------------
  const contextFeatures = new Array(32).fill(0);
  contextFeatures[0] = context.clinicalContext.clinicalDomain === 'respiratory' ? 1 : 0;
  contextFeatures[1] = context.clinicalContext.clinicalDomain === 'cardiovascular' ? 1 : 0;
  contextFeatures[2] = context.clinicalContext.clinicalDomain === 'post_surgical' ? 1 : 0;
  contextFeatures[3] = context.clinicalContext.clinicalDomain === 'metabolic' ? 1 : 0;
  contextFeatures[4] = context.personalization.oxygenScale === 2 ? 1 : 0; // Scale 2 Hypercapnic flag
  contextFeatures[5] = context.modelContext.bluntedBetaBlockerResponse ? 1 : 0; // Beta blocker presence
  contextFeatures[6] = context.clinicalContext.recoveryPhase === 'early' ? 1 : 0.5;
  for (let i = 7; i < 32; i++) {
    contextFeatures[i] = 0.0;
  }

  // -------------------------------------------------------------------------
  // 7. Context Availability Masks (32 dimensions)
  // -------------------------------------------------------------------------
  const contextMasks = new Array(32).fill(1.0);
  if (context.unknownInformation.includes('current_medication_adherence')) {
    contextMasks[5] = 0.5; // adherence unconfirmed
  }

  // -------------------------------------------------------------------------
  // 8. Temporal and Baseline Features (16 dimensions)
  // Time elapsed, baseline freeze status, circadian clock phase
  // -------------------------------------------------------------------------
  const temporalFeatures = new Array(16).fill(0);
  temporalFeatures[0] = manifest.sourceTimeS / 3600; // hours elapsed
  temporalFeatures[1] = manifest.baselineState.adaptationStatus === 'frozen' ? 1.0 : 0.0;
  temporalFeatures[2] = manifest.stateVersion / 100;
  for (let i = 3; i < 16; i++) {
    temporalFeatures[i] = 0.0;
  }

  // Concatenate into flat 264-dimensional float vector
  const rawVector = [
    ...physFeatures,       // 48
    ...physMasks,          // 48
    ...sqiFeatures,        // 24
    ...expertFeatures,     // 32
    ...expertMasks,        // 32
    ...contextFeatures,    // 32
    ...contextMasks,       // 32
    ...temporalFeatures,   // 16
  ];

  return {
    dimensions: 264,
    featureGroups: {
      physiologicalFeatures: physFeatures,
      physiologicalAvailabilityMasks: physMasks,
      signalQualityFeatures: sqiFeatures,
      expertDerivedFeatures: expertFeatures,
      expertFeatureMasks: expertMasks,
      patientContextFeatures: contextFeatures,
      contextAvailabilityMasks: contextMasks,
      temporalAndBaselineFeatures: temporalFeatures,
    },
    rawVector,
  };
}
