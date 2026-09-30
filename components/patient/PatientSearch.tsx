"use client";

import * as React from "react";
import { Search, UserPlus, Phone, CreditCard, ChevronLeft, Clock, Activity } from "lucide-react";
import { Patient } from "@/types/medical";
import { searchPatients } from "@/lib/storage";
import { formatPersianNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
}

export function PatientSearch({
  onSelectPatient,
  onOpenNewPatientModal,
}: PatientSearchProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Patient[]>([]);
  const [isFocused, setIsFocused] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or '/' to focus search
  React.useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "k") || (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA")) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  React.useEffect(() => {
    const searchStartTime = performance.now();
    const matches = searchPatients(query);
    setResults(matches);
    setSelectedIndex(-1);
    const searchDuration = performance.now() - searchStartTime;
    // Log performance internally ensuring < 1s requirement
    if (searchDuration > 100) {
      console.warn(`Patient search took ${searchDuration.toFixed(1)}ms`);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsFocused(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
    setQuery("");
    setIsFocused(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute right-4 text-emerald-600 dark:text-emerald-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="جست‌وجوی فوری بیمار بر اساس نام، کدملی، شماره تماس... (کلید میانبر / یا Ctrl+K)"
          className="h-13 w-full rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md pr-12 pl-28 text-sm md:text-base font-medium text-slate-900 shadow-lg shadow-slate-100/70 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100 dark:shadow-none dark:placeholder:text-slate-500 dark:focus:border-emerald-500"
        />
        <div className="absolute left-3 flex items-center gap-1.5">
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-mono text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Ctrl+K
          </kbd>
          <button
            type="button"
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">بیمار جدید</span>
          </button>
        </div>
      </div>

      {/* Instant Dropdown Results */}
      {isFocused && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsFocused(false)}
          />
          <div className="absolute right-0 left-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
              <span>نتایج جست‌وجو ({formatPersianNumber(results.length)} پرونده)</span>
              <span className="text-[11px]">با کلیدهای ↑ و ↓ جابه‌جا شوید</span>
            </div>

            {results.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  پرونده‌ای با مشخصات وارد شده یافت نشد.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsFocused(false);
                    onOpenNewPatientModal();
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2 text-xs font-semibold hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  تشکیل پرونده سریع برای «{query}»
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((patient, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={patient.id}
                      onClick={() => handleSelect(patient)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group flex items-center justify-between rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-emerald-50/90 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100 shadow-sm"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            patient.sex === "female"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}
                        >
                          {patient.fullName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {patient.fullName}
                            </span>
                            {patient.age && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                ({formatPersianNumber(patient.age)} ساله)
                              </span>
                            )}
                            {patient.bloodType && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                {patient.bloodType}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {patient.nationalId && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3 text-slate-400" />
                                {formatPersianNumber(patient.nationalId)}
                              </span>
                            )}
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {formatPersianNumber(patient.phone)}
                            </span>
                            {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                              <span className="hidden sm:flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Activity className="h-3 w-3" />
                                {patient.chronicConditions.join("، ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          مشاهده پرونده
                        </span>
                        <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
