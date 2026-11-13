import { SecurityEvent } from '@/types';

let secCounter = 100;

const ATTACK_CONFIGS = {
  'forged-identity': {
    category: 'Forged Device Identity',
    stage: 'JWT Validation',
  },
  'tampered-vital': {
    category: 'Tampered Vital Reading',
    stage: 'HMAC Signature Verification',
  },
  'replayed-request': {
    category: 'Replayed Request',
    stage: 'Nonce / Replay Protection',
  },
  'expired-timestamp': {
    category: 'Expired Timestamp',
    stage: 'Timestamp Validation',
  },
  'unauthorized-patient': {
    category: 'Unauthorized Patient Mapping',
    stage: 'Patient-Device Authorization',
  },
  'duplicate-event': {
    category: 'Duplicate Event',
    stage: 'Payload Validation',
  },
} as const;

export type AttackType = keyof typeof ATTACK_CONFIGS;

export function simulateAttack(type: AttackType): SecurityEvent {
  secCounter++;
  const attack = ATTACK_CONFIGS[type];
  return {
    id: `SEC-${String(secCounter).padStart(5, '0')}`,
    timestamp: new Date().toISOString(),
    deviceId: `DEVICE-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    attackCategory: attack.category,
    detectionStage: attack.stage,
    result: 'REJECTED',
    clinicalImpact: 'None — rejected before clinical processing',
    details: {
      jwt: 'eyJ[MASKED].payload[MASKED]',
      hmac: 'HMAC-SHA256: [MASKED]',
      nonce: `nonce-[MASKED]-${secCounter}`,
      timestamp: type === 'expired-timestamp' ? new Date(Date.now() - 600000).toISOString() : new Date().toISOString(),
      sequenceNumber: `SEQ-${String(secCounter).padStart(6, '0')}`,
      idempotencyKey: `IK-${String(secCounter).padStart(8, '0')}`,
      deviceBinding: type === 'unauthorized-patient' ? 'UNAUTHORIZED' : type === 'forged-identity' ? 'UNVERIFIED' : 'BOUND',
    },
  };
}
