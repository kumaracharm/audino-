import React, { useState } from 'react';
import { 
  HeartPulse, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Clock, 
  Activity, 
  MessageSquare, 
  FileCheck,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { Patient } from '@/types';

interface RecoveryPlansViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
}

interface RecoveryTask {
  id: string;
  title: string;
  due: string;
  category: 'Vitals' | 'Medication' | 'Mobility' | 'Nutrition';
  completed: boolean;
}

export const RecoveryPlansView: React.FC<RecoveryPlansViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
}) => {
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const [tasks, setTasks] = useState<Record<string, RecoveryTask[]>>({
    'HG-001': [
      { id: 't1', title: 'Morning standing blood pressure and weight check', due: '08:00 AM', category: 'Vitals', completed: true },
      { id: 't2', title: 'Furosemide 40mg with fluid restriction reminder', due: '09:00 AM', category: 'Medication', completed: true },
      { id: 't3', title: '15-minute gentle living-room assisted ambulation', due: '02:00 PM', category: 'Mobility', completed: false },
      { id: 't4', title: 'Evening SpO₂ pulse oximetry spot-check', due: '07:00 PM', category: 'Vitals', completed: false },
      { id: 't5', title: 'Daily sodium intake self-report check-in', due: '08:30 PM', category: 'Nutrition', completed: false },
    ],
    'HG-002': [
      { id: 't201', title: 'Amoxicillin/Clavulanate oral antibiotic morning dose', due: '08:00 AM', category: 'Medication', completed: true },
      { id: 't202', title: 'Incentive spirometry exercise (10 deep breaths)', due: '11:00 AM', category: 'Mobility', completed: true },
      { id: 't203', title: 'Midday respiratory rate and temperature check', due: '01:00 PM', category: 'Vitals', completed: false },
      { id: 't204', title: 'Evening antibiotic dose with meals', due: '08:00 PM', category: 'Medication', completed: false },
    ],
  });

  const patientTasks = tasks[selectedPatient.id] || [
    { id: 'td1', title: 'Morning post-discharge vital sign transmission', due: '09:00 AM', category: 'Vitals', completed: true },
    { id: 'td2', title: 'Discharge medication adherence check-in', due: '12:00 PM', category: 'Medication', completed: false },
    { id: 'td3', title: 'Physical mobility & wound inspection logging', due: '04:00 PM', category: 'Mobility', completed: false },
    { id: 'td4', title: 'Evening resting pulse and oxygen check', due: '08:00 PM', category: 'Vitals', completed: false },
  ];

  const toggleTask = (taskId: string) => {
    setTasks((prev) => {
      const currentList = prev[selectedPatient.id] || patientTasks;
      return {
        ...prev,
        [selectedPatient.id]: currentList.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      };
    });
  };

  const completedCount = patientTasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / patientTasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A]/10 text-[#16866A] uppercase tracking-wider">
              Care-Plan Pathway Adherence
            </span>
            <span className="text-xs text-[#697B73]">Post-Discharge Rehabilitation</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">Patient Recovery Monitoring</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            Coordinating clinician-approved recovery milestones, daily tasks, symptom self-reporting, and clinical follow-up schedules.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#697B73]">Patient Pathway:</span>
          <select
            value={selectedPatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E7ECE6] bg-[#FAFBF8] text-xs font-bold text-[#193B32] focus:outline-none focus:border-[#16866A] cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.recoveryStage} • {p.priority})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress & Milestone Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Care Plan Summary */}
        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-[#697B73] uppercase tracking-wider block">Care Plan Summary</span>
          <p className="text-sm font-bold text-[#193B32]">{selectedPatient.dischargeContext}</p>
          <p className="text-xs text-[#697B73]">Baseline target: {selectedPatient.recoveryBaseline}</p>
        </div>

        {/* Milestone Pathway Progress */}
        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#697B73] uppercase tracking-wider">Today's Protocol Adherence</span>
            <span className="text-xs font-bold text-[#16866A]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#FAFBF8] border border-[#E7ECE6] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#16866A] to-[#3AA99B] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#697B73]">
            {completedCount} of {patientTasks.length} tasks completed today
          </p>
        </div>

        {/* Follow-up schedule */}
        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-[#697B73] uppercase tracking-wider block">Next Follow-Up Review</span>
          <div className="flex items-center gap-2 text-sm font-bold text-[#193B32]">
            <Calendar className="w-4 h-4 text-[#16866A]" />
            <span>Telehealth Consultation in 3 Days</span>
          </div>
          <p className="text-xs text-[#697B73]">Assigned to: Community Heart Failure Care Team</p>
        </div>
      </div>

      {/* Daily Task List & Symptom Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clinician-Approved Daily Tasks (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
            <div>
              <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#16866A]" />
                Clinician-Approved Daily Recovery Tasks
              </h3>
              <p className="text-xs text-[#697B73] mt-0.5">Click any task to toggle simulated patient completion</p>
            </div>
            <span className="text-xs font-semibold text-[#16866A] bg-[#16866A]/10 px-2.5 py-0.5 rounded-full">
              Day 4 Post-Discharge
            </span>
          </div>

          <div className="space-y-2.5">
            {patientTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleTask(t.id)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                  t.completed
                    ? 'bg-[#16866A]/5 border-[#16866A]/20'
                    : 'bg-[#FAFBF8] border-[#E7ECE6] hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {t.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#16866A] shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                  <div>
                    <p className={`text-xs font-semibold ${t.completed ? 'line-through text-[#697B73]' : 'text-[#193B32]'}`}>
                      {t.title}
                    </p>
                    <span className="text-[10px] text-[#697B73] mt-0.5 block">
                      Scheduled: {t.due} • Domain: {t.category}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  t.completed ? 'bg-[#16866A]/15 text-[#16866A]' : 'bg-gray-100 text-[#697B73]'
                }`}>
                  {t.completed ? 'DONE' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#697B73] pt-3 border-t border-[#E7ECE6]">
            * Tasks are personalized automatically based on discharge diagnosis, surgical recovery stage, and mobility goals.
          </p>
        </div>

        {/* Patient-Reported Symptoms & Recovery Envelope (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
            <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#3AA99B]" />
              Patient-Reported Symptom Log
            </h3>
            <span className="text-[10px] text-[#697B73]">PROMs Telemetry</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#193B32]">Dyspnea / Shortness of Breath</span>
                <span className="text-xs font-bold text-[#16866A]">Mild (Grade 1)</span>
              </div>
              <p className="text-[11px] text-[#697B73]">
                "Only on fast walking up the stairs; resolved with rest within 2 minutes."
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#193B32]">Surgical Site Discomfort</span>
                <span className="text-xs font-bold text-[#16866A]">VAS 2 / 10</span>
              </div>
              <p className="text-[11px] text-[#697B73]">
                "Clean, dry dressing. No excessive redness or drainage reported."
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#193B32]">Sleep Quality & Fatigue</span>
                <span className="text-xs font-bold text-[#E6A23C]">Moderate Restlessness</span>
              </div>
              <p className="text-[11px] text-[#697B73]">
                "Woke once during the night; used 2 pillows as instructed."
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#16866A]/5 border border-[#16866A]/20 text-[11px] text-[#697B73]">
            <strong>Safety Guardrail:</strong> HEALTHGUARD does not produce autonomous prescription adjustments or unsupervised dosing modifications.
          </div>
        </div>
      </div>
    </div>
  );
};
