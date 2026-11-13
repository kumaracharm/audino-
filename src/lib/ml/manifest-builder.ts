// Layer 5: Textual Physiological State Manifest Builder
// Follows MineArena V4.1 specification (Section 6, Pages 14-17)

import { 
  PhysiologicalManifestV1, 
  PhysiologicalStateVector, 
  ClinicalContextV1,
  ExpertFindingV1 
} from './types';

export function buildPhysiologicalManifest(
  patientId: string,
  stateVersion: number,
  currentVitals: PhysiologicalStateVector,
  baselineVitals: PhysiologicalStateVector,
  context: ClinicalContextV1,
  expertFindings: ExpertFindingV1[],
  variantId: PhysiologicalManifestV1['identity']['variantId'] = 'original'
): PhysiologicalManifestV1 {
  const isDeteriorating = expertFindings.some(f => f.contextualConcern === 'High');
  
  // Rule: Baseline freezes during suspected deterioration or unreliable measurements
  const adaptationStatus: 'active' | 'frozen' = isDeteriorating ? 'frozen' : 'active';

  const relationships: PhysiologicalManifestV1['physiologicalRelationships'] = [
    {
      relationship: 'cardiorespiratory_coupling',
      status: currentVitals.heartRate > 100 && currentVitals.respiratoryRate > 22 ? 'supported' : 'possible',
      evidenceRef: `EVIDENCE-${stateVersion}-CRC`,
    },
    {
      relationship: 'thermal_cardiovascular_coupling',
      status: currentVitals.temperature > 38.0 ? 'supported' : 'possible',
      evidenceRef: `EVIDENCE-${stateVersion}-TCC`,
    },
  ];

  if (currentVitals.spo2 <= 92) {
    relationships.push({
      relationship: 'hypoxic_ventilatory_response',
      status: 'supported',
      evidenceRef: `EVIDENCE-${stateVersion}-HVR`,
    });
  }

  const expertEvidenceRefs = expertFindings.map(f => `${f.expertId}-E${stateVersion}`);

  return {
    manifestId: `MANIFEST-${patientId}-${String(stateVersion).padStart(4, '0')}`,
    schemaVersion: '1.0',
    stateVersion,
    identity: {
      patientId,
      sessionId: `SESSION-${patientId}-001`,
      variantId,
    },
    sourceTimeS: stateVersion * 15,
    contextRef: context.contextId,
    observedState: {
      hr: {
        value: currentVitals.heartRate,
        unit: 'bpm',
        quality: 'valid',
        observationRef: `OBS-HR-${stateVersion * 15}`,
      },
      rr: {
        value: currentVitals.respiratoryRate,
        unit: 'breaths/min',
        quality: 'valid',
        observationRef: `OBS-RR-${stateVersion * 15}`,
      },
      spo2: {
        value: currentVitals.spo2,
        unit: '%',
        quality: 'valid',
        observationRef: `OBS-SPO2-${stateVersion * 15}`,
      },
      temperature: {
        value: currentVitals.temperature,
        unit: 'Cel',
        quality: 'valid',
        observationRef: `OBS-TEMP-${stateVersion * 15}`,
      },
    },
    baselineState: {
      hr: baselineVitals.heartRate,
      rr: baselineVitals.respiratoryRate,
      spo2: baselineVitals.spo2,
      temperature: baselineVitals.temperature,
      adaptationStatus,
      baselineRef: context.personalization.baselineProfileRef,
    },
    physiologicalRelationships: relationships,
    modelConfiguration: {
      equationSet: 'CARDIORESP_THERMAL_V1',
      parameterProfileRef: context.modelContext.parameterProfileRef,
      parameterStatus: 'calibrated',
    },
    expertEvidenceRefs,
    uncertainty: {
      missingVitals: [],
      parameterUncertainty: isDeteriorating ? 'moderate' : 'low',
      unobservedPhysiology: 'intravascular_volume_status',
    },
    estimatedStateRef: `ESTIMATE-${patientId}-${stateVersion}`,
    checkpointRef: `CHECKPOINT-${patientId}-${stateVersion}`,
    parentManifestRef: stateVersion > 1 ? `MANIFEST-${patientId}-${String(stateVersion - 1).padStart(4, '0')}` : 'ROOT_STATE',
  };
}

