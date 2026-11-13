export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type RecoveryStage = 'Early' | 'Mid' | 'Late' | 'Discharged';
export type MonitoringStatus = 'Active' | 'Paused' | 'Completed';

export interface VitalReading {
  timestamp: string;
  heartRate: number;
  respiratoryRate: number;
  spo2: number;
  temperature: number;
}

export interface Patient {
  id: string;
  age: number;
  recoveryStage: RecoveryStage;
  monitoringStatus: MonitoringStatus;
  priority: Priority;
  conditions: string[];
  dischargeContext: string;
  recoveryBaseline: string;
  monitoringNotes: string;
  currentVitals: VitalReading;
  vitalHistory: VitalReading[];
  lastObservation: string;
}

export interface ClinicalScore {
  rrScore: number;
  spo2Score: number;
  hrScore: number;
  tempScore: number;
  maxScore: number;
  priority: Priority | 'Requires context';
  ageGroup: string;
  explanation: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  deviceId: string;
  attackCategory: string;
  detectionStage: string;
  result: 'REJECTED' | 'PASSED';
  clinicalImpact: string;
  details: Record<string, string>;
  packetDump?: {
    header: Record<string, string>;
    rawPayload: string;
    authDigest: string;
    rejectionReason: string;
  };
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  patientId?: string;
  isDemo: boolean;
  priority?: Priority;
  telemetrySnapshot?: {
    hr: number;
    rr: number;
    spo2: number;
    temp: number;
  };
}

export interface ForecastPoint {
  time: string;
  value: number;
  forecast?: number;
  upper?: number;
  lower?: number;
}

export interface PerformanceMetric {
  name: string;
  p50: number;
  p95: number;
  p99: number;
  unit: string;
}

export type ShowcaseActId = 'act-1' | 'act-2' | 'act-3' | 'act-4' | 'act-5' | 'act-6' | 'act-7';

export interface ShowcaseAct {
  id: ShowcaseActId;
  actNumber: string;
  title: string;
  tagline: string;
  description: string;
  targetPatientId: string;
  targetModule: 'overview' | 'patients' | 'clinical' | 'digital-twin' | 'security' | 'fhir';
  narrativeBullets: string[];
  actionLabel: string;
  metricHighlight?: {
    label: string;
    value: string;
    variant: 'neutral' | 'emerald' | 'coral' | 'amber';
  };
}

// User Roles & Authentication Types
export type UserRole = 'patient' | 'pheon' | 'nurse' | 'doctor' | 'senior_doctor';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  patientId?: string;
  assignedPatients?: string[];
  avatarSeed?: string;
}

// Daily Check-in Types
export interface DailyCheckin {
  id: string;
  patientId: string;
  timestamp: string;
  timeFormatted: string;
  date: string;
  feeling: string;
  breathing: string;
  fatigue: string;
  fever: string;
  medications: string;
  symptoms: string[];
  adaptiveDetails?: {
    onset?: string;
    progression?: string;
    impact?: string;
  };
  voiceNoteTranscript?: string;
  riskScore: number;
  riskTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

