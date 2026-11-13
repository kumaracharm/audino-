// Layer 3: Shared Clinical Knowledge Base (Clinical KB)
// General, reusable clinical heuristics, physiological coupling rules, and safety bounds

export interface ClinicalRule {
  ruleId: string;
  name: string;
  category: 'explicit_scoring' | 'physiological_coupling' | 'tacit_heuristic' | 'medication_impact' | 'safety_policy';
  version: string;
  description: string;
  applicabilityCriteria: string;
  evidenceReference: string;
}

export const SHARED_CLINICAL_KB: Record<string, ClinicalRule> = {
  'NEWS2_PARTIAL_SCORING_V1': {
    ruleId: 'NEWS2_PARTIAL_SCORING_V1',
    name: '4-Component Partial NEWS2 Scoring',
    category: 'explicit_scoring',
    version: '1.2',
    description: 'Computes component scores (0-3) for HR, RR, SpO2, and Temp. Maximum 4-component subtotal is 12 (Temp <= 35.0C scores 3). Clearly isolated from full 7-parameter NEWS2.',
    applicabilityCriteria: 'All adult post-discharge patients with 4-vital telemetry stream.',
    evidenceReference: 'Royal College of Physicians NEWS2 Guidelines (2017)',
  },

  'CARDIORESP_COUPLING_V1': {
    ruleId: 'CARDIORESP_COUPLING_V1',
    name: 'Cardiorespiratory Compensatory Coupling',
    category: 'physiological_coupling',
    version: '1.0',
    description: 'Hypoxemia (SpO2 drop) and metabolic acidosis prompt compensatory tachypnea (RR elevation) followed by sympathetic tachycardia (HR elevation). Concurrent RR and HR elevation with falling SpO2 indicates active physiological compromise.',
    applicabilityCriteria: 'Patients with respiratory conditions, pulmonary embolism, or early septic shock.',
    evidenceReference: 'Guyton and Hall Textbook of Medical Physiology, 14th Ed.',
  },

  'THERMAL_CARDIOVASCULAR_V1': {
    ruleId: 'THERMAL_CARDIOVASCULAR_V1',
    name: 'Thermoregulatory Heart Rate Acceleration (Liebermeister Rule)',
    category: 'physiological_coupling',
    version: '1.0',
    description: 'Each 1°C elevation in core body temperature above 37°C induces an expected 8-10 bpm increase in resting heart rate due to heightened metabolic demand.',
    applicabilityCriteria: 'Patients exhibiting pyrexia / fever spikes.',
    evidenceReference: 'Liebermeister Rule of Febrile Tachycardia',
  },

  'BETA_BLOCKER_BLUNTING_TACIT_V1': {
    ruleId: 'BETA_BLOCKER_BLUNTING_TACIT_V1',
    name: 'Beta-Blocker Chronotropic Blunting Heuristic',
    category: 'tacit_heuristic',
    version: '1.1',
    description: 'Patients on beta-1 adrenoceptor antagonists (e.g. Metoprolol, Bisoprolol) do not mount typical tachycardia (HR > 100) even in severe deterioration or sepsis. A modest HR rise from 60 to 88 bpm or isolated tachypnea must be treated as critical compensation.',
    applicabilityCriteria: 'Active beta-blocker prescription in Patient KB.',
    evidenceReference: 'Post-CABG Hemodynamic Surveillance Protocol, AHA/ACC 2021',
  },

  'OXYGEN_SCALE_2_HYPERCAPNIC_V1': {
    ruleId: 'OXYGEN_SCALE_2_HYPERCAPNIC_V1',
    name: 'NEWS2 Scale 2 Hypercapnic Oxygen Targets',
    category: 'medication_impact',
    version: '1.0',
    description: 'In patients with chronic hypercapnic respiratory failure (COPD GOLD III/IV), target SpO2 is 88-92%. SpO2 >= 93% on supplemental oxygen risks hypoventilation due to loss of hypoxic respiratory drive.',
    applicabilityCriteria: 'Authorized Scale 2 personalization flag in Patient KB.',
    evidenceReference: 'British Thoracic Society Guideline for Oxygen Use in Adults',
  },

  'INDEPENDENT_SAFETY_FLOOR_V1': {
    ruleId: 'INDEPENDENT_SAFETY_FLOOR_V1',
    name: 'Mandatory Non-Neural Escalation Floor',
    category: 'safety_policy',
    version: '2.0',
    description: 'If partial NEWS2 subtotal >= 7 OR any single vital scores 3 (e.g., SpO2 <= 91%, RR >= 25, HR >= 131), immediate P0 Urgent escalation is mandatory. Neural PINN-ODE forecasts cannot override or downgrade this safety threshold.',
    applicabilityCriteria: 'Mandatory hot-path safety gate across all monitored sessions.',
    evidenceReference: 'MineArena V4.1 Independent Clinical Safety Supervisor Specification',
  },
};

