import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { alertId = 'ALT-001', acknowledgedBy = 'Nurse Sarah Jenkins, RN', note = 'Observation noted. Vitals stabilizing.' } = body;

    const acknowledgment = {
      alertId,
      status: 'ACKNOWLEDGED',
      acknowledgedBy,
      timestamp: new Date().toISOString(),
      clinicalNote: note,
      auditLogged: true,
    };

    return NextResponse.json({
      success: true,
      message: `Alert ${alertId} acknowledged by ${acknowledgedBy}`,
      data: acknowledgment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

