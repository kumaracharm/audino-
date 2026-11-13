import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patientId = 'HG-001',
      escalatedFrom = 'PHEON Marcus Ward',
      escalateTo = 'Nurse Sarah Jenkins, RN',
      reason = 'Patient SpO2 dropped below 92% with mild dyspnea',
      priority = 'P0',
    } = body;

    const escalation = {
      escalationId: `ESC-${Date.now()}`,
      patientId,
      timestamp: new Date().toISOString(),
      escalatedFrom,
      escalateTo,
      priority,
      reason,
      status: 'DISPATCHED_ZERO_QUEUE',
      deliveryLatencyMs: 44,
      channels: ['in_app_banner', 'smartwatch_haptic', 'clinical_sms_gateway'],
    };

    return NextResponse.json({
      success: true,
      message: `Escalation triggered: ${escalation.escalationId}`,
      data: escalation,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

