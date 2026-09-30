"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpecialtyTemplatePhrase, SpecialtyType, TemplateSection } from "@/types/medical";
import { addCustomTemplatePhrase, getTemplates } from "@/lib/storage";
import { formatPersianNumber } from "@/lib/utils";
import { Plus, Search, Check, Layers, BookOpen } from "lucide-react";

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateAdded: () => void;
}

export function TemplateManagerModal({
  isOpen,
  onClose,
  onTemplateAdded,
}: TemplateManagerModalProps) {
  const [templates, setTemplates] = React.useState<SpecialtyTemplatePhrase[]>([]);
  const [activeSpecialty, setActiveSpecialty] = React.useState<SpecialtyType>("internal");
  const [activeSection, setActiveSection] = React.useState<TemplateSection>("chief_complaint");
  const [search, setSearch] = React.useState("");

  // New phrase form
  const [isAdding, setIsAdding] = React.useState(false);
  const [newText, setNewText] = React.useState("");
  const [newCode, setNewCode] = React.useState("");
  const [newGroup, setNewGroup] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setTemplates(getTemplates());
      setIsAdding(false);
      setNewText("");
    }
  }, [isOpen]);

  const filtered = React.useMemo(() => {
    return templates.filter((t) => {
      const matchSpec = t.specialty === activeSpecialty || t.specialty === "general";
      const matchSec = t.section === activeSection;
      const matchSearch =
        !search ||
        t.phraseText.includes(search) ||
        t.code?.toLowerCase().includes(search.toLowerCase()) ||
        t.systemGroup?.includes(search);
      return matchSpec && matchSec && matchSearch;
    });
  }, [templates, activeSpecialty, activeSection, search]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    addCustomTemplatePhrase({
      phraseText: newText.trim(),
      code: newCode.trim() || undefined,
      systemGroup: newGroup.trim() || undefined,
      section: activeSection,
      specialty: activeSpecialty,
    });

    setTemplates(getTemplates());
    setNewText("");
    setNewCode("");
    setNewGroup("");
    setIsAdding(false);
    onTemplateAdded();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-600" />
          <span>کتابخانه عبارت‌های آماده بالینی (قالب‌های ویزیت)</span>
        </div>
      }
      description="مشاهده و شخصی‌سازی عبارت‌های ساختاریافته برای هر تخصص"
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Specialty filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex rounded-xl border border-slate-200 p-1 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveSpecialty("internal")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                activeSpecialty === "internal"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              تخصص بیماری‌های داخلی
            </button>
            <button
              type="button"
              onClick={() => setActiveSpecialty("general")}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                activeSpecialty === "general"
                  ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              پزشکی عمومی
            </button>
          </div>

          <div className="w-full sm:w-60">
            <Input
              placeholder="جست‌وجو در عبارت‌ها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveSection("chief_complaint")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeSection === "chief_complaint"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            شکایات اصلی (Chief Complaints)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("exam_finding")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeSection === "exam_finding"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            معاینات بالینی (Physical Exam)
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("diagnosis")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 ${
              activeSection === "diagnosis"
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            تشخیص‌های بالینی (Diagnosis)
          </button>
        </div>

        {/* Action: Add custom phrase */}
        {!isAdding ? (
          <div className="flex justify-between items-center pt-1">
            <span className="text-xs text-slate-500">
              تعداد موارد: {formatPersianNumber(filtered.length)} عبارت آماده
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAdding(true)}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              افزودن عبارت سفارشی جدید
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3"
          >
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              افزودن عبارت بالینی جدید به دسته فعال:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <Input
                  placeholder="متن عبارت بالینی..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="h-9 text-xs"
                  autoFocus
                />
              </div>
              <div>
                <Input
                  placeholder={
                    activeSection === "exam_finding"
                      ? "دستگاه (مثال: قلبی-عروقی)"
                      : "کد اختصاری یا ICD (اختیاری)"
                  }
                  value={activeSection === "exam_finding" ? newGroup : newCode}
                  onChange={(e) =>
                    activeSection === "exam_finding"
                      ? setNewGroup(e.target.value)
                      : setNewCode(e.target.value)
                  }
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
              >
                انصراف
              </Button>
              <Button type="submit" size="sm">
                ذخیره در کتابخانه
              </Button>
            </div>
          </form>
        )}

        {/* Phrases List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.phraseText}
                </span>
                {item.systemGroup && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {item.systemGroup}
                  </span>
                )}
              </div>
              {item.code && (
                <span className="font-mono text-[11px] text-slate-400">
                  {item.code}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            بستن
          </Button>
        </div>
      </div>
    </Modal>
  );
}
