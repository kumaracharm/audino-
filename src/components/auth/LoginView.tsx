import React from 'react';
import { UserSession, UserRole } from '@/types';
import { ShieldCheck, UserCheck, Stethoscope, HeartPulse, ArrowRight, Activity, Heart } from 'lucide-react';
import { MinecraftAvatar } from '../common/MinecraftAvatar';

interface LoginViewProps {
  onLogin: (session: UserSession) => void;
}

export const DEMO_USERS: UserSession[] = [
  {
    id: 'patient_p001',
    name: 'Clora Christiansen',
    role: 'patient',
    title: 'Post-Discharge Patient (CHF Stepdown)',
    patientId: 'HG-001',
    assignedPatients: ['HG-001'],
  },
  {
    id: 'pheon_marcus',
    name: 'Marcus Vance',
    role: 'pheon',
    title: 'Post-Discharge Care Attendant (PHEON)',
    assignedPatients: ['HG-001', 'HG-002', 'HG-003', 'HG-007'],
  },
  {
    id: 'nurse_sarah',
    name: 'Sarah Jenkins, RN',
    role: 'nurse',
    title: 'Post-Discharge Tele-Surveillance Nurse',
    assignedPatients: ['HG-001', 'HG-002', 'HG-003', 'HG-004', 'HG-007', 'HG-009'],
  },
  {
    id: 'dr_chen',
    name: 'Dr. Arthur Chen, MD',
    role: 'doctor',
    title: 'Cardiopulmonary Attending Physician',
    assignedPatients: ['HG-001', 'HG-003', 'HG-006', 'HG-009', 'HG-010'],
  },
  {
    id: 'dr_patel',
    name: 'Dr. Maya Patel, MD',
    role: 'senior_doctor',
    title: 'Chief Medical Officer / Clinical Director',
    assignedPatients: ['HG-001', 'HG-002', 'HG-003', 'HG-004', 'HG-005', 'HG-006', 'HG-007', 'HG-008', 'HG-009', 'HG-010'],
  },
];

const CLINICAL_ROLE_CONFIGS: Record<Exclude<UserRole, 'patient'>, {
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  scope: string;
  desc: string;
}> = {
  pheon: {
    badge: 'PHEON / Attendant',
    badgeColor: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/30',
    icon: UserCheck,
    scope: '4 Assigned Patients • Remote Cohort A',
    desc: 'First-response operational monitoring, device connectivity & one-click nurse escalation.',
  },
  nurse: {
    badge: 'Staff Nurse',
    badgeColor: 'bg-[#16866A]/10 text-[#16866A] border-[#16866A]/30',
    icon: HeartPulse,
    scope: '6 Assigned Patients • Remote Cohort A & B',
    desc: 'Clinical telemetry, prioritized alerts, check-in waveform review & care plan execution.',
  },
  doctor: {
    badge: 'Attending Physician',
    badgeColor: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/30',
    icon: Stethoscope,
    scope: '5 Assigned Patients • High Acuity',
    desc: 'Decision support, neural ODE deterioration trajectories, care orders & authorized FHIR export.',
  },
  senior_doctor: {
    badge: 'Senior Doctor / Admin',
    badgeColor: 'bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/30',
    icon: ShieldCheck,
    scope: 'Full Remote Cohort (10 Patients) · Post-Discharge',
    desc: 'Cohort governance, staff response metrics, patient reassignment & audited workflow overrides.',
  },
};

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-[#F7F8F3] flex flex-col justify-center items-center p-6 text-[#193B32]">
      {/* Brand Header */}
      <div className="max-w-2xl w-full text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16866A]/10 text-[#16866A] text-xs font-bold border border-[#16866A]/20 mb-4">
          <Activity className="w-4 h-4" />
          <span>HOSPITAL-GRADE ROLE-BASED ACCESS CONTROL</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#193B32]">
          HealthGuard Clinical Intelligence
        </h1>
        <p className="text-sm text-[#697B73] mt-2 max-w-lg mx-auto">
          Sign in with your authorized credentials. Patients access their private health check-in portal, while clinicians access scoped monitoring workspaces.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Patient Portal Card (Completely Separated & Non-Mixed!) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-[#0284c7]/10 via-[#38bdf8]/5 to-white border-2 border-[#0284c7]/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <MinecraftAvatar patientId="HG-001" size={64} />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#0284c7] text-white text-[10px] font-bold uppercase tracking-wider">
                  Patient Portal
                </span>
                <span className="text-xs font-mono font-semibold text-[#64748b]">ID: HG-001</span>
              </div>
              <h3 className="text-lg font-bold text-[#0f172a] mt-1">Clora Christiansen</h3>
              <p className="text-xs text-[#64748b] mt-0.5 max-w-md">
                Private, accessible mobile-first patient dashboard with daily health check-in, voice assistant, and connected smartwatch wave.
              </p>
            </div>
          </div>
          <button
            onClick={() => onLogin(DEMO_USERS[0])}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#0284c7] text-white font-bold text-sm shadow hover:bg-[#0369a1] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Launch Patient Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clinical Staff Roles */}
        {DEMO_USERS.slice(1).map((user) => {
          if (user.role === 'patient') return null;
          const roleConfig = CLINICAL_ROLE_CONFIGS[user.role];
          const Icon = roleConfig.icon;

          return (
            <div
              key={user.id}
              onClick={() => onLogin(user)}
              className="bg-white border border-[#E7ECE6] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#16866A] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleConfig.badgeColor}`}>
                    {roleConfig.badge}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#F7F8F3] group-hover:bg-[#16866A]/10 flex items-center justify-center text-[#697B73] group-hover:text-[#16866A] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-[#193B32] group-hover:text-[#16866A] transition-colors">
                  {user.name}
                </h3>
                <p className="text-[11px] text-[#697B73] mt-0.5 font-medium">{user.title}</p>
                <div className="my-2.5 py-1 px-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6] text-[10px] font-semibold text-[#16866A]">
                  {roleConfig.scope}
                </div>
                <p className="text-[11px] text-[#697B73] leading-relaxed line-clamp-3">
                  {roleConfig.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E7ECE6] flex items-center justify-between text-xs font-bold text-[#16866A]">
                <span>Sign In Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
