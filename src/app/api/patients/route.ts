import { NextResponse } from 'next/server';
import { PATIENTS } from '@/data/patients';
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'live_stream_state.json');

export async function GET() {
  try {
    let liveData: any = null;
    if (fs.existsSync(STATE_FILE)) {
      try {
        liveData = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      } catch {
        // Fallback
      }
    }

    const patientsList = PATIENTS.map((p) => {
      let currentVitals = p.currentVitals;
      let priority = p.priority;
      let lastObservation = p.lastObservation;

      if (liveData && liveData.patients) {
        // Find matching live record
        const live = Object.values(liveData.patients).find(
          (item: any) => item.display_id === p.id || item.patient_id === p.id
        ) as any;

        if (live) {
          currentVitals = {
            timestamp: live.lastUpdated,
            heartRate: live.heartRate,
            spo2: live.spo2,
            respiratoryRate: live.respiratoryRate,
            temperature: live.temperature,
          };
          priority = live.priority as any;
          lastObservation = live.lastUpdated;
        }
      }

      // Convert to format consumed by clinical views & standalone pages
      return {
        patient_id: p.id,
        display_name: p.id === 'HG-001' ? 'Maura Steuber' :
                      p.id === 'HG-002' ? 'Eugenio Okuneva' :
                      p.id === 'HG-003' ? 'Michale VonRueden' :
                      p.id === 'HG-004' ? 'Danilo Bradtke' :
                      p.id === 'HG-005' ? 'Ellis Bosco' :
                      p.id === 'HG-006' ? 'Launa Brakus' :
                      p.id === 'HG-007' ? 'Albert Bins' :
                      p.id === 'HG-008' ? 'Lucie Hackett' :
                      p.id === 'HG-009' ? 'Jarrett Mraz' : 'Asha Raynor',
        age: p.age,
        age_group: p.age > 65 ? 'Senior (65+)' : p.age > 40 ? 'Adult (40-65)' : 'Young Adult (18-39)',
        assigned_to: p.id === 'HG-001' || p.id === 'HG-002' ? 'Nurse Sarah (Attendant: Alex)' : 'Nurse Patel (Attendant: Jordan)',
        current_status: priority === 'P0' ? 'Urgent' : priority === 'P1' ? 'Attention' : 'Stable',
        priority,
        conditions: p.conditions,
        discharge_context: p.dischargeContext,
        monitoring_notes: p.monitoringNotes,
        recovery_baseline: p.recoveryBaseline,
        last_checkin_time: lastObservation,
        missed_checkins: priority === 'P0' ? 1 : 0,
        device_status: 'Connected',
        signal_quality: 0.98,
        vitals: currentVitals,
      };
    });

    return NextResponse.json(patientsList, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

