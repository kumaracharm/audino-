import React from 'react';
import { 
  Gauge, 
  Cpu, 
  Server, 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { PerformanceMetric } from '@/types';

export const SystemPerformanceView: React.FC = () => {
  const metrics: PerformanceMetric[] = [
    { name: 'Telemetry Ingestion Latency (FastAPI)', p50: 12, p95: 28, p99: 45, unit: 'ms' },
    { name: 'P0 Urgent Alert Delivery Dispatch', p50: 48, p95: 110, p99: 142, unit: 'ms' },
    { name: 'HMAC-SHA256 Edge Verification', p50: 1.8, p95: 3.4, p99: 5.1, unit: 'ms' },
    { name: 'PINN-ODE Neural Forecaster Batch', p50: 84, p95: 140, p99: 195, unit: 'ms' },
    { name: 'HAPI FHIR R4 Transaction Persistence', p50: 65, p95: 120, p99: 180, unit: 'ms' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#16866A]/10 text-[#16866A] uppercase tracking-wider">
              Distributed Telemetry Engine
            </span>
            <span className="text-xs text-[#697B73]">Low-Latency Clinical Message Bus</span>
          </div>
          <h2 className="text-xl font-bold text-[#193B32] mt-1">System Architecture & Technical Performance</h2>
          <p className="text-xs text-[#697B73] mt-0.5 max-w-2xl">
            Real-time pipeline diagnostics, Redis Streams priority queue depth, worker pool health, and end-to-end alert dispatch benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#16866A]/10 text-[#16866A] border border-[#16866A]/20">
            <CheckCircle2 className="w-4 h-4 text-[#16866A]" />
            Cluster Health: 100% OPERATIONAL
          </span>
        </div>
      </div>

      {/* Latency Percentile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">p50 Median Ingestion Latency</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#16866A]">12</span>
            <span className="text-xs font-bold text-[#697B73]">milliseconds</span>
          </div>
          <p className="text-[11px] text-[#697B73] mt-1">Simulink socket → FastAPI edge buffer</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E7ECE6] shadow-xs">
          <span className="text-[10px] font-bold text-[#697B73] uppercase tracking-wider block">p95 Tail Ingestion Latency</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#193B32]">28</span>
            <span className="text-xs font-bold text-[#697B73]">milliseconds</span>
          </div>
          <p className="text-[11px] text-[#697B73] mt-1">Includes HMAC & nonce replay check</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E45D58]/30 shadow-xs bg-gradient-to-br from-white to-[#E45D58]/5">
          <span className="text-[10px] font-bold text-[#E45D58] uppercase tracking-wider block">P0 Urgent Zero-Queue Dispatch (p99)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#E45D58]">142</span>
            <span className="text-xs font-bold text-[#E45D58]">milliseconds</span>
          </div>
          <p className="text-[11px] text-[#E45D58] mt-1">Critical threshold → Clinician screen push</p>
        </div>
      </div>

      {/* Architecture System Map */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E7ECE6]">
          <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#16866A]" />
            End-to-End System Microservice Architecture
          </h3>
          <span className="text-xs text-[#697B73]">Simulated Topology Flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#16866A] block">SOURCE</span>
              <p className="text-xs font-bold text-[#193B32] mt-1">MATLAB / Simulink</p>
              <p className="text-[10px] text-[#697B73] mt-1">10 simulated bio-sensor device streams emitting continuous vitals</p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#E7ECE6] text-[10px] text-[#16866A] font-semibold">
              TLS / Socket stream
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#16866A] block">GATEWAY</span>
              <p className="text-xs font-bold text-[#193B32] mt-1">NGINX + FastAPI</p>
              <p className="text-[10px] text-[#697B73] mt-1">Edge authentication, HMAC verification, nonce cache, rate limiting</p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#E7ECE6] text-[10px] text-[#16866A] font-semibold">
              p50: 1.8ms crypto
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#16866A] block">MESSAGE BUS</span>
              <p className="text-xs font-bold text-[#193B32] mt-1">Redis Streams</p>
              <p className="text-[10px] text-[#697B73] mt-1">Dual-lane routing: Priority zero-queue stream vs batch consumer group</p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#E7ECE6] text-[10px] text-[#16866A] font-semibold">
              Lag: 0 messages
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#16866A] block">WORKER POOL</span>
              <p className="text-xs font-bold text-[#193B32] mt-1">Distributed Workers</p>
              <p className="text-[10px] text-[#697B73] mt-1">Safety Worker, Clinical Worker, Digital Twin Worker, FHIR Worker</p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#E7ECE6] text-[10px] text-[#16866A] font-semibold">
              4 / 4 Nodes Healthy
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFBF8] border border-[#E7ECE6] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#16866A] block">PERSISTENCE</span>
              <p className="text-xs font-bold text-[#193B32] mt-1">Clinician UI & FHIR</p>
              <p className="text-[10px] text-[#697B73] mt-1">Next.js UI SSE push, HAPI FHIR R4 repo, PostgreSQL audit log</p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#E7ECE6] text-[10px] text-[#16866A] font-semibold">
              Synchronized
            </div>
          </div>
        </div>
      </div>

      {/* Latency Benchmark Breakdown Table */}
      <div className="bg-white rounded-2xl border border-[#E7ECE6] p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#193B32] flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#16866A]" />
          Detailed Latency & Throughput Benchmark Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF8] text-[#697B73] font-semibold border-b border-[#E7ECE6]">
              <tr>
                <th className="py-2.5 px-3">Pipeline Stage</th>
                <th className="py-2.5 px-3 text-right">p50 (Median)</th>
                <th className="py-2.5 px-3 text-right">p95</th>
                <th className="py-2.5 px-3 text-right">p99 (Tail)</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7ECE6]">
              {metrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#FAFBF8]">
                  <td className="py-3 px-3 font-semibold text-[#193B32]">{m.name}</td>
                  <td className="py-3 px-3 text-right font-mono text-[#16866A] font-bold">
                    {m.p50} {m.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#193B32] font-semibold">
                    {m.p95} {m.unit}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#193B32] font-semibold">
                    {m.p99} {m.unit}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] font-bold text-[#16866A] bg-[#16866A]/10 px-2 py-0.5 rounded">
                      OPTIMAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[#697B73] pt-2 border-t border-[#E7ECE6]">
          * SIMULATED PERFORMANCE METRICS: Measurements demonstrate projected architecture SLAs and benchmarked prototype latencies.
        </p>
      </div>
    </div>
  );
};
