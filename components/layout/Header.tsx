"use client";

import * as React from "react";
import { Doctor } from "@/types/medical";
import { getAllDoctors, setActiveDoctor } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  Zap,
  Layers,
  Database,
  UserPlus,
  Moon,
  Sun,
  ChevronDown,
  User,
  ShieldCheck,
} from "lucide-react";

interface HeaderProps {
  activeDoctor: Doctor;
  onDoctorChange: (doctor: Doctor) => void;
  avgDurationSeconds: number;
  onOpenEfficiencyModal: () => void;
  onOpenTemplateModal: () => void;
  onOpenBackupModal: () => void;
  onOpenNewPatientModal: () => void;
}

export function Header({
  activeDoctor,
  onDoctorChange,
  avgDurationSeconds,
  onOpenEfficiencyModal,
  onOpenTemplateModal,
  onOpenBackupModal,
  onOpenNewPatientModal,
}: HeaderProps) {
  const [isDoctorMenuOpen, setIsDoctorMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const doctors = getAllDoctors();

  const toggleDarkMode = () => {
    const isDark = !isDarkMode;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSelectDoctor = (doc: Doctor) => {
    setActiveDoctor(doc);
    onDoctorChange(doc);
    setIsDoctorMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/25">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                مطب هوشمند <span className="text-emerald-600 dark:text-emerald-400 font-mono">MediDoc</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                نسخه ۱.۰
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              سامانه ثبت فوق‌سریع پرونده‌های بالینی و ویزیت ساختاریافته
            </p>
          </div>
        </div>

        {/* Center: Real-time Speed & Efficiency Badge */}
        <div className="hidden lg:flex items-center">
          <button
            type="button"
            onClick={onOpenEfficiencyModal}
            className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-500/20 dark:text-amber-300 transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>میانگین سرعت ثبت: {avgDurationSeconds || 26} ثانیه</span>
            <span className="text-[10px] text-amber-600 font-normal">| مشاهده آمار فاز ۱.۵</span>
          </button>
        </div>

        {/* Right: Actions & Doctor Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action: New Patient */}
          <Button
            onClick={onOpenNewPatientModal}
            size="sm"
            className="hidden sm:inline-flex gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <UserPlus className="h-4 w-4" />
            <span>بیمار جدید</span>
          </Button>

          {/* Quick Action: Templates library */}
          <Button
            onClick={onOpenTemplateModal}
            variant="outline"
            size="iconSm"
            title="کتابخانه قالب‌های بالینی"
          >
            <Layers className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </Button>

          {/* Quick Action: Backup & Restore */}
          <Button
            onClick={onOpenBackupModal}
            variant="outline"
            size="iconSm"
            title="پشتیبان‌گیری دیتابیس (JSON)"
          >
            <Database className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            onClick={toggleDarkMode}
            variant="outline"
            size="iconSm"
            title="تغییر تم"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </Button>

          {/* Active Doctor Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDoctorMenuOpen(!isDoctorMenuOpen)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pl-3 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 transition-all text-xs"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                <User className="h-4 w-4" />
              </div>
              <div className="text-right hidden md:block">
                <span className="block font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {activeDoctor.fullName}
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  {activeDoctor.specialty === "internal" ? "متخصص داخلی" : "پزشک عمومی"}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isDoctorMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDoctorMenuOpen(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    تغییر پزشک فعال مطب
                  </div>
                  {doctors.map((doc) => {
                    const isSelected = doc.id === activeDoctor.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => handleSelectDoctor(doc)}
                        className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100 font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {doc.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {doc.specialty === "internal" ? "بیماری‌های داخلی" : "پزشکی عمومی"} • نظام: {doc.medicalCouncilNumber}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
