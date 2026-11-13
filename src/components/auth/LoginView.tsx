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
    <div className="relative min-h-screen bg-[#F4F6F2] flex flex-col justify-center items-center p-6 text-[#193B32] overflow-hidden">
      {/* Ambient Spatial Lighting Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-[#16866A]/12 to-[#3AA99B]/08 blur-[120px]" />
        <div className="absolute top-[35%] -right-[15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-bl from-[#83AD8B]/14 to-[#16866A]/05 blur-[130px]" />
        <div className="absolute -bottom-[20%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-[#3AA99B]/10 to-[#A99ACB]/06 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#193B32_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Brand Header: Logo only as visual recognition */}
      <div className="relative z-10 max-w-2xl w-full text-center mb-8 flex flex-col items-center">
        <div className="py-2.5 px-6 rounded-3xl bg-white/95 backdrop-blur-md border border-white/90 shadow-sm mb-3 inline-flex items-center justify-center">
          <img 
            src="/avoflare_logo.jpg" 
            alt="Logo" 
            className="h-10 w-auto object-contain" 
          />
        </div>
        <p className="text-xs text-[#697B73] mt-1 max-w-md mx-auto">
          Personalized post-discharge deterioration forecasting. Select your authorized clinical profile to access your surveillance workspace.
        </p>
      </div>

      {/* Role Selection Grid */}
      <div className="relative z-10 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Patient Portal Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 spatial-card backdrop-blur-2xl bg-white/85 border border-white/95 p-6 shadow-md hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <MinecraftAvatar patientId="HG-001" size={64} />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0284c7] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
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
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-[#0284c7] text-white font-bold text-sm shadow hover:bg-[#0369a1] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-98"
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
              className="spatial-card backdrop-blur-xl bg-white/80 border border-white/90 rounded-2xl p-5 shadow-xs hover:shadow-lg hover:border-[#16866A]/40 transition-all cursor-pointer flex flex-col justify-between group active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleConfig.badgeColor}`}>
                    {roleConfig.badge}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#E7ECE6]/80 group-hover:bg-[#16866A]/10 flex items-center justify-center text-[#697B73] group-hover:text-[#16866A] transition-colors shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-sm text-[#193B32] group-hover:text-[#16866A] transition-colors">
                  {user.name}
                </h3>
                <p className="text-[11px] text-[#697B73] mt-0.5 font-medium">{user.title}</p>
                <div className="my-2.5 py-1 px-2 rounded-xl bg-white/70 border border-[#E7ECE6]/80 text-[10px] font-semibold text-[#16866A]">
                  {roleConfig.scope}
                </div>
                <p className="text-[11px] text-[#697B73] leading-relaxed line-clamp-3">
                  {roleConfig.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E7ECE6]/60 flex items-center justify-between text-xs font-bold text-[#16866A]">
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
