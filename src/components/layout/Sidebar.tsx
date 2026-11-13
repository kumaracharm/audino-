import React from 'react';
import { 
  Activity, 
  Users, 
  BrainCircuit, 
  GitFork, 
  ShieldAlert, 
  HeartPulse, 
  Gauge, 
  SlidersHorizontal,
  Sparkles,
  Database
} from 'lucide-react';
import { UserSession, UserRole } from '@/types';

export type NavPage = 
  | 'overview' 
  | 'showcase'
  | 'patients' 
  | 'clinical' 
  | 'digital-twin' 
  | 'security' 
  | 'fhir' 
  | 'recovery' 
  | 'performance';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  onOpenDemoControls: () => void;
  simulationActive: boolean;
  urgentAlertCount: number;
  currentUser?: UserSession | null;
}

const ROLE_PERMITTED_PAGES: Record<UserRole, NavPage[]> = {
  patient: [],
  pheon: ['overview', 'patients'],
  nurse: ['overview', 'patients', 'clinical', 'recovery', 'security'],
  doctor: ['overview', 'showcase', 'patients', 'clinical', 'digital-twin', 'security', 'fhir', 'recovery', 'performance'],
  senior_doctor: ['overview', 'showcase', 'patients', 'clinical', 'digital-twin', 'security', 'fhir', 'recovery', 'performance'],
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  onOpenDemoControls,
  simulationActive,
  urgentAlertCount,
  currentUser,
}) => {
  const allNavItems: { id: NavPage; label: string; icon: React.ElementType; badge?: string; highlight?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'showcase', label: 'Showcase Demo', icon: Sparkles, badge: '7 ACTS', highlight: true },
    { id: 'patients', label: 'Patient Monitoring', icon: Users, badge: '10' },
    { id: 'clinical', label: 'Clinical Intelligence', icon: BrainCircuit },
    { id: 'digital-twin', label: 'Digital Twin', icon: GitFork },
    { id: 'security', label: 'Security Operations', icon: ShieldAlert, badge: 'HMAC' },
    { id: 'fhir', label: 'FHIR Records', icon: Database, badge: 'R4' },
    { id: 'recovery', label: 'Recovery Plans', icon: HeartPulse },
    { id: 'performance', label: 'System Performance', icon: Gauge },
  ];

  const permittedPages = currentUser ? ROLE_PERMITTED_PAGES[currentUser.role] : null;
  const navItems = permittedPages ? allNavItems.filter((item) => permittedPages.includes(item.id)) : allNavItems;

  const renderRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'pheon':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">PHEON ATTENDANT</span>;
      case 'nurse':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">STAFF NURSE</span>;
      case 'doctor':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">ATTENDING MD</span>;
      case 'senior_doctor':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">CHIEF CLINICIAN</span>;
      default:
        return null;
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-[#E7ECE6] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#E7ECE6] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16866A] to-[#3AA99B] flex items-center justify-center text-white shadow-sm shrink-0">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#193B32]">HEALTHGUARD</span>
            </div>
            <p className="text-[11px] font-medium text-[#697B73] leading-none mt-1 truncate">
              Intelligent Tele-Surveillance
            </p>
          </div>
        </div>

        {/* Current Clinician Identity Card */}
        {currentUser && (
          <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-[#F7F8F3] border border-[#E7ECE6] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#697B73]">Logged In Role</span>
              {renderRoleBadge()}
            </div>
            <p className="text-xs font-bold text-[#193B32] truncate">{currentUser.name}</p>
            <p className="text-[10px] text-[#697B73] truncate">{currentUser.title}</p>
          </div>
        )}

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#697B73] flex items-center justify-between">
            <span>Clinical Workspace</span>
            <span className="text-[9px] font-normal lowercase text-[#697B73]">({navItems.length} modules)</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#16866A] text-white shadow-sm'
                    : item.highlight
                    ? 'bg-[#16866A]/10 text-[#16866A] hover:bg-[#16866A]/20 font-bold border border-[#16866A]/30'
                    : 'text-[#697B73] hover:text-[#193B32] hover:bg-[#F7F8F3]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : item.highlight ? 'text-[#16866A]' : 'text-[#697B73]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active
                        ? 'bg-white/20 text-white'
                        : item.highlight
                        ? 'bg-[#16866A] text-white'
                        : 'bg-[#F7F8F3] text-[#697B73] border border-[#E7ECE6]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-[#E7ECE6] space-y-2.5 bg-[#FAFBF8]">
        {/* Demo Controls Launcher button */}
        <button
          onClick={onOpenDemoControls}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#16866A]/10 text-[#16866A] hover:bg-[#16866A]/20 border border-[#16866A]/20 transition-all cursor-pointer shadow-xs active:scale-98"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Demo Controls Panel</span>
          {simulationActive && (
            <span className="w-2 h-2 rounded-full bg-[#16866A]" />
          )}
        </button>

        {/* Live Simulation Status */}
        <div className="p-2.5 rounded-xl bg-white border border-[#E7ECE6] text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#697B73] font-medium flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${simulationActive ? 'bg-[#16866A]' : 'bg-gray-400'}`} />
              Telemetry Ingestion
            </span>
            <span className="font-mono font-bold text-[#193B32]">
              {simulationActive ? '10 Hz' : 'PAUSED'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#697B73] font-medium">Active Critical P0</span>
            <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${
              urgentAlertCount > 0 ? 'bg-[#E45D58] text-white' : 'text-[#16866A]'
            }`}>
              {urgentAlertCount}
            </span>
          </div>
        </div>

        <div className="text-[10px] text-center text-[#697B73] font-mono">
          <span>PS-03 HealthGuard Core v2.4</span>
        </div>
      </div>
    </aside>
  );
};
