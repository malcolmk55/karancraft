"use client";

import * as React from "react";
import { useTheme } from "next-themes";
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
  Menu,
  X,
  Laptop,
  BarChart2,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const [currentUser, setCurrentUser] = React.useState<User>(getActiveUser());
  const [activeOfficeId, setActiveOfficeIdState] = React.useState<string | null>(
    getActiveOfficeId()
  );
  const [allOffices, setAllOffices] = React.useState<MedicalOffice[]>(getOffices());
  const users = getUsers();

  React.useEffect(() => {
    setMounted(true);
    setCurrentUser(getActiveUser());
    setActiveOfficeIdState(getActiveOfficeId());
    setAllOffices(getOffices());
  }, []);

  const toggleDarkMode = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
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
    setIsMobileMenuOpen(false);
    if (onOfficeChange) onOfficeChange(officeId);
  };

  const currentOfficeName = React.useMemo(() => {
    if (!activeOfficeId) return "همه مطب‌ها (یکپارچه)";
    const found = allOffices.find((o) => o.id === activeOfficeId);
    return found ? found.name : "مطب اصلی";
  }, [activeOfficeId, allOffices]);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex h-16 sm:h-17 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2">
        {/* Brand & Office Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/20">
            <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 truncate">
                مطب هوشمند <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">MediDoc</span>
              </span>
              <span className="hidden sm:inline-flex rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                نسخه ۲.۰
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate hidden xs:block">
              سامانه پرونده الکترونیک و مدیریت بالینی مطب
            </p>
          </div>
        </div>

        {/* Center: Desktop Multi-Office Selector & Speed Badge */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Office Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOfficeMenuOpen(!isOfficeMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="تغییر مطب فعال"
            >
              <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span className="max-w-[140px] truncate">{currentOfficeName}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
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
                    <span className="text-[10px] text-teal-600 dark:text-teal-400">یکپارچگی اسناد</span>
                  </div>

                  <div
                    onClick={() => handleSelectOffice(null)}
                    className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer text-xs transition-colors ${
                      activeOfficeId === null
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>همه مطب‌ها (نمای یکپارچه کلیه بیماران)</span>
                    {activeOfficeId === null && <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />}
                  </div>

                  {allOffices.map((off) => {
                    const isSelected = activeOfficeId === off.id;
                    return (
                      <div
                        key={off.id}
                        onClick={() => handleSelectOffice(off.id)}
                        className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {off.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{off.city || "تهران"}</p>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />}
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
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>افزودن مطب جدید...</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Actions, Theme, Role/User, and Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Action: New Patient */}
          <Button
            onClick={onOpenNewPatientModal}
            size="sm"
            className="gap-1.5 h-9 px-3 text-xs sm:text-sm font-semibold"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">بیمار جدید</span>
          </Button>

          {/* Desktop Toolbar Icons */}
          <div className="hidden lg:flex items-center gap-1">
            <Button
              onClick={onOpenEfficiencyModal}
              variant="ghost"
              size="iconSm"
              title="آمار و شاخص‌های بهره‌وری مطب"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <BarChart2 className="h-4 w-4" />
            </Button>

            <Button
              onClick={onOpenNetworkModal}
              variant="ghost"
              size="iconSm"
              title="شبکه پزشکان و پرونده‌های مشترک"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button
              onClick={onOpenSubscriptionModal}
              variant="ghost"
              size="iconSm"
              title="طرح اشتراک و پرداخت"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Crown className="h-4 w-4" />
            </Button>

            <Button
              onClick={onOpenTemplateModal}
              variant="ghost"
              size="iconSm"
              title="کتابخانه قالب‌های بالینی"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Layers className="h-4 w-4" />
            </Button>

            <Button
              onClick={onOpenBackupModal}
              variant="ghost"
              size="iconSm"
              title="پشتیبان‌گیری داده‌ها (JSON)"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <Database className="h-4 w-4" />
            </Button>

            <Button
              onClick={onOpenAdminModal}
              variant="ghost"
              size="iconSm"
              title="پنل مدیریت کل سیستم (Admin Console)"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ShieldAlert className="h-4 w-4" />
            </Button>
          </div>

          {/* Theme Toggle Button (Light / Dark) */}
          <Button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            variant="outline"
            size="iconSm"
            aria-label="تغییر تم تاریک و روشن"
            title={isDark ? "تغییر به تم روشن" : "تغییر به تم تاریک"}
            className="border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800 h-9 w-9"
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700 transition-transform rotate-0" />
              )
            ) : (
              <span className="h-4 w-4 block rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            )}
          </Button>

          {/* Multi-Role / User Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-white p-1 sm:pl-2.5 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 transition-all text-xs"
              title="تغییر نقش کاربری"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="text-right hidden md:block">
                <span className="block font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                  {currentUser.role === "admin"
                    ? "مدیر ارشد"
                    : currentUser.role === "receptionist"
                    ? "منشی مطب"
                    : "پزشک معالج"}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                    <span>سوییچ نقش کاربری (RBAC)</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400">مدیریت دسترسی</span>
                  </div>

                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`flex items-center justify-between rounded-xl p-2.5 cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            {u.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {u.role === "admin"
                              ? "مدیر ارشد سامانه (دسترسی کامل)"
                              : u.role === "doctor"
                              ? "پزشک معالج (ثبت ویزیت و بالینی)"
                              : "منشی مطب (پذیرش و تشکیل پرونده)"}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Mobile & Tablet Menu Toggle Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="iconSm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800 h-9 w-9"
              aria-label="منوی ابزارها"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Panel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 dark:border-slate-800 dark:bg-slate-900/98 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {/* Active Office Mobile Switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 block">
              مطب فعال فعلی:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectOffice(null)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${
                  activeOfficeId === null
                    ? "bg-teal-600 text-white border-teal-600"
                    : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                همه مطب‌ها (یکپارچه)
              </button>
              {allOffices.map((off) => (
                <button
                  key={off.id}
                  type="button"
                  onClick={() => handleSelectOffice(off.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    activeOfficeId === off.id
                      ? "bg-teal-600 text-white border-teal-600"
                      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {off.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenNewOfficeModal();
                }}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold border border-dashed border-teal-600/50 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800/60"
              >
                + مطب جدید
              </button>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenEfficiencyModal();
              }}
              className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-right"
            >
              <BarChart2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>بهره‌وری مطب</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenNetworkModal();
              }}
              className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-right"
            >
              <Share2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>شبکه پزشکان</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSubscriptionModal();
              }}
              className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-right"
            >
              <Crown className="h-4 w-4 text-amber-500 shrink-0" />
              <span>طرح اشتراک</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTemplateModal();
              }}
              className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-right"
            >
              <Layers className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
              <span>قالب‌های بالینی</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBackupModal();
              }}
              className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-right"
            >
              <Database className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
              <span>پشتیبان‌گیری</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAdminModal();
              }}
              className="col-span-2 flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60"
            >
              <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0" />
              <span>کنسول مدیریت سامانه (Admin)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
