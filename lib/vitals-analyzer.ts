import { VitalsData } from "@/types/medical";

export interface VitalStatus {
  status: "normal" | "warning" | "danger" | "neutral";
  label: string;
  badgeClass: string;
  color: string;
}

export function evaluateBloodPressure(sys?: number | null, dia?: number | null): VitalStatus | null {
  if (!sys && !dia) return null;
  const s = sys ?? 120;
  const d = dia ?? 80;

  if (s >= 180 || d >= 120) {
    return {
      status: "danger",
      label: "بحران فشار خون (اورژانسی)",
      badgeClass: "bg-red-500/15 text-red-500 border-red-500/30",
      color: "#ef4444",
    };
  }
  if (s >= 140 || d >= 90) {
    return {
      status: "danger",
      label: "فشار خون مرحله ۲",
      badgeClass: "bg-rose-500/15 text-rose-500 border-rose-500/30",
      color: "#f43f5e",
    };
  }
  if (s >= 130 || d >= 80) {
    return {
      status: "warning",
      label: "فشار خون مرحله ۱",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      color: "#f59e0b",
    };
  }
  if (s >= 120 && d < 80) {
    return {
      status: "warning",
      label: "پیش‌فشار خون (Elevated)",
      badgeClass: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
      color: "#eab308",
    };
  }
  return {
    status: "normal",
    label: "نرمال",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    color: "#10b981",
  };
}

export function calculateBmi(weightKg?: number | null, heightCm?: number | null): {
  bmi: number | null;
  status: VitalStatus | null;
} {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: null, status: null };
  }
  const heightM = heightCm / 100;
  const bmiVal = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let status: VitalStatus;
  if (bmiVal < 18.5) {
    status = {
      status: "warning",
      label: "کمبود وزن",
      badgeClass: "bg-blue-500/15 text-blue-500 border-blue-500/30",
      color: "#3b82f6",
    };
  } else if (bmiVal < 25) {
    status = {
      status: "normal",
      label: "وزن طبیعی",
      badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      color: "#10b981",
    };
  } else if (bmiVal < 30) {
    status = {
      status: "warning",
      label: "اضافه وزن",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      color: "#f59e0b",
    };
  } else {
    status = {
      status: "danger",
      label: "چاقی بالینی",
      badgeClass: "bg-red-500/15 text-red-500 border-red-500/30",
      color: "#ef4444",
    };
  }

  return { bmi: bmiVal, status };
}

export function evaluatePulse(pulse?: number | null): VitalStatus | null {
  if (!pulse) return null;
  if (pulse < 50) {
    return {
      status: "warning",
      label: "برادی‌کاردی (<50)",
      badgeClass: "bg-blue-500/15 text-blue-500 border-blue-500/30",
      color: "#3b82f6",
    };
  }
  if (pulse > 105) {
    return {
      status: "warning",
      label: "تاکی‌کاردی (>105)",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      color: "#f59e0b",
    };
  }
  return {
    status: "normal",
    label: "ریتم منظم (نرمال)",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    color: "#10b981",
  };
}

export function evaluateTemperature(temp?: number | null): VitalStatus | null {
  if (!temp) return null;
  if (temp >= 38.5) {
    return {
      status: "danger",
      label: "تب بالا (هایپرترمی)",
      badgeClass: "bg-red-500/15 text-red-500 border-red-500/30",
      color: "#ef4444",
    };
  }
  if (temp >= 37.5) {
    return {
      status: "warning",
      label: "ساب‌فبریل (خفیف)",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      color: "#f59e0b",
    };
  }
  return {
    status: "normal",
    label: "نرمال (۳۶.۵ - ۳۷.۴)",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    color: "#10b981",
  };
}

export function evaluateSpo2(spo2?: number | null): VitalStatus | null {
  if (!spo2) return null;
  if (spo2 < 90) {
    return {
      status: "danger",
      label: "هیپوکسی شدید (<90%)",
      badgeClass: "bg-red-500/15 text-red-500 border-red-500/30",
      color: "#ef4444",
    };
  }
  if (spo2 < 95) {
    return {
      status: "warning",
      label: "اکسیژن لب‌مرزی (۹۰-۹۴%)",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      color: "#f59e0b",
    };
  }
  return {
    status: "normal",
    label: "اکسیژناسیون عالی (≥95%)",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    color: "#10b981",
  };
}

export function evaluateBloodGlucose(bs?: number | null): VitalStatus | null {
  if (!bs) return null;
  if (bs >= 200) {
    return {
      status: "danger",
      label: "هایپرگلیسمی بارز (≥200)",
      badgeClass: "bg-red-500/15 text-red-500 border-red-500/30",
      color: "#ef4444",
    };
  }
  if (bs >= 140) {
    return {
      status: "warning",
      label: "بالاتر از حد نرمال (140-199)",
      badgeClass: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      color: "#f59e0b",
    };
  }
  if (bs < 70) {
    return {
      status: "danger",
      label: "هیپوگلیسمی (<70)",
      badgeClass: "bg-rose-500/15 text-rose-500 border-rose-500/30",
      color: "#f43f5e",
    };
  }
  return {
    status: "normal",
    label: "قند نرمال (70-139)",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    color: "#10b981",
  };
}
