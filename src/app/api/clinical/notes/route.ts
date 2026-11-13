import { NextResponse } from 'next/server';

interface ClinicalNote {
  id: string;
  patientId: string;
  author: string;
  role: string;
  timestamp: string;
  noteText: string;
  plan: string;
}

const STORED_NOTES: ClinicalNote[] = [
  {
    id: "NOTE-101",
    patientId: "HG-001",
    author: "Dr. Arthur Chen, MD",
    role: "Attending Physician",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    noteText: "Post-discharge CHF baseline stable. Fluid restriction 1.5L/day maintained. Patient reports adherence to morning Furosemide.",
    plan: "Continue tele-surveillance. Follow up with cardiopulmonary clinic in 7 days.",
  },
  {
    id: "NOTE-102",
    patientId: "HG-003",
    author: "Nurse Sarah Jenkins, RN",
    role: "Clinical Nurse",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    noteText: "SpO2 fluctuated to 91% on exertion during morning walk. Patient completed checkin reporting mild dyspnea via voice note.",
    plan: "Advised patient to rest in semi-Fowler position. Triggered P1 attending doctor review.",
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  const filtered = patientId ? STORED_NOTES.filter(n => n.patientId === patientId) : STORED_NOTES;
  return NextResponse.json({ total: filtered.length, notes: filtered });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      patientId = 'HG-001',
      author = 'Dr. Arthur Chen, MD',
      role = 'doctor',
      noteText = '',
      plan = 'Routine tele-monitoring',
    } = body;

    if (!noteText.trim()) {
      return NextResponse.json({ success: false, error: 'Note text cannot be empty' }, { status: 400 });
    }

    const newNote: ClinicalNote = {
      id: `NOTE-${Date.now()}`,
      patientId,
      author,
      role,
      timestamp: new Date().toISOString(),
      noteText,
      plan,
    };

    STORED_NOTES.unshift(newNote);

    return NextResponse.json({
      success: true,
      message: 'Clinical note recorded to patient electronic record',
      note: newNote,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
