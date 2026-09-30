"use client";

import * as React from "react";
import { Doctor, Patient, Visit } from "@/types/medical";
import { formatPersianNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, ArrowRight } from "lucide-react";

interface VisitPrintViewProps {
  visit: Visit;
  patient: Patient;
  doctor: Doctor;
  onBack: () => void;
}

export function VisitPrintView({
  visit,
  patient,
  doctor,
  onBack,
}: VisitPrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Non-printable action bar */}
      <div className="flex items-center justify-between no-print rounded-2xl bg-slate-900 p-4 text-white">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="gap-2 text-white border-white/20 hover:bg-white/10"
        >
          <ArrowRight className="h-4 w-4" />
          <span>بازگشت به برنامه</span>
        </Button>
        <span className="text-xs font-bold text-slate-300">
          پیش‌نمایش چاپ نسخه / خلاصه ویزیت
        </span>
        <Button onClick={handlePrint} size="sm" className="gap-2">
          <Printer className="h-4 w-4" />
          <span>ارسال به چاپگر (Print)</span>
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="print-area mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-white p-8 md:p-12 text-slate-900 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-slate-900">{doctor.clinicName}</h1>
            <p className="text-sm font-bold text-slate-700 mt-1">
              {doctor.fullName} — متخصص{" "}
              {doctor.specialty === "internal" ? "بیماری‌های داخلی" : "پزشکی عمومی"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              شماره نظام پزشکی: {formatPersianNumber(doctor.medicalCouncilNumber)}
            </p>
          </div>
          <div className="text-left font-mono text-xs text-slate-500 space-y-1">
            <p>تاریخ ویزیت: {visit.visitDate}</p>
            <p>شناسه پرونده: {visit.id}</p>
            <p>نسخه الکترونیک مطب هوشمند</p>
          </div>
        </div>

        {/* Patient Demographics Bar */}
        <div className="my-6 grid grid-cols-4 gap-4 rounded-xl bg-slate-100 p-4 text-xs">
          <div>
            <span className="text-slate-500 block">نام بیمار:</span>
            <span className="font-bold text-sm text-slate-900">{patient.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">سن و جنسیت:</span>
            <span className="font-bold text-slate-900">
              {patient.age ? `${formatPersianNumber(patient.age)} ساله` : "-"} /{" "}
              {patient.sex === "female" ? "خانم" : "آقا"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">کد ملی:</span>
            <span className="font-bold font-mono text-slate-900">
              {patient.nationalId ? formatPersianNumber(patient.nationalId) : "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">شماره تماس:</span>
            <span className="font-bold font-mono text-slate-900">
              {formatPersianNumber(patient.phone)}
            </span>
          </div>
        </div>

        {/* Vitals Strip */}
        <div className="mb-6 rounded-xl border border-slate-200 p-3 text-xs">
          <span className="font-bold text-slate-500 block mb-2 text-[11px] uppercase tracking-wider">
            علائم حیاتی ثبت‌شده:
          </span>
          <div className="flex flex-wrap gap-4 font-mono">
            {visit.vitals.systolicBp && (
              <span>
                <strong>BP:</strong> {formatPersianNumber(visit.vitals.systolicBp)}/
                {formatPersianNumber(visit.vitals.diastolicBp || 0)} mmHg
              </span>
            )}
            {visit.vitals.pulse && (
              <span>
                <strong>HR:</strong> {formatPersianNumber(visit.vitals.pulse)} bpm
              </span>
            )}
            {visit.vitals.temperature && (
              <span>
                <strong>Temp:</strong> {formatPersianNumber(visit.vitals.temperature)}°C
              </span>
            )}
            {visit.vitals.spo2 && (
              <span>
                <strong>SpO2:</strong> {formatPersianNumber(visit.vitals.spo2)}%
              </span>
            )}
            {visit.vitals.weight && (
              <span>
                <strong>Weight:</strong> {formatPersianNumber(visit.vitals.weight)} kg
              </span>
            )}
          </div>
        </div>

        {/* Chief Complaints & Diagnoses */}
        <div className="mb-6 space-y-4">
          {visit.chiefComplaintsText && visit.chiefComplaintsText.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">
                شکایت اصلی:
              </span>
              <p className="text-xs font-semibold text-slate-800">
                {visit.chiefComplaintsText.join(" • ")}
              </p>
            </div>
          )}

          {visit.diagnosesText && visit.diagnosesText.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">
                تشخیص بالینی:
              </span>
              <p className="text-xs font-bold text-emerald-800">
                {visit.diagnosesText.join(" • ")}
              </p>
            </div>
          )}
        </div>

        {/* Plan & Prescription Notes */}
        <div className="mb-10 rounded-xl border border-slate-300 p-5 min-h-[160px]">
          <span className="text-xs font-black text-slate-800 block mb-2">
            دستورات دارویی، پاراکلینیک و توصیه‌های پزشک (Rx & Plan):
          </span>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-900 font-medium">
            {visit.planNotes || "بدون دستور دارویی ثبت‌شده"}
          </p>
        </div>

        {/* Signature & Stamp area */}
        <div className="flex items-end justify-between border-t border-slate-200 pt-8 mt-12 text-xs">
          <div className="text-slate-400">
            سامانه مدیریت پرونده و مطب هوشمند MediDoc — نسخه ۱
          </div>
          <div className="text-center min-w-[180px]">
            <p className="font-bold text-slate-800 mb-10">امضا و مهر پزشک</p>
            <p className="text-[11px] text-slate-500 font-mono">
              دکتر {doctor.fullName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
