import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Wind, 
  Droplets, 
  Thermometer, 
  Cpu, 
  Layers, 
  TrendingUp, 
  Info,
  CheckCircle2,
  Clock,
  Calendar,
  Code2,
  Binary,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  FileText,
  AlertTriangle,
  Sliders
} from 'lucide-react';
import { Patient, DailyCheckin } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Area, ComposedChart } from 'recharts';
import { formatHourMinuteSafe } from '@/lib/date-utils';
import { MinecraftAvatar } from '../common/MinecraftAvatar';
import { executeTwinPipeline, ForecastHorizon } from '@/lib/ml';

interface DigitalTwinViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  isMounted: boolean;
  checkins?: DailyCheckin[];
}

type TwinSubTab = 'forecast' | 'manifest' | 'encoder' | 'counterfactual' | 'trustworthy';

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  isMounted,
  checkins = [],
}) => {
  const [horizon, setHorizon] = useState<ForecastHorizon>('15m');
  const [activeTab, setActiveTab] = useState<TwinSubTab>('forecast');
  const [copiedManifest, setCopiedManifest] = useState(false);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientCheckins = checkins.filter((c) => c.patientId === selectedPatient.id);

  // Baseline reference for selected patient
  const baselineVitals = useMemo(() => {
    const firstHist = selectedPatient.vitalHistory[0] || selectedPatient.currentVitals;
    return {
      heartRate: firstHist.heartRate || 75,
      respiratoryRate: firstHist.respiratoryRate || 16,
      spo2: Math.max(92, firstHist.spo2 || 97),
      temperature: firstHist.temperature || 37.0,
    };
  }, [selectedPatient]);

  // Execute Complete V4.1 Cognitive Digital Twin Pipeline
  const pipelineResult = useMemo(() => {
    return executeTwinPipeline(
      selectedPatient.id,
      {
        heartRate: selectedPatient.currentVitals.heartRate,
        respiratoryRate: selectedPatient.currentVitals.respiratoryRate,
        spo2: selectedPatient.currentVitals.spo2,
        temperature: selectedPatient.currentVitals.temperature,
      },
      baselineVitals,
      42,
      horizon
    );
  }, [selectedPatient, baselineVitals, horizon]);

  // Combine historical readings with real PINN-ODE continuous trajectory
  const combinedChartData = useMemo(() => {
    const history = selectedPatient.vitalHistory.slice(-8);
    const lastTimestamp = new Date(selectedPatient.currentVitals.timestamp).getTime();

    const historicalPoints = history.map((h) => ({
      time: formatHourMinuteSafe(h.timestamp),
      type: 'historical',
      hrActual: h.heartRate,
      hrForecast: null as number | null,
      hrLower: null as number | null,
      hrUpper: null as number | null,
      rrActual: h.respiratoryRate,
      rrForecast: null as number | null,
      rrLower: null as number | null,
      rrUpper: null as number | null,
      spo2Actual: h.spo2,
      spo2Forecast: null as number | null,
      spo2Lower: null as number | null,
      spo2Upper: null as number | null,
      tempActual: h.temperature,
      tempForecast: null as number | null,
      tempLower: null as number | null,
      tempUpper: null as number | null,
    }));

    // Connect last actual point to forecast start
    const lastPoint = historicalPoints[historicalPoints.length - 1];
    if (lastPoint) {
      lastPoint.hrForecast = lastPoint.hrActual;
      lastPoint.hrLower = lastPoint.hrActual;
      lastPoint.hrUpper = lastPoint.hrActual;
      lastPoint.rrForecast = lastPoint.rrActual;
      lastPoint.rrLower = lastPoint.rrActual;
      lastPoint.rrUpper = lastPoint.rrActual;
      lastPoint.spo2Forecast = lastPoint.spo2Actual;
      lastPoint.spo2Lower = lastPoint.spo2Actual;
      lastPoint.spo2Upper = lastPoint.spo2Actual;
      lastPoint.tempForecast = lastPoint.tempActual;
      lastPoint.tempLower = lastPoint.tempActual;
      lastPoint.tempUpper = lastPoint.tempActual;
    }

    const forecastPoints = pipelineResult.forecast.trajectories.slice(1).map((pt) => {
      const stepMs = pt.tMinutes * 60 * 1000;
      const pointTime = new Date(lastTimestamp + stepMs);
      const timeStr = formatHourMinuteSafe(pointTime.toISOString());

      return {
        time: timeStr,
        type: 'forecast',
        hrActual: null as number | null,
        hrForecast: pt.state.heartRate,
        hrLower: pt.confidenceLower.heartRate,
        hrUpper: pt.confidenceUpper.heartRate,
        rrActual: null as number | null,
        rrForecast: pt.state.respiratoryRate,
        rrLower: pt.confidenceLower.respiratoryRate,
        rrUpper: pt.confidenceUpper.respiratoryRate,
        spo2Actual: null as number | null,
        spo2Forecast: pt.state.spo2,
        spo2Lower: pt.confidenceLower.spo2,
        spo2Upper: pt.confidenceUpper.spo2,
        tempActual: null as number | null,
        tempForecast: pt.state.temperature,
        tempLower: pt.confidenceLower.temperature,
        tempUpper: pt.confidenceUpper.temperature,
      };
    });

    return [...historicalPoints, ...forecastPoints];
  }, [selectedPatient, pipelineResult]);

  const copyManifestToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(pipelineResult.manifest, null, 2));
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Minecraft Avatar & Architecture Identification */}
      <div className="spatial-card backdrop-blur-2xl bg-white/85 border border-white/90 p-6 shadow-sm rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MinecraftAvatar patientId={selectedPatient.id} size={48} />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A]/10 text-[#16866A] uppercase tracking-wider">
                AvoFlare Neural-ODE V4.1 · Cognitive Digital Twin
              </span>
              <span className="text-xs text-[#697B73]">PINN-ODE Clinical Model</span>
            </div>
            <h2 className="text-xl font-bold text-[#193B32] mt-1">
              AvoFlare Digital Twin Engine — {selectedPatient.id}
            </h2>
            <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
              Manifest-driven physiological state evolution: dx/dt = f_phys(x, p, u) + f_θ(x, z_t, u) solved via continuous 4th-Order Runge-Kutta numerical integration.
            </p>
          </div>
        </div>

        {/* Patient and Horizon Selector Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md p-1 rounded-xl border border-[#E7ECE6]/80 shadow-xs">
            {(['5m', '15m', '30m'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  horizon === h
                    ? 'bg-[#16866A] text-white shadow-xs'
                    : 'text-[#697B73] hover:text-[#193B32]'
                }`}
              >
                {h === '5m' ? '5 min (Primary)' : h === '15m' ? '15 min (Secondary)' : '30 min (Experimental)'}
              </button>
            ))}
          </div>

          <select
            value={selectedPatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E7ECE6]/80 bg-white/80 backdrop-blur-md text-xs font-bold text-[#193B32] focus:outline-none focus:border-[#16866A] cursor-pointer shadow-xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.priority} • Age {p.age})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tab Navigation for Architecture Deep-Dive */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E7ECE6] pb-3">
        {[
          { id: 'forecast', label: '1. PINN-ODE Forecast & Neural Dynamics', icon: Cpu },
          { id: 'manifest', label: '2. Textual Physiological Manifest', icon: FileText },
          { id: 'encoder', label: '3. 264-Dim Vector Encoder', icon: Binary },
          { id: 'counterfactual', label: '4. Counterfactual Branching Engine', icon: GitBranch },
          { id: 'trustworthy', label: '5. Trustworthy & Safety Supervisor', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TwinSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#16866A] text-white shadow-xs'
                  : 'bg-white text-[#697B73] border border-[#E7ECE6] hover:bg-[#FAFBF8] hover:text-[#193B32]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PINN-ODE FORECAST & NEURAL DYNAMICS */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Correlated Patient Check-in Overlay */}
          {patientCheckins.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <span className="font-bold text-blue-900">
                    Correlated Check-in Data along Wave ({patientCheckins[0].timeFormatted}):
                  </span>
                  <span className="text-blue-950 ml-1.5">
                    Feeling: <strong>{patientCheckins[0].feeling}</strong> • Breathing: <strong>{patientCheckins[0].breathing}</strong> • Meds: <strong>{patientCheckins[0].medications}</strong>
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-700 text-white shrink-0">
                Check-in Risk: {patientCheckins[0].riskTier}
              </span>
            </div>
          )}

          {/* 4 Interactive Twin Forecast Charts with 95% Confidence Corridors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heart Rate Forecast */}
            <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
                <div>
                  <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#E45D58]" /> Heart Rate Forecast (RK4 + Neural Residual)
                  </span>
                  <p className="text-[11px] text-[#697B73] mt-0.5">
                    Current: {selectedPatient.currentVitals.heartRate} bpm • Baseline: {baselineVitals.heartRate} bpm
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-[#193B32]">
                    <span className="w-3 h-0.5 bg-[#E45D58]" /> Observed
                  </span>
                  <span className="flex items-center gap-1 text-[#697B73]">
                    <span className="w-3 h-0.5 border-t border-dashed border-[#E45D58]" /> PINN Forecast
                  </span>
                  <span className="text-[10px] font-mono text-[#16866A] bg-[#16866A]/10 px-1.5 py-0.5 rounded">
                    ±95% CI
                  </span>
                </div>
              </div>

              <div className="h-44 w-full">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                      <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 9, fill: '#697B73' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                      <Line type="monotone" dataKey="hrActual" stroke="#E45D58" strokeWidth={2.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="hrForecast" stroke="#E45D58" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="hrUpper" stroke="#E45D58" strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="2 2" dot={false} />
                      <Line type="monotone" dataKey="hrLower" stroke="#E45D58" strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="2 2" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Realtime PINN-ODE Equation Decomposition */}
              <div className="pt-2 border-t border-[#E7ECE6] grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">f_phys(x, p, u)</span>
                  <span className="font-bold text-[#193B32]">
                    {pipelineResult.forecast.trajectories[1]?.components.fPhys.heartRate.toFixed(2)} bpm/min
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">f_θ(x, z_t, u)</span>
                  <span className="font-bold text-[#16866A]">
                    {pipelineResult.forecast.trajectories[1]?.components.fTheta.heartRate.toFixed(2)} bpm/min
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">Net dx_HR/dt</span>
                  <span className="font-bold text-[#E45D58]">
                    {((pipelineResult.forecast.trajectories[1]?.components.fPhys.heartRate || 0) + (pipelineResult.forecast.trajectories[1]?.components.fTheta.heartRate || 0)).toFixed(2)} bpm/min
                  </span>
                </div>
              </div>
            </div>

            {/* Respiratory Rate Forecast */}
            <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
                <div>
                  <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-[#3AA99B]" /> Resp Rate Forecast (Ventilatory Drive)
                  </span>
                  <p className="text-[11px] text-[#697B73] mt-0.5">
                    Current: {selectedPatient.currentVitals.respiratoryRate} /min • Baseline: {baselineVitals.respiratoryRate} /min
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-[#193B32]">
                    <span className="w-3 h-0.5 bg-[#3AA99B]" /> Observed
                  </span>
                  <span className="flex items-center gap-1 text-[#697B73]">
                    <span className="w-3 h-0.5 border-t border-dashed border-[#3AA99B]" /> PINN Forecast
                  </span>
                </div>
              </div>

              <div className="h-44 w-full">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                      <YAxis domain={['dataMin - 4', 'dataMax + 4']} tick={{ fontSize: 9, fill: '#697B73' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                      <Line type="monotone" dataKey="rrActual" stroke="#3AA99B" strokeWidth={2.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="rrForecast" stroke="#3AA99B" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="rrUpper" stroke="#3AA99B" strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="2 2" dot={false} />
                      <Line type="monotone" dataKey="rrLower" stroke="#3AA99B" strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="2 2" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Equation Decomposition */}
              <div className="pt-2 border-t border-[#E7ECE6] grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">f_phys(x, p, u)</span>
                  <span className="font-bold text-[#193B32]">
                    {pipelineResult.forecast.trajectories[1]?.components.fPhys.respiratoryRate.toFixed(2)} /min²
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">f_θ(x, z_t, u)</span>
                  <span className="font-bold text-[#16866A]">
                    {pipelineResult.forecast.trajectories[1]?.components.fTheta.respiratoryRate.toFixed(2)} /min²
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">Net dx_RR/dt</span>
                  <span className="font-bold text-[#3AA99B]">
                    {((pipelineResult.forecast.trajectories[1]?.components.fPhys.respiratoryRate || 0) + (pipelineResult.forecast.trajectories[1]?.components.fTheta.respiratoryRate || 0)).toFixed(2)} /min²
                  </span>
                </div>
              </div>
            </div>

            {/* SpO2 Forecast */}
            <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
                <div>
                  <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-[#16866A]" /> Oxygen Saturation Drift (Desaturation Dynamics)
                  </span>
                  <p className="text-[11px] text-[#697B73] mt-0.5">
                    Current: {selectedPatient.currentVitals.spo2}% • Target Scale: Scale {pipelineResult.context.personalization.oxygenScale}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-[#193B32]">
                    <span className="w-3 h-0.5 bg-[#16866A]" /> Observed
                  </span>
                  <span className="flex items-center gap-1 text-[#697B73]">
                    <span className="w-3 h-0.5 border-t border-dashed border-[#16866A]" /> PINN Forecast
                  </span>
                </div>
              </div>

              <div className="h-44 w-full">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                      <YAxis domain={[82, 100]} tick={{ fontSize: 9, fill: '#697B73' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                      <Line type="monotone" dataKey="spo2Actual" stroke="#16866A" strokeWidth={2.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="spo2Forecast" stroke="#16866A" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="spo2Upper" stroke="#16866A" strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="2 2" dot={false} />
                      <Line type="monotone" dataKey="spo2Lower" stroke="#16866A" strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="2 2" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Equation Decomposition */}
              <div className="pt-2 border-t border-[#E7ECE6] grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">f_phys(x, p, u)</span>
                  <span className="font-bold text-[#193B32]">
                    {pipelineResult.forecast.trajectories[1]?.components.fPhys.spo2.toFixed(2)} %/min
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">f_θ(x, z_t, u)</span>
                  <span className="font-bold text-[#16866A]">
                    {pipelineResult.forecast.trajectories[1]?.components.fTheta.spo2.toFixed(2)} %/min
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">Net dx_SpO2/dt</span>
                  <span className="font-bold text-[#16866A]">
                    {((pipelineResult.forecast.trajectories[1]?.components.fPhys.spo2 || 0) + (pipelineResult.forecast.trajectories[1]?.components.fTheta.spo2 || 0)).toFixed(2)} %/min
                  </span>
                </div>
              </div>
            </div>

            {/* Temperature Forecast */}
            <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
                <div>
                  <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-[#E6A23C]" /> Core Temperature Forecast (Thermoregulation)
                  </span>
                  <p className="text-[11px] text-[#697B73] mt-0.5">
                    Current: {selectedPatient.currentVitals.temperature.toFixed(1)}°C • Baseline: {baselineVitals.temperature.toFixed(1)}°C
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1 text-[#193B32]">
                    <span className="w-3 h-0.5 bg-[#E6A23C]" /> Observed
                  </span>
                  <span className="flex items-center gap-1 text-[#697B73]">
                    <span className="w-3 h-0.5 border-t border-dashed border-[#E6A23C]" /> PINN Forecast
                  </span>
                </div>
              </div>

              <div className="h-44 w-full">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                      <YAxis domain={[35.0, 40.5]} tick={{ fontSize: 9, fill: '#697B73' }} />
                      <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                      <Line type="monotone" dataKey="tempActual" stroke="#E6A23C" strokeWidth={2.5} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="tempForecast" stroke="#E6A23C" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="tempUpper" stroke="#E6A23C" strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="2 2" dot={false} />
                      <Line type="monotone" dataKey="tempLower" stroke="#E6A23C" strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="2 2" dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Equation Decomposition */}
              <div className="pt-2 border-t border-[#E7ECE6] grid grid-cols-3 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">f_phys(x, p, u)</span>
                  <span className="font-bold text-[#193B32]">
                    {pipelineResult.forecast.trajectories[1]?.components.fPhys.temperature.toFixed(3)} °C/min
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">f_θ(x, z_t, u)</span>
                  <span className="font-bold text-[#16866A]">
                    {pipelineResult.forecast.trajectories[1]?.components.fTheta.temperature.toFixed(3)} °C/min
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAFBF8] border border-[#E7ECE6]">
                  <span className="text-[#697B73] block font-mono">Net dx_T/dt</span>
                  <span className="font-bold text-[#E6A23C]">
                    {((pipelineResult.forecast.trajectories[1]?.components.fPhys.temperature || 0) + (pipelineResult.forecast.trajectories[1]?.components.fTheta.temperature || 0)).toFixed(3)} °C/min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEXTUAL PHYSIOLOGICAL MANIFEST (LAYER 5) */}
      {activeTab === 'manifest' && (
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7ECE6]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#193B32]">Layer 5 — Textual Physiological State Manifest</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#16866A]/10 text-[#16866A] font-bold">
                  v{pipelineResult.manifest.stateVersion} · {pipelineResult.manifest.manifestId}
                </span>
              </div>
              <p className="text-xs text-[#697B73] mt-1 max-w-3xl">
                The manifest is a structured textual representation of the virtual physiological state. It contains what is required to reconstruct and model physiological dynamics — <strong>never images, 3D anatomical models, or duplicate full medical records</strong>.
              </p>
            </div>
            <button
              onClick={copyManifestToClipboard}
              className="px-3.5 py-1.5 rounded-xl border border-[#E7ECE6] bg-[#FAFBF8] text-xs font-bold text-[#193B32] hover:bg-[#16866A] hover:text-white transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Code2 className="w-3.5 h-3.5" />
              {copiedManifest ? 'Copied JSON!' : 'Copy Manifest JSON'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-xs space-y-1">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block">Baseline Adaptation Status</span>
              <span className={`font-bold inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${
                pipelineResult.manifest.baselineState.adaptationStatus === 'frozen'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {pipelineResult.manifest.baselineState.adaptationStatus === 'frozen' ? 'FROZEN (Suspected Deterioration)' : 'ACTIVE ADAPTATION'}
              </span>
              <p className="text-[10px] text-[#697B73] pt-1">
                Ref: {pipelineResult.manifest.baselineState.baselineRef}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-xs space-y-1">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block">Physiological Relationships</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {pipelineResult.manifest.physiologicalRelationships.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-white border border-[#E7ECE6] font-mono text-[#193B32]">
                    {r.relationship} ({r.status})
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] text-xs space-y-1">
              <span className="text-[10px] font-bold text-[#697B73] uppercase block">Model Configuration</span>
              <span className="font-mono text-xs text-[#16866A] font-bold block">
                {pipelineResult.manifest.modelConfiguration.equationSet}
              </span>
              <p className="text-[10px] text-[#697B73]">
                Param Profile: {pipelineResult.manifest.modelConfiguration.parameterProfileRef} ({pipelineResult.manifest.modelConfiguration.parameterStatus})
              </p>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-[#193B32] text-[#F7F8F3] text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed border border-[#16866A]/30">
            {JSON.stringify(pipelineResult.manifest, null, 2)}
          </pre>
        </div>
      )}

      {/* TAB 3: 264-DIMENSIONAL CONTEXT-ADAPTIVE VECTOR ENCODER (LAYER 6) */}
      {activeTab === 'encoder' && (
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-[#E7ECE6]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#193B32]">Layer 6 — Context-Adaptive Vector Encoder</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#16866A] text-white font-bold">
                Exact 264 Ordered Numerical Dimensions
              </span>
            </div>
            <p className="text-xs text-[#697B73] mt-1 max-w-3xl">
              Fuses Input A (Structured Manifest) and Input B (Patient Context) into a standardized numerical vector. Missingness is preserved explicitly via availability masks rather than zero-filling.
            </p>
          </div>

          {/* 8 Feature Group Dimension Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '1. Physiological Features', dims: '48 dimensions', active: '48 valid', color: 'border-l-4 border-l-[#E45D58]' },
              { label: '2. Phys Availability Masks', dims: '48 dimensions', active: 'Explicit masks', color: 'border-l-4 border-l-[#E6A23C]' },
              { label: '3. Signal Quality Features', dims: '24 dimensions', active: 'SQI & noise index', color: 'border-l-4 border-l-[#16866A]' },
              { label: '4. Expert-Derived Features', dims: '32 dimensions', active: '7 domain outputs', color: 'border-l-4 border-l-[#3AA99B]' },
              { label: '5. Expert Feature Masks', dims: '32 dimensions', active: 'Confidence flags', color: 'border-l-4 border-l-blue-500' },
              { label: '6. Patient Context Features', dims: '32 dimensions', active: 'Domain & O2 scale', color: 'border-l-4 border-l-purple-500' },
              { label: '7. Context Availability Masks', dims: '32 dimensions', active: 'Verification status', color: 'border-l-4 border-l-indigo-500' },
              { label: '8. Temporal & Baseline Features', dims: '16 dimensions', active: 'Freeze & elapsed', color: 'border-l-4 border-l-[#193B32]' },
            ].map((grp, i) => (
              <div key={i} className={`p-3 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] ${grp.color}`}>
                <span className="text-[10px] font-bold text-[#697B73] uppercase block">{grp.label}</span>
                <span className="text-sm font-black text-[#193B32] mt-0.5 block">{grp.dims}</span>
                <span className="text-[10px] text-[#16866A] font-semibold mt-0.5 block">{grp.active}</span>
              </div>
            ))}
          </div>

          {/* Real Numerical Slice Visualizer */}
          <div className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#193B32]">
              <span>Sample Feature Vector Slice [z_t, dims 0..63]</span>
              <span className="font-mono text-[10px] text-[#697B73]">Length: 264 | Float64</span>
            </div>
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              {pipelineResult.encoderFrame.rawVector.slice(0, 64).map((val, idx) => (
                <span
                  key={idx}
                  title={`Dimension ${idx}: ${val}`}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    val === 0 
                      ? 'bg-gray-100 text-gray-500' 
                      : val < 0 
                      ? 'bg-rose-100 text-rose-800 font-bold' 
                      : 'bg-emerald-100 text-emerald-800 font-bold'
                  }`}
                >
                  [{idx}]: {val.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COUNTERFACTUAL BRANCHING ENGINE (LAYER 7) */}
      {activeTab === 'counterfactual' && (
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-[#E7ECE6]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#193B32]">Layer 7 — Counterfactual Branching Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800 font-bold">
                Isolated In-Silico Virtual Experiments
              </span>
            </div>
            <p className="text-xs text-[#697B73] mt-1 max-w-3xl">
              Branches the physiological manifest into 4 parallel virtual states, applies hypothetical manipulations, and re-runs the PINN-ODE solver to test forecast divergence and decision robustness. <strong>The real patient state remains untouched.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pipelineResult.trust.counterfactualBranches.map((branch) => (
              <div key={branch.branchId} className="p-4 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#193B32]">{branch.branchLabel}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    branch.decisionDivergence === 'Consistent'
                      ? 'bg-[#16866A]/10 text-[#16866A]'
                      : 'bg-[#E6A23C]/10 text-[#E6A23C]'
                  }`}>
                    {branch.decisionDivergence}
                  </span>
                </div>
                <p className="text-[11px] text-[#697B73]">{branch.description}</p>
                <div className="text-[10px] font-mono bg-white p-2 rounded border border-[#E7ECE6] text-[#193B32]">
                  Manipulation: <span className="font-bold text-[#16866A]">{branch.manipulation}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
                  <div className="bg-white p-1.5 rounded border border-[#E7ECE6]">
                    <span className="text-[#697B73] block">HR 5m</span>
                    <span className="font-bold text-[#193B32]">{branch.endpoint5m.heartRate.toFixed(0)} bpm</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-[#E7ECE6]">
                    <span className="text-[#697B73] block">RR 5m</span>
                    <span className="font-bold text-[#193B32]">{branch.endpoint5m.respiratoryRate.toFixed(0)}/min</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-[#E7ECE6]">
                    <span className="text-[#697B73] block">SpO2 5m</span>
                    <span className="font-bold text-[#193B32]">{branch.endpoint5m.spo2.toFixed(0)}%</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-[#E7ECE6]">
                    <span className="text-[#697B73] block">Robustness</span>
                    <span className="font-bold text-[#16866A]">{(branch.robustnessScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TRUSTWORTHY INTELLIGENCE & SAFETY SUPERVISOR (LAYER 7 & 8) */}
      {activeTab === 'trustworthy' && (
        <div className="space-y-6">
          {/* Layer 8: Independent Clinical Safety Supervisor Banner */}
          <div className={`p-5 rounded-2xl border ${
            pipelineResult.decision.safetySupervisor.safetyFloorTriggered
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}>
            <div className="flex items-start gap-3">
              {pipelineResult.decision.safetySupervisor.safetyFloorTriggered ? (
                <ShieldAlert className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Layer 8 — Independent Clinical Safety Supervisor
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/80">
                    Mandatory Escalation Floor Check
                  </span>
                </div>
                <h3 className="text-base font-bold">
                  {pipelineResult.decision.safetySupervisor.safetyFloorTriggered
                    ? 'MANDATORY CLINICAL ESCALATION FLOOR ACTIVATED'
                    : 'SAFETY SUPERVISOR: MONITORING PASS'}
                </h3>
                <p className="text-xs max-w-3xl leading-relaxed">
                  {pipelineResult.decision.safetySupervisor.reason}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-white border border-current">
                    Partial NEWS2 Subtotal: {pipelineResult.clinicalScore.subtotal} / 12
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white border border-current">
                    Neural Override Blocked: {pipelineResult.decision.safetySupervisor.overrideBlocked ? 'YES (Neural optimism rejected)' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Uncertainty Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Measurement Uncertainty', val: `${(pipelineResult.trust.uncertaintyBreakdown.measurement * 100).toFixed(0)}%` },
              { label: 'Context Uncertainty', val: `${(pipelineResult.trust.uncertaintyBreakdown.context * 100).toFixed(0)}%` },
              { label: 'Baseline Uncertainty', val: `${(pipelineResult.trust.uncertaintyBreakdown.baseline * 100).toFixed(0)}%` },
              { label: 'Parameter Uncertainty', val: `${(pipelineResult.trust.uncertaintyBreakdown.parameter * 100).toFixed(0)}%` },
              { label: 'Model Residual Uncertainty', val: `${(pipelineResult.trust.uncertaintyBreakdown.model * 100).toFixed(0)}%` },
              { label: 'Forecast Horizon Uncertainty', val: `${(pipelineResult.trust.uncertaintyBreakdown.forecast * 100).toFixed(0)}%` },
            ].map((u, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white border border-[#E7ECE6] shadow-xs text-center">
                <span className="text-[10px] font-bold text-[#697B73] block">{u.label}</span>
                <span className="text-lg font-black text-[#193B32] mt-1 block">{u.val}</span>
              </div>
            ))}
          </div>

          {/* Trust Score & Consistency Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
              <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Trust Engine Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-[#16866A]">
                  {(pipelineResult.trust.trustEngineScore * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-[#697B73]">Reliability Index</span>
              </div>
              <p className="text-[10px] text-[#697B73] mt-1">
                Combines sensor provenance, HMAC validity, and evidence grounding.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
              <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Physiological Consistency</span>
              <span className="text-sm font-bold text-[#16866A] mt-2 block flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16866A]" />
                {pipelineResult.trust.physiologicalConsistency}
              </span>
              <p className="text-[10px] text-[#697B73] mt-1">
                Strict numerical stability bounds (HR ∈ [30, 220], SpO2 ∈ [50, 100]).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
              <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">Model Validity Gate</span>
              <span className="text-sm font-bold text-[#193B32] mt-2 block">
                Status: <span className="font-mono text-[#16866A]">{pipelineResult.trust.modelValidityGate}</span>
              </span>
              <p className="text-[10px] text-[#697B73] mt-1">
                Out-of-distribution safeguard preventing rogue forecasting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
