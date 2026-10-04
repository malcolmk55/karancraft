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
  Check,
  CreditCard,
  Crown,
  Zap,
  Mic,
  FileText,
  Clock,
  ShieldCheck,
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
        setSuccessMessage(`طرح اشتراک شما با موفقیت به ${planName.toUpperCase()} ارتقا یافت.`);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        if (onSubscriptionUpdated) onSubscriptionUpdated();
      } finally {
        setIsProcessing(false);
      }
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <span>طرح اشتراک و تعرفه خدمات مطب</span>
        </div>
      }
      description="مدیریت سقف پرونده‌ها، تمدید اشتراک و دسترسی به قابلیت‌های پیشرفته"
      size="4xl"
    >
      <div className="space-y-5">
        {/* Success Alert */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-xs font-semibold text-teal-800 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 animate-in fade-in">
            <Check className="h-4 w-4 text-teal-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Current Subscription Status Bar */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">طرح فعال شما:</span>
                <span className="rounded-lg bg-teal-600 text-white px-2 py-0.5 text-xs font-bold">
                  {currentPlan?.displayName || currentSub.planName}
                </span>
                <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  وضعیت: فعال
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تاریخ تمدید:{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(currentSub.currentPeriodEnd).toLocaleDateString("fa-IR")}
                </span>{" "}
                • تمدید خودکار: {currentSub.autoRenew ? "فعال" : "غیرفعال"}
              </p>
            </div>

            {/* Quota Progress */}
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">سقف پرونده بیماران:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(patientCount)} از{" "}
                  {quota.maxPatients === -1 ? "نامحدود" : formatPersianNumber(quota.maxPatients)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    quota.percentageUsed > 85 ? "bg-rose-500" : "bg-teal-600"
                  }`}
                  style={{
                    width: quota.maxPatients === -1 ? "25%" : `${quota.percentageUsed}%`,
                  }}
                />
              </div>
              {quota.isExceeded && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  سقف ظرفیت تکمیل شده است. جهت ثبت پرونده جدید ارتقا دهید.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            دوره پرداخت:
          </span>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              ماهانه
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <span>سالانه</span>
              <span className="rounded bg-teal-50 px-1 text-[10px] font-bold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                تخفیف ویژه
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.name === currentSub.planName;
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                  isCurrent
                    ? "border-teal-600 bg-slate-50/80 dark:border-teal-500 dark:bg-slate-850 ring-2 ring-teal-600/20"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    طرح فعال شما
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {plan.displayName}
                    </h4>
                    <p className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
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
                        <Check className="h-3.5 w-3.5 shrink-0 text-teal-600 mt-0.5" />
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
                      className="w-full text-xs font-semibold text-slate-500 border-slate-200 dark:border-slate-700"
                    >
                      طرح فعال
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={isProcessing}
                      className="w-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {isProcessing ? "در حال پردازش..." : "انتخاب طرح"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cost Optimization & AI Engine Note */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Mic className="h-4 w-4 text-teal-600" />
            <span>بهینه‌سازی مصرف و امنیت هوش مصنوعی:</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            تبدیل صوت و پردازش فرم با متدهای فشرده‌سازی De-identified اجرا می‌شود تا حریم خصوصی بیمار و سرعت پردازش تضمین گردد.
          </p>
        </div>

        {/* Payment History */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            تاریخچه تراکنش‌ها و پرداخت‌ها:
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="p-3">شرح</th>
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
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      طرح {tx.planName}
                    </td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 font-mono font-semibold">
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
                      <Badge variant="secondary" className="text-[10px]">
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
