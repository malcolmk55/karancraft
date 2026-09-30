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
        text: "فایل پشتیبان کامل مطب با موفقیت دانلود شد.",
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
          <Database className="h-5 w-5 text-emerald-600" />
          <span>پشتیبان‌گیری و مدیریت پایگاه داده مطب</span>
        </div>
      }
      description="ذخیره‌سازی سریع، هزینه میزبانی صفر (Zero-Cost Hosting) و استقلال ۱۰۰٪ از قطعی اینترنت"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Action 1: Export */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Download className="h-4 w-4 text-emerald-600" />
              دریافت نسخه پشتیبان کامل (Export JSON)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              شامل پرونده کلیه بیماران، مراجعات، قالب‌های سفارشی و تنظیمات پزشک.
            </p>
          </div>
          <Button onClick={handleExport} size="sm" className="shrink-0 gap-1.5">
            <Download className="h-3.5 w-3.5" />
            دانلود فایل
          </Button>
        </div>

        {/* Action 2: Import */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="h-4 w-4 text-blue-600" />
              بازیابی از فایل پشتیبان (Import JSON)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              بارگذاری فایل پشتیبان قبلی روی این سیستم یا جابه‌جایی به دستگاه دیگر.
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
              className="shrink-0 gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              انتخاب فایل
            </Button>
          </div>
        </div>

        {/* Action 3: Reset */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 transition-colors">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-slate-400" />
              بازنشانی به داده‌های نمونه بالینی
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              بارگذاری ۸ پرونده نمونه واقعی و ویزیت‌های ثبت‌شده برای تست امکانات.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="shrink-0 text-slate-600 hover:text-rose-600"
          >
            بازنشانی نمونه‌ها
          </Button>
        </div>

        {/* Architecture Note */}
        <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-xs text-emerald-900 dark:text-emerald-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>مزیت فنی: کمترین هزینه و بالاترین سرعت</span>
          </div>
          <p className="leading-relaxed">
            این مدل با ذخیره‌سازی محلی مقاوم و بدون وابستگی به دیتابیس‌های ابری سنگین خارجی، هزینه‌ی نگهداری سرور را به صفر رسانده و حتی در شرایط افت یا قطعی اینترنت، مطب را فعال نگه می‌دارد.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            بستن
          </Button>
        </div>
      </div>
    </Modal>
  );
}
