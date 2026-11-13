"use client";

import React, { useState } from 'react';
import { ArchitectureNav } from '@/components/layout/ArchitectureNav';
import { PatientPortalView } from '@/components/patient/PatientPortalView';
import { PATIENTS } from '@/data/patients';
import { UserSession, DailyCheckin } from '@/types';

const PATIENT_USER: UserSession = {
  id: 'patient_p001',
  name: 'Clora Christiansen',
  role: 'patient',
  title: 'Post-Discharge Patient (CHF Stepdown)',
  patientId: 'HG-001',
  assignedPatients: ['HG-001'],
};

const INITIAL_CHECKINS: DailyCheckin[] = [
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
];

export default function PatientCheckinPage() {
  const [patient] = useState(PATIENTS[0]);
  const [checkins, setCheckins] = useState<DailyCheckin[]>(INITIAL_CHECKINS);

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F8]">
      <ArchitectureNav />
      <div className="flex-1">
        <PatientPortalView
          user={PATIENT_USER}
          patient={patient}
          onLogout={() => {}}
          onCheckinSubmitted={(chk) => setCheckins((prev) => [chk, ...prev])}
          recentCheckins={checkins}
        />
      </div>
    </div>
  );
}
