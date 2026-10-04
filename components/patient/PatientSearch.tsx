"use client";

import * as React from "react";
import { Search, UserPlus, Phone, CreditCard, ChevronLeft, Clock, Activity, X } from "lucide-react";
import { Patient } from "@/types/medical";
import { searchPatients } from "@/lib/storage";
import { formatPersianNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PatientAvatar } from "@/components/patient/PatientAvatar";

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
      if (
        (e.ctrlKey && e.key === "k") ||
        (e.key === "/" &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  React.useEffect(() => {
    const matches = searchPatients(query);
    setResults(matches);
    setSelectedIndex(-1);
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
        <div className="pointer-events-none absolute right-3.5 text-teal-600 dark:text-teal-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="جست‌وجوی فوری بیمار (نام، کدملی، تماس)..."
          className="h-12 sm:h-13 w-full rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md pr-11 pl-20 sm:pl-28 text-sm md:text-base font-medium text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500"
        />
        <div className="absolute left-2.5 sm:left-3 flex items-center gap-1.5">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="پاک کردن"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              Ctrl+K
            </kbd>
          )}

          <button
            type="button"
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-1 rounded-xl bg-teal-600 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
            title="تشکیل پرونده بیمار جدید"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">تشکیل پرونده</span>
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
          <div className="absolute right-0 left-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-xl p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900/98 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
              <span>نتایج جست‌وجو ({formatPersianNumber(results.length)} پرونده)</span>
              <span className="text-[11px] hidden sm:inline">با کلیدهای ↑ و ↓ جابه‌جا شوید</span>
            </div>

            {results.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  پرونده‌ای با این مشخصات یافت نشد.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsFocused(false);
                    onOpenNewPatientModal();
                  }}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 text-slate-800 px-3.5 py-1.5 text-xs font-semibold hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  تشکیل پرونده جدید
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
                      className={`group flex items-center justify-between rounded-xl p-2.5 sm:p-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                          : "hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <PatientAvatar sex={patient.sex} name={patient.fullName} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                              {patient.fullName}
                            </span>
                            {patient.age && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                                ({formatPersianNumber(patient.age)} ساله)
                              </span>
                            )}
                            {patient.bloodType && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0 border-slate-200 dark:border-slate-700">
                                {patient.bloodType}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {patient.nationalId && (
                              <span className="flex items-center gap-1 font-mono">
                                <CreditCard className="h-3 w-3 text-slate-400" />
                                {formatPersianNumber(patient.nationalId)}
                              </span>
                            )}
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-slate-400" />
                              {formatPersianNumber(patient.phone)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                          مشاهده
                        </span>
                        <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:-translate-x-0.5 transition-all" />
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
