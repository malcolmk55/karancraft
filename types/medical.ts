export type SpecialtyType = "general" | "internal";

export type EncounterStatus = "draft" | "finalized";

export type SexType = "male" | "female" | "other";

export type UserRole = "admin" | "doctor" | "receptionist";

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
  createdByDoctorId?: string;
  createdByOfficeId?: string;
  officeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  officeId?: string;
  officeName?: string;
  specialty: SpecialtyType;
  visitDate: string; // ISO format or YYYY-MM-DD
  status: EncounterStatus;
  
  // Phase 1.5 Metrics
  durationSeconds: number; // Time taken to document the visit
  
  // Structured phrases (Schema-first)
  chiefComplaintIds: string[];
  chiefComplaintsText?: string[]; // Cached readable text for export/indexing
  customChiefComplaints?: string[]; // Doc 09: Dynamic custom entries
  
  vitals: VitalsData;
  
  examFindingsIds: string[];
  examFindingsText?: string[];
  customExamFindings?: string[]; // Doc 09: Dynamic custom entries
  
  diagnosisIds: string[];
  diagnosesText?: string[];
  customDiagnoses?: string[]; // Doc 09: Dynamic custom entries
  
  // Doc 09: Item Modifiers (notes attached to specific IDs, e.g. { "pe_abd_1": "فقط سمت راست" })
  itemModifiers?: Record<string, string>;
  
  // Structured clinical plan
  planNotes: string; // Medications, lab requests, recommendations
  
  // Minimal fallback field (monitored for template coverage)
  freeTextFallback?: string;
  
  // AI Voice recording transcript (if used)
  voiceTranscript?: string;
  
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

// User and RBAC (Doc 05 & 06)
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  officeId?: string; // For receptionist
  doctorId?: string; // For doctor
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Medical Office / Clinic (Doc 05 & 07)
export interface MedicalOffice {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  city?: string;
  doctorCount?: number;
  patientCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorOffice {
  id: string;
  doctorId: string;
  officeId: string;
  role: "owner" | "member";
  joinedAt: string;
}

export interface Doctor {
  id: string;
  userId?: string;
  fullName: string;
  medicalCouncilNumber: string;
  specialty: SpecialtyType;
  clinicName: string;
  officeIds?: string[];
  bio?: string;
  city?: string;
  avatar?: string;
}

export interface Receptionist {
  id: string;
  userId: string;
  fullName: string;
  officeId: string;
  officeName: string;
  createdAt: string;
  updatedAt: string;
}

// Doctor Network & Connections (Doc 07)
export type ConnectionStatus = "pending" | "accepted" | "rejected" | "blocked";

export interface DoctorConnection {
  id: string;
  requesterId: string;
  requesterDoctor?: Doctor;
  receiverId: string;
  receiverDoctor?: Doctor;
  status: ConnectionStatus;
  requestedAt: string;
  respondedAt?: string | null;
}

// Patient Sharing (Doc 07)
export type ShareAccessLevel = "read_only" | "read_write";

export interface SharedPatient {
  id: string;
  patientId: string;
  patient?: Patient;
  ownerDoctorId: string;
  ownerDoctorName?: string;
  sharedWithDoctorId: string;
  sharedWithDoctorName?: string;
  accessLevel: ShareAccessLevel;
  patientConsent: boolean;
  notes?: string;
  sharedAt: string;
  revokedAt?: string | null;
  isActive: boolean;
}

// Subscription Plans (Doc 08)
export type SubscriptionPlanType = "trial" | "bronze" | "silver" | "gold";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "past_due";

export interface SubscriptionPlan {
  id: string;
  name: SubscriptionPlanType;
  displayName: string;
  maxPatients: number; // -1 for unlimited
  priceMonthly: number; // Toman / IRR
  priceAnnual: number;
  maxOffices: number;
  maxReceptionists: number;
  maxConnections: number;
  hasAiVoice: boolean;
  features: string[];
  isActive: boolean;
}

export interface DoctorSubscription {
  id: string;
  doctorId: string;
  planId: string;
  planName: SubscriptionPlanType;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string | null;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  doctorId: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  currency: string;
  gateway: string;
  gatewayRefId?: string;
  status: "pending" | "success" | "failed" | "refunded";
  paidAt?: string | null;
  createdAt: string;
}

// Audit Trail (Doc 05 & 06)
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "patient.create", "visit.finalize", "patient.share"
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ClinicEfficiencyMetrics {
  totalVisits: number;
  finalizedVisits: number;
  avgDurationSeconds: number;
  structuredPhrasesUsedCount: number;
  customPhrasesUsedCount?: number;
  fallbackTextUsedCount: number;
  structuredAdoptionRate: number; // percentage
  estimatedMinutesSaved: number;
}
