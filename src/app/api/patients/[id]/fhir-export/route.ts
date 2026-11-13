import { NextResponse } from 'next/server';
import { PATIENTS } from '@/data/patients';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patient = PATIENTS.find((p) => p.id === id) || PATIENTS[0];

  const now = new Date().toISOString();

  // Construct HL7 FHIR R4 Bundle
  const fhirBundle = {
    resourceType: "Bundle",
    id: `fhir-bundle-${patient.id}-${Date.now()}`,
    type: "document",
    timestamp: now,
    meta: {
      versionId: "1",
      lastUpdated: now,
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
      security: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-Confidentiality",
          code: "R",
          display: "Restricted",
        },
      ],
    },
    entry: [
      // 1. Patient Resource
      {
        fullUrl: `urn:uuid:patient-${patient.id}`,
        resource: {
          resourceType: "Patient",
          id: patient.id,
          identifier: [
            {
              system: "http://hospital.healthguard.local/identifiers/patient",
              value: patient.id,
            },
          ],
          active: true,
          gender: "unknown",
          birthDate: "1958-04-12",
          managingOrganization: {
            display: "HealthGuard Post-Discharge Tele-Surveillance Ward",
          },
        },
      },
      // 2. Heart Rate Observation (LOINC 8867-4)
      {
        fullUrl: `urn:uuid:obs-hr-${patient.id}`,
        resource: {
          resourceType: "Observation",
          id: `obs-hr-${Date.now()}`,
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/observation-category",
                  code: "vital-signs",
                  display: "Vital Signs",
                },
              ],
            },
          ],
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "8867-4",
                display: "Heart rate",
              },
            ],
          },
          subject: { reference: `Patient/${patient.id}` },
          effectiveDateTime: patient.currentVitals.timestamp,
          valueQuantity: {
            value: patient.currentVitals.heartRate,
            unit: "beats/minute",
            system: "http://unitsofmeasure.org",
            code: "/min",
          },
        },
      },
      // 3. Respiratory Rate Observation (LOINC 9279-1)
      {
        fullUrl: `urn:uuid:obs-rr-${patient.id}`,
        resource: {
          resourceType: "Observation",
          id: `obs-rr-${Date.now()}`,
          status: "final",
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "9279-1",
                display: "Respiratory rate",
              },
            ],
          },
          subject: { reference: `Patient/${patient.id}` },
          effectiveDateTime: patient.currentVitals.timestamp,
          valueQuantity: {
            value: patient.currentVitals.respiratoryRate,
            unit: "breaths/minute",
            system: "http://unitsofmeasure.org",
            code: "/min",
          },
        },
      },
      // 4. Oxygen Saturation SpO2 (LOINC 2708-6)
      {
        fullUrl: `urn:uuid:obs-spo2-${patient.id}`,
        resource: {
          resourceType: "Observation",
          id: `obs-spo2-${Date.now()}`,
          status: "final",
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "2708-6",
                display: "Oxygen saturation in Arterial blood by Pulse oximetry",
              },
            ],
          },
          subject: { reference: `Patient/${patient.id}` },
          effectiveDateTime: patient.currentVitals.timestamp,
          valueQuantity: {
            value: patient.currentVitals.spo2,
            unit: "%",
            system: "http://unitsofmeasure.org",
            code: "%",
          },
        },
      },
      // 5. Body Temperature (LOINC 8310-5)
      {
        fullUrl: `urn:uuid:obs-temp-${patient.id}`,
        resource: {
          resourceType: "Observation",
          id: `obs-temp-${Date.now()}`,
          status: "final",
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "8310-5",
                display: "Body temperature",
              },
            ],
          },
          subject: { reference: `Patient/${patient.id}` },
          effectiveDateTime: patient.currentVitals.timestamp,
          valueQuantity: {
            value: patient.currentVitals.temperature,
            unit: "Cel",
            system: "http://unitsofmeasure.org",
            code: "Cel",
          },
        },
      },
    ],
  };

  return new NextResponse(JSON.stringify(fhirBundle, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/fhir+json; charset=utf-8",
      "Content-Disposition": `attachment; filename="fhir-bundle-${patient.id}.json"`,
      "X-Audit-Record": `AUDIT-FHIR-EXPORT-${Date.now()}`,
    },
  });
}
