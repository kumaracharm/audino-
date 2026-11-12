import { ShowcaseAct } from '@/types';

export const SHOWCASE_ACTS: ShowcaseAct[] = [
  {
    id: 'act-1',
    actNumber: 'ACT I',
    title: 'The Post-Discharge Patient Baseline',
    tagline: 'Cohort Enrollment & Context Retrieval',
    description:
      'Introduce Patient HG-001: 72-year-old female discharged after acute Congestive Heart Failure exacerbation. Baseline vital signs and individual comorbidities (Hypertension, T2 Diabetes) are bound to the secure tele-surveillance manifest.',
    targetPatientId: 'HG-001',
    targetModule: 'patients',
    narrativeBullets: [
      'Patient Profile: HG-001 (Age 72, Early Recovery Stage, Active surveillance).',
      'Clinical Context: Stabilized acute decompensated CHF, dual oral loop diuretic step-down.',
      'Physiological Baseline: HR 68 bpm, RR 16 /min, SpO₂ 97%, Temp 36.8°C.',
      'Monitoring Protocol: Continuous 4-vital sensor patch with mTLS hardware token.',
    ],
    actionLabel: 'Inspect Patient Baseline & Context',
    metricHighlight: {
      label: 'Cohort State',
      value: 'Stable Baseline Calibrated',
      variant: 'emerald',
    },
  },
  {
    id: 'act-2',
    actNumber: 'ACT II',
    title: 'The Sensor Ingestion Stream',
    tagline: 'Continuous Bio-Telemetry Verification',
    description:
      'Wearable telemetry arrives via NGINX/FastAPI gateway. The zero-trust pipeline verifies the hardware JWT, validates payload ranges, and matches the sensor serial to HG-001’s identity before entering Redis Streams.',
    targetPatientId: 'HG-001',
    targetModule: 'overview',
    narrativeBullets: [
      'Simulink Bio-Sensor Stream: Telemetry frames transmitted every 3.5 seconds.',
      'Edge Verification: HMAC-SHA256 integrity signature matches payload hash.',
      'Timestamp Freshness: Drift <1.2 seconds, well within the 300s security window.',
      'Deterministic Processing: Four vitals validated against physiological schema.',
    ],
    actionLabel: 'Verify Live Stream & Ingestion',
    metricHighlight: {
      label: 'Telemetry Status',
      value: '4/4 Vitals Stream Active',
      variant: 'emerald',
    },
  },
  {
    id: 'act-3',
    actNumber: 'ACT III',
    title: 'The Acute Deterioration Event',
    tagline: 'Reproducible Decompensation Injection',
    description:
      'A reproducible deterioration scenario is injected into HG-001’s bio-telemetry stream: severe tachycardia (136 bpm), tachypnea (27 /min), moderate arterial desaturation (90% SpO₂), and mild pyrexia (38.5°C).',
    targetPatientId: 'HG-001',
    targetModule: 'clinical',
    narrativeBullets: [
      'Injected Telemetry: HR 136 bpm, RR 27 /min, SpO₂ 90%, Temp 38.5°C.',
      'Component Scores: Heart Rate (+3), Respiratory (+3), SpO₂ (+3), Temp (+1).',
      'Maximum Component Score: 3 / 3 (severe physiological deviation).',
      'Age Policy Match: Score 3 on 72-year-old maps directly to P0 Critical.',
    ],
    actionLabel: 'Inject Acute Deterioration & Score',
    metricHighlight: {
      label: 'Triggered Condition',
      value: 'Score 3 Deterioration (P0)',
      variant: 'coral',
    },
  },
  {
    id: 'act-4',
    actNumber: 'ACT IV',
    title: 'The Zero-Queue Priority Response',
    tagline: 'Deterministic Emergency Alert Triage',
    description:
      'P0 Urgent alert activates immediately via dedicated zero-queue Redis lane. The critical escalation dispatches to the clinician interface in 48ms, deliberately bypassing heavy AI inference queues.',
    targetPatientId: 'HG-001',
    targetModule: 'overview',
    narrativeBullets: [
      'Zero-Queue Fast Path: Bypass transactional database locks and model inference.',
      'Clinician Dispatch Latency: 48ms end-to-end alert push delivery.',
      'Escalation Rationale: Multi-system compromise (respiratory tachypnea + acute hypoxia).',
      'Safety Guarantee: Urgent routing executes deterministically without AI black-box delays.',
    ],
    actionLabel: 'Inspect Critical P0 Triage Alert',
    metricHighlight: {
      label: 'Alert Dispatch',
      value: 'P0 Fast-Path Delivered (48ms)',
      variant: 'coral',
    },
  },
  {
    id: 'act-5',
    actNumber: 'ACT V',
    title: 'Physiological Digital Twin Intelligence',
    tagline: 'Mechanistic PINN-ODE Trajectory Forecast',
    description:
      'With the emergency alert delivered, the Digital Twin worker processes the trajectory. Mechanistic cardiovascular ODEs combined with neural residuals project a 15-minute downward hypoxia trend if unaddressed.',
    targetPatientId: 'HG-001',
    targetModule: 'digital-twin',
    narrativeBullets: [
      'Twin Architecture: Hybrid physics-informed neural ODE (PINN-ODE v3.2).',
      '15-Minute Forecast: Projected heart rate acceleration towards 142 bpm; SpO₂ dipping to 87%.',
      'Confidence Envelope: Calibrated 95% Bayesian uncertainty interval (±3.8%).',
      'Clinician Decision Support: Provides predictive context while ambulance is dispatched.',
    ],
    actionLabel: 'Examine Digital Twin Projections',
    metricHighlight: {
      label: 'Trajectory Forecast',
      value: 'Severe Hypoxic Drift Predicted',
      variant: 'amber',
    },
  },
  {
    id: 'act-6',
    actNumber: 'ACT VI',
    title: 'The Adversarial Cyber Attack Rejection',
    tagline: 'Edge Replay & Tamper Defense',
    description:
      'Adversaries attempt to intercept patient telemetry: First, an attacker replays a valid prior packet to spoof a normal state; second, a hacker tampers with vital bytes in flight. Both are blocked cold at the edge gateway.',
    targetPatientId: 'HG-001',
    targetModule: 'security',
    narrativeBullets: [
      'Replay Attack: Duplicate nonce `nonce-replay-001` detected in sliding window filter.',
      'Tamper Attack: Cryptographic HMAC-SHA256 signature mismatch intercepted.',
      'Zero-Trust Enforcement: Both packets rejected before reaching clinical scoring.',
      'Patient Safety Outcome: Corrupted telemetry NEVER influences clinical priority routing.',
    ],
    actionLabel: 'Execute Attack Simulation & Defense',
    metricHighlight: {
      label: 'Edge Firewall',
      value: '2/2 Attacks Intercepted (0 Impact)',
      variant: 'emerald',
    },
  },
  {
    id: 'act-7',
    actNumber: 'ACT VII',
    title: 'FHIR R4 Interoperability & Audit Chain',
    tagline: 'Standardized Clinical Records & Provable Provenance',
    description:
      'The complete clinical episode is committed to HL7 FHIR R4: Authenticated observations are published to HAPI FHIR with LOINC codings, while security violations are captured as FHIR AuditEvents with cryptographically signed Provenance.',
    targetPatientId: 'HG-001',
    targetModule: 'fhir',
    narrativeBullets: [
      'LOINC Vital Observations: LOINC 8867-4 (HR), 9279-1 (RR), 59408-5 (SpO₂), 8310-5 (Temp).',
      'HAPI FHIR Synchronized: RESTful JSON resources linked to Patient/hg-patient-001.',
      'AuditEvent Partitioning: Security rejections logged separately from clinical observations.',
      'Audit Trail Integrity: Complete legal and medical chain of custody from sensor to clinician.',
    ],
    actionLabel: 'Inspect FHIR R4 Records & Audit Chain',
    metricHighlight: {
      label: 'HL7 Interop',
      value: 'FHIR R4 Bundle Synchronized',
      variant: 'emerald',
    },
  },
];

