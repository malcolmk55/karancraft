import {
  AuditLog,
  ClinicEfficiencyMetrics,
  ConnectionStatus,
  Doctor,
  DoctorConnection,
  DoctorSubscription,
  MedicalOffice,
  Patient,
  PaymentTransaction,
  ShareAccessLevel,
  SharedPatient,
  SpecialtyTemplatePhrase,
  SpecialtyType,
  SubscriptionPlan,
  SubscriptionPlanType,
  User,
  UserRole,
  Visit,
} from "@/types/medical";
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_DOCTOR_CONNECTIONS,
  INITIAL_DOCTOR_SUBSCRIPTION,
  INITIAL_PATIENTS,
  INITIAL_PAYMENT_TRANSACTIONS,
  INITIAL_SHARED_PATIENTS,
  INITIAL_VISITS,
  MOCK_DOCTORS,
  MOCK_OFFICES,
  MOCK_SUBSCRIPTION_PLANS,
  MOCK_USERS,
} from "./mock-data";
import { INITIAL_TEMPLATES } from "./templates-data";

const STORAGE_KEYS = {
  PATIENTS: "medidoc_patients_v2",
  VISITS: "medidoc_visits_v2",
  TEMPLATES: "medidoc_templates_v2",
  CURRENT_DOCTOR: "medidoc_active_doctor_v2",
  CURRENT_USER: "medidoc_active_user_v2",
  USERS: "medidoc_users_v2",
  OFFICES: "medidoc_offices_v2",
  ACTIVE_OFFICE: "medidoc_active_office_v2",
  CONNECTIONS: "medidoc_connections_v2",
  SHARED_PATIENTS: "medidoc_shared_patients_v2",
  SUBSCRIPTION: "medidoc_subscription_v2",
  PAYMENTS: "medidoc_payments_v2",
  AUDIT_LOGS: "medidoc_audit_logs_v2",
};

// Safe access for SSR & LocalStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      window.localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("medidoc-data-changed"));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// ================= AUDIT LOGS =================

export function getAuditLogs(): AuditLog[] {
  return getFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

export function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, any>
): void {
  const logs = getAuditLogs();
  const currentUser = getActiveUser();
  const newLog: AuditLog = {
    id: `aud_${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action,
    entityType,
    entityId,
    metadata,
    ipAddress: "127.0.0.1 (Local Session)",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "MediDoc Browser Client",
    createdAt: new Date().toISOString(),
  };
  logs.unshift(newLog);
  // Keep last 100 logs
  if (logs.length > 100) logs.pop();
  setToStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// ================= USERS & RBAC SESSIONS =================

export function getUsers(): User[] {
  return getFromStorage<User[]>(STORAGE_KEYS.USERS, MOCK_USERS);
}

export function getActiveUser(): User {
  return getFromStorage<User>(STORAGE_KEYS.CURRENT_USER, MOCK_USERS[0]); // Default to Dr. Sara Alavi
}

export function setActiveUser(user: User): void {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user);
  if (user.role === "doctor" && user.doctorId) {
    const doc = getAllDoctors().find((d) => d.id === user.doctorId);
    if (doc) setActiveDoctor(doc);
  }
  logAuditEvent("user.session_switch", "User", user.id, { role: user.role, email: user.email });
}

export function saveUser(userData: Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }): User {
  const users = getUsers();
  const now = new Date().toISOString();

  if (userData.id) {
    const idx = users.findIndex((u) => u.id === userData.id);
    if (idx >= 0) {
      const updated: User = {
        ...users[idx],
        ...userData,
        id: userData.id,
        updatedAt: now,
      };
      users[idx] = updated;
      setToStorage(STORAGE_KEYS.USERS, users);
      logAuditEvent("admin.user_update", "User", updated.id, { fullName: updated.fullName, role: updated.role });
      return updated;
    }
  }

  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  users.push(newUser);
  setToStorage(STORAGE_KEYS.USERS, users);
  logAuditEvent("admin.user_create", "User", newUser.id, { fullName: newUser.fullName, role: newUser.role });
  return newUser;
}

// ================= MEDICAL OFFICES (MULTI-OFFICE) =================

export function getOffices(): MedicalOffice[] {
  return getFromStorage<MedicalOffice[]>(STORAGE_KEYS.OFFICES, MOCK_OFFICES);
}

export function getActiveOfficeId(): string | null {
  // Returns specific officeId or null for "All Offices"
  return getFromStorage<string | null>(STORAGE_KEYS.ACTIVE_OFFICE, "off_1");
}

export function setActiveOfficeId(officeId: string | null): void {
  setToStorage(STORAGE_KEYS.ACTIVE_OFFICE, officeId);
  logAuditEvent("office.switch", "MedicalOffice", officeId || "all_offices");
}

export function saveOffice(officeData: Omit<MedicalOffice, "id" | "createdAt" | "updatedAt"> & { id?: string }): MedicalOffice {
  const offices = getOffices();
  const now = new Date().toISOString();

  if (officeData.id) {
    const idx = offices.findIndex((o) => o.id === officeData.id);
    if (idx >= 0) {
      const updated: MedicalOffice = {
        ...offices[idx],
        ...officeData,
        id: officeData.id,
        updatedAt: now,
      };
      offices[idx] = updated;
      setToStorage(STORAGE_KEYS.OFFICES, offices);
      logAuditEvent("office.update", "MedicalOffice", updated.id);
      return updated;
    }
  }

  const newOffice: MedicalOffice = {
    ...officeData,
    id: `off_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  offices.push(newOffice);
  setToStorage(STORAGE_KEYS.OFFICES, offices);
  logAuditEvent("office.create", "MedicalOffice", newOffice.id, { name: newOffice.name });
  return newOffice;
}

// ================= PATIENT OPERATIONS =================

export function getPatients(): Patient[] {
  return getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
}

export function getPatientById(id: string): Patient | undefined {
  const patients = getPatients();
  return patients.find((p) => p.id === id);
}

export function savePatient(
  patientData: Omit<Patient, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Patient {
  const patients = getPatients();
  const now = new Date().toISOString();
  const activeDoc = getActiveDoctor();
  const activeOfficeId = getActiveOfficeId();
  const activeOffice = getOffices().find((o) => o.id === activeOfficeId);

  if (patientData.id) {
    // Update existing
    const existingIndex = patients.findIndex((p) => p.id === patientData.id);
    if (existingIndex >= 0) {
      const updated: Patient = {
        ...patients[existingIndex],
        ...patientData,
        id: patientData.id,
        updatedAt: now,
      };
      patients[existingIndex] = updated;
      setToStorage(STORAGE_KEYS.PATIENTS, patients);
      logAuditEvent("patient.update", "Patient", updated.id, { fullName: updated.fullName });
      return updated;
    }
  }

  // Check subscription quota before adding
  const subscription = getCurrentSubscription();
  const quota = checkPlanQuota(subscription.planName, patients.length);
  if (quota.isExceeded) {
    throw new Error(
      `سقف پرونده‌های بیمار در طرح ${quota.planDisplayName} (${quota.maxPatients} بیمار) تکمیل شده است. لطفاً جهت ثبت بیمار جدید، اشتراک خود را ارتقا دهید.`
    );
  }

  // Create new
  const newPatient: Patient = {
    ...patientData,
    id: `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdByDoctorId: patientData.createdByDoctorId || activeDoc.id,
    createdByOfficeId: patientData.createdByOfficeId || activeOfficeId || "off_1",
    officeName: patientData.officeName || activeOffice?.name || "مطب اصلی",
    createdAt: now,
    updatedAt: now,
  };
  patients.unshift(newPatient);
  setToStorage(STORAGE_KEYS.PATIENTS, patients);
  logAuditEvent("patient.create", "Patient", newPatient.id, { fullName: newPatient.fullName });
  return newPatient;
}

export function deletePatient(id: string): void {
  const patients = getPatients().filter((p) => p.id !== id);
  setToStorage(STORAGE_KEYS.PATIENTS, patients);
  // Also remove their visits
  const visits = getVisits().filter((v) => v.patientId !== id);
  setToStorage(STORAGE_KEYS.VISITS, visits);
  logAuditEvent("patient.delete", "Patient", id);
}

export function searchPatients(query: string, officeIdFilter?: string | null): Patient[] {
  let list = getPatients();
  if (officeIdFilter) {
    list = list.filter((p) => p.createdByOfficeId === officeIdFilter);
  }

  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return list;

  return list.filter((p) => {
    const matchName = p.fullName.toLowerCase().includes(cleanQuery);
    const matchPhone = p.phone.replace(/[\s-]/g, "").includes(cleanQuery);
    const matchNationalId = p.nationalId?.includes(cleanQuery);
    const matchCondition = p.chronicConditions?.some((c) =>
      c.toLowerCase().includes(cleanQuery)
    );
    return matchName || matchPhone || matchNationalId || matchCondition;
  });
}

// ================= VISIT OPERATIONS =================

export function getVisits(): Visit[] {
  return getFromStorage<Visit[]>(STORAGE_KEYS.VISITS, INITIAL_VISITS);
}

export function getVisitById(id: string): Visit | undefined {
  return getVisits().find((v) => v.id === id);
}

export function getVisitsForPatient(patientId: string): Visit[] {
  return getVisits()
    .filter((v) => v.patientId === patientId)
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
}

export function saveVisit(
  visitData: Omit<Visit, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Visit {
  const visits = getVisits();
  const now = new Date().toISOString();
  const activeOfficeId = getActiveOfficeId();
  const activeOffice = getOffices().find((o) => o.id === activeOfficeId);

  if (visitData.id) {
    const index = visits.findIndex((v) => v.id === visitData.id);
    if (index >= 0) {
      const updated: Visit = {
        ...visits[index],
        ...visitData,
        id: visitData.id,
        updatedAt: now,
        finalizedAt:
          visitData.status === "finalized" && !visits[index].finalizedAt
            ? now
            : visits[index].finalizedAt,
      };
      visits[index] = updated;
      setToStorage(STORAGE_KEYS.VISITS, visits);
      logAuditEvent("visit.update", "Visit", updated.id, { status: updated.status });
      return updated;
    }
  }

  const newVisit: Visit = {
    ...visitData,
    id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    officeId: visitData.officeId || activeOfficeId || "off_1",
    officeName: visitData.officeName || activeOffice?.name || "مطب اصلی",
    createdAt: now,
    updatedAt: now,
    finalizedAt: visitData.status === "finalized" ? now : null,
  };
  visits.unshift(newVisit);
  setToStorage(STORAGE_KEYS.VISITS, visits);

  // Update patient's last activity
  const patient = getPatientById(visitData.patientId);
  if (patient) {
    savePatient({ ...patient });
  }

  logAuditEvent("visit.create", "Visit", newVisit.id, {
    patientId: newVisit.patientId,
    status: newVisit.status,
  });

  return newVisit;
}

export function finalizeVisit(visitId: string): Visit | undefined {
  const visit = getVisitById(visitId);
  if (!visit) return undefined;

  const finalized = saveVisit({
    ...visit,
    status: "finalized",
    finalizedAt: new Date().toISOString(),
  });
  logAuditEvent("visit.finalize", "Visit", visitId);
  return finalized;
}

export function deleteVisit(visitId: string): void {
  const visits = getVisits().filter((v) => v.id !== visitId);
  setToStorage(STORAGE_KEYS.VISITS, visits);
  logAuditEvent("visit.delete", "Visit", visitId);
}

// ================= TEMPLATE OPERATIONS =================

export function getTemplates(): SpecialtyTemplatePhrase[] {
  return getFromStorage<SpecialtyTemplatePhrase[]>(
    STORAGE_KEYS.TEMPLATES,
    INITIAL_TEMPLATES
  );
}

export function getTemplatesBySpecialty(specialty: SpecialtyType): SpecialtyTemplatePhrase[] {
  return getTemplates().filter(
    (t) => t.specialty === specialty || t.specialty === "general"
  );
}

export function addCustomTemplatePhrase(
  phrase: Omit<SpecialtyTemplatePhrase, "id" | "order">
): SpecialtyTemplatePhrase {
  const templates = getTemplates();
  const newPhrase: SpecialtyTemplatePhrase = {
    ...phrase,
    id: `tpl_custom_${Date.now()}`,
    order: templates.length + 1,
  };
  templates.push(newPhrase);
  setToStorage(STORAGE_KEYS.TEMPLATES, templates);
  logAuditEvent("template.create", "SpecialtyTemplatePhrase", newPhrase.id, {
    phraseText: newPhrase.phraseText,
  });
  return newPhrase;
}

// ================= DOCTOR PROFILE =================

export function getActiveDoctor(): Doctor {
  return getFromStorage<Doctor>(STORAGE_KEYS.CURRENT_DOCTOR, MOCK_DOCTORS[0]);
}

export function setActiveDoctor(doctor: Doctor): void {
  setToStorage(STORAGE_KEYS.CURRENT_DOCTOR, doctor);
}

export function getAllDoctors(): Doctor[] {
  return MOCK_DOCTORS;
}

// ================= DOCTOR NETWORK & CONNECTIONS (DOC 07) =================

export function getConnections(): DoctorConnection[] {
  return getFromStorage<DoctorConnection[]>(
    STORAGE_KEYS.CONNECTIONS,
    INITIAL_DOCTOR_CONNECTIONS
  );
}

export function sendConnectionRequest(targetDoctorId: string): DoctorConnection {
  const connections = getConnections();
  const currentDoc = getActiveDoctor();

  // Check if exists
  const existing = connections.find(
    (c) =>
      (c.requesterId === currentDoc.id && c.receiverId === targetDoctorId) ||
      (c.requesterId === targetDoctorId && c.receiverId === currentDoc.id)
  );

  if (existing) {
    return existing;
  }

  const newConn: DoctorConnection = {
    id: `conn_${Date.now()}`,
    requesterId: currentDoc.id,
    receiverId: targetDoctorId,
    status: "pending",
    requestedAt: new Date().toISOString(),
  };

  connections.unshift(newConn);
  setToStorage(STORAGE_KEYS.CONNECTIONS, connections);
  logAuditEvent("doctor_network.request_sent", "DoctorConnection", newConn.id, {
    targetDoctorId,
  });
  return newConn;
}

export function respondToConnectionRequest(
  connectionId: string,
  newStatus: ConnectionStatus
): void {
  const connections = getConnections();
  const idx = connections.findIndex((c) => c.id === connectionId);
  if (idx >= 0) {
    connections[idx].status = newStatus;
    connections[idx].respondedAt = new Date().toISOString();
    setToStorage(STORAGE_KEYS.CONNECTIONS, connections);
    logAuditEvent("doctor_network.response", "DoctorConnection", connectionId, {
      status: newStatus,
    });
  }
}

export function removeConnection(connectionId: string): void {
  const connections = getConnections().filter((c) => c.id !== connectionId);
  setToStorage(STORAGE_KEYS.CONNECTIONS, connections);
  logAuditEvent("doctor_network.remove", "DoctorConnection", connectionId);
}

// ================= SHARED PATIENTS (DOC 07) =================

export function getSharedPatients(): SharedPatient[] {
  return getFromStorage<SharedPatient[]>(
    STORAGE_KEYS.SHARED_PATIENTS,
    INITIAL_SHARED_PATIENTS
  );
}

export function sharePatientWithDoctor(params: {
  patientId: string;
  sharedWithDoctorId: string;
  accessLevel: ShareAccessLevel;
  patientConsent: boolean;
  notes?: string;
}): SharedPatient {
  const sharedList = getSharedPatients();
  const currentDoc = getActiveDoctor();
  const targetDoc = getAllDoctors().find((d) => d.id === params.sharedWithDoctorId);
  const patient = getPatientById(params.patientId);

  // Check if already shared
  const existingIdx = sharedList.findIndex(
    (s) =>
      s.patientId === params.patientId &&
      s.ownerDoctorId === currentDoc.id &&
      s.sharedWithDoctorId === params.sharedWithDoctorId
  );

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    sharedList[existingIdx] = {
      ...sharedList[existingIdx],
      accessLevel: params.accessLevel,
      patientConsent: params.patientConsent,
      notes: params.notes,
      isActive: true,
      revokedAt: null,
      sharedAt: now,
    };
    setToStorage(STORAGE_KEYS.SHARED_PATIENTS, sharedList);
    logAuditEvent("patient.share_update", "SharedPatient", sharedList[existingIdx].id);
    return sharedList[existingIdx];
  }

  const newShare: SharedPatient = {
    id: `shp_${Date.now()}`,
    patientId: params.patientId,
    patient,
    ownerDoctorId: currentDoc.id,
    ownerDoctorName: currentDoc.fullName,
    sharedWithDoctorId: params.sharedWithDoctorId,
    sharedWithDoctorName: targetDoc?.fullName || "همکار پزشک",
    accessLevel: params.accessLevel,
    patientConsent: params.patientConsent,
    notes: params.notes,
    sharedAt: now,
    revokedAt: null,
    isActive: true,
  };

  sharedList.unshift(newShare);
  setToStorage(STORAGE_KEYS.SHARED_PATIENTS, sharedList);
  logAuditEvent("patient.share", "SharedPatient", newShare.id, {
    patientId: params.patientId,
    sharedWith: targetDoc?.fullName,
    accessLevel: params.accessLevel,
  });
  return newShare;
}

export function revokePatientShare(shareId: string): void {
  const sharedList = getSharedPatients();
  const idx = sharedList.findIndex((s) => s.id === shareId);
  if (idx >= 0) {
    sharedList[idx].isActive = false;
    sharedList[idx].revokedAt = new Date().toISOString();
    setToStorage(STORAGE_KEYS.SHARED_PATIENTS, sharedList);
    logAuditEvent("patient.share_revoke", "SharedPatient", shareId);
  }
}

export function getPatientsSharedWithMe(): SharedPatient[] {
  const currentDoc = getActiveDoctor();
  return getSharedPatients().filter(
    (s) => s.sharedWithDoctorId === currentDoc.id && s.isActive
  );
}

// ================= SUBSCRIPTION & BILLING (DOC 08) =================

export function getSubscriptionPlans(): SubscriptionPlan[] {
  return MOCK_SUBSCRIPTION_PLANS;
}

export function getCurrentSubscription(): DoctorSubscription {
  return getFromStorage<DoctorSubscription>(
    STORAGE_KEYS.SUBSCRIPTION,
    INITIAL_DOCTOR_SUBSCRIPTION
  );
}

export function getPaymentHistory(): PaymentTransaction[] {
  return getFromStorage<PaymentTransaction[]>(
    STORAGE_KEYS.PAYMENTS,
    INITIAL_PAYMENT_TRANSACTIONS
  );
}

export function checkPlanQuota(
  planName: SubscriptionPlanType,
  currentPatientCount: number
): {
  isExceeded: boolean;
  maxPatients: number;
  remaining: number;
  percentageUsed: number;
  planDisplayName: string;
} {
  const plan = getSubscriptionPlans().find((p) => p.name === planName);
  const max = plan?.maxPatients ?? 100;
  if (max === -1) {
    return {
      isExceeded: false,
      maxPatients: -1,
      remaining: 999999,
      percentageUsed: 0,
      planDisplayName: plan?.displayName || "طرح طلایی",
    };
  }

  const remaining = Math.max(0, max - currentPatientCount);
  const percentage = Math.min(100, Math.round((currentPatientCount / max) * 100));

  return {
    isExceeded: currentPatientCount >= max,
    maxPatients: max,
    remaining,
    percentageUsed: percentage,
    planDisplayName: plan?.displayName || planName,
  };
}

export function upgradeSubscription(
  planName: SubscriptionPlanType,
  billingPeriod: "monthly" | "annual"
): DoctorSubscription {
  const plan = getSubscriptionPlans().find((p) => p.name === planName);
  if (!plan) throw new Error("طرح انتخابی نامعتبر است");

  const currentDoc = getActiveDoctor();
  const currentSub = getCurrentSubscription();
  const now = new Date();
  const endDate = new Date(now);

  if (billingPeriod === "annual") {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const amount = billingPeriod === "annual" ? plan.priceAnnual : plan.priceMonthly;

  const updatedSub: DoctorSubscription = {
    ...currentSub,
    planId: plan.id,
    planName: plan.name,
    status: "active",
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: endDate.toISOString(),
    autoRenew: true,
    updatedAt: now.toISOString(),
  };

  setToStorage(STORAGE_KEYS.SUBSCRIPTION, updatedSub);

  // Add payment invoice record
  const payments = getPaymentHistory();
  const newTx: PaymentTransaction = {
    id: `tx_${Date.now()}`,
    doctorId: currentDoc.id,
    subscriptionId: updatedSub.id,
    planName: `${plan.displayName} — دوره ${billingPeriod === "annual" ? "سالانه" : "ماهانه"}`,
    amount,
    currency: "تومان",
    gateway: "زرین‌پال (پرداخت شبیه‌سازی‌شده تستی)",
    gatewayRefId: `REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
    status: "success",
    paidAt: now.toISOString(),
    createdAt: now.toISOString(),
  };
  payments.unshift(newTx);
  setToStorage(STORAGE_KEYS.PAYMENTS, payments);

  logAuditEvent("subscription.upgrade", "DoctorSubscription", updatedSub.id, {
    newPlan: planName,
    amount,
  });

  return updatedSub;
}

// ================= EFFICIENCY & AUDIT METRICS (PHASE 1.5) =================

export function calculateEfficiencyMetrics(): ClinicEfficiencyMetrics {
  const visits = getVisits();
  const totalVisits = visits.length;
  const finalized = visits.filter((v) => v.status === "finalized");

  const totalDuration = finalized.reduce((acc, v) => acc + (v.durationSeconds || 25), 0);
  const avgDuration = finalized.length > 0 ? Math.round(totalDuration / finalized.length) : 0;

  let structuredPhrasesCount = 0;
  let customPhrasesCount = 0;
  let fallbackCount = 0;

  for (const v of visits) {
    const ccCount = v.chiefComplaintIds?.length || 0;
    const peCount = v.examFindingsIds?.length || 0;
    const dxCount = v.diagnosisIds?.length || 0;
    structuredPhrasesCount += ccCount + peCount + dxCount;

    const customCc = v.customChiefComplaints?.length || 0;
    const customPe = v.customExamFindings?.length || 0;
    const customDx = v.customDiagnoses?.length || 0;
    customPhrasesCount += customCc + customPe + customDx;

    if (v.freeTextFallback && v.freeTextFallback.trim().length > 0) {
      fallbackCount++;
    }
  }

  const totalSelections = structuredPhrasesCount + customPhrasesCount + fallbackCount;
  const adoptionRate =
    totalSelections > 0
      ? Math.round((structuredPhrasesCount / totalSelections) * 100)
      : 100;

  const secondsSavedPerVisit = Math.max(0, 270 - avgDuration);
  const estimatedMinutesSaved = Math.round((secondsSavedPerVisit * finalized.length) / 60);

  return {
    totalVisits,
    finalizedVisits: finalized.length,
    avgDurationSeconds: avgDuration,
    structuredPhrasesUsedCount: structuredPhrasesCount,
    customPhrasesUsedCount: customPhrasesCount,
    fallbackTextUsedCount: fallbackCount,
    structuredAdoptionRate: adoptionRate,
    estimatedMinutesSaved,
  };
}

// ================= EXPORT & IMPORT (ZERO-COST DATA BACKUP) =================

export interface ClinicBackupPayload {
  version: string;
  exportedAt: string;
  doctor: Doctor;
  users?: User[];
  offices?: MedicalOffice[];
  patients: Patient[];
  visits: Visit[];
  templates: SpecialtyTemplatePhrase[];
  connections?: DoctorConnection[];
  sharedPatients?: SharedPatient[];
  subscription?: DoctorSubscription;
  payments?: PaymentTransaction[];
  auditLogs?: AuditLog[];
}

export function exportClinicData(): string {
  const payload: ClinicBackupPayload = {
    version: "2.0.0",
    exportedAt: new Date().toISOString(),
    doctor: getActiveDoctor(),
    users: getUsers(),
    offices: getOffices(),
    patients: getPatients(),
    visits: getVisits(),
    templates: getTemplates(),
    connections: getConnections(),
    sharedPatients: getSharedPatients(),
    subscription: getCurrentSubscription(),
    payments: getPaymentHistory(),
    auditLogs: getAuditLogs(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importClinicData(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString) as Partial<ClinicBackupPayload>;
    if (!data.patients || !Array.isArray(data.patients)) {
      return { success: false, message: "فایل پشتیبان نامعتبر است (ساختار بیماران یافت نشد)" };
    }
    if (data.patients) setToStorage(STORAGE_KEYS.PATIENTS, data.patients);
    if (data.visits) setToStorage(STORAGE_KEYS.VISITS, data.visits);
    if (data.templates) setToStorage(STORAGE_KEYS.TEMPLATES, data.templates);
    if (data.doctor) setToStorage(STORAGE_KEYS.CURRENT_DOCTOR, data.doctor);
    if (data.users) setToStorage(STORAGE_KEYS.USERS, data.users);
    if (data.offices) setToStorage(STORAGE_KEYS.OFFICES, data.offices);
    if (data.connections) setToStorage(STORAGE_KEYS.CONNECTIONS, data.connections);
    if (data.sharedPatients) setToStorage(STORAGE_KEYS.SHARED_PATIENTS, data.sharedPatients);
    if (data.subscription) setToStorage(STORAGE_KEYS.SUBSCRIPTION, data.subscription);
    if (data.payments) setToStorage(STORAGE_KEYS.PAYMENTS, data.payments);
    if (data.auditLogs) setToStorage(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);

    logAuditEvent("backup.import", "System", "database", {
      patientsCount: data.patients.length,
      visitsCount: data.visits?.length,
    });

    return {
      success: true,
      message: `اطلاعات با موفقیت بازیابی شد (${data.patients.length} پرونده بیمار، ${data.visits?.length ?? 0} ویزیت)`,
    };
  } catch (err) {
    return {
      success: false,
      message: "خطا در پردازش فایل پشتیبان JSON: " + (err instanceof Error ? err.message : String(err)),
    };
  }
}

export function resetClinicToDefaults(): void {
  setToStorage(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  setToStorage(STORAGE_KEYS.VISITS, INITIAL_VISITS);
  setToStorage(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
  setToStorage(STORAGE_KEYS.CURRENT_DOCTOR, MOCK_DOCTORS[0]);
  setToStorage(STORAGE_KEYS.USERS, MOCK_USERS);
  setToStorage(STORAGE_KEYS.OFFICES, MOCK_OFFICES);
  setToStorage(STORAGE_KEYS.ACTIVE_OFFICE, "off_1");
  setToStorage(STORAGE_KEYS.CONNECTIONS, INITIAL_DOCTOR_CONNECTIONS);
  setToStorage(STORAGE_KEYS.SHARED_PATIENTS, INITIAL_SHARED_PATIENTS);
  setToStorage(STORAGE_KEYS.SUBSCRIPTION, INITIAL_DOCTOR_SUBSCRIPTION);
  setToStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENT_TRANSACTIONS);
  setToStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  setToStorage(STORAGE_KEYS.CURRENT_USER, MOCK_USERS[0]);
}
