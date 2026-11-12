import { VitalReading, ActivityEvent } from '@/types';

let eventCounter = 0;

export function generateNormalReading(): VitalReading {
  return {
    timestamp: new Date().toISOString(),
    heartRate: Math.round(55 + Math.random() * 35),
    respiratoryRate: Math.round(12 + Math.random() * 8),
    spo2: Math.round(96 + Math.random() * 4),
    temperature: parseFloat((36.1 + Math.random() * 1.9).toFixed(1)),
  };
}

export function generateAbnormalReading(): VitalReading {
  const scenarios = [
    { heartRate: 128, respiratoryRate: 26, spo2: 92, temperature: 39.3 },
    { heartRate: 38, respiratoryRate: 8, spo2: 90, temperature: 34.8 },
    { heartRate: 115, respiratoryRate: 24, spo2: 93, temperature: 38.7 },
    { heartRate: 140, respiratoryRate: 28, spo2: 89, temperature: 39.5 },
  ];
  const s = scenarios[Math.floor(Math.random() * scenarios.length)];
  return { timestamp: new Date().toISOString(), ...s };
}

export function generateActivityEvent(type: string, patientId?: string): ActivityEvent {
  eventCounter++;
  const messages: Record<string, string> = {
    'observation': `New observation received${patientId ? ` for ${patientId}` : ''}`,
    'context': `Patient context retrieved${patientId ? ` for ${patientId}` : ''}`,
    'assessment': `Clinical assessment completed${patientId ? ` for ${patientId}` : ''}`,
    'priority': `Priority assigned${patientId ? ` for ${patientId}` : ''}`,
    'alert': `Urgent alert delivered${patientId ? ` for ${patientId}` : ''}`,
    'security': 'Security validation event processed',
    'fhir': `FHIR record synchronized${patientId ? ` for ${patientId}` : ''}`,
  };
  return {
    id: `EVT-${String(eventCounter).padStart(5, '0')}`,
    timestamp: new Date().toISOString(),
    type,
    message: messages[type] || type,
    patientId,
    isDemo: true,
  };
}
