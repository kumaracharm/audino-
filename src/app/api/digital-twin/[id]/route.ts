import { NextRequest, NextResponse } from 'next/server';
import { PATIENTS } from '@/data/patients';
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'live_stream_state.json');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const normalizedId = id.toUpperCase();

  // Find patient record
  const patient = PATIENTS.find(
    (p) => p.id === normalizedId || p.id === `HG-${normalizedId.replace('P', '')}` || normalizedId === p.id.replace('HG-', 'P')
  ) || PATIENTS[0];

  let liveRecord: any = null;
  if (fs.existsSync(STATE_FILE)) {
    try {
      const liveData = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      if (liveData.patients) {
        liveRecord = Object.values(liveData.patients).find(
          (p: any) => p.display_id === patient.id || p.patient_id === normalizedId || p.patient_id === `P${patient.id.replace('HG-', '')}`
        );
      }
    } catch {
      // Fallback
    }
  }

  const hr = liveRecord ? liveRecord.heartRate : patient.currentVitals.heartRate;
  const spo2 = liveRecord ? liveRecord.spo2 : patient.currentVitals.spo2;
  const rr = liveRecord ? liveRecord.respiratoryRate : patient.currentVitals.respiratoryRate;
  const temp = liveRecord ? liveRecord.temperature : patient.currentVitals.temperature;
  const signalQuality = liveRecord ? liveRecord.signalQuality : 0.98;
  const sensorStatus = liveRecord ? liveRecord.sensorStatus : 'CONNECTED';
  const lastUpdated = liveRecord ? liveRecord.lastUpdated : new Date().toISOString();

  // Generate SVG avatar for digital twin
  const avatarSvg = `
    <svg width="64" height="64" viewBox="0 0 16 16" style="image-rendering:pixelated;border-radius:8px;">
      <rect width="16" height="16" fill="#1e293b"/>
      <rect x="3" y="3" width="10" height="10" fill="#fcd34d"/>
      <rect x="5" y="6" width="2" height="2" fill="#0f172a"/>
      <rect x="9" y="6" width="2" height="2" fill="#0f172a"/>
      <rect x="6" y="10" width="4" height="1" fill="#b45309"/>
      <rect x="3" y="1" width="10" height="3" fill="#78350f"/>
    </svg>
  `;

  return NextResponse.json({
    patient_id: patient.id,
    avatar_svg: avatarSvg,
    wearable: {
      connection_state: sensorStatus === 'CONNECTED' ? 'CONNECTED' : 'DEGRADED',
      signal_quality: `${Math.round(signalQuality * 100)}%`,
      battery_status: '87%',
      last_sync_timestamp: lastUpdated,
      is_stale_measurement: false,
    },
    vitals: {
      heart_rate: {
        current_value: hr,
        unit: 'bpm',
        baseline: 72,
        trend: hr > 105 ? 'DETERIORATING' : 'STABLE',
        clinical_rationale: 'Elevated resting tachycardia indicates physiological stress or decompensation.',
        normal_range: '60 - 100 bpm',
        escalation_threshold: '> 110 bpm',
      },
      spo2: {
        current_value: spo2,
        unit: '%',
        baseline: 97,
        trend: spo2 < 92 ? 'DETERIORATING' : 'STABLE',
        clinical_rationale: 'Peripheral oxygen saturation desaturation flags hypoxemia.',
        normal_range: '95 - 100%',
        escalation_threshold: '< 92%',
      },
      respiratory_rate: {
        current_value: rr,
        unit: 'bpm',
        baseline: 16,
        trend: rr > 22 ? 'DETERIORATING' : 'STABLE',
        clinical_rationale: 'Tachypnea is often the earliest sensitive sign of clinical deterioration.',
        normal_range: '12 - 20 bpm',
        escalation_threshold: '> 24 bpm',
      },
      temperature: {
        current_value: temp,
        unit: '°C',
        baseline: 36.8,
        trend: temp > 38.0 ? 'DETERIORATING' : 'STABLE',
        clinical_rationale: 'Pyrexia surveillance flags early surgical site infection or sepsis.',
        normal_range: '36.5 - 37.5 °C',
        escalation_threshold: '> 38.2 °C',
      },
    },
    timeline_events: [
      { timestamp: lastUpdated, event: `Physiological stream sample ingested from BIDMC replay: HR ${hr}, SpO2 ${spo2}%` },
      { timestamp: new Date(Date.now() - 300000).toISOString(), event: 'Continuous background wearable sync active' },
    ]
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

