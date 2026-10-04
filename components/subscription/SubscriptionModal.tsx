"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DoctorSubscription,
  PaymentTransaction,
  SubscriptionPlan,
  SubscriptionPlanType,
} from "@/types/medical";
import {
  checkPlanQuota,
  getCurrentSubscription,
  getPatients,
  getPaymentHistory,
  getSubscriptionPlans,
  upgradeSubscription,
} from "@/lib/storage";
import { formatPersianNumber } from "@/lib/utils";
import {
  Sparkles,
  Check,
  CreditCard,
  Crown,
  Zap,
  Mic,
  FileText,
  Clock,
  ShieldCheck,
  TrendingUp,
  Download,
  AlertTriangle,
} from "lucide-react";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionUpdated?: () => void;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  onSubscriptionUpdated,
}: SubscriptionModalProps) {
  const [plans, setPlans] = React.useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = React.useState<DoctorSubscription | null>(null);
  const [payments, setPayments] = React.useState<PaymentTransaction[]>([]);
  const [patientCount, setPatientCount] = React.useState(0);
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("monthly");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const loadData = React.useCallback(() => {
    setPlans(getSubscriptionPlans());
    const sub = getCurrentSubscription();
    setCurrentSub(sub);
    setPayments(getPaymentHistory());
    setPatientCount(getPatients().length);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadData();
      setSuccessMessage(null);
    }
  }, [isOpen, loadData]);

  if (!currentSub) return null;

  const quota = checkPlanQuota(currentSub.planName, patientCount);
  const currentPlan = plans.find((p) => p.name === currentSub.planName);

  const handleUpgrade = (planName: SubscriptionPlanType) => {
    if (planName === currentSub.planName) return;

    setIsProcessing(true);
    setTimeout(() => {
      try {
        const updated = upgradeSubscription(planName, billingCycle);
        setCurrentSub(updated);
        loadData();
        setSuccessMessage(`اشتراک شما با موفقیت به طرح ${planName.toUpperCase()} ارتقا یافت!`);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (onSubscriptionUpdated) onSubscriptionUpdated();
      } finally {
        setIsProcessing(false);
      }
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="طرح‌های اشتراک، پرداخت و نقشه‌راه هوش مصنوعی"
      description="مدل تعرفه‌گذاری برنزی/نقره‌ای/طلایی، پایش سقف بیماران و قابلیت‌های فعال (سند ۰۸)"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in">
            <Check className="h-5 w-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Subscription Status Bar */}
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">طرح فعال شما:</span>
                <Badge variant="success" className="text-xs font-black">
                  {currentPlan?.displayName || currentSub.planName}
                </Badge>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  وضعیت: فعال
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                تاریخ تمدید بعدی:{" "}
                <strong>
                  {new Date(currentSub.currentPeriodEnd).toLocaleDateString("fa-IR")}
                </strong>{" "}
                • تمدید خودکار: {currentSub.autoRenew ? "فعال" : "غیرفعال"}
              </p>
            </div>

            {/* Quota Progress */}
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">سقف پرونده بیماران:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatPersianNumber(patientCount)} از{" "}
                  {quota.maxPatients === -1 ? "نامحدود" : formatPersianNumber(quota.maxPatients)}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quota.percentageUsed > 85 ? "bg-red-500" : "bg-emerald-600"
                  }`}
                  style={{
                    width: quota.maxPatients === -1 ? "25%" : `${quota.percentageUsed}%`,
                  }}
                />
              </div>
              {quota.isExceeded && (
                <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  سقف بیماران پر شده است. جهت ثبت بیمار جدید ارتقا دهید.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            دوره پرداخت:
          </span>
          <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              ماهانه
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`rounded-xl px-3 py-1 text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <span>سالانه</span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                ۲ ماه رایگان
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.name === currentSub.planName;
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-4.5 transition-all ${
                  isCurrent
                    ? "border-emerald-600 bg-emerald-50/20 shadow-md ring-2 ring-emerald-600/20 dark:bg-emerald-950/10"
                    : plan.name === "gold"
                    ? "border-amber-400 bg-gradient-to-b from-amber-500/5 to-transparent dark:border-amber-800 shadow-sm"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-md">
                    طرح فعال شما
                  </div>
                )}

                {plan.name === "gold" && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-md flex items-center gap-1">
                    <Crown className="h-3 w-3" />
                    <span>پیشنهاد هوشمند</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {plan.displayName}
                    </h4>
                    <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {price === 0 ? (
                        "رایگان"
                      ) : (
                        <>
                          {formatPersianNumber(price.toLocaleString())}{" "}
                          <span className="text-[11px] font-normal text-slate-500">
                            تومان / {billingCycle === "annual" ? "سال" : "ماه"}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  {isCurrent ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full text-xs font-bold text-emerald-700 border-emerald-600/30"
                    >
                      طرح فعلی
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={isProcessing}
                      className={`w-full text-xs font-bold ${
                        plan.name === "gold"
                          ? "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
                          : ""
                      }`}
                    >
                      {isProcessing ? "در حال فعال‌سازی..." : "انتخاب و ارتقا"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cost Optimization & AI Engine Note (Doc 08 & Doc 09) */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <Mic className="h-4 w-4 text-emerald-600" />
            <span>معماری بهینه‌سازی هزینه‌های زیرساخت هوش مصنوعی (Cost-Optimized AI Engine):</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            جهت جلوگیری از هزینه‌های سنگین اجاره سرورهای GPU اختصاصی، سیستم در فاز هوش مصنوعی از خط‌لوله <strong>Groq API (Whisper-Large-V3)</strong> برای تبدیل فوق‌سریع صوت و <strong>DeepSeek-V3</strong> برای نگاشت دقیق متون تخصصی پزشکی بدون اطلاعات هویتی (De-identified) استفاده می‌کند.
          </p>
        </div>

        {/* Payment History */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            تاریخچه پرداخت‌ها و فاکتورها:
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="p-3">شرح فاکتور</th>
                  <th className="p-3">مبلغ</th>
                  <th className="p-3">درگاه</th>
                  <th className="p-3">کد رهگیری</th>
                  <th className="p-3">تاریخ</th>
                  <th className="p-3">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      {tx.planName}
                    </td>
                    <td className="p-3 text-emerald-600 font-mono font-bold">
                      {formatPersianNumber(tx.amount.toLocaleString())} تومان
                    </td>
                    <td className="p-3 text-slate-500">{tx.gateway}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {tx.gatewayRefId}
                    </td>
                    <td className="p-3 text-slate-500">
                      {tx.paidAt ? new Date(tx.paidAt).toLocaleDateString("fa-IR") : "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant="success" className="text-[10px]">
                        موفق
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
