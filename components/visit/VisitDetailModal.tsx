"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient, Visit } from "@/types/medical";
import { formatPersianNumber } from "@/lib/utils";
import { evaluateBloodPressure, evaluateTemperature } from "@/lib/vitals-analyzer";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Activity,
  Heart,
  FileCheck2,
  FileEdit,
  Printer,
  Zap,
} from "lucide-react";

interface VisitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit | null;
  patient: Patient | null;
  onPrint: () => void;
  onEditDraft?: (visit: Visit) => void;
}

export function VisitDetailModal({
  isOpen,
  onClose,
  visit,
  patient,
  onPrint,
  onEditDraft,
}: VisitDetailModalProps) {
  if (!visit || !patient) return null;

  const isDraft = visit.status === "draft";
  const bpStatus = evaluateBloodPressure(
    visit.vitals.systolicBp,
    visit.vitals.diastolicBp
  );
  const tempStatus = evaluateTemperature(visit.vitals.temperature);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>پرونده ویزیت مورخ {visit.visitDate}</span>
          <Badge variant={isDraft ? "amber" : "emerald"}>
            {isDraft ? "پیش‌نویس" : "تایید نهایی"}
          </Badge>
        </div>
      }
      description={`بیمار: ${patient.fullName} • پزشک: ${visit.doctorName}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Speed & Metadata banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">تخصص:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {visit.specialty === "internal" ? "بیماری‌های داخلی" : "پزشکی عمومی"}
            </span>
          </div>

          {visit.durationSeconds > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <Zap className="h-3.5 w-3.5" />
              <span>
                سرعت ثبت: {formatPersianNumber(visit.durationSeconds)} ثانیه (تکمیل سریع)
              </span>
            </div>
          )}

          <div className="text-slate-400 font-mono text-[11px]">
            شناسه: {visit.id}
          </div>
        </div>

        {/* Chief Complaints */}
        {visit.chiefComplaintsText && visit.chiefComplaintsText.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              شکایت اصلی بیمار (Chief Complaint)
            </h4>
            <div className="flex flex-wrap gap-2">
              {visit.chiefComplaintsText.map((cc, i) => (
                <span
                  key={i}
                  className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                >
                  {cc}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Vitals Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            علائم حیاتی ثبت‌شده (Vitals)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {visit.vitals.systolicBp && (
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">فشار خون (BP)</span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(visit.vitals.systolicBp)}/
                  {formatPersianNumber(visit.vitals.diastolicBp || 0)} mmHg
                </span>
                {bpStatus && (
                  <span className={`block text-[10px] font-bold mt-1 ${bpStatus.color}`}>
                    {bpStatus.label}
                  </span>
                )}
              </div>
            )}

            {visit.vitals.pulse && (
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">ضربان قلب (HR)</span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(visit.vitals.pulse)} bpm
                </span>
              </div>
            )}

            {visit.vitals.temperature && (
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">دمای بدن (Temp)</span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(visit.vitals.temperature)} °C
                </span>
              </div>
            )}

            {visit.vitals.spo2 && (
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">اکسیژن (SpO2)</span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(visit.vitals.spo2)}%
                </span>
              </div>
            )}

            {visit.vitals.bloodGlucose && (
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">قند خون (BS)</span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(visit.vitals.bloodGlucose)} mg/dL
                </span>
              </div>
            )}

            {visit.vitals.weight && (
              <div className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-900">
                <span className="text-slate-400 block text-[10px]">وزن و BMI</span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(visit.vitals.weight)} kg
                </span>
                {visit.vitals.bmi && (
                  <span className="block text-[10px] text-slate-500">
                    BMI: {formatPersianNumber(visit.vitals.bmi)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Physical Exam */}
        {visit.examFindingsText && visit.examFindingsText.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              معاینه فیزیکی (Physical Exam)
            </h4>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-850/40">
              <ul className="list-disc list-inside space-y-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                {visit.examFindingsText.map((pe, i) => (
                  <li key={i}>{pe}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Diagnoses */}
        {visit.diagnosesText && visit.diagnosesText.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              تشخیص بالینی (Diagnosis)
            </h4>
            <div className="flex flex-wrap gap-2">
              {visit.diagnosesText.map((dx, i) => (
                <span
                  key={i}
                  className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
                >
                  {dx}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Plan Notes */}
        {visit.planNotes && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              دستورات درمانی، داروها و توصیه‌ها (Plan)
            </h4>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-850/40">
              <p className="whitespace-pre-line text-xs font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                {visit.planNotes}
              </p>
            </div>
          </div>
        )}

        {/* Free text fallback if used */}
        {visit.freeTextFallback && (
          <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-bold block mb-1">یادداشت متن آزاد (Fallback):</span>
            <p>{visit.freeTextFallback}</p>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            بستن
          </Button>

          <div className="flex items-center gap-2">
            {isDraft && onEditDraft && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onEditDraft(visit);
                }}
                className="gap-2"
              >
                <FileEdit className="h-4 w-4" />
                <span>ویرایش پیش‌نویس</span>
              </Button>
            )}

            <Button onClick={onPrint} className="gap-2">
              <Printer className="h-4 w-4" />
              <span>چاپ خلاصه پرونده</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
