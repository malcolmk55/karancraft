"use client";

import * as React from "react";
import { Patient, Visit } from "@/types/medical";
import { formatPersianNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone,
  CreditCard,
  Calendar,
  AlertTriangle,
  Activity,
  PlusCircle,
  Edit,
  Heart,
  Droplet,
  FileText,
  Share2,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { evaluateBloodPressure } from "@/lib/vitals-analyzer";
import { getSharedPatients } from "@/lib/storage";

interface PatientProfileProps {
  patient: Patient;
  visits: Visit[];
  onStartNewVisit: () => void;
  onEditPatient: () => void;
  onOpenShareModal?: () => void;
  isReadOnly?: boolean;
}

export function PatientProfile({
  patient,
  visits,
  onStartNewVisit,
  onEditPatient,
  onOpenShareModal,
  isReadOnly = false,
}: PatientProfileProps) {
  const lastVisit = visits[0];
  const bpStatus = lastVisit?.vitals?.systolicBp
    ? evaluateBloodPressure(lastVisit.vitals.systolicBp, lastVisit.vitals.diastolicBp)
    : null;

  const activeShares = React.useMemo(() => {
    return getSharedPatients().filter((s) => s.patientId === patient.id && s.isActive);
  }, [patient.id]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20">
      {/* Background subtle decoration */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-44 w-44 rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-400/5" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Avatar & Demographics */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-inner ${
              patient.sex === "female"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            }`}
          >
            {patient.fullName.slice(0, 1)}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
                {patient.fullName}
              </h1>
              {patient.age && (
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {formatPersianNumber(patient.age)} ساله
                </span>
              )}
              {patient.bloodType && (
                <Badge variant="outline" className="flex items-center gap-1 font-mono">
                  <Droplet className="h-3 w-3 text-rose-500" />
                  {patient.bloodType}
                </Badge>
              )}
              <span className="text-xs text-slate-400 font-medium">
                جنسیت: {patient.sex === "female" ? "خانم" : "آقا"}
              </span>

              {/* Office Origin Badge */}
              {patient.officeName && (
                <span className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40">
                  <Building2 className="h-3 w-3" />
                  {patient.officeName}
                </span>
              )}
            </div>

            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {formatPersianNumber(patient.phone)}
              </span>
              {patient.nationalId && (
                <span className="flex items-center gap-1.5 font-mono">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  کدملی: {formatPersianNumber(patient.nationalId)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                مجموع مراجعات: {formatPersianNumber(visits.length)} بار
              </span>
            </div>

            {/* Allergies & Chronic Conditions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>حساسیت دارویی: {patient.allergies.join("، ")}</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">بدون آلرژی دارویی گزارش‌شده</span>
              )}

              {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                  <Activity className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>سابقه: {patient.chronicConditions.join("، ")}</span>
                </div>
              )}

              {/* Shared with others indicator */}
              {activeShares.length > 0 && (
                <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Share2 className="h-3 w-3" />
                  اشتراک با {activeShares.length} همکار
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Last Vitals Snapshot & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {lastVisit?.vitals?.systolicBp && (
            <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-3 text-right dark:border-slate-800 dark:bg-slate-900/90 shadow-sm flex flex-col justify-center min-w-[130px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                آخرین علائم حیاتی ({lastVisit.visitDate})
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(lastVisit.vitals.systolicBp)}/
                  {formatPersianNumber(lastVisit.vitals.diastolicBp || 0)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">mmHg</span>
              </div>
              {bpStatus && (
                <span className={`text-[10px] font-bold mt-0.5 ${bpStatus.color}`}>
                  {bpStatus.label}
                </span>
              )}
            </div>
          )}

          <div className="flex sm:flex-col gap-2 shrink-0">
            {!isReadOnly && (
              <Button
                onClick={onStartNewVisit}
                size="default"
                className="flex-1 sm:flex-none shadow-md shadow-emerald-600/20"
              >
                <PlusCircle className="h-4 w-4" />
                <span>ثبت ویزیت جدید</span>
              </Button>
            )}

            <div className="flex gap-2">
              <Button
                onClick={onEditPatient}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>ویرایش</span>
              </Button>

              {onOpenShareModal && (
                <Button
                  onClick={onOpenShareModal}
                  variant="outline"
                  size="sm"
                  title="اشتراک‌گذاری پرونده با همکار"
                  className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>اشتراک</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
