"use client";

import React, { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { PATIENTS } from "@/data/patients";
import { calculateScore } from "@/lib/scoring";
import { simulateAttack, AttackType } from "@/lib/security-simulator";
import { generateActivityEvent } from "@/lib/simulation";
import { Patient, VitalReading, SecurityEvent, ActivityEvent, Priority } from "@/types";

import { Sidebar, NavPage } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { DemoControlsModal } from "@/components/dashboard/DemoControlsModal";

import { OverviewView } from "@/components/dashboard/OverviewView";
import { PatientMonitoringView } from "@/components/patients/PatientMonitoringView";
import { ClinicalIntelligenceView } from "@/components/clinical/ClinicalIntelligenceView";
import { DigitalTwinView } from "@/components/digital-twin/DigitalTwinView";
import { SecurityOperationsView } from "@/components/security/SecurityOperationsView";
import { FhirRecordsView } from "@/components/fhir/FhirRecordsView";
import { RecoveryPlansView } from "@/components/recovery/RecoveryPlansView";
import { SystemPerformanceView } from "@/components/performance/SystemPerformanceView";

const INITIAL_SECURITY_LOG: SecurityEvent[] = [
  {
    id: "SEC-00001",
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    deviceId: "DEVICE-104",
    attackCategory: "Replayed Request",
    detectionStage: "Nonce / Replay Protection",
    result: "REJECTED",
    clinicalImpact: "None — rejected before clinical processing",
    details: {
      nonce: "nonce-replay-001",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      sequenceNumber: "SEQ-000412",
      hmac: "HMAC-SHA256: [VALID]",
      jwt: "eyJhbGciOiJSUzI1NiJ9...[MASKED]",
      idempotencyKey: "IK-DUPLICATE-001",
      deviceBinding: "BOUND",
    },
  },
  {
    id: "SEC-00002",
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    deviceId: "DEVICE-883",
    attackCategory: "Tampered Vital Reading",
    detectionStage: "HMAC Signature Verification",
    result: "REJECTED",
    clinicalImpact: "None — rejected before clinical processing",
    details: {
      nonce: "nonce-tamper-002",
      timestamp: new Date(Date.now() - 1920000).toISOString(),
      sequenceNumber: "SEQ-000398",
      hmac: "HMAC-SHA256: INVALID_SIG_HEX [MISMATCH]",
      jwt: "eyJhbGciOiJSUzI1NiJ9...[MASKED]",
      idempotencyKey: "IK-000398",
      deviceBinding: "BOUND",
    },
  },
  {
    id: "SEC-00003",
    timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    deviceId: "DEVICE-049",
    attackCategory: "Forged Device Identity",
    detectionStage: "JWT Validation",
    result: "REJECTED",
    clinicalImpact: "None — rejected before clinical processing",
    details: {
      nonce: "nonce-forged-003",
      timestamp: new Date(Date.now() - 3300000).toISOString(),
      sequenceNumber: "SEQ-000350",
      hmac: "HMAC-SHA256: [UNVERIFIED]",
      jwt: "eyJhbGciOiJub25lIn0...[FORGED]",
      idempotencyKey: "IK-000350",
      deviceBinding: "UNVERIFIED",
    },
  },
];

const INITIAL_ACTIVITY_LOG: ActivityEvent[] = [
  { id: "EVT-0001", timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString(), type: "observation", message: "New observation received for HG-001", patientId: "HG-001", isDemo: true },
  { id: "EVT-0002", timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), type: "assessment", message: "Clinical assessment completed for HG-001: P0 Assigned", patientId: "HG-001", isDemo: true },
  { id: "EVT-0003", timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(), type: "alert", message: "Urgent P0 alert dispatched to on-call physician", patientId: "HG-001", isDemo: true },
  { id: "EVT-0004", timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(), type: "security", message: "Security validation passed for HG-002", patientId: "HG-002", isDemo: true },
  { id: "EVT-0005", timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), type: "fhir", message: "FHIR observation synced to HAPI repository", patientId: "HG-003", isDemo: true },
  { id: "EVT-0006", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), type: "context", message: "Patient context retrieved: CHF baseline", patientId: "HG-001", isDemo: true },
];

export default function HealthGuardDashboard() {
  const [currentPage, setCurrentPage] = useState<NavPage>("overview");
  const [patients, setPatients] = useState<Patient[]>(PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("HG-001");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(INITIAL_SECURITY_LOG);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_LOG);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState<boolean>(false);
  const [fhirOutage, setFhirOutage] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Filter patients if search is applied
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.dischargeContext.toLowerCase().includes(q) ||
        p.conditions.some((c) => c.toLowerCase().includes(q))
    );
  }, [patients, searchQuery]);

  // Overall Cohort Statistics
  const stats = useMemo(() => {
    const total = patients.length;
    const urgent = patients.filter((p) => p.priority === "P0").length;
    const review = patients.filter((p) => p.priority === "P1").length;
    const routine = patients.filter((p) => p.priority === "P2" || p.priority === "P3").length;
    return { total, urgent, review, routine };
  }, [patients]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Continuous Telemetry Stream Generator (runs every 3.5 seconds if active)
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setPatients((prev) => {
        // Pick a random patient to receive a live vital tick
        const randomIndex = Math.floor(Math.random() * prev.length);
        const target = prev[randomIndex];

        const deltaHR = Math.round((Math.random() - 0.5) * 4);
        const deltaRR = Math.round((Math.random() - 0.5) * 2);
        const deltaSpO2 = Math.round((Math.random() - 0.5) * 1.5);
        const deltaTemp = parseFloat(((Math.random() - 0.5) * 0.1).toFixed(1));

        const newHR = Math.max(42, Math.min(145, target.currentVitals.heartRate + deltaHR));
        const newRR = Math.max(9, Math.min(32, target.currentVitals.respiratoryRate + deltaRR));
        const newSpO2 = Math.max(88, Math.min(100, target.currentVitals.spo2 + deltaSpO2));
        const newTemp = parseFloat(
          Math.max(35.2, Math.min(40.5, target.currentVitals.temperature + deltaTemp)).toFixed(1)
        );

        const score = calculateScore(newHR, newRR, newSpO2, newTemp, target.age);
        const assignedPriority: Priority =
          score.priority === "Requires context" ? "P1" : (score.priority as Priority);

        const newReading: VitalReading = {
          timestamp: new Date().toISOString(),
          heartRate: newHR,
          respiratoryRate: newRR,
          spo2: newSpO2,
          temperature: newTemp,
        };

        const updatedPatient: Patient = {
          ...target,
          currentVitals: newReading,
          priority: assignedPriority,
          lastObservation: newReading.timestamp,
          vitalHistory: [...target.vitalHistory.slice(1), newReading],
        };

        return prev.map((p, i) => (i === randomIndex ? updatedPatient : p));
      });

      // Also append an activity stream event periodically
      const types = ["observation", "assessment", "security", "fhir"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setActivityEvents((prev) => [
        generateActivityEvent(randomType, `HG-00${Math.floor(Math.random() * 9) + 1}`),
        ...prev.slice(0, 19),
      ]);
    }, 3500);

    return () => clearInterval(interval);
  }, [simulationActive]);

  // Manual Trigger: Simulate Normal Reading
  const handleSimulateNormalReading = () => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === selectedPatient.id) {
          const normalReading: VitalReading = {
            timestamp: new Date().toISOString(),
            heartRate: Math.round(68 + (Math.random() - 0.5) * 10),
            respiratoryRate: Math.round(15 + (Math.random() - 0.5) * 2),
            spo2: Math.round(98 + (Math.random() - 0.5) * 2),
            temperature: parseFloat((36.8 + (Math.random() - 0.5) * 0.3).toFixed(1)),
          };
          const score = calculateScore(
            normalReading.heartRate,
            normalReading.respiratoryRate,
            normalReading.spo2,
            normalReading.temperature,
            p.age
          );
          return {
            ...p,
            currentVitals: normalReading,
            priority: score.priority === "Requires context" ? "P2" : (score.priority as Priority),
            lastObservation: normalReading.timestamp,
            vitalHistory: [...p.vitalHistory.slice(1), normalReading],
          };
        }
        return p;
      })
    );
    showNotification(`Normal observation registered for ${selectedPatient.id}. Recovery status stable.`);
  };

  // Manual Trigger: Simulate Deterioration / Urgent Scenario
  const handleSimulateUrgentEvent = () => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === selectedPatient.id) {
          const urgentReading: VitalReading = {
            timestamp: new Date().toISOString(),
            heartRate: 136,
            respiratoryRate: 28,
            spo2: 89,
            temperature: 39.4,
          };
          return {
            ...p,
            priority: "P0",
            currentVitals: urgentReading,
            lastObservation: urgentReading.timestamp,
            vitalHistory: [...p.vitalHistory.slice(1), urgentReading],
          };
        }
        return p;
      })
    );
    setActivityEvents((prev) => [
      generateActivityEvent("alert", selectedPatient.id),
      ...prev.slice(0, 19),
    ]);
    showNotification(
      `CRITICAL ALERT: Patient ${selectedPatient.id} deteriorated. P0 Urgent status triggered! Dedicated zero-queue path active.`
    );
  };

  // Manual Trigger: Simulate Abnormal Non-Critical Reading
  const handleSimulateAbnormalReading = () => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === selectedPatient.id) {
          const abnormalReading: VitalReading = {
            timestamp: new Date().toISOString(),
            heartRate: 114,
            respiratoryRate: 22,
            spo2: 93,
            temperature: 38.4,
          };
          const score = calculateScore(114, 22, 93, 38.4, p.age);
          return {
            ...p,
            priority: score.priority === "Requires context" ? "P1" : (score.priority as Priority),
            currentVitals: abnormalReading,
            lastObservation: abnormalReading.timestamp,
            vitalHistory: [...p.vitalHistory.slice(1), abnormalReading],
          };
        }
        return p;
      })
    );
    showNotification(`Mild deterioration reading ingested for ${selectedPatient.id}. Priority reassigned to P1.`);
  };

  // Cyber Attack Simulation Handler
  const handleTriggerAttack = (type?: AttackType) => {
    const attackType: AttackType = type || "replayed-request";
    const evt = simulateAttack(attackType);
    setSecurityEvents((prev) => [evt, ...prev]);
    setActivityEvents((prev) => [
      generateActivityEvent("security", evt.deviceId),
      ...prev.slice(0, 19),
    ]);
    showNotification(
      `Security Event Blocked: ${evt.attackCategory} intercepted at ${evt.detectionStage}. Clinical impact: NONE.`
    );
  };

  // Reset Demo State
  const handleResetDemo = () => {
    setPatients(PATIENTS);
    setSelectedPatientId("HG-001");
    setSecurityEvents(INITIAL_SECURITY_LOG);
    setActivityEvents(INITIAL_ACTIVITY_LOG);
    setFhirOutage(false);
    showNotification("Demo environment restored to baseline synthetic cohort.");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8F3] text-[#193B32]">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-[#193B32] text-white text-xs border-l-4 border-[#3AA99B] animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-[#3AA99B] animate-ping" />
          <span>{notification}</span>
        </div>
      )}

      {/* FIXED LEFT SIDEBAR */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
        onOpenDemoControls={() => setIsDemoControlsOpen(true)}
        simulationActive={simulationActive}
      />

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <TopNav
          currentPage={currentPage}
          onSearchChange={(q) => setSearchQuery(q)}
          searchQuery={searchQuery}
          onOpenDemoControls={() => setIsDemoControlsOpen(true)}
          unreadAlertCount={stats.urgent}
          onTriggerAlertView={() => setCurrentPage("overview")}
        />

        {/* SCROLLABLE PAGE BODY */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto pb-12">
            {currentPage === "overview" && (
              <OverviewView
                patients={filteredPatients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={(id) => setSelectedPatientId(id)}
                onNavigateToPatientDetail={(id) => {
                  setSelectedPatientId(id);
                  setCurrentPage("patients");
                }}
                activityEvents={activityEvents}
                stats={stats}
                onSimulateNewObservation={handleSimulateNormalReading}
                onSimulateUrgentEvent={handleSimulateUrgentEvent}
                isMounted={isMounted}
              />
            )}

            {currentPage === "patients" && (
              <PatientMonitoringView
                patient={selectedPatient}
                onReturnToOverview={() => setCurrentPage("overview")}
                onSimulateNewObservation={handleSimulateNormalReading}
                onSimulateAbnormalObservation={handleSimulateUrgentEvent}
                isMounted={isMounted}
              />
            )}

            {currentPage === "clinical" && (
              <ClinicalIntelligenceView
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={(id) => setSelectedPatientId(id)}
              />
            )}

            {currentPage === "digital-twin" && (
              <DigitalTwinView
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={(id) => setSelectedPatientId(id)}
                isMounted={isMounted}
              />
            )}

            {currentPage === "security" && (
              <SecurityOperationsView
                securityEvents={securityEvents}
                onTriggerAttack={handleTriggerAttack}
              />
            )}

            {currentPage === "fhir" && (
              <FhirRecordsView
                fhirOutage={fhirOutage}
                onSimulateSync={() => {
                  setActivityEvents((prev) => [
                    generateActivityEvent("fhir", selectedPatientId),
                    ...prev.slice(0, 19),
                  ]);
                  showNotification("FHIR bundle synchronized to HAPI repository.");
                }}
              />
            )}

            {currentPage === "recovery" && (
              <RecoveryPlansView
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={(id) => setSelectedPatientId(id)}
              />
            )}

            {currentPage === "performance" && <SystemPerformanceView />}
          </div>
        </main>
      </div>

      {/* DEMO CONTROLS MODAL */}
      <DemoControlsModal
        isOpen={isDemoControlsOpen}
        onClose={() => setIsDemoControlsOpen(false)}
        simulationActive={simulationActive}
        onToggleSimulation={() => {
          setSimulationActive(!simulationActive);
          showNotification(
            simulationActive ? "Telemetry streaming paused." : "Telemetry streaming resumed."
          );
        }}
        onGenerateNormal={handleSimulateNormalReading}
        onGenerateAbnormal={handleSimulateAbnormalReading}
        onTriggerUrgent={handleSimulateUrgentEvent}
        onSimulateReplayAttack={handleTriggerAttack}
        onToggleFhirOutage={() => {
          setFhirOutage(!fhirOutage);
          showNotification(
            !fhirOutage
              ? "HAPI FHIR Outage simulated: Queues buffering in Redis."
              : "HAPI FHIR connection restored. Backlog flushing."
          );
        }}
        fhirOutage={fhirOutage}
        onResetDemo={handleResetDemo}
      />
    </div>
  );
}
