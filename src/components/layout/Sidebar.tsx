import React from 'react';
import { 
  Activity, 
  Users, 
  BrainCircuit, 
  GitFork, 
  ShieldAlert, 
  FileText, 
  HeartPulse, 
  Gauge, 
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type NavPage = 
  | 'overview' 
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  onOpenDemoControls,
  simulationActive
}) => {
  const navItems: { id: NavPage; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'patients', label: 'Patient Monitoring', icon: Users, badge: '10' },
    { id: 'clinical', label: 'Clinical Intelligence', icon: BrainCircuit },
    { id: 'digital-twin', label: 'Digital Twin', icon: GitFork },
    { id: 'security', label: 'Security Operations', icon: ShieldAlert, badge: 'HMAC' },
    { id: 'fhir', label: 'FHIR Records', icon: FileText, badge: 'R4' },
    { id: 'recovery', label: 'Recovery Plans', icon: HeartPulse },
    { id: 'performance', label: 'System Performance', icon: Gauge },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E7ECE6] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-[#E7ECE6] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#16866A] to-[#3AA99B] flex items-center justify-center text-white shadow-sm shrink-0">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#193B32]">HEALTHGUARD</span>
            </div>
            <p className="text-[11px] font-medium text-[#697B73] leading-none mt-1">
              Intelligent Post-Discharge Monitoring
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#697B73]">
            Clinical Workspace
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
                    : 'text-[#697B73] hover:text-[#193B32] hover:bg-[#F7F8F3]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#697B73]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      active
                        ? 'bg-white/20 text-white'
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
            <span className="w-2 h-2 rounded-full bg-[#16866A] animate-ping" />
          )}
        </button>

        {/* Live Simulation Status */}
        <div className="p-2.5 rounded-xl bg-white border border-[#E7ECE6] text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[#697B73] flex items-center gap-1 font-medium">
              <span className={`w-2 h-2 rounded-full ${simulationActive ? 'bg-[#16866A] animate-pulse' : 'bg-amber-400'}`} />
              Telemetry Stream
            </span>
            <span className="font-bold text-[#193B32]">{simulationActive ? 'STREAMING' : 'PAUSED'}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#697B73]">
            <span>Mode: Deterministic NEWS2</span>
            <span className="text-[#16866A] font-semibold">Demo 100%</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-[#E7ECE6]">
          <div className="w-8 h-8 rounded-full bg-[#16866A] text-white flex items-center justify-center text-xs font-bold shrink-0">
            CA
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#193B32] truncate">Dr. Sarah Vance, MD</p>
            <p className="text-[10px] text-[#697B73] truncate">Clinical Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

