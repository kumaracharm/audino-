// Layer 8: Independent Clinical Safety Supervisor & Evidence-Constrained Decision System
// Specification: MineArena V4.1 Section 10 & 11 (Pages 24-26)

import { 
  ClinicalContextV1, 
  ClinicalScoreV1, 
  ExpertFindingV1, 
  NeuralForecastV1, 
  TrustAssessmentV1, 
  SafetyAssessmentV1, 
  ClinicalDecisionV1, 
  DecisionTier, 
  Priority 
} from './types';

export function runSafetySupervisor(
  clinicalScore: ClinicalScoreV1,
  forecast: NeuralForecastV1
): SafetyAssessmentV1 {
  // Safety Rule: If partial NEWS2 subtotal >= 7 OR any individual component score == 3,
  // mandatory escalation floor is triggered.
  const hasExtremeVital = clinicalScore.hrScore === 3 || clinicalScore.rrScore === 3 || clinicalScore.spo2Score === 3 || clinicalScore.tempScore === 3;
  const isHighSubtotal = clinicalScore.subtotal >= 7;

  const safetyFloorTriggered = hasExtremeVital || isHighSubtotal;
  
  // Check if neural model attempted an optimistic downgrade
  const neuralPredictsImprovement = forecast.summaryMetrics.predictedSpo2Drift > 0 && forecast.summaryMetrics.predictedHrDrift < 0;
  const overrideBlocked = safetyFloorTriggered && neuralPredictsImprovement;

  let reason = 'Observations within safe non-urgent envelope. Normal supervisory monitoring.';
  if (hasExtremeVital) {
    reason = `Critical physiological component score of 3 detected (${clinicalScore.dominantComponents.join(', ')}). Mandatory escalation floor activated.`;
  } else if (isHighSubtotal) {
    reason = `High aggregate partial NEWS2 subtotal (${clinicalScore.subtotal}/12 >= 7). Mandatory escalation floor activated.`;
  }

  return {
    safetyFloorTriggered,
    mandatoryEscalationRequirement: safetyFloorTriggered,
    reason,
    partialNews2Score: clinicalScore.subtotal,
    neuralOverrideAttempted: neuralPredictsImprovement,
    overrideBlocked,
  };
}

export function evaluateClinicalDecision(
  patientId: string,
  context: ClinicalContextV1,
  clinicalScore: ClinicalScoreV1,
  expertFindings: ExpertFindingV1[],
  forecast: NeuralForecastV1,
  trust: TrustAssessmentV1
): ClinicalDecisionV1 {
  const safetySupervisor = runSafetySupervisor(clinicalScore, forecast);

  let clinicalPriority: DecisionTier = 'Watch';
  let priorityCode: Priority = 'P2';
  let recommendedAction: ClinicalDecisionV1['recommendedAction'] = 'Continue monitoring';

  const highConcerns = expertFindings.filter(f => f.contextualConcern === 'High');
  const modConcerns = expertFindings.filter(f => f.contextualConcern === 'Moderate');

  if (safetySupervisor.mandatoryEscalationRequirement || highConcerns.length >= 2) {
    clinicalPriority = 'Urgent';
    priorityCode = 'P0';
    recommendedAction = 'Immediate Escalation';
  } else if (clinicalScore.subtotal >= 3 || highConcerns.length === 1 || modConcerns.length >= 2) {
    clinicalPriority = 'Review';
    priorityCode = 'P1';
    recommendedAction = 'Clinical Review';
  } else if (clinicalScore.subtotal >= 1 || modConcerns.length === 1) {
    clinicalPriority = 'Watch';
    priorityCode = 'P2';
    recommendedAction = 'Continue monitoring';
  }

  // Supporting evidence list
  const supportingEvidence: string[] = [
    `Partial NEWS2 Subtotal: ${clinicalScore.subtotal}/12 (${clinicalScore.dominantComponents.join(', ')})`,
    ...expertFindings.filter(f => f.contextualConcern !== 'None').map(f => `${f.expertName}: ${f.findingsSummary}`),
    `PINN-ODE 15m Forecast: HR drift ${forecast.summaryMetrics.predictedHrDrift > 0 ? '+' : ''}${forecast.summaryMetrics.predictedHrDrift} bpm, SpO2 drift ${forecast.summaryMetrics.predictedSpo2Drift}%, Temp drift ${forecast.summaryMetrics.predictedTempDrift}°C`,
    `Trust Engine: Score ${trust.trustEngineScore} (${trust.physiologicalConsistency})`,
  ];

  const limitations: string[] = [
    'Synthetic and simulated data for engineering hackathon demonstration only.',
    'PINN-ODE physics-informed trajectory is an experimental research model, not clinically validated for diagnostic reliance.',
    ...context.unknownInformation.map(u => `Unobserved patient parameter: ${u}`),
  ];

  return {
    decisionId: `DEC-${patientId}-${Date.now().toString().slice(-6)}`,
    patientId,
    timestamp: new Date().toISOString(),
    clinicalPriority,
    priorityCode,
    physiologicalConcern: highConcerns.length > 0 ? 'High' : modConcerns.length > 0 ? 'Moderate' : 'None',
    evidenceReliability: trust.trustEngineScore > 0.8 ? 'High' : 'Moderate',
    monitoringStatus: 'Normal',
    forecastStatus: forecast.status,
    recommendedAction,
    supportingEvidence,
    limitations,
    safetySupervisor,
  };
}

