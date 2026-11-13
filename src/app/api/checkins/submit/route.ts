import { NextResponse } from 'next/server';
import { DailyCheckin } from '@/types';

// In-memory persistent checkin store for interactive session
export let storedCheckins: DailyCheckin[] = [
  {
    id: "CHK-1001",
    patientId: "HG-001",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    timeFormatted: "08:30 AM",
    date: "Today",
    feeling: "good",
    breathing: "none",
    fatigue: "mild",
    fever: "none",
    medications: "yes_all",
    symptoms: ["None"],
    voiceNoteTranscript: "I feel pretty rested today, just slight fatigue after morning tea.",
    riskScore: 1,
    riskTier: "LOW",
  },
  {
    id: "CHK-1002",
    patientId: "HG-003",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeFormatted: "09:15 AM",
    date: "Today",
    feeling: "unwell",
    breathing: "mild",
    fatigue: "severe",
    fever: "none",
    medications: "partial",
    symptoms: ["Cough", "Chest heaviness"],
    adaptiveDetails: {
      onset: "Earlier today",
      progression: "Worsening with movement",
      impact: "Difficulty walking to bathroom",
    },
    voiceNoteTranscript: "Breathing feels heavier when walking up the steps, and my chest feels tight.",
    riskScore: 5,
    riskTier: "HIGH",
  },
];

export async function GET() {
  return NextResponse.json({
    total: storedCheckins.length,
    checkins: storedCheckins,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patientId = 'HG-001',
      feeling = 'good',
      breathing = 'none',
      fatigue = 'none',
      fever = 'none',
      medications = 'yes_all',
      symptoms = ['None'],
      adaptiveDetails,
      voiceNoteTranscript,
    } = body;

    // Deterministic clinical risk scoring
    let score = 0;
    if (feeling === 'unwell') score += 2;
    if (breathing === 'mild') score += 2;
    if (breathing === 'severe') score += 5;
    if (fatigue === 'severe') score += 3;
    if (fever === 'mild') score += 2;
    if (medications === 'partial' || medications === 'skipped' || medications === 'not_yet') score += 2;
    if (adaptiveDetails?.onset === 'last_hour' || adaptiveDetails?.onset === 'Past hour') score += 3;

    const riskTier = score >= 6 ? 'CRITICAL' : score >= 3 ? 'HIGH' : score >= 1 ? 'MODERATE' : 'LOW';

    const now = new Date();
    const newCheckin: DailyCheckin = {
      id: `CHK-${Date.now()}`,
      patientId,
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      feeling,
      breathing,
      fatigue,
      fever,
      medications,
      symptoms,
      adaptiveDetails,
      voiceNoteTranscript,
      riskScore: score,
      riskTier,
    };

    storedCheckins.unshift(newCheckin);

    // If critical/high, trigger escalation notification flag
    const alertTriggered = riskTier === 'CRITICAL' || riskTier === 'HIGH';

    return NextResponse.json({
      success: true,
      message: `Check-in recorded successfully for patient ${patientId}`,
      checkin: newCheckin,
      alertTriggered,
      recommendedAction: alertTriggered 
        ? "Priority P0/P1 Clinical Review Dispatched to Nurse Sarah Jenkins, RN"
        : "Routine Surveillance Baseline Maintained",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Invalid checkin payload' },
      { status: 400 }
    );
  }
}

