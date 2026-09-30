"use client";

import * as React from "react";
import { Visit } from "@/types/medical";
import { formatPersianNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Activity,
  FileCheck2,
  FileEdit,
  Printer,
  ChevronDown,
  ChevronUp,
  Eye,
  Zap,
} from "lucide-react";
import { evaluateBloodPressure, evaluateTemperature } from "@/lib/vitals-analyzer";

interface PatientTimelineProps {
  visits: Visit[];
  onSelectVisit: (visit: Visit) => void;
  onEditDraftVisit: (visit: Visit) => void;
  onPrintVisit: (visit: Visit) => void;
}

export function PatientTimeline({
  visits,
  onSelectVisit,
  onEditDraftVisit,
  onPrintVisit,
}: PatientTimelineProps) {
  const [expandedVisitId, setExpandedVisitId] = React.useState<string | null>(
    visits[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedVisitId((prev) => (prev === id ? null : id));
  };

  if (visits.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <Stethoscope className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
          هنوز هیچ ویزیتی برای این بیمار ثبت نشده است
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          برای شروع، بر روی دکمه «ثبت ویزیت جدید» کلیک کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h3 className="flex items-center gap-2 text-base font-black text-slate-900 dark:text-slate-100">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <span>خط زمانی مراجعات و ویزیت‌ها ({formatPersianNumber(visits.length)})</span>
        </h3>
        <span className="text-xs text-slate-400">به ترتیب از جدیدترین به قدیمی‌ترین</span>
      </div>

      <div className="relative border-r-2 border-slate-200 pr-5 mr-3 space-y-6 dark:border-slate-800">
        {visits.map((visit) => {
          const isExpanded = expandedVisitId === visit.id;
          const isDraft = visit.status === "draft";
          const bpStatus = evaluateBloodPressure(
            visit.vitals.systolicBp,
            visit.vitals.diastolicBp
          );
          const tempStatus = evaluateTemperature(visit.vitals.temperature);

          return (
            <div key={visit.id} className="relative group">
              {/* Timeline dot */}
              <div
                className={`absolute -right-[27px] top-4.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-950 transition-transform group-hover:scale-125 ${
                  isDraft
                    ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                    : "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                }`}
              />

              <div
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isDraft
                    ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/10"
                    : "border-slate-200 bg-white/90 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90"
                }`}
              >
                {/* Header (Always Visible) */}
                <div
                  onClick={() => toggleExpand(visit.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-black text-slate-900 dark:text-slate-100">
                      {visit.visitDate}
                    </span>

                    <Badge
                      variant={isDraft ? "amber" : "emerald"}
                      className="gap-1 font-bold text-[11px]"
                    >
                      {isDraft ? (
                        <>
                          <FileEdit className="h-3 w-3" />
                          <span>پیش‌نویس</span>
                        </>
                      ) : (
                        <>
                          <FileCheck2 className="h-3 w-3" />
                          <span>تایید نهایی</span>
                        </>
                      )}
                    </Badge>

                    <Badge variant="secondary" className="text-[11px]">
                      {visit.specialty === "internal" ? "داخلی" : "عمومی"}
                    </Badge>

                    <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <User className="h-3 w-3 text-slate-400" />
                      {visit.doctorName}
                    </span>

                    {visit.durationSeconds > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        <Zap className="h-2.5 w-2.5 text-emerald-500" />
                        ثبت در {formatPersianNumber(visit.durationSeconds)} ثانیه
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>{isExpanded ? "بستن جزئیات" : "مشاهده خلاصه"}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Encounter Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 sm:p-5 space-y-4 dark:border-slate-800 animate-in fade-in duration-150">
                    {/* Chief Complaints */}
                    {visit.chiefComplaintsText && visit.chiefComplaintsText.length > 0 && (
                      <div>
                        <span className="block text-xs font-bold text-slate-400 mb-1.5">
                          شکایت اصلی بیمار (Chief Complaint)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {visit.chiefComplaintsText.map((cc, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                            >
                              {cc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vitals Summary Pill Strip */}
                    <div>
                      <span className="block text-xs font-bold text-slate-400 mb-1.5">
                        علائم حیاتی ثبت‌شده (Vitals)
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {visit.vitals.systolicBp && (
                          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60 font-mono">
                            <span className="text-slate-400">BP:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatPersianNumber(visit.vitals.systolicBp)}/
                              {formatPersianNumber(visit.vitals.diastolicBp || 0)}
                            </span>
                            {bpStatus && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${bpStatus.badgeClass}`}
                              >
                                {bpStatus.label}
                              </span>
                            )}
                          </div>
                        )}

                        {visit.vitals.pulse && (
                          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60 font-mono">
                            <span className="text-slate-400">HR:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatPersianNumber(visit.vitals.pulse)} bpm
                            </span>
                          </div>
                        )}

                        {visit.vitals.temperature && (
                          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60 font-mono">
                            <span className="text-slate-400">Temp:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatPersianNumber(visit.vitals.temperature)}°C
                            </span>
                            {tempStatus && tempStatus.status !== "normal" && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${tempStatus.badgeClass}`}
                              >
                                {tempStatus.label}
                              </span>
                            )}
                          </div>
                        )}

                        {visit.vitals.spo2 && (
                          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60 font-mono">
                            <span className="text-slate-400">SpO2:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatPersianNumber(visit.vitals.spo2)}%
                            </span>
                          </div>
                        )}

                        {visit.vitals.bloodGlucose && (
                          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60 font-mono">
                            <span className="text-slate-400">BS:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatPersianNumber(visit.vitals.bloodGlucose)} mg/dL
                            </span>
                          </div>
                        )}

                        {visit.vitals.weight && (
                          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60 font-mono">
                            <span className="text-slate-400">Weight:</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {formatPersianNumber(visit.vitals.weight)} kg
                            </span>
                            {visit.vitals.bmi && (
                              <span className="text-slate-500 text-[11px]">
                                (BMI: {formatPersianNumber(visit.vitals.bmi)})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Physical Exam Findings */}
                    {visit.examFindingsText && visit.examFindingsText.length > 0 && (
                      <div>
                        <span className="block text-xs font-bold text-slate-400 mb-1.5">
                          یافته‌های معاینه فیزیکی (Physical Examination)
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                          {visit.examFindingsText.map((pe, i) => (
                            <li key={i}>{pe}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Diagnoses */}
                    {visit.diagnosesText && visit.diagnosesText.length > 0 && (
                      <div>
                        <span className="block text-xs font-bold text-slate-400 mb-1.5">
                          تشخیص بالینی (Assessment & Diagnosis)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {visit.diagnosesText.map((dx, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40"
                            >
                              {dx}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Plan Notes */}
                    {visit.planNotes && (
                      <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800">
                        <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                          طرح درمان و توصیه‌ها (Plan & Prescription)
                        </span>
                        <p className="whitespace-pre-line text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                          {visit.planNotes}
                        </p>
                      </div>
                    )}

                    {/* Free Text Fallback Warning (if any) */}
                    {visit.freeTextFallback && (
                      <div className="rounded-xl bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                        <span className="font-bold block mb-0.5">
                          یادداشت تکمیلی خارج از قالب (Fallback Note):
                        </span>
                        <p>{visit.freeTextFallback}</p>
                      </div>
                    )}

                    {/* Actions Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">
                        شناسه ویزیت: <span className="font-mono">{visit.id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDraft && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onEditDraftVisit(visit)}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            <FileEdit className="h-3.5 w-3.5" />
                            تکمیل و نهایی‌سازی پیش‌نویس
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectVisit(visit)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          مشاهده کامل
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onPrintVisit(visit)}
                        >
                          <Printer className="h-3.5 w-3.5" />
                          چاپ خلاصه
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
