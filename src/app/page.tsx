"use client";

import React, { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { PATIENTS } from "@/data/patients";
import { SHOWCASE_ACTS } from "@/data/showcase-acts";
import { calculateScore } from "@/lib/scoring";
import { simulateAttack, AttackType } from "@/lib/security-simulator";
import { generateActivityEvent } from "@/lib/simulation";
import { 
  Patient, 
  VitalReading, 
  SecurityEvent, 
  ActivityEvent, 
  Priority, 
  ShowcaseAct,
  UserSession,
  DailyCheckin
} from "@/types";
import { clinicalBuzzer } from "@/lib/audio-buzzer";

import { Sidebar, NavPage } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { DemoControlsModal } from "@/components/dashboard/DemoControlsModal";
import { PatientDetailDrawer } from "@/components/dashboard/PatientDetailDrawer";
import { ShowcaseExperience } from "@/components/dashboard/ShowcaseExperience";

import { OverviewView } from "@/components/dashboard/OverviewView";
import { PatientMonitoringView } from "@/components/patients/PatientMonitoringView";
import { ClinicalIntelligenceView } from "@/components/clinical/ClinicalIntelligenceView";
import { DigitalTwinView } from "@/components/digital-twin/DigitalTwinView";
import { SecurityOperationsView } from "@/components/security/SecurityOperationsView";
import { FhirRecordsView } from "@/components/fhir/FhirRecordsView";
import { RecoveryPlansView } from "@/components/recovery/RecoveryPlansView";
import { SystemPerformanceView } from "@/components/performance/SystemPerformanceView";

// RBAC Login and Dedicated Patient Portal Components
import { LoginView, DEMO_USERS } from "@/components/auth/LoginView";
import { PatientPortalView } from "@/components/patient/PatientPortalView";

const INITIAL_SECURITY_LOG: SecurityEvent[] = [
  {
    id: "SEC-00001",
    timestamp: "2026-11-12T17:46:00.000Z",
    deviceId: "DEVICE-104",
    attackCategory: "Replayed Request",
    detectionStage: "Nonce / Replay Protection",
    result: "REJECTED",
    clinicalImpact: "None — rejected before clinical processing",
    details: {
      nonce: "nonce-replay-001",
      timestamp: "2026-11-12T17:45:00.000Z",
      sequenceNumber: "SEQ-000412",
      hmac: "HMAC-SHA256: [VALID]",
      jwt: "eyJhbGciOiJSUzI1NiJ9...[MASKED]",
      idempotencyKey: "IK-DUPLICATE-001",
      deviceBinding: "BOUND",
    },
    packetDump: {
      header: { Host: "gateway.healthguard.local", Authorization: "Bearer eyJ...", "X-Nonce": "nonce-replay-001" },
      rawPayload: '{"patientId":"HG-001","vitals":{"hr":72,"rr":16,"spo2":98,"temp":36.8}}',
      authDigest: "HMAC-SHA256 [MATCH]",
      rejectionReason: "Replay window violated: Nonce already registered in bloom filter.",
    },
  },
  {
    id: "SEC-00002",
    timestamp: "2026-11-12T17:28:00.000Z",
    deviceId: "DEVICE-883",
    attackCategory: "Tampered Vital Reading",
    detectionStage: "HMAC Signature Verification",
    result: "REJECTED",
    clinicalImpact: "None — rejected before clinical processing",
    details: {
      nonce: "nonce-tamper-002",
      timestamp: "2026-11-12T17:27:00.000Z",
      sequenceNumber: "SEQ-000398",
      hmac: "HMAC-SHA256: INVALID_SIG_HEX [MISMATCH]",
      jwt: "eyJhbGciOiJSUzI1NiJ9...[MASKED]",
      idempotencyKey: "IK-000398",
      deviceBinding: "BOUND",
    },
    packetDump: {
      header: { Host: "gateway.healthguard.local", "X-Signature-256": "4a7f9b0c..." },
      rawPayload: '{"patientId":"HG-001","vitals":{"hr":65,"rr":15,"spo2":99,"temp":36.7}}',
      authDigest: "SIGNATURE_MISMATCH: Calculated 8b1c... received 4a7f...",
      rejectionReason: "Payload tampered in transit: HMAC digest validation failed.",
    },
  },
  {
    id: "SEC-00003",
    timestamp: "2026-11-12T17:05:00.000Z",
    deviceId: "DEVICE-049",
    attackCategory: "Forged Device Identity",
    detectionStage: "JWT Validation",
    result: "REJECTED",
    clinicalImpact: "None — rejected before clinical processing",
    details: {
      nonce: "nonce-forged-003",
      timestamp: "2026-11-12T17:04:00.000Z",
      sequenceNumber: "SEQ-000350",
      hmac: "HMAC-SHA256: [UNVERIFIED]",
      jwt: "eyJhbGciOiJub25lIn0...[FORGED]",
      idempotencyKey: "IK-000350",
      deviceBinding: "UNVERIFIED",
    },
    packetDump: {
      header: { Host: "gateway.healthguard.local", Authorization: "Bearer none-alg" },
      rawPayload: '{"patientId":"HG-003","vitals":{"hr":82,"rr":18,"spo2":95,"temp":37.0}}',
      authDigest: "TOKEN_INVALID: Algorithm 'none' strictly rejected by RS256 policy.",
      rejectionReason: "Unsigned / fabricated JWT presented by rogue device identity.",
    },
  },
];

const INITIAL_ACTIVITY_LOG: ActivityEvent[] = [
  { id: "EVT-0001", timestamp: "2026-11-12T17:59:00.000Z", type: "observation", message: "New observation received for HG-001", patientId: "HG-001", isDemo: true },
  { id: "EVT-0002", timestamp: "2026-11-12T17:58:00.000Z", type: "assessment", message: "Clinical assessment completed for HG-001: P0 Assigned", patientId: "HG-001", isDemo: true },
  { id: "EVT-0003", timestamp: "2026-11-12T17:56:00.000Z", type: "alert", message: "Urgent P0 alert dispatched to on-call physician", patientId: "HG-001", isDemo: true },
  { id: "EVT-0004", timestamp: "2026-11-12T17:54:00.000Z", type: "security", message: "Security validation passed for HG-002", patientId: "HG-002", isDemo: true },
  { id: "EVT-0005", timestamp: "2026-11-12T17:52:00.000Z", type: "fhir", message: "FHIR observation synced to HAPI repository", patientId: "HG-003", isDemo: true },
  { id: "EVT-0006", timestamp: "2026-11-12T17:50:00.000Z", type: "context", message: "Patient context retrieved: CHF baseline", patientId: "HG-001", isDemo: true },
];

const INITIAL_CHECKINS: DailyCheckin[] = [
  {
    id: "CHK-1001",
    patientId: "HG-001",
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    timeFormatted: "08:30 AM",
    date: "Today",
    feeling: "good",
    breathing: "none",
    fatigue: "mild",
    fever: "none",
    medications: "yes_all",
    symptoms: ["None"],
    voiceNoteTranscript: "I feel pretty rested today, just slight fatigue after morning tea.",
    riskScore: 1,
    riskTier: "LOW",
  },
  {
    id: "CHK-1002",
    patientId: "HG-003",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeFormatted: "09:15 AM",
    date: "Today",
    feeling: "unwell",
    breathing: "mild",
    fatigue: "severe",
    fever: "none",
    medications: "partial",
    symptoms: ["Cough", "Chest heaviness"],
    adaptiveDetails: {
      onset: "Earlier today",
      progression: "Worsening with movement",
      impact: "Difficulty walking to bathroom",
    },
    voiceNoteTranscript: "Breathing feels heavier when walking up the steps, and my chest feels tight.",
    riskScore: 5,
    riskTier: "HIGH",
  },
];

export default function HealthGuardDashboard() {
  // Session RBAC state: defaults to Senior Doctor for instant clinical inspection, easily switched to Patient or any role
  const [currentUser, setCurrentUser] = useState<UserSession | null>(DEMO_USERS[4]);
  const [currentPage, setCurrentPage] = useState<NavPage>("overview");
  const [patients, setPatients] = useState<Patient[]>(PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("HG-001");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(INITIAL_SECURITY_LOG);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_LOG);
  const [checkins, setCheckins] = useState<DailyCheckin[]>(INITIAL_CHECKINS);
  const [simulationActive, setSimulationActive] = useState<boolean>(true);
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerPatient, setDrawerPatient] = useState<Patient | null>(null);
  const [currentShowcaseAct, setCurrentShowcaseAct] = useState<number>(0);
  const [fhirOutage, setFhirOutage] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [p0LockedPatientIds, setP0LockedPatientIds] = useState<string[]>(['HG-001']);
  const [isBuzzerMuted, setIsBuzzerMuted] = useState<boolean>(false);
  const [buzzCount, setBuzzCount] = useState<number>(0);
  const [isBuzzActive, setIsBuzzActive] = useState<boolean>(false);

  useEffect(() => {
    clinicalBuzzer.onBuzzUpdate((count, active) => {
      setBuzzCount(count);
      setIsBuzzActive(active);
    });
  }, []);

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Role-based patient filtering: Attendants / PHEON see their assigned patients by default
  const roleScopedPatients = useMemo(() => {
    if (!currentUser) return patients;
    if (currentUser.role === 'pheon' && currentUser.assignedPatients) {
      return patients.filter((p) => currentUser.assignedPatients!.includes(p.id));
    }
    return patients;
  }, [patients, currentUser]);

  // Filter patients if search is applied
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return roleScopedPatients;
    const q = searchQuery.toLowerCase();
    return roleScopedPatients.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.dischargeContext.toLowerCase().includes(q) ||
        p.conditions.some((c) => c.toLowerCase().includes(q))
    );
  }, [roleScopedPatients, searchQuery]);

  // Overall Cohort Statistics
  const stats = useMemo(() => {
    const total = filteredPatients.length;
    const urgent = filteredPatients.filter((p) => p.priority === "P0").length;
    const review = filteredPatients.filter((p) => p.priority === "P1").length;
    const routine = filteredPatients.filter((p) => p.priority === "P2" || p.priority === "P3").length;
    return { total, urgent, review, routine };
  }, [filteredPatients]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  // Continuous 10-Patient Real-Time Dataset Stream (Powered by cloned kumaracharm/data BIDMC + Synthea)
  useEffect(() => {
    if (!simulationActive) return;

    let isMounted = true;
    const fetchLatestStream = async () => {
      try {
        const res = await fetch('/api/vitals/latest');
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'streaming' && data.patients && isMounted) {
          setPatients((prev) => {
            return prev.map((p) => {
              // If patient is in locked P0 critical deterioration, maintain acute fluctuating vitals
              if (p0LockedPatientIds.includes(p.id)) {
                const jitterHR = Math.round(132 + ((Math.sin(Date.now() / 2000) * 4)));
                const jitterRR = Math.round(27 + ((Math.cos(Date.now() / 3000) * 2)));
                const jitterSpO2 = Math.round(Math.min(91, Math.max(87, 89 + (Math.sin(Date.now() / 4000) * 1.5))));
                const p0Reading: VitalReading = {
                  timestamp: new Date().toISOString(),
                  heartRate: jitterHR,
                  respiratoryRate: jitterRR,
                  spo2: jitterSpO2,
                  temperature: 38.6,
                };
                return {
                  ...p,
                  priority: 'P0',
                  currentVitals: p0Reading,
                  lastObservation: p0Reading.timestamp,
                  vitalHistory: [...p.vitalHistory.slice(1), p0Reading],
                };
              }

              // Match by HG-00X or P00X
              const pid = Object.keys(data.patients).find(
                (k) => data.patients[k].display_id === p.id || k === p.id
              );
              if (!pid) return p;
              const live = data.patients[pid];

              const newReading: VitalReading = {
                timestamp: live.lastUpdated || new Date().toISOString(),
                heartRate: live.heartRate,
                respiratoryRate: live.respiratoryRate,
                spo2: live.spo2,
                temperature: live.temperature,
              };

              const score = calculateScore(live.heartRate, live.respiratoryRate, live.spo2, live.temperature, p.age);
              const assignedPriority: Priority =
                score.priority === "Requires context" ? "P1" : (score.priority as Priority);

              let updatedHistory = p.vitalHistory;
              if (live.history && live.history.length > 0) {
                updatedHistory = live.history.map((h: any) => ({
                  timestamp: h.timestamp,
                  heartRate: h.heartRate,
                  respiratoryRate: h.respiratoryRate,
                  spo2: h.spo2,
                  temperature: h.temperature,
                }));
              } else {
                updatedHistory = [...p.vitalHistory.slice(1), newReading];
              }

              return {
                ...p,
                currentVitals: newReading,
                priority: assignedPriority,
                lastObservation: newReading.timestamp,
                vitalHistory: updatedHistory,
              };
            });
          });
        }
      } catch {
        // Safe silent catch on transient network polling
      }
    };

    fetchLatestStream();
    const interval = setInterval(fetchLatestStream, 1500);

    // Also append an activity stream event periodically
    const activityInterval = setInterval(() => {
      const types = ["observation", "assessment", "security", "fhir"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setActivityEvents((prev) => [
        generateActivityEvent(randomType, `HG-00${Math.floor(Math.random() * 9) + 1}`),
        ...prev.slice(0, 19),
      ]);
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearInterval(activityInterval);
    };
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

  // Sound toggle for clinical alert buzzer
  const handleToggleBuzzerMute = () => {
    const muted = clinicalBuzzer.toggleMute();
    setIsBuzzerMuted(muted);
    showNotification(muted ? "Alert buzzer muted." : "Alert buzzer active.");
  };

  // Manual Trigger: Simulate Deterioration / Urgent Scenario (Inject P0)
  const handleSimulateUrgentEvent = (patientIdOverride?: string) => {
    const targetId = patientIdOverride || selectedPatient.id || 'HG-001';
    
    // Add to P0 locked list so continuous poll keeps this patient in critical decompensation
    setP0LockedPatientIds((prev) => Array.from(new Set([...prev, targetId])));

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === targetId) {
          const urgentReading: VitalReading = {
            timestamp: new Date().toISOString(),
            heartRate: 136,
            respiratoryRate: 28,
            spo2: 89,
            temperature: 38.6,
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
      generateActivityEvent("alert", targetId),
      ...prev.slice(0, 19),
    ]);

    // Fire audible hospital telemetry alarm buzzer (3 buzzes, every 5s)!
    clinicalBuzzer.triggerThreeBuzzSequence();

    showNotification(
      `🚨 P0 CRITICAL INJECTED: Patient ${targetId} deteriorated (HR 136, RR 28, SpO₂ 89%, Temp 38.6°C). Zero-queue buzzer alert active!`
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

  // Showcase Act Execution Engine
  const handleExecuteShowcaseAct = (act: ShowcaseAct) => {
    setSelectedPatientId(act.targetPatientId);

    switch (act.id) {
      case 'act-1':
        // Restore HG-001 baseline
        setPatients((prev) =>
          prev.map((p) => (p.id === 'HG-001' ? PATIENTS[0] : p))
        );
        showNotification("ACT I: Patient HG-001 baseline context retrieved from EHR.");
        break;
      case 'act-2':
        // Generate live stream tick
        handleSimulateNormalReading();
        showNotification("ACT II: Continuous wearable telemetry verified via HMAC-SHA256.");
        break;
      case 'act-3':
        // Inject acute deterioration
        handleSimulateUrgentEvent('HG-001');
        showNotification("ACT III: Acute decompensation injected! HR 136, RR 27, SpO₂ 90%.");
        break;
      case 'act-4':
        // Trigger P0 fast-path
        handleSimulateUrgentEvent('HG-001');
        showNotification("ACT IV: P0 zero-queue lane activated — 48ms delivery directly to clinician.");
        break;
      case 'act-5':
        // Open digital twin
        setCurrentPage('digital-twin');
        showNotification("ACT V: Digital Twin ODE engine projected 15-minute hypoxia trajectory.");
        return;
      case 'act-6':
        // Fire replay and tampered attacks
        handleTriggerAttack('replayed-request');
        setTimeout(() => handleTriggerAttack('tampered-vital'), 600);
        showNotification("ACT VI: Adversarial replay & vital tamper attacks blocked at edge gateway.");
        break;
      case 'act-7':
        // Sync FHIR
        setActivityEvents((prev) => [
          generateActivityEvent("fhir", 'HG-001'),
          ...prev.slice(0, 19),
        ]);
        showNotification("ACT VII: LOINC observations committed to HAPI FHIR R4 repository.");
        break;
    }
  };

  // Reset Demo State
  const handleResetDemo = () => {
    setPatients(PATIENTS);
    setSelectedPatientId("HG-001");
    setSecurityEvents(INITIAL_SECURITY_LOG);
    setActivityEvents(INITIAL_ACTIVITY_LOG);
    setFhirOutage(false);
    setCurrentShowcaseAct(0);
    showNotification("Demo environment restored to baseline synthetic cohort.");
  };

  // 1. IF NO USER LOGGED IN: Render Login Screen with Role Selection
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F8F3]">
        <div className="flex-1">
          <LoginView onLogin={(session) => setCurrentUser(session)} />
        </div>
      </div>
    );
  }

  // 2. IF PATIENT ROLE: Render Completely Isolated Patient Portal with Voice Assistant & Check-in Wizard
  if (currentUser.role === 'patient') {
    const patientRecord = patients.find((p) => p.id === (currentUser.patientId || 'HG-001')) || patients[0];
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F8F3]">
        <div className="flex-1">
          <PatientPortalView
            user={currentUser}
            patient={patientRecord}
            onLogout={() => setCurrentUser(null)}
            onCheckinSubmitted={(newCheckin) => {
              setCheckins((prev) => [newCheckin, ...prev]);
              showNotification(`Daily check-in recorded for ${newCheckin.patientId}. Risk Tier: ${newCheckin.riskTier}`);
            }}
            recentCheckins={checkins.filter((c) => c.patientId === patientRecord.id)}
          />
        </div>
      </div>
    );
  }

  // 3. CLINICIAN ROLES (PHEON, Nurse, Doctor, Senior Doctor): Render Scoped Clinical Command Center
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F7F8F3] text-[#193B32]">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg bg-[#193B32] text-white text-xs border-l-4 border-[#3AA99B] animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-[#3AA99B]" />
          <span>{notification}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* FIXED LEFT SIDEBAR (Filtered by Role Permissions) */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          onOpenDemoControls={() => setIsDemoControlsOpen(true)}
          simulationActive={simulationActive}
          urgentAlertCount={stats.urgent}
          currentUser={currentUser}
        />

        {/* MAIN WORKSPACE CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOP NAVIGATION BAR (No Voice Chat in Clinician Header, includes Role Badge & Switch Role) */}
          <TopNav
            currentPage={currentPage}
            onSearchChange={(q) => setSearchQuery(q)}
            searchQuery={searchQuery}
            onOpenDemoControls={() => setIsDemoControlsOpen(true)}
            unreadAlertCount={stats.urgent}
            onTriggerAlertView={() => setCurrentPage("overview")}
            onNavigateToShowcase={() => setCurrentPage("showcase")}
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
            onInjectP0={() => handleSimulateUrgentEvent(selectedPatientId)}
            isMuted={isBuzzerMuted}
            onToggleMute={handleToggleBuzzerMute}
          />

          {/* CRITICAL ALERT BUZZER LIVE BANNER (3 Buzzes every 5s) */}
          {isBuzzActive && (
            <div className="bg-[#E45D58] text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold shadow-md sticky top-16 z-30">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 animate-ping" />
                <span>
                  CRITICAL TELEMETRY ALERT: Priority P0 Physiological Decompensation Active · Alarm Buzzer (Pulse {buzzCount} of 3, 5s cadence)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    clinicalBuzzer.cancelBuzzerSequence();
                    setIsBuzzActive(false);
                  }}
                  className="px-3 py-1 bg-white text-[#E45D58] hover:bg-[#F7F8F3] rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  Acknowledge & Mute Buzzer
                </button>
              </div>
            </div>
          )}

          {/* SCROLLABLE PAGE BODY */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto pb-12">
              {currentPage === "overview" && (
                <OverviewView
                  patients={filteredPatients}
                  selectedPatientId={selectedPatientId}
                  onSelectPatient={(id) => setSelectedPatientId(id)}
                  onOpenPatientDrawer={(patient) => {
                    setDrawerPatient(patient);
                    setIsDrawerOpen(true);
                  }}
                  onNavigateToPatientDetail={(id) => {
                    setSelectedPatientId(id);
                    setCurrentPage("patients");
                  }}
                  onNavigateToShowcase={() => setCurrentPage("showcase")}
                  activityEvents={activityEvents}
                  stats={stats}
                  onSimulateNewObservation={handleSimulateNormalReading}
                  onSimulateUrgentEvent={handleSimulateUrgentEvent}
                  isMounted={isMounted}
                  currentUser={currentUser}
                />
              )}

              {currentPage === "showcase" && (
                <ShowcaseExperience
                  currentActIndex={currentShowcaseAct}
                  onSelectAct={(idx) => setCurrentShowcaseAct(idx)}
                  onExecuteActAction={handleExecuteShowcaseAct}
                  onNavigateToModule={(mod) => setCurrentPage(mod)}
                  onResetShowcase={handleResetDemo}
                  patients={patients}
                  selectedPatientId={selectedPatientId}
                />
              )}

              {currentPage === "patients" && (
                <PatientMonitoringView
                  patient={selectedPatient}
                  onReturnToOverview={() => setCurrentPage("overview")}
                  onSimulateNewObservation={handleSimulateNormalReading}
                  onSimulateAbnormalObservation={handleSimulateUrgentEvent}
                  isMounted={isMounted}
                  checkins={checkins}
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
                  checkins={checkins}
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
      </div>

      {/* SLIDE-OVER PATIENT DETAIL DRAWER */}
      <PatientDetailDrawer
        patient={drawerPatient}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigateToFullDetail={(pId) => {
          setSelectedPatientId(pId);
          setCurrentPage("patients");
        }}
        onSimulateNewObservation={handleSimulateNormalReading}
        onSimulateDeterioration={handleSimulateUrgentEvent}
        isMounted={isMounted}
      />

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
