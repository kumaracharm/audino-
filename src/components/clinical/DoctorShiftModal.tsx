import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Send, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  PhoneCall, 
  Pill, 
  Activity,
  Layers
} from 'lucide-react';
import { DoctorShiftSession, DoctorShiftFeedback, Patient, UserSession } from '@/types';

interface DoctorShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  currentShift: DoctorShiftSession;
  patients: Patient[];
  activePatientId?: string;
  onProvideFeedback: (feedback: Omit<DoctorShiftFeedback, 'id' | 'timestamp'>) => void;
  onEndShift?: () => void;
  isAlarmActive: boolean;
  onSilenceAlarm: () => void;
}

export const DoctorShiftModal: React.FC<DoctorShiftModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentShift,
  patients,
  activePatientId = 'HG-001',
  onProvideFeedback,
  onEndShift,
  isAlarmActive,
  onSilenceAlarm,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(activePatientId);
  const [clinicalImpression, setClinicalImpression] = useState<string>('Acute physiological decompensation secondary to post-discharge pneumonia exacerbation');
  const [actionPlan, setActionPlan] = useState<string>('Immediate rapid response nurse home dispatch + titrate oxygen');
  const [prescriptions, setPrescriptions] = useState<string>('Increase Furosemide to 40mg oral BID; Albuterol nebulizer 2.5mg Q4H PRN');
  const [handoverDirective, setHandoverDirective] = useState<string>('Re-evaluate SpO2 trajectory in 30 minutes. If SpO2 remains < 88% on room air, trigger direct hospital admission.');
  const [submittedFeedback, setSubmittedFeedback] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProvideFeedback({
      patientId: selectedPatientId,
      doctorName: currentUser?.name || 'Attending Physician',
      clinicalImpression,
      actionPlan,
      prescriptionsOrOrders: prescriptions,
      handoverDirective,
      urgencyResolved: true,
    });

    if (isAlarmActive) {
      onSilenceAlarm();
    }

    setSubmittedFeedback(true);
    setTimeout(() => {
      setSubmittedFeedback(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E7ECE6] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E7ECE6] bg-[#FAFBF8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#16866A]/10 text-[#16866A] flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#193B32]">Physician Shift Session & Clinical Feedback</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16866A] text-white">
                  ON-DUTY SESSION
                </span>
              </div>
              <p className="text-xs text-[#697B73] mt-0.5">
                {currentUser?.name || 'Attending Physician'} · {currentShift.shiftType} · Started {currentShift.startTime}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#697B73] hover:text-[#193B32] hover:bg-[#E7ECE6]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alarm Banner if Active */}
        {isAlarmActive && (
          <div className="bg-[#E45D58] text-white px-5 py-2.5 flex items-center justify-between text-xs font-bold shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>ALARM REQUIRING ATTENTION: Audible warning is active until clinician review feedback is provided.</span>
            </div>
            <button
              onClick={onSilenceAlarm}
              className="px-2.5 py-1 bg-white text-[#E45D58] rounded-md font-bold text-xs hover:bg-[#F7F8F3] transition-colors cursor-pointer"
            >
              Acknowledge & Mute Tone
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Shift Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6]">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block">Shift Session</span>
              <span className="text-xs font-bold text-[#193B32] mt-0.5 block">{currentShift.shiftType}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6]">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block">Reviewed Patients</span>
              <span className="text-xs font-bold text-[#16866A] mt-0.5 block">
                {currentShift.reviewedPatientIds.length} of {patients.length} Monitored
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6]">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block">Clinical Interventions</span>
              <span className="text-xs font-bold text-[#193B32] mt-0.5 block">
                {currentShift.feedbackList.length} Interventions Logged
              </span>
            </div>
          </div>

          {/* Patient Selection & Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#193B32] block">Select Patient Under Review:</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {patients.map((p) => {
                const isSelected = p.id === selectedPatientId;
                const isP0 = p.priority === 'P0';
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#16866A] bg-[#16866A]/10 font-bold'
                        : isP0
                        ? 'border-[#E45D58] bg-[#E45D58]/10'
                        : 'border-[#E7ECE6] bg-[#FAFBF8] hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#193B32]">{p.id}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isP0 ? 'bg-[#E45D58] text-white' : 'bg-gray-200 text-[#193B32]'
                      }`}>
                        {p.priority}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#697B73] block mt-1 truncate">
                      HR {p.currentVitals.heartRate} · SpO₂ {p.currentVitals.spo2}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Context Snippet */}
          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#193B32]">{selectedPatient.id} · Age {selectedPatient.age} · {selectedPatient.conditions[0]}</span>
              <p className="text-[#697B73] text-[11px] mt-0.5">{selectedPatient.dischargeContext}</p>
            </div>
            <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-[#E7ECE6] text-[#193B32] shrink-0">
              Vitals: HR {selectedPatient.currentVitals.heartRate} · RR {selectedPatient.currentVitals.respiratoryRate} · SpO₂ {selectedPatient.currentVitals.spo2}% · Temp {selectedPatient.currentVitals.temperature}°C
            </div>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#193B32] block mb-1">
                Clinical Assessment & Diagnostic Impression:
              </label>
              <textarea
                rows={2}
                value={clinicalImpression}
                onChange={(e) => setClinicalImpression(e.target.value)}
                required
                className="w-full p-2.5 text-xs rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-[#193B32] focus:outline-none focus:border-[#16866A]"
                placeholder="Document physician findings, trajectory assessment, and decompensation drivers..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#193B32] block mb-1">
                  Immediate Clinical Action Plan & Orders:
                </label>
                <textarea
                  rows={2}
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  required
                  className="w-full p-2.5 text-xs rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-[#193B32] focus:outline-none focus:border-[#16866A]"
                  placeholder="e.g. Urgent nurse visit, oxygen titration, video consult..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#193B32] block mb-1">
                  Medication Adjustments / Prescriptions:
                </label>
                <textarea
                  rows={2}
                  value={prescriptions}
                  onChange={(e) => setPrescriptions(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-[#193B32] focus:outline-none focus:border-[#16866A]"
                  placeholder="e.g. Diuretic dosage, bronchodilator frequency..."
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#193B32] block mb-1">
                Handover Directive for Next Shift Clinician:
              </label>
              <input
                type="text"
                value={handoverDirective}
                onChange={(e) => setHandoverDirective(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-[#193B32] focus:outline-none focus:border-[#16866A]"
                placeholder="Clear instructions for next attending doctor or on-call nurse..."
              />
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-[#E7ECE6] flex items-center justify-between">
              <span className="text-[11px] text-[#697B73]">
                Feedback commits to patient EHR audit trail and marks patient as Clinician Attended.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F7F8F3] text-[#697B73] hover:text-[#193B32] border border-[#E7ECE6] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#16866A] text-white hover:bg-[#126b55] transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittedFeedback ? 'Feedback Committed!' : 'Sign & Submit Shift Feedback'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Past Interventions in this Shift */}
          {currentShift.feedbackList.length > 0 && (
            <div className="pt-4 border-t border-[#E7ECE6] space-y-3">
              <h4 className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#16866A]" />
                <span>Interventions Signed During Current Shift Session</span>
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {currentShift.feedbackList.map((fb) => (
                  <div key={fb.id} className="p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#193B32]">{fb.patientId} · {fb.doctorName}</span>
                      <span className="text-[10px] text-[#697B73]">{fb.timestamp}</span>
                    </div>
                    <p className="text-[#193B32] font-semibold">{fb.clinicalImpression}</p>
                    <p className="text-[11px] text-[#697B73]">Plan: {fb.actionPlan}</p>
                    <p className="text-[10px] text-[#16866A] font-mono">Handover: {fb.handoverDirective}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

