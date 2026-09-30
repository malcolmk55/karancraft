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
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 pb-1 text-xs font-bold text-slate-400">
        <span>فهرست بیماران مطب ({formatPersianNumber(patients.length)})</span>
        <span>انتخاب پرونده</span>
      </div>

      <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
        {patients.map((patient) => {
          const isSelected = patient.id === selectedPatientId;
          const patientVisits = visits.filter((v) => v.patientId === patient.id);
          const hasDraft = patientVisits.some((v) => v.status === "draft");

          return (
            <div
              key={patient.id}
              onClick={() => onSelectPatient(patient)}
              className={`group flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10 dark:border-emerald-500/50 dark:bg-emerald-950/40"
                  : "border-slate-200/80 bg-white/80 hover:border-slate-300 hover:bg-slate-50/90 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-850"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black ${
                    patient.sex === "female"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  }`}
                >
                  {patient.fullName.slice(0, 1)}
                </div>

                <div className="min-w-0 space-y-1">
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
                        پیش‌نویس باز
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{formatPersianNumber(patient.phone)}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatPersianNumber(patientVisits.length)} ویزیت
                    </span>
                    {patient.allergies && patient.allergies.length > 0 && (
                      <span className="text-[11px] text-rose-500 font-semibold truncate max-w-[120px]">
                        آلرژی: {patient.allergies[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ChevronLeft
                  className={`h-4 w-4 transition-transform group-hover:-translate-x-1 ${
                    isSelected
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-300 group-hover:text-slate-600"
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
