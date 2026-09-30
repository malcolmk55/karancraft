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
  AlertTriangle,
  Award,
  Sparkles,
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
          <span>گزارش عملکرد و سنجش سرعت مطب (فاز ۱.۵)</span>
        </div>
      }
      description="ارزیابی معیار موفقیت کلیدی محصول: سرعت ثبت پرونده و پذیرش قالب‌های ساختاریافته"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Highlight Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-700/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                میانگین زمان تکمیل پرونده در MediDoc
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl md:text-5xl font-black font-mono">
                  {formatPersianNumber(metrics.avgDurationSeconds)}
                </span>
                <span className="text-lg font-bold text-emerald-100">ثانیه / ویزیت</span>
              </div>
              <p className="mt-2 text-xs text-emerald-100 leading-relaxed max-w-md">
                در مقایسه با ۴ تا ۵ دقیقه زمان تایپ انشا در نرم‌افزار رقیب، پزشک در کمتر از نیم دقیقه ویزیت را با دقت بالا بایگانی می‌کند.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 text-center border border-white/20 shrink-0">
              <span className="block text-[11px] text-emerald-100 font-bold mb-0.5">
                زمان صرفه‌جویی‌شده تا امروز
              </span>
              <span className="text-2xl md:text-3xl font-black font-mono">
                {formatPersianNumber(metrics.estimatedMinutesSaved)}
              </span>
              <span className="block text-[11px] text-emerald-200 mt-0.5">دقیقه وقت ارزشمند پزشک</span>
            </div>
          </div>
        </div>

        {/* 4 Stat Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200 p-4 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-400 block mb-1">کل ویزیت‌های ثبت‌شده</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatPersianNumber(metrics.totalVisits)}
            </span>
            <span className="block text-[10px] text-emerald-600 mt-1 font-bold">
              {formatPersianNumber(metrics.finalizedVisits)} ویزیت نهایی
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-400 block mb-1">نرخ پذیرش قالب ساختاریافته</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {formatPersianNumber(metrics.structuredAdoptionRate)}٪
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">پوشش قالب‌های بالینی</span>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-400 block mb-1">عبارت‌های انتخابی</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {formatPersianNumber(metrics.structuredPhrasesUsedCount)}
            </span>
            <span className="block text-[10px] text-slate-500 mt-1">داده آماده برای AI آینده</span>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-white dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-400 block mb-1">دفعات استفاده از متن آزاد</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatPersianNumber(metrics.fallbackTextUsedCount)}
            </span>
            <span className="block text-[10px] text-amber-600 mt-1 font-bold">
              نیاز به تقویت قالب: {metrics.fallbackTextUsedCount === 0 ? "صفر" : "پایین"}
            </span>
          </div>
        </div>

        {/* Clinical Note from Roadmap */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>انطباق با مستندات محصول و سند فنی:</span>
          </div>
          <p className="leading-relaxed">
            طبق بخش ۳ و ۴ سند فنی، تمامی انتخاب‌های پزشک با کلیدهای یکتا و استاندارد ذخیره می‌شوند تا بدون نیاز به مهاجرت سنگین، در فاز ۲ برای نگاشت تبدیل گفتار به متن (STT) و آموزش مدل بالینی استفاده شوند.
          </p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button onClick={onClose}>متوجه شدم</Button>
        </div>
      </div>
    </Modal>
  );
}
