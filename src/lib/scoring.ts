import { Priority } from '@/types';

export interface ScoreResult {
  rrScore: number;
  spo2Score: number;
  hrScore: number;
  tempScore: number;
  maxScore: number;
  priority: Priority | 'Requires context';
  ageGroup: string;
  explanation: string;
  components: { name: string; value: number; score: number; range: string }[];
}

export function scoreRR(rr: number): number {
  if (rr <= 8 || rr >= 25) return 3;
  if (rr >= 21 && rr <= 24) return 2;
  if (rr >= 9 && rr <= 11) return 1;
  return 0;
}

export function scoreSpo2(spo2: number): number {
  if (spo2 <= 91) return 3;
  if (spo2 >= 92 && spo2 <= 93) return 2;
  if (spo2 >= 94 && spo2 <= 95) return 1;
  return 0;
}

export function scoreHR(hr: number): number {
  if (hr <= 40 || hr >= 131) return 3;
  if (hr >= 111 && hr <= 130) return 2;
  if ((hr >= 41 && hr <= 50) || (hr >= 91 && hr <= 110)) return 1;
  return 0;
}

export function scoreTemp(temp: number): number {
  if (temp <= 35.0) return 3;
  if (temp >= 39.1) return 2;
  if ((temp >= 35.1 && temp <= 36.0) || (temp >= 38.1 && temp <= 39.0)) return 1;
  return 0;
}

export function getAgeGroup(age: number): string {
  if (age >= 18 && age <= 29) return '18-29';
  if (age >= 30 && age <= 45) return '30-45';
  if (age >= 50) return '50+';
  return 'unsupported';
}

export function routePriority(maxScore: number, age: number): Priority | 'Requires context' {
  const ageGroup = getAgeGroup(age);
  if (ageGroup === 'unsupported') return 'Requires context';
  if (maxScore === 3) return 'P0';
  if (maxScore === 2 && ageGroup === '50+') return 'P0';
  if (maxScore === 2 && (ageGroup === '30-45' || ageGroup === '18-29')) return 'P1';
  if (maxScore === 1 && ageGroup === '50+') return 'P1';
  if (maxScore <= 1 && (ageGroup === '30-45' || ageGroup === '18-29')) return 'P2';
  return 'P2';
}

export function calculateScore(hr: number, rr: number, spo2: number, temp: number, age: number): ScoreResult {
  const hrScore = scoreHR(hr);
  const rrScore = scoreRR(rr);
  const spo2Score = scoreSpo2(spo2);
  const tempScore = scoreTemp(temp);
  const maxScore = Math.max(hrScore, rrScore, spo2Score, tempScore);
  const ageGroup = getAgeGroup(age);
  const priority = routePriority(maxScore, age);

  const dominants = [
    { name: 'Heart Rate', score: hrScore },
    { name: 'Respiratory Rate', score: rrScore },
    { name: 'SpO\u2082', score: spo2Score },
    { name: 'Temperature', score: tempScore },
  ].filter(x => x.score === maxScore).map(x => x.name).join(', ');

  const explanation = maxScore === 0
    ? 'All four vital-sign components are within normal reference ranges. Routine monitoring continues.'
    : `Maximum component score of ${maxScore} driven by ${dominants}. Age group ${ageGroup === 'unsupported' ? 'outside supported bands' : ageGroup} maps to priority ${priority}. This is a custom prototype routing policy, not a clinically validated protocol.`;

  return {
    rrScore, spo2Score, hrScore, tempScore, maxScore,
    priority, ageGroup, explanation,
    components: [
      { name: 'Heart Rate', value: hr, score: hrScore, range: '51\u201390: 0 | 41\u201350 or 91\u2013110: 1 | 111\u2013130: 2 | \u226440 or \u2265131: 3' },
      { name: 'Respiratory Rate', value: rr, score: rrScore, range: '12\u201320: 0 | 9\u201311: 1 | 21\u201324: 2 | \u22648 or \u226525: 3' },
      { name: 'SpO\u2082', value: spo2, score: spo2Score, range: '\u226596: 0 | 94\u201395: 1 | 92\u201393: 2 | \u226491: 3' },
      { name: 'Temperature', value: temp, score: tempScore, range: '36.1\u201338.0: 0 | 35.1\u201336.0 or 38.1\u201339.0: 1 | \u226539.1: 2 | \u226435.0: 3' },
    ],
  };
}
