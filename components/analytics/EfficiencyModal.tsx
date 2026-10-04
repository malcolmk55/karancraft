"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ClinicEfficiencyMetrics } from "@/types/medical";
import { formatPersianNumber } from "@/lib/utils";
import {
  Zap,
  Clock,
  TrendingUp,
  CheckCircle,
  Award,
} from "lucide-react";

interface EfficiencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ClinicEfficiencyMetrics;
}

export function EfficiencyModal({
  isOpen,
  onClose,
  metrics,
}: EfficiencyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <span>گزارش بهره‌وری و سنجش سرعت مطب</span>
        </div>
      }
      description="ارزیابی شاخص کلیدی: سرعت ثبت پرونده و پذیرش فرم‌های ساختاریافته"
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Highlight Card */}
        <div className="relative overflow-hidden rounded-2xl bg-teal-700 p-5 sm:p-6 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-teal-200">
                میانگین زمان ثبت پرونده در MediDoc
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono">
                  {formatPersianNumber(metrics.avgDurationSeconds)}
                </span>
                <span className="text-base sm:text-lg font-semibold text-teal-100">ثانیه / ویزیت</span>
              </div>
              <p className="mt-2 text-xs text-teal-100/90 leading-relaxed max-w-md">
                ثبت داده‌های استاندارد بالینی با چند کلیک بدون نیاز به تایپ طولانی، زمان مستندسازی را به حداقل ممکن می‌رساند.
              </p>
            </div>

            <div className="rounded-xl bg-white/10 backdrop-blur-md p-3.5 sm:p-4 text-center border border-white/20 shrink-0">
              <span className="block text-[11px] text-teal-100 font-medium mb-0.5">
                زمان صرفه‌جویی‌شده تا امروز
              </span>
              <span className="text-2xl md:text-3xl font-black font-mono">
                {formatPersianNumber(metrics.estimatedMinutesSaved)}
              </span>
              <span className="block text-[10px] text-teal-200 mt-0.5">دقیقه زمان پزشک</span>
            </div>
          </div>
        </div>

        {/* 4 Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="rounded-xl border border-slate-200 p-3.5 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">کل ویزیت‌ها</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatPersianNumber(metrics.totalVisits)}
            </span>
            <span className="block text-[10px] text-teal-600 dark:text-teal-400 mt-1 font-semibold">
              {formatPersianNumber(metrics.finalizedVisits)} ویزیت نهایی
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 p-3.5 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">نرخ ساختاریافته</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatPersianNumber(metrics.structuredAdoptionRate)}٪
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">پوشش قالب‌های بالینی</span>
          </div>

          <div className="rounded-xl border border-slate-200 p-3.5 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">عبارت‌های انتخابی</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatPersianNumber(metrics.structuredPhrasesUsedCount)}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">واژگان بالینی استاندارد</span>
          </div>

          <div className="rounded-xl border border-slate-200 p-3.5 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">متن آزاد تکمیلی</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatPersianNumber(metrics.fallbackTextUsedCount)}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">موارد خاص خارج از الگو</span>
          </div>
        </div>

        {/* Clinical Note from Roadmap */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>یکپارچگی و آمادگی هوش مصنوعی:</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            داده‌های ثبت‌شده با کدهای مرجع استاندارد ساختاریافته ذخیره می‌شوند تا زمینه پردازش خودکار صوتی و مدل‌های پشتیبان بالینی آماده باشد.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={onClose} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
            بستن
          </Button>
        </div>
      </div>
    </Modal>
  );
}
