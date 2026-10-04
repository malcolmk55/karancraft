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
import { PatientAvatar } from "@/components/patient/PatientAvatar";

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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 p-4 sm:p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        {/* Left: Avatar & Demographics */}
        <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
          <PatientAvatar
            sex={patient.sex}
            name={patient.fullName}
            size="xl"
          />

          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 truncate">
                {patient.fullName}
              </h1>
              {patient.age && (
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {formatPersianNumber(patient.age)} ساله
                </span>
              )}
              {patient.bloodType && (
                <Badge variant="outline" className="flex items-center gap-1 font-mono text-[11px] border-slate-200 dark:border-slate-700">
                  <Droplet className="h-3 w-3 text-rose-500" />
                  {patient.bloodType}
                </Badge>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {patient.sex === "female" ? "خانم" : "آقا"}
              </span>

              {/* Office Origin Badge */}
              {patient.officeName && (
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                  <Building2 className="h-3 w-3 text-slate-500" />
                  {patient.officeName}
                </span>
              )}
            </div>

            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
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
                مجموع مراجعات: {formatPersianNumber(visits.length)}
              </span>
            </div>

            {/* Clinical Alerts (Allergies & Chronic Conditions) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {patient.allergies && patient.allergies.length > 0 ? (
                <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span>حساسیت دارویی: {patient.allergies.join("، ")}</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  بدون آلرژی دارویی گزارش‌شده
                </span>
              )}

              {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                  <Activity className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>سابقه: {patient.chronicConditions.join("، ")}</span>
                </div>
              )}

              {/* Shared with others indicator */}
              {activeShares.length > 0 && (
                <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                  <Share2 className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                  اشتراک با {formatPersianNumber(activeShares.length)} پزشک
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Last Vitals Snapshot & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          {lastVisit?.vitals?.systolicBp && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-right dark:border-slate-700/80 dark:bg-slate-800/70 flex flex-col justify-center min-w-[130px]">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
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
                className="flex-1 sm:flex-none font-semibold"
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
                className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>ویرایش پرونده</span>
              </Button>

              {onOpenShareModal && (
                <Button
                  onClick={onOpenShareModal}
                  variant="outline"
                  size="sm"
                  title="اشتراک‌گذاری پرونده با همکار"
                  className="gap-1 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
