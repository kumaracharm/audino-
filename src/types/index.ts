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
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  patientId?: string;
  isDemo: boolean;
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
