"use client";

import * as React from "react";
import { Doctor, MedicalOffice, User } from "@/types/medical";
import {
  getActiveDoctor,
  getActiveOfficeId,
  getActiveUser,
  getAllDoctors,
  getOffices,
  getUsers,
  setActiveDoctor,
  setActiveOfficeId,
  setActiveUser,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Zap,
  Layers,
  Database,
  UserPlus,
  Moon,
  Sun,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  Building2,
  Share2,
  Crown,
  ShieldAlert,
  Plus,
  Check,
} from "lucide-react";

interface HeaderProps {
  activeDoctor: Doctor;
  onDoctorChange: (doctor: Doctor) => void;
  avgDurationSeconds: number;
  onOpenEfficiencyModal: () => void;
  onOpenTemplateModal: () => void;
  onOpenBackupModal: () => void;
  onOpenNewPatientModal: () => void;
  onOpenNetworkModal: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenAdminModal: () => void;
  onOpenNewOfficeModal: () => void;
  onOfficeChange?: (officeId: string | null) => void;
  onUserRoleChange?: (user: User) => void;
}

export function Header({
  activeDoctor,
  onDoctorChange,
  avgDurationSeconds,
  onOpenEfficiencyModal,
  onOpenTemplateModal,
  onOpenBackupModal,
  onOpenNewPatientModal,
  onOpenNetworkModal,
  onOpenSubscriptionModal,
  onOpenAdminModal,
  onOpenNewOfficeModal,
  onOfficeChange,
  onUserRoleChange,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isOfficeMenuOpen, setIsOfficeMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const [currentUser, setCurrentUser] = React.useState<User>(getActiveUser());
  const [activeOfficeId, setActiveOfficeIdState] = React.useState<string | null>(
    getActiveOfficeId()
  );
  const [allOffices, setAllOffices] = React.useState<MedicalOffice[]>(getOffices());
  const users = getUsers();

  React.useEffect(() => {
    setCurrentUser(getActiveUser());
    setActiveOfficeIdState(getActiveOfficeId());
    setAllOffices(getOffices());
  }, []);

  const toggleDarkMode = () => {
    const isDark = !isDarkMode;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSelectUser = (u: User) => {
    setActiveUser(u);
    setCurrentUser(u);
    setIsUserMenuOpen(false);

    if (u.role === "doctor" && u.doctorId) {
      const doc = getAllDoctors().find((d) => d.id === u.doctorId);
      if (doc) {
        setActiveDoctor(doc);
        onDoctorChange(doc);
      }
    }
    if (onUserRoleChange) onUserRoleChange(u);
  };

  const handleSelectOffice = (officeId: string | null) => {
    setActiveOfficeId(officeId);
    setActiveOfficeIdState(officeId);
    setIsOfficeMenuOpen(false);
    if (onOfficeChange) onOfficeChange(officeId);
  };

  const currentOfficeName = React.useMemo(() => {
    if (!activeOfficeId) return "همه مطب‌ها (نمای یکپارچه)";
    const found = allOffices.find((o) => o.id === activeOfficeId);
    return found ? found.name : "مطب اصلی";
  }, [activeOfficeId, allOffices]);

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
                نسخه ۲.۰
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              چند مطبی • شبکه پزشکان • پرونده مشترک • هوش مصنوعی
            </p>
          </div>
        </div>

        {/* Center: Multi-Office Switcher & Speed Badge */}
        <div className="hidden md:flex items-center gap-2">
          {/* Office Switcher Dropdown (Doc 07) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOfficeMenuOpen(!isOfficeMenuOpen)}
              className="flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-50/50 px-3.5 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-100/70 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200 transition-all"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              <span>{currentOfficeName}</span>
              <ChevronDown className="h-3 w-3 text-blue-500" />
            </button>

            {isOfficeMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOfficeMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                    <span>انتخاب مطب فعال پزشک</span>
                    <span className="text-[10px] text-blue-600">Doc 07</span>
                  </div>

                  <div
                    onClick={() => handleSelectOffice(null)}
                    className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer text-xs transition-colors ${
                      activeOfficeId === null
                        ? "bg-blue-50 text-blue-950 dark:bg-blue-950/50 dark:text-blue-100 font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>همه مطب‌ها (نمای یکپارچه کلیه بیماران)</span>
                    {activeOfficeId === null && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </div>

                  {allOffices.map((off) => {
                    const isSelected = activeOfficeId === off.id;
                    return (
                      <div
                        key={off.id}
                        onClick={() => handleSelectOffice(off.id)}
                        className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-950 dark:bg-blue-950/50 dark:text-blue-100 font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {off.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{off.city || "تهران"}</p>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                      </div>
                    );
                  })}

                  <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOfficeMenuOpen(false);
                        onOpenNewOfficeModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>افزودن مطب جدید...</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Efficiency Metric Badge */}
          <button
            type="button"
            onClick={onOpenEfficiencyModal}
            className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-500/20 dark:text-amber-300 transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>ثبت: {avgDurationSeconds || 24} ثانیه</span>
          </button>
        </div>

        {/* Right: Actions & Role / User Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Action: New Patient */}
          <Button
            onClick={onOpenNewPatientModal}
            size="sm"
            className="hidden sm:inline-flex gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <UserPlus className="h-4 w-4" />
            <span>بیمار جدید</span>
          </Button>

          {/* Doctor Network & Patient Sharing */}
          <Button
            onClick={onOpenNetworkModal}
            variant="outline"
            size="sm"
            title="شبکه پزشکان و پرونده‌های مشترک"
            className="gap-1.5 text-xs border-slate-200 dark:border-slate-800"
          >
            <Share2 className="h-4 w-4 text-emerald-600" />
            <span className="hidden lg:inline">شبکه و اشتراک</span>
          </Button>

          {/* My Subscription (Doc 08) */}
          <Button
            onClick={onOpenSubscriptionModal}
            variant="outline"
            size="sm"
            title="طرح اشتراک و پرداخت"
            className="gap-1.5 text-xs border-slate-200 dark:border-slate-800"
          >
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="hidden lg:inline">اشتراک من</span>
          </Button>

          {/* Admin Dashboard (Doc 06) */}
          <Button
            onClick={onOpenAdminModal}
            variant="outline"
            size="iconSm"
            title="پنل مدیریت کل سیستم (Admin Console)"
            className="text-slate-600 dark:text-slate-300"
          >
            <ShieldAlert className="h-4 w-4 text-rose-500" />
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

          {/* Multi-Role / User Session Switcher (Doc 06) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pl-3 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 transition-all text-xs"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl font-bold ${
                  currentUser.role === "admin"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : currentUser.role === "receptionist"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="text-right hidden sm:block">
                <span className="block font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-500 block leading-tight">
                  {currentUser.role === "admin"
                    ? "مدیر ارشد سامانه"
                    : currentUser.role === "receptionist"
                    ? "منشی مطب ونک"
                    : "پزشک متخصص"}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                    <span>سوییچ سریع نقش و کاربر (RBAC)</span>
                    <span className="text-[10px] text-emerald-600">Doc 06</span>
                  </div>

                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100 font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {u.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {u.role === "admin"
                              ? "ادمین کل سیستم (دسترسی کامل)"
                              : u.role === "doctor"
                              ? "پزشک معالج (ثبت ویزیت و پرونده)"
                              : "منشی مطب (پذیرش و اطلاعات پایه)"}
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
