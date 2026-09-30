export type SpecialtyType = "general" | "internal";

export type EncounterStatus = "draft" | "finalized";

export type SexType = "male" | "female" | "other";

export interface VitalsData {
  systolicBp?: number | null; // mmHg
  diastolicBp?: number | null; // mmHg
  pulse?: number | null; // bpm
  temperature?: number | null; // Celsius
  weight?: number | null; // kg
  height?: number | null; // cm
  bmi?: number | null; // auto-computed
  spo2?: number | null; // %
  bloodGlucose?: number | null; // mg/dL
  respiratoryRate?: number | null; // breaths/min
}

export interface Patient {
  id: string;
  fullName: string;
  nationalId?: string;
  phone: string;
  birthDate?: string;
  age?: number;
  sex: SexType;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: SpecialtyType;
  visitDate: string; // ISO format or YYYY-MM-DD
  status: EncounterStatus;
  
  // Phase 1.5 Metrics
  durationSeconds: number; // Time taken to document the visit
  
  // Structured phrases (Schema-first)
  chiefComplaintIds: string[];
  chiefComplaintsText?: string[]; // Cached readable text for export/indexing
  
  vitals: VitalsData;
  
  examFindingsIds: string[];
  examFindingsText?: string[];
  
  diagnosisIds: string[];
  diagnosesText?: string[];
  
  // Structured clinical plan
  planNotes: string; // Medications, lab requests, recommendations
  
  // Minimal fallback field (monitored for template coverage)
  freeTextFallback?: string;
  
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string | null;
}

export type TemplateSection = "chief_complaint" | "exam_finding" | "diagnosis";

export interface SpecialtyTemplatePhrase {
  id: string;
  specialty: SpecialtyType;
  section: TemplateSection;
  systemGroup?: string; // e.g. "عمومی", "قلبی-عروقی", "تنفسی", "گوارش", "مغز و اعصاب"
  phraseText: string;
  code?: string; // Optional clinical code or shorthand
  order: number;
}

export interface Doctor {
  id: string;
  fullName: string;
  medicalCouncilNumber: string;
  specialty: SpecialtyType;
  clinicName: string;
  avatar?: string;
}

export interface ClinicEfficiencyMetrics {
  totalVisits: number;
  finalizedVisits: number;
  avgDurationSeconds: number;
  structuredPhrasesUsedCount: number;
  fallbackTextUsedCount: number;
  structuredAdoptionRate: number; // percentage
  estimatedMinutesSaved: number;
}
