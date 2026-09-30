import {
  ClinicEfficiencyMetrics,
  Doctor,
  Patient,
  SpecialtyTemplatePhrase,
  SpecialtyType,
  Visit,
} from "@/types/medical";
import { INITIAL_PATIENTS, INITIAL_VISITS, MOCK_DOCTORS } from "./mock-data";
import { INITIAL_TEMPLATES } from "./templates-data";

const STORAGE_KEYS = {
  PATIENTS: "medidoc_patients_v1",
  VISITS: "medidoc_visits_v1",
  TEMPLATES: "medidoc_templates_v1",
  CURRENT_DOCTOR: "medidoc_active_doctor_v1",
};

// Safe access for SSR
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

// ================= PATIENT OPERATIONS =================

export function getPatients(): Patient[] {
  return getFromStorage<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
}

export function getPatientById(id: string): Patient | undefined {
  const patients = getPatients();
  return patients.find((p) => p.id === id);
}

export function savePatient(patientData: Omit<Patient, "id" | "createdAt" | "updatedAt"> & { id?: string }): Patient {
  const patients = getPatients();
  const now = new Date().toISOString();

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
      return updated;
    }
  }

  // Create new
  const newPatient: Patient = {
    ...patientData,
    id: `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  patients.unshift(newPatient);
  setToStorage(STORAGE_KEYS.PATIENTS, patients);
  return newPatient;
}

export function deletePatient(id: string): void {
  const patients = getPatients().filter((p) => p.id !== id);
  setToStorage(STORAGE_KEYS.PATIENTS, patients);
  // Also remove their visits
  const visits = getVisits().filter((v) => v.patientId !== id);
  setToStorage(STORAGE_KEYS.VISITS, visits);
}

export function searchPatients(query: string): Patient[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return getPatients();

  return getPatients().filter((p) => {
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

export function saveVisit(visitData: Omit<Visit, "id" | "createdAt" | "updatedAt"> & { id?: string }): Visit {
  const visits = getVisits();
  const now = new Date().toISOString();

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
      return updated;
    }
  }

  const newVisit: Visit = {
    ...visitData,
    id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

  return newVisit;
}

export function finalizeVisit(visitId: string): Visit | undefined {
  const visit = getVisitById(visitId);
  if (!visit) return undefined;

  return saveVisit({
    ...visit,
    status: "finalized",
    finalizedAt: new Date().toISOString(),
  });
}

export function deleteVisit(visitId: string): void {
  const visits = getVisits().filter((v) => v.id !== visitId);
  setToStorage(STORAGE_KEYS.VISITS, visits);
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
  return newPhrase;
}

// ================= DOCTOR SESSION =================

export function getActiveDoctor(): Doctor {
  return getFromStorage<Doctor>(STORAGE_KEYS.CURRENT_DOCTOR, MOCK_DOCTORS[0]);
}

export function setActiveDoctor(doctor: Doctor): void {
  setToStorage(STORAGE_KEYS.CURRENT_DOCTOR, doctor);
}

export function getAllDoctors(): Doctor[] {
  return MOCK_DOCTORS;
}

// ================= EFFICIENCY & AUDIT METRICS (PHASE 1.5) =================

export function calculateEfficiencyMetrics(): ClinicEfficiencyMetrics {
  const visits = getVisits();
  const totalVisits = visits.length;
  const finalized = visits.filter((v) => v.status === "finalized");

  const totalDuration = finalized.reduce((acc, v) => acc + (v.durationSeconds || 25), 0);
  const avgDuration = finalized.length > 0 ? Math.round(totalDuration / finalized.length) : 0;

  let structuredPhrasesCount = 0;
  let fallbackCount = 0;

  for (const v of visits) {
    const ccCount = v.chiefComplaintIds?.length || 0;
    const peCount = v.examFindingsIds?.length || 0;
    const dxCount = v.diagnosisIds?.length || 0;
    structuredPhrasesCount += ccCount + peCount + dxCount;

    if (v.freeTextFallback && v.freeTextFallback.trim().length > 0) {
      fallbackCount++;
    }
  }

  const totalSelections = structuredPhrasesCount + fallbackCount;
  const adoptionRate =
    totalSelections > 0
      ? Math.round((structuredPhrasesCount / totalSelections) * 100)
      : 100;

  // Traditional Iranian clinic legacy typing takes ~4.5 minutes (270 seconds) per encounter
  // Saved time = (270 - avgDuration) * finalized / 60
  const secondsSavedPerVisit = Math.max(0, 270 - avgDuration);
  const estimatedMinutesSaved = Math.round((secondsSavedPerVisit * finalized.length) / 60);

  return {
    totalVisits,
    finalizedVisits: finalized.length,
    avgDurationSeconds: avgDuration,
    structuredPhrasesUsedCount: structuredPhrasesCount,
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
  patients: Patient[];
  visits: Visit[];
  templates: SpecialtyTemplatePhrase[];
}

export function exportClinicData(): string {
  const payload: ClinicBackupPayload = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    doctor: getActiveDoctor(),
    patients: getPatients(),
    visits: getVisits(),
    templates: getTemplates(),
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
}
