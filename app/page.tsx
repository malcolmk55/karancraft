"use client";

import * as React from "react";
import {
  ClinicEfficiencyMetrics,
  Doctor,
  Patient,
  Visit,
} from "@/types/medical";
import {
  calculateEfficiencyMetrics,
  getActiveDoctor,
  getPatientById,
  getPatients,
  getVisits,
  getVisitsForPatient,
} from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { PatientSearch } from "@/components/patient/PatientSearch";
import { PatientList } from "@/components/patient/PatientList";
import { PatientProfile } from "@/components/patient/PatientProfile";
import { PatientTimeline } from "@/components/patient/PatientTimeline";
import { PatientModal } from "@/components/patient/PatientModal";
import { VisitForm } from "@/components/visit/VisitForm";
import { VisitDetailModal } from "@/components/visit/VisitDetailModal";
import { VisitPrintView } from "@/components/visit/VisitPrintView";
import { EfficiencyModal } from "@/components/analytics/EfficiencyModal";
import { DataBackupModal } from "@/components/settings/DataBackupModal";
import { TemplateManagerModal } from "@/components/settings/TemplateManagerModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  UserPlus,
  Users,
  Stethoscope,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

type AppViewMode = "view_patient" | "create_visit" | "edit_draft_visit" | "print_visit";

export default function HomePage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [activeDoctor, setActiveDoctor] = React.useState<Doctor | null>(null);
  const [metrics, setMetrics] = React.useState<ClinicEfficiencyMetrics | null>(null);

  // Active Selected Patient
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);

  // Current view mode
  const [viewMode, setViewMode] = React.useState<AppViewMode>("view_patient");

  // State for forms/modals
  const [visitForForm, setVisitForForm] = React.useState<Visit | null>(null);
  const [visitForDetail, setVisitForDetail] = React.useState<Visit | null>(null);
  const [visitForPrint, setVisitForPrint] = React.useState<Visit | null>(null);
  const [patientToEdit, setPatientToEdit] = React.useState<Patient | null>(null);

  // Modals visibility
  const [isPatientModalOpen, setIsPatientModalOpen] = React.useState(false);
  const [isEfficiencyModalOpen, setIsEfficiencyModalOpen] = React.useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = React.useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);

  // Load data function
  const loadData = React.useCallback(() => {
    const pts = getPatients();
    const vs = getVisits();
    const doc = getActiveDoctor();
    const met = calculateEfficiencyMetrics();

    setPatients(pts);
    setVisits(vs);
    setActiveDoctor(doc);
    setMetrics(met);

    setSelectedPatientId((prev) => {
      if (prev && pts.some((p) => p.id === prev)) return prev;
      return pts[0]?.id || null;
    });
  }, []);

  React.useEffect(() => {
    setIsMounted(true);
    loadData();

    const handleStorageUpdate = () => {
      loadData();
    };
    window.addEventListener("medidoc-data-changed", handleStorageUpdate);
    return () => {
      window.removeEventListener("medidoc-data-changed", handleStorageUpdate);
    };
  }, [loadData]);

  const selectedPatient = React.useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId) || null;
  }, [patients, selectedPatientId]);

  const selectedPatientVisits = React.useMemo(() => {
    if (!selectedPatientId) return [];
    return getVisitsForPatient(selectedPatientId);
  }, [selectedPatientId, visits]);

  // Handlers
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    setViewMode("view_patient");
  };

  const handleStartNewVisit = () => {
    setVisitForForm(null);
    setViewMode("create_visit");
  };

  const handleEditDraftVisit = (visit: Visit) => {
    setVisitForForm(visit);
    setViewMode("edit_draft_visit");
  };

  const handlePrintVisit = (visit: Visit) => {
    setVisitForPrint(visit);
    setViewMode("print_visit");
  };

  const handleVisitSaved = (savedVisit: Visit) => {
    loadData();
    setViewMode("view_patient");
  };

  const handlePatientSaved = (patient: Patient) => {
    loadData();
    setSelectedPatientId(patient.id);
    setViewMode("view_patient");
  };

  if (!isMounted || !activeDoctor || !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30">
            <Stethoscope className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            در حال بارگذاری سامانه مطب هوشمند...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950/80">
      {/* Clinic Header */}
      <Header
        activeDoctor={activeDoctor}
        onDoctorChange={(doc) => {
          setActiveDoctor(doc);
          loadData();
        }}
        avgDurationSeconds={metrics.avgDurationSeconds}
        onOpenEfficiencyModal={() => setIsEfficiencyModalOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenNewPatientModal={() => {
          setPatientToEdit(null);
          setIsPatientModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 space-y-6">
        {/* Fast Search Hero Row */}
        {viewMode !== "print_visit" && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 max-w-3xl">
              <PatientSearch
                onSelectPatient={handleSelectPatient}
                onOpenNewPatientModal={() => {
                  setPatientToEdit(null);
                  setIsPatientModalOpen(true);
                }}
              />
            </div>

            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>کل بیماران: {patients.length} پرونده</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
                <Stethoscope className="h-4 w-4 text-blue-600" />
                <span>ویزیت‌ها: {visits.length} ویزیت</span>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Switching: Print View vs Main Clinical Workspace */}
        {viewMode === "print_visit" && visitForPrint && selectedPatient ? (
          <VisitPrintView
            visit={visitForPrint}
            patient={selectedPatient}
            doctor={activeDoctor}
            onBack={() => setViewMode("view_patient")}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Sidebar / Left Column: Patient Directory (4 cols) */}
            <div className="lg:col-span-4 order-2 lg:order-1">
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
                <PatientList
                  patients={patients}
                  visits={visits}
                  selectedPatientId={selectedPatientId || undefined}
                  onSelectPatient={handleSelectPatient}
                />
              </div>
            </div>

            {/* Main Stage: Patient Profile & Encounter Form or Timeline (8 cols) */}
            <div className="lg:col-span-8 order-1 lg:order-2 space-y-6">
              {viewMode === "create_visit" || viewMode === "edit_draft_visit" ? (
                selectedPatient && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between pb-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("view_patient")}
                        className="gap-1.5"
                      >
                        <ArrowRight className="h-4 w-4" />
                        <span>بازگشت به پرونده بیمار</span>
                      </Button>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {viewMode === "edit_draft_visit"
                          ? "در حال ویرایش پیش‌نویس ویزیت"
                          : "فرم ثبت ویزیت بالینی جدید"}
                      </span>
                    </div>

                    <VisitForm
                      patient={selectedPatient}
                      doctor={activeDoctor}
                      initialVisit={visitForForm}
                      onSaved={handleVisitSaved}
                      onCancel={() => setViewMode("view_patient")}
                    />
                  </div>
                )
              ) : selectedPatient ? (
                <div className="space-y-6">
                  {/* Patient Profile Card */}
                  <PatientProfile
                    patient={selectedPatient}
                    visits={selectedPatientVisits}
                    onStartNewVisit={handleStartNewVisit}
                    onEditPatient={() => {
                      setPatientToEdit(selectedPatient);
                      setIsPatientModalOpen(true);
                    }}
                  />

                  {/* Encounter Timeline */}
                  <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
                    <PatientTimeline
                      visits={selectedPatientVisits}
                      onSelectVisit={(visit) => setVisitForDetail(visit)}
                      onEditDraftVisit={handleEditDraftVisit}
                      onPrintVisit={handlePrintVisit}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 p-16 text-center dark:border-slate-800">
                  <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                  <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                    هیچ بیماری انتخاب نشده است
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    از نوار جست‌وجو یا لیست سمت راست یک بیمار را انتخاب کنید.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/60 py-6 text-center text-xs text-slate-500 backdrop-blur-md dark:border-slate-850 dark:bg-slate-900/60 dark:text-slate-400 no-print">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              سامانه مطب هوشمند MediDoc
            </span>
            <span>—</span>
            <span>اسلایس عمودی اول (بدون هوش مصنوعی / آماده برای اتصال در فاز ۲)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>زیرساخت سرورلس Vercel Ready</span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">بلوکه کامل خزنده‌ها و ربات‌ها (noindex)</span>
          </div>
        </div>
      </footer>

      {/* Modal: New / Edit Patient */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patientToEdit={patientToEdit}
        onSaved={handlePatientSaved}
      />

      {/* Modal: Encounter Detail */}
      <VisitDetailModal
        isOpen={Boolean(visitForDetail)}
        onClose={() => setVisitForDetail(null)}
        visit={visitForDetail}
        patient={selectedPatient}
        onPrint={() => {
          if (visitForDetail) {
            const v = visitForDetail;
            setVisitForDetail(null);
            handlePrintVisit(v);
          }
        }}
        onEditDraft={(v) => {
          setVisitForDetail(null);
          handleEditDraftVisit(v);
        }}
      />

      {/* Modal: Efficiency Metrics (Phase 1.5) */}
      <EfficiencyModal
        isOpen={isEfficiencyModalOpen}
        onClose={() => setIsEfficiencyModalOpen(false)}
        metrics={metrics}
      />

      {/* Modal: Data Backup & Restore */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={loadData}
      />

      {/* Modal: Clinical Template Library Manager */}
      <TemplateManagerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onTemplateAdded={loadData}
      />
    </div>
  );
}
