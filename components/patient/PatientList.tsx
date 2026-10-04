"use client";

import * as React from "react";
import { Patient, Visit } from "@/types/medical";
import { formatPersianNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  CreditCard,
  Calendar,
  ChevronLeft,
  Activity,
  AlertTriangle,
  User,
  Trash2,
} from "lucide-react";
import { PatientAvatar } from "@/components/patient/PatientAvatar";

interface PatientListProps {
  patients: Patient[];
  visits: Visit[];
  selectedPatientId?: string;
  onSelectPatient: (patient: Patient) => void;
  onDeletePatient?: (id: string) => void;
}

export function PatientList({
  patients,
  visits,
  selectedPatientId,
  onSelectPatient,
  onDeletePatient,
}: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        هیچ پرونده بیماری در این مطب ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 pb-1 text-xs font-semibold text-slate-400">
        <span>فهرست بیماران ({formatPersianNumber(patients.length)})</span>
        <span>انتخاب پرونده</span>
      </div>

      <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
        {patients.map((patient) => {
          const isSelected = patient.id === selectedPatientId;
          const patientVisits = visits.filter((v) => v.patientId === patient.id);
          const hasDraft = patientVisits.some((v) => v.status === "draft");

          return (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={`group flex items-center justify-between rounded-xl sm:rounded-2xl border p-3.5 cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "border-teal-500 bg-teal-50/70 shadow-sm dark:border-teal-500/60 dark:bg-teal-950/30"
                  : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <PatientAvatar sex={patient.sex} name={patient.fullName} size="sm" />

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {patient.fullName}
                    </span>
                    {patient.age && (
                      <span className="text-xs text-slate-400 shrink-0">
                        {formatPersianNumber(patient.age)} ساله
                      </span>
                    )}
                    {hasDraft && (
                      <Badge variant="amber" className="text-[10px] py-0 px-1.5 shrink-0">
                        پیش‌نویس
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{formatPersianNumber(patient.phone)}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatPersianNumber(patientVisits.length)} ویزیت
                    </span>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <span className="text-[11px] text-rose-500 font-semibold truncate max-w-[110px]">
                        آلرژی: {patient.allergies[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <ChevronLeft
                  className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${
                    isSelected
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
