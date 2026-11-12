export const FHIR_PATIENT = {
  resourceType: 'Patient',
  id: 'hg-patient-001',
  meta: {
    profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
    versionId: '1',
    lastUpdated: '2026-11-12T18:00:00Z',
  },
  text: { status: 'generated', div: '<div>SAMPLE FHIR RESOURCE - Demo only</div>' },
  identifier: [{ system: 'urn:oid:healthguard.demo', value: 'HG-001', use: 'official' }],
  active: true,
  gender: 'female',
  birthDate: '1954-06-15',
  managingOrganization: { display: 'HealthGuard Clinical Network' },
};

export const FHIR_OBSERVATIONS = {
  heartRate: {
    resourceType: 'Observation',
    id: 'hg-obs-hr-001',
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns'] },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '8867-4',
          display: 'Heart rate',
        },
      ],
      text: 'Heart rate',
    },
    subject: { reference: 'Patient/hg-patient-001' },
    effectiveDateTime: '2026-11-12T17:57:00Z',
    valueQuantity: {
      value: 118,
      unit: 'beats/min',
      system: 'http://unitsofmeasure.org',
      code: '/min',
    },
  },
  respiratoryRate: {
    resourceType: 'Observation',
    id: 'hg-obs-rr-001',
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns'] },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '9279-1',
          display: 'Respiratory rate',
        },
      ],
      text: 'Respiratory rate',
    },
    subject: { reference: 'Patient/hg-patient-001' },
    effectiveDateTime: '2026-11-12T17:57:00Z',
    valueQuantity: {
      value: 26,
      unit: 'breaths/min',
      system: 'http://unitsofmeasure.org',
      code: '/min',
    },
  },
  spo2: {
    resourceType: 'Observation',
    id: 'hg-obs-spo2-001',
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns'] },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '59408-5',
          display: 'Oxygen saturation in Arterial blood by Pulse oximetry',
        },
      ],
      text: 'SpO₂',
    },
    subject: { reference: 'Patient/hg-patient-001' },
    effectiveDateTime: '2026-11-12T17:57:00Z',
    valueQuantity: {
      value: 93,
      unit: '%',
      system: 'http://unitsofmeasure.org',
      code: '%',
    },
  },
  temperature: {
    resourceType: 'Observation',
    id: 'hg-obs-temp-001',
    meta: { profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns'] },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '8310-5',
          display: 'Body temperature',
        },
      ],
      text: 'Body temperature',
    },
    subject: { reference: 'Patient/hg-patient-001' },
    effectiveDateTime: '2026-11-12T17:57:00Z',
    valueQuantity: {
      value: 37.2,
      unit: 'Cel',
      system: 'http://unitsofmeasure.org',
      code: 'Cel',
    },
  },
};

export const FHIR_DEVICE = {
  resourceType: 'Device',
  id: 'hg-device-001',
  status: 'active',
  identifier: [{ system: 'urn:oid:healthguard.devices', value: 'DEVICE-001' }],
  deviceName: [{ name: 'HealthGuard Bio-Telemetry Monitor v2', type: 'user-friendly-name' }],
  type: { coding: [{ system: 'http://snomed.info/sct', code: '706689003', display: 'Vital signs monitor' }] },
  owner: { reference: 'Organization/healthguard-demo' },
};

export const FHIR_AUDIT_EVENT = {
  resourceType: 'AuditEvent',
  id: 'hg-audit-001',
  type: { system: 'http://terminology.hl7.org/CodeSystem/audit-event-type', code: 'rest', display: 'RESTful Operation' },
  subtype: [{ system: 'http://hl7.org/fhir/restful-interaction', code: 'create', display: 'create' }],
  action: 'C',
  recorded: '2026-11-12T17:57:00Z',
  outcome: '0',
  agent: [{ who: { reference: 'Device/hg-device-001' }, requestor: true, network: { address: 'EDGE-GATEWAY-01 [MUTUAL-TLS]', type: '5' } }],
  source: { site: 'HealthGuard Post-Discharge Telemetry Gateway', observer: { display: 'HealthGuard Ingestion Engine' } },
  entity: [{ what: { reference: 'Observation/hg-obs-hr-001' }, type: { code: '2', display: 'System Object' } }],
};
