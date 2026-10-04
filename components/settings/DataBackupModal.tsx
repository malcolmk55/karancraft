"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { exportClinicData, importClinicData, resetClinicToDefaults } from "@/lib/storage";
import { Download, Upload, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Database } from "lucide-react";

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export function DataBackupModal({
  isOpen,
  onClose,
  onDataRestored,
}: DataBackupModalProps) {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const dataStr = exportClinicData();
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `medidoc_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFeedback({
        type: "success",
        text: "فایل پشتیبان کامل با موفقیت ذخیره شد.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        text: "خطا در دانلود فایل پشتیبان: " + String(err),
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = importClinicData(content);
      if (result.success) {
        setFeedback({ type: "success", text: result.message });
        onDataRestored();
      } else {
        setFeedback({ type: "error", text: result.message });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReset = () => {
    if (confirm("آیا از بازگردانی داده‌های پیش‌فرض بالینی اطمینان دارید؟")) {
      resetClinicToDefaults();
      setFeedback({
        type: "success",
        text: "اطلاعات مطب به داده‌های نمونه اولیه بازگردانی شد.",
      });
      onDataRestored();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          <span>پشتیبان‌گیری و مدیریت پایگاه داده</span>
        </div>
      }
      description="ذخیره‌سازی سریع آفلاین، قابلیت جابه‌جایی کامل داده‌ها و استقلال از اینترنت"
      maxWidth="2xl"
    >
      <div className="space-y-4 sm:space-y-5">
        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-teal-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Action 1: Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              دریافت نسخه پشتیبان کامل (JSON)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              شامل پرونده کلیه بیماران، مراجعات، قالب‌های سفارشی و تنظیمات.
            </p>
          </div>
          <Button onClick={handleExport} size="sm" className="shrink-0 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs">
            <Download className="h-3.5 w-3.5" />
            دانلود فایل
          </Button>
        </div>

        {/* Action 2: Import */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              بازیابی از فایل پشتیبان (Import)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              بارگذاری فایل پشتیبان قبلی روی این سیستم یا جابه‌جایی اطلاعات.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="medidoc-backup-input"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 gap-1.5 border-slate-200 dark:border-slate-700 text-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              انتخاب فایل
            </Button>
          </div>
        </div>

        {/* Action 3: Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-slate-400" />
              بازنشانی داده‌های نمونه اولیه
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              بارگذاری پرونده‌های نمونه بالینی برای آشنایی با امکانات نرم‌افزار.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="shrink-0 text-slate-600 hover:text-rose-600 text-xs"
          >
            بازنشانی نمونه‌ها
          </Button>
        </div>

        {/* Security & Offline Note */}
        <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 dark:bg-slate-900/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>پایداری داده‌ها و امنیت بالا</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
            داده‌های مطب شما در سیستم محلی ذخیره شده و مستقل از قطعی‌های خارجی، امنیت و دسترسی بدون وقفه شما را تضمین می‌کند.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            بستن
          </Button>
        </div>
      </div>
    </Modal>
  );
}
