import React, { useState } from 'react';
import { 
  GitFork, 
  Activity, 
  Heart, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  TrendingUp, 
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Patient } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface DigitalTwinViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  isMounted: boolean;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  isMounted,
}) => {
  const [horizon, setHorizon] = useState<'5m' | '15m' | '30m'>('15m');
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Generate historical + forecast points
  const twinForecastData = React.useMemo(() => {
    const history = selectedPatient.vitalHistory.slice(-10);
    const horizonMinutes = horizon === '5m' ? 5 : horizon === '15m' ? 15 : 30;
    const forecastCount = horizon === '5m' ? 5 : horizon === '15m' ? 8 : 12;

    const baseHR = selectedPatient.currentVitals.heartRate;
    const baseRR = selectedPatient.currentVitals.respiratoryRate;
    const baseSpO2 = selectedPatient.currentVitals.spo2;
    const baseTemp = selectedPatient.currentVitals.temperature;

    // Deterioration drift factor if P0/P1
    const driftHR = selectedPatient.priority === 'P0' ? 1.5 : selectedPatient.priority === 'P1' ? 0.6 : 0;
    const driftRR = selectedPatient.priority === 'P0' ? 0.5 : 0;
    const driftSpO2 = selectedPatient.priority === 'P0' ? -0.4 : 0;

    const formattedHistory = history.map((h, i) => {
      const d = new Date(h.timestamp);
      return {
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'historical',
        hrActual: h.heartRate,
        hrForecast: null as number | null,
        rrActual: h.respiratoryRate,
        rrForecast: null as number | null,
        spo2Actual: h.spo2,
        spo2Forecast: null as number | null,
        tempActual: h.temperature,
        tempForecast: null as number | null,
      };
    });

    const now = Date.now();
    const forecastPoints = Array.from({ length: forecastCount }, (_, i) => {
      const t = new Date(now + (i + 1) * (horizonMinutes / forecastCount) * 60 * 1000);
      return {
        time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'forecast',
        hrActual: null as number | null,
        hrForecast: Math.round(baseHR + (i + 1) * driftHR + (Math.random() - 0.5) * 3),
        rrActual: null as number | null,
        rrForecast: Math.round(baseRR + (i + 1) * driftRR + (Math.random() - 0.5) * 1.5),
        spo2Actual: null as number | null,
        spo2Forecast: Math.round(Math.max(80, Math.min(100, baseSpO2 + (i + 1) * driftSpO2 + (Math.random() - 0.5) * 1))),
        tempActual: null as number | null,
        tempForecast: parseFloat((baseTemp + (i + 1) * 0.05 + (Math.random() - 0.5) * 0.1).toFixed(1)),
      };
    });

    // Bridge point to connect line
    const lastHist = formattedHistory[formattedHistory.length - 1];
    if (lastHist) {
      lastHist.hrForecast = lastHist.hrActual;
      lastHist.rrForecast = lastHist.rrActual;
      lastHist.spo2Forecast = lastHist.spo2Actual;
      lastHist.tempForecast = lastHist.tempActual;
    }

    return [...formattedHistory, ...forecastPoints];
  }, [selectedPatient, horizon]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A]/10 text-[#16866A] uppercase tracking-wider">
              PINN-ODE Neural Forecaster
            </span>
            <span className="text-xs text-[#697B73]">Hybrid Physics-Informed Digital Twin</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">Physiological Digital Twin</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            Mechanistic ODE cardiovascular models blended with residual neural estimators to forecast short-horizon trajectory drift.
          </p>
        </div>

        {/* Patient and Horizon Selector Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#FAFBF8] p-1 rounded-xl border border-[#E7ECE6]">
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
                {h === '5m' ? '5 min' : h === '15m' ? '15 min' : '30 min'}
              </button>
            ))}
          </div>

          <select
            value={selectedPatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#E7ECE6] bg-[#FAFBF8] text-xs font-bold text-[#193B32] focus:outline-none focus:border-[#16866A] cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} ({p.priority} • Age {p.age})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Architecture Strip */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-4 shadow-xs">
        <h3 className="text-xs font-bold text-[#193B32] uppercase tracking-wider mb-2.5 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#16866A]" />
          Hybrid PINN Pipeline Architecture
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {[
            { step: '01', name: 'Patient Context', desc: 'Comorbidities & baseline' },
            { step: '02', name: 'State Manifest', desc: 'Normalized vital vector' },
            { step: '03', name: 'Feature Encoder', desc: 'Latent representation' },
            { step: '04', name: 'PINN-ODE Core', desc: 'Cardiovascular mechanics' },
            { step: '05', name: 'Forecast Extrapolator', desc: '5/15/30 min trajectory' },
            { step: '06', name: 'Trust & Uncertainty', desc: 'Confidence bound check' },
          ].map((node) => (
            <div key={node.step} className="p-2.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6]">
              <span className="text-[10px] font-bold text-[#16866A] block">NODE {node.step}</span>
              <p className="font-bold text-[#193B32] text-xs mt-0.5">{node.name}</p>
              <p className="text-[10px] text-[#697B73] mt-0.5">{node.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Interactive Twin Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate Forecast */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
            <div>
              <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#E45D58]" /> Heart Rate Forecast (ODE + Neural)
              </span>
              <p className="text-[11px] text-[#697B73] mt-0.5">
                Current: {selectedPatient.currentVitals.heartRate} bpm • Horizon: {horizon}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-[#193B32]">
                <span className="w-3 h-0.5 bg-[#E45D58]" /> Observed
              </span>
              <span className="flex items-center gap-1 text-[#697B73]">
                <span className="w-3 h-0.5 border-t border-dashed border-[#E45D58]" /> PINN Forecast
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={twinForecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 9, fill: '#697B73' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                  <Line type="monotone" dataKey="hrActual" stroke="#E45D58" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="hrForecast" stroke="#E45D58" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
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
                Current: {selectedPatient.currentVitals.respiratoryRate} /min • Horizon: {horizon}
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
                <LineChart data={twinForecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                  <YAxis domain={['dataMin - 3', 'dataMax + 3']} tick={{ fontSize: 9, fill: '#697B73' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                  <Line type="monotone" dataKey="rrActual" stroke="#3AA99B" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="rrForecast" stroke="#3AA99B" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* SpO2 Forecast */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
            <div>
              <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#16866A]" /> Oxygen Saturation Forecast
              </span>
              <p className="text-[11px] text-[#697B73] mt-0.5">
                Current: {selectedPatient.currentVitals.spo2}% • Horizon: {horizon}
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
                <LineChart data={twinForecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                  <YAxis domain={[85, 100]} tick={{ fontSize: 9, fill: '#697B73' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                  <Line type="monotone" dataKey="spo2Actual" stroke="#16866A" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="spo2Forecast" stroke="#16866A" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Temperature Forecast */}
        <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7ECE6]">
            <div>
              <span className="text-xs font-bold text-[#193B32] flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-[#E6A23C]" /> Core Temperature Forecast
              </span>
              <p className="text-[11px] text-[#697B73] mt-0.5">
                Current: {selectedPatient.currentVitals.temperature.toFixed(1)}°C • Horizon: {horizon}
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
                <LineChart data={twinForecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#697B73' }} />
                  <YAxis domain={[35.0, 41.0]} tick={{ fontSize: 9, fill: '#697B73' }} />
                  <Tooltip contentStyle={{ fontSize: '11px', backgroundColor: '#FFFFFF', border: '1px solid #E7ECE6', borderRadius: '6px' }} />
                  <Line type="monotone" dataKey="tempActual" stroke="#E6A23C" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="tempForecast" stroke="#E6A23C" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Model Validity & Uncertainty Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[11px] font-bold text-[#697B73] uppercase tracking-wider block">Model Version</span>
          <span className="text-sm font-bold text-[#193B32] mt-1 block">PINN-Physio v3.2.1-Sim</span>
          <span className="text-[10px] text-[#16866A] mt-0.5 block">Mechanistic ODE + Neural Residual</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[11px] font-bold text-[#697B73] uppercase tracking-wider block">Input Signal Quality</span>
          <span className="text-sm font-bold text-[#16866A] mt-1 block">99.2% Valid Frames</span>
          <span className="text-[10px] text-[#697B73] mt-0.5 block">Zero missing packets in buffer</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[11px] font-bold text-[#697B73] uppercase tracking-wider block">Prediction Uncertainty</span>
          <span className="text-sm font-bold text-[#193B32] mt-1 block">±3.8% (95% CI)</span>
          <span className="text-[10px] text-[#697B73] mt-0.5 block">Calibrated Bayesian confidence</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[11px] font-bold text-[#697B73] uppercase tracking-wider block">Execution Status</span>
          <span className="text-sm font-bold text-[#16866A] mt-1 block">Real-Time (12ms)</span>
          <span className="text-[10px] text-[#697B73] mt-0.5 block">Executed on Twin Worker node</span>
        </div>
      </div>

      {/* Warning Alert */}
      <div className="p-3.5 rounded-xl bg-[#E6A23C]/10 border border-[#E6A23C]/30 text-xs text-[#193B32] flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#E6A23C] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Demonstration Disclaimer:</strong> Forecasts are simulated demonstration outputs generated via synthetic algorithms and are not clinically validated diagnostic projections.
        </p>
      </div>
    </div>
  );
};
