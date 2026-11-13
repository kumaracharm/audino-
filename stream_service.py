"""
Real-Time 10-Patient Continuous Physiological Streamer for HealthGuard
Powered by BIDMC PhysioNet numerics & Synthea FHIR cohort from kumaracharm/data
"""

import os
import sys
import json
import time
import asyncio
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# Add data_repo/ps03_five_patient_starter to sys.path
BASE_DIR = Path(__file__).resolve().parent
REPO_DIR = BASE_DIR / "data_repo" / "ps03_five_patient_starter"
if str(REPO_DIR) not in sys.path:
    sys.path.insert(0, str(REPO_DIR))

from simulator.config import SimulatorConfig, NoiseParameters
from simulator.patient_loader import load_patients
from simulator.simulation_manager import SimulationManager

STATE_FILE = BASE_DIR / "live_stream_state.json"
GATEWAY_URL = "http://localhost:3000/api/vitals/stream"

# Patient ID cross-mapping
PATIENT_NAME_MAP = {
    "P001": {"display_id": "HG-001", "name": "Maura Steuber", "age": 62, "scenario": "Respiratory decline / COVID-19"},
    "P002": {"display_id": "HG-002", "name": "Eugenio Okuneva", "age": 42, "scenario": "COPD / Hypercapnic target test"},
    "P003": {"display_id": "HG-003", "name": "Michale VonRueden", "age": 71, "scenario": "Heart failure gradual drift"},
    "P004": {"display_id": "HG-004", "name": "Danilo Bradtke", "age": 68, "scenario": "Post-pneumonia motion artifact"},
    "P005": {"display_id": "HG-005", "name": "Ellis Bosco", "age": 55, "scenario": "Cardiac surgery / Probe dropout"},
    "P006": {"display_id": "HG-006", "name": "Launa Brakus", "age": 58, "scenario": "Respiratory illness / Asthma"},
    "P007": {"display_id": "HG-007", "name": "Albert Bins", "age": 46, "scenario": "Post-op appendectomy temp trend"},
    "P008": {"display_id": "HG-008", "name": "Lucie Hackett", "age": 21, "scenario": "Stable post-op recovery"},
    "P009": {"display_id": "HG-009", "name": "Jarrett Mraz", "age": 62, "scenario": "Acute NSTEMI / Cardiac history"},
    "P010": {"display_id": "HG-010", "name": "Asha Raynor", "age": 27, "scenario": "COVID-19 / Sensor comparison"},
}

def determine_priority(hr: float, spo2: float, rr: float, temp: float) -> str:
    if spo2 < 88.0 or hr > 130 or hr < 40 or rr > 28:
        return "P0"
    if spo2 < 92.0 or hr > 110 or rr > 24 or temp > 38.5:
        return "P1"
    if spo2 < 95.0 or hr > 95 or rr > 20 or temp > 37.8:
        return "P2"
    return "P3"

class ContinuousStreamFeeder:
    def __init__(self, speed: float = 1.0, sampling_interval: float = 1.0):
        self.speed = speed
        self.sampling_interval = sampling_interval
        self.patients_data = {}
        self.history_buffers = {f"P{i:03d}": [] for i in range(1, 11)}
        self.running = True

        # Initialize base state
        for pid, meta in PATIENT_NAME_MAP.items():
            self.patients_data[pid] = {
                "patient_id": pid,
                "display_id": meta["display_id"],
                "name": meta["name"],
                "age": meta["age"],
                "scenario": meta["scenario"],
                "heartRate": 72.0,
                "spo2": 97.0,
                "respiratoryRate": 16.0,
                "temperature": 36.8,
                "signalQuality": 0.98,
                "sensorStatus": "CONNECTED",
                "priority": "P3",
                "lastUpdated": datetime.now(timezone.utc).isoformat(),
                "history": []
            }

    def save_state(self):
        try:
            temp_path = STATE_FILE.with_suffix(".tmp")
            payload = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "patient_count": len(self.patients_data),
                "patients": self.patients_data
            }
            temp_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
            temp_path.replace(STATE_FILE)
        except Exception as e:
            print(f"[Feeder] Error saving state: {e}", file=sys.stderr)

    def post_gateway(self, observation: dict):
        try:
            req = urllib.request.Request(
                GATEWAY_URL,
                data=json.dumps(observation).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=0.5) as resp:
                pass
        except Exception:
            # Non-blocking if Next.js gateway is temporarily busy
            pass

    async def run(self):
        print(f"[Feeder] Initializing Continuous Physiological Stream from {REPO_DIR}...")
        profiles = load_patients()
        print(f"[Feeder] Successfully loaded {len(profiles)} patient profiles.")

        while self.running:
            try:
                config = SimulatorConfig(
                    realtime=True,
                    speed=self.speed,
                    sampling_interval_seconds=self.sampling_interval,
                )
                manager = SimulationManager(config, profiles=profiles)
                print("[Feeder] Starting continuous 10-patient observation loop...")

                async for obs in manager.iter_observed(continuous=True):
                    pid = obs.get("patient_id")
                    if not pid or pid not in self.patients_data:
                        continue

                    # Extract observed vitals (with graceful fallbacks for sensor dropouts)
                    hr = obs.get("observed_hr_bpm")
                    spo2 = obs.get("observed_spo2_percent")
                    rr = obs.get("observed_rr_bpm")
                    temp = obs.get("observed_temp_c")

                    curr = self.patients_data[pid]
                    hr_val = round(float(hr), 1) if hr is not None else curr["heartRate"]
                    spo2_val = round(float(spo2), 1) if spo2 is not None else curr["spo2"]
                    rr_val = round(float(rr), 1) if rr is not None else curr["respiratoryRate"]
                    temp_val = round(float(temp), 1) if temp is not None else curr["temperature"]

                    sig_qual = round(float(obs.get("signal_quality", 0.98)), 2)
                    sensor_stat = str(obs.get("sensor_status", "CONNECTED"))
                    prio = determine_priority(hr_val, spo2_val, rr_val, temp_val)
                    iso_now = datetime.now(timezone.utc).isoformat()

                    # Update history buffer (keep last 30 readings per patient)
                    history_entry = {
                        "timestamp": iso_now,
                        "heartRate": hr_val,
                        "spo2": spo2_val,
                        "respiratoryRate": rr_val,
                        "temperature": temp_val,
                        "signalQuality": sig_qual
                    }
                    buf = self.history_buffers[pid]
                    buf.append(history_entry)
                    if len(buf) > 30:
                        buf.pop(0)

                    # Update state entry
                    curr["heartRate"] = hr_val
                    curr["spo2"] = spo2_val
                    curr["respiratoryRate"] = rr_val
                    curr["temperature"] = temp_val
                    curr["signalQuality"] = sig_qual
                    curr["sensorStatus"] = sensor_stat
                    curr["priority"] = prio
                    curr["lastUpdated"] = iso_now
                    curr["history"] = list(buf)

                    # Persist state
                    self.save_state()

                    # Notify Next.js gateway
                    self.post_gateway({
                        "event_id": obs.get("event_id"),
                        "patient_id": pid,
                        "display_id": PATIENT_NAME_MAP[pid]["display_id"],
                        "timestamp": iso_now,
                        "vitals": {
                            "heartRate": hr_val,
                            "spo2": spo2_val,
                            "respiratoryRate": rr_val,
                            "temperature": temp_val,
                        },
                        "signalQuality": sig_qual,
                        "sensorStatus": sensor_stat,
                        "priority": prio
                    })

            except asyncio.CancelledError:
                print("[Feeder] Simulation stream cancelled.")
                break
            except Exception as e:
                print(f"[Feeder] Stream iteration error (restarting in 2s): {e}", file=sys.stderr)
                await asyncio.sleep(2.0)

def main():
    feeder = ContinuousStreamFeeder(speed=1.0, sampling_interval=1.0)
    try:
        asyncio.run(feeder.run())
    except KeyboardInterrupt:
        print("[Feeder] Stopped by user.")

if __name__ == "__main__":
    main()

