"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import { Doctor, Patient, SpecialtyTemplatePhrase, SpecialtyType, Visit, VitalsData } from "@/types/medical";
import { getTemplates, saveVisit } from "@/lib/storage";
import { formatPersianNumber } from "@/lib/utils";
import { evaluateBloodPressure, evaluatePulse, evaluateTemperature, evaluateSpo2, evaluateBloodGlucose, calculateBmi } from "@/lib/vitals-analyzer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  FileEdit,
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  Save,
  Check,
  Search,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Plus,
} from "lucide-react";

interface VisitFormProps {
  patient: Patient;
  doctor: Doctor;
  initialVisit?: Visit | null;
  onSaved: (visit: Visit) => void;
  onCancel: () => void;
}

export function VisitForm({
  patient,
  doctor,
  initialVisit,
  onSaved,
  onCancel,
}: VisitFormProps) {
  // Timer for measuring documentation speed (Phase 1.5 requirement)
  const [secondsElapsed, setSecondsElapsed] = React.useState<number>(
    initialVisit?.durationSeconds || 0
  );
  const [isTimerRunning, setIsTimerRunning] = React.useState<boolean>(true);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Form State
  const [specialty, setSpecialty] = React.useState<SpecialtyType>(
    initialVisit?.specialty || doctor.specialty || "internal"
  );
  const [visitDate, setVisitDate] = React.useState<string>(
    initialVisit?.visitDate || new Date().toISOString().split("T")[0]
  );

  // Template collections
  const [templates, setTemplates] = React.useState<SpecialtyTemplatePhrase[]>([]);
  const [ccSearch, setCcSearch] = React.useState("");
  const [peSearch, setPeSearch] = React.useState("");
  const [dxSearch, setDxSearch] = React.useState("");

  // Selections (Schema-First)
  const [selectedCcIds, setSelectedCcIds] = React.useState<string[]>(
    initialVisit?.chiefComplaintIds || []
  );
  const [selectedPeIds, setSelectedPeIds] = React.useState<string[]>(
    initialVisit?.examFindingsIds || []
  );
  const [selectedDxIds, setSelectedDxIds] = React.useState<string[]>(
    initialVisit?.diagnosisIds || []
  );

  // Vitals State
  const [systolicBp, setSystolicBp] = React.useState<string>(
    initialVisit?.vitals?.systolicBp ? String(initialVisit.vitals.systolicBp) : ""
  );
  const [diastolicBp, setDiastolicBp] = React.useState<string>(
    initialVisit?.vitals?.diastolicBp ? String(initialVisit.vitals.diastolicBp) : ""
  );
  const [pulse, setPulse] = React.useState<string>(
    initialVisit?.vitals?.pulse ? String(initialVisit.vitals.pulse) : ""
  );
  const [temperature, setTemperature] = React.useState<string>(
    initialVisit?.vitals?.temperature ? String(initialVisit.vitals.temperature) : ""
  );
  const [spo2, setSpo2] = React.useState<string>(
    initialVisit?.vitals?.spo2 ? String(initialVisit.vitals.spo2) : ""
  );
  const [bloodGlucose, setBloodGlucose] = React.useState<string>(
    initialVisit?.vitals?.bloodGlucose ? String(initialVisit.vitals.bloodGlucose) : ""
  );
  const [weight, setWeight] = React.useState<string>(
    initialVisit?.vitals?.weight ? String(initialVisit.vitals.weight) : ""
  );
  const [height, setHeight] = React.useState<string>(
    initialVisit?.vitals?.height ? String(initialVisit.vitals.height) : ""
  );

  // Plan & Free text fallback
  const [planNotes, setPlanNotes] = React.useState<string>(
    initialVisit?.planNotes || ""
  );
  const [showFallback, setShowFallback] = React.useState<boolean>(
    Boolean(initialVisit?.freeTextFallback)
  );
  const [freeTextFallback, setFreeTextFallback] = React.useState<string>(
    initialVisit?.freeTextFallback || ""
  );

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<"complaint" | "vitals" | "exam" | "diagnosis" | "plan">("complaint");

  // Load templates
  React.useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  // Filtered Templates by Specialty
  const availableChiefComplaints = React.useMemo(() => {
    return templates
      .filter((t) => t.section === "chief_complaint")
      .filter((t) => t.specialty === specialty || t.specialty === "general")
      .filter((t) => !ccSearch || t.phraseText.includes(ccSearch));
  }, [templates, specialty, ccSearch]);

  const availableExamFindings = React.useMemo(() => {
    return templates
      .filter((t) => t.section === "exam_finding")
      .filter((t) => t.specialty === specialty || t.specialty === "general")
      .filter(
        (t) =>
          !peSearch ||
          t.phraseText.includes(peSearch) ||
          t.systemGroup?.includes(peSearch)
      );
  }, [templates, specialty, peSearch]);

  // Group exam findings by organ system
  const examFindingsBySystem = React.useMemo(() => {
    const groups: Record<string, SpecialtyTemplatePhrase[]> = {};
    for (const item of availableExamFindings) {
      const groupName = item.systemGroup || "سایر معاینات";
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    }
    return groups;
  }, [availableExamFindings]);

  const availableDiagnoses = React.useMemo(() => {
    return templates
      .filter((t) => t.section === "diagnosis")
      .filter((t) => t.specialty === specialty || t.specialty === "general")
      .filter(
        (t) =>
          !dxSearch ||
          t.phraseText.includes(dxSearch) ||
          t.code?.toLowerCase().includes(dxSearch.toLowerCase())
      );
  }, [templates, specialty, dxSearch]);

  // Vitals evaluations
  const bpEvaluation = evaluateBloodPressure(
    systolicBp ? parseInt(systolicBp, 10) : null,
    diastolicBp ? parseInt(diastolicBp, 10) : null
  );
  const pulseEvaluation = evaluatePulse(pulse ? parseInt(pulse, 10) : null);
  const tempEvaluation = evaluateTemperature(
    temperature ? parseFloat(temperature) : null
  );
  const spo2Evaluation = evaluateSpo2(spo2 ? parseInt(spo2, 10) : null);
  const bsEvaluation = evaluateBloodGlucose(
    bloodGlucose ? parseInt(bloodGlucose, 10) : null
  );
  const bmiCalc = calculateBmi(
    weight ? parseFloat(weight) : null,
    height ? parseFloat(height) : null
  );

  // Toggle helper
  const toggleSelection = (
    id: string,
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Quick Preset Handlers (One-click clinical setup)
  const applyPresetNormalCheckup = () => {
    const cc = templates.find((t) => t.id === "gen_cc_13")?.id;
    const pe1 = templates.find((t) => t.id === "pe_gen_1")?.id;
    const pe2 = templates.find((t) => t.id === "pe_resp_1")?.id;
    const pe3 = templates.find((t) => t.id === "pe_cv_1")?.id;
    const pe4 = templates.find((t) => t.id === "pe_abd_1")?.id;
    const dx = templates.find((t) => t.id === "gen_dx_8")?.id;

    if (cc) setSelectedCcIds([cc]);
    setSelectedPeIds(
      [pe1, pe2, pe3, pe4].filter(Boolean) as string[]
    );
    if (dx) setSelectedDxIds([dx]);
    setSystolicBp("120");
    setDiastolicBp("80");
    setPulse("75");
    setTemperature("36.7");
    setSpo2("98");
    setPlanNotes("چکاپ روتین نرمال. توصیه به ورزش هوازی ۳ روز در هفته، رژیم غذایی سالم و آزمایشات دوره‌ای سالانه.");
  };

  const applyPresetFluURI = () => {
    const cc1 = templates.find((t) => t.id === "gen_cc_1")?.id;
    const cc2 = templates.find((t) => t.id === "gen_cc_2")?.id;
    const cc3 = templates.find((t) => t.id === "gen_cc_3")?.id;
    const pe1 = templates.find((t) => t.id === "pe_gen_2")?.id;
    const pe2 = templates.find((t) => t.id === "pe_heent_1")?.id;
    const pe3 = templates.find((t) => t.id === "pe_resp_1")?.id;
    const dx1 = templates.find((t) => t.id === "gen_dx_1")?.id;
    const dx2 = templates.find((t) => t.id === "gen_dx_2")?.id;

    setSelectedCcIds([cc1, cc2, cc3].filter(Boolean) as string[]);
    setSelectedPeIds([pe1, pe2, pe3].filter(Boolean) as string[]);
    setSelectedDxIds([dx1, dx2].filter(Boolean) as string[]);
    setSystolicBp("118");
    setDiastolicBp("76");
    setPulse("82");
    setTemperature("38.1");
    setSpo2("98");
    setPlanNotes("۱. قرص استامینوفن ۵۰۰ هر ۶ ساعت در صورت تب و درد\n۲. شربت دیفن‌هیدرامین کامپاند هر ۸ ساعت ۵ سی‌سی\n۳. قرص سیتریزین ۱۰ میلی‌گرم شب‌ها یک عدد\n۴. استراحت، مصرف مایعات گرم و میوه فراوان");
  };

  const applyPresetHypertension = () => {
    setSpecialty("internal");
    const cc = templates.find((t) => t.id === "int_cc_2")?.id;
    const pe1 = templates.find((t) => t.id === "pe_gen_1")?.id;
    const pe2 = templates.find((t) => t.id === "pe_cv_1")?.id;
    const pe3 = templates.find((t) => t.id === "pe_cv_5")?.id;
    const dx = templates.find((t) => t.id === "int_dx_1")?.id;

    if (cc) setSelectedCcIds([cc]);
    setSelectedPeIds([pe1, pe2, pe3].filter(Boolean) as string[]);
    if (dx) setSelectedDxIds([dx]);
    setSystolicBp("145");
    setDiastolicBp("92");
    setPulse("76");
    setTemperature("36.6");
    setSpo2("97");
    setPlanNotes("کنترل فشار خون اسنشیال.\n۱. قرص لوزارتان ۲۵ روزی یک عدد صبح‌ها\n۲. ثبت روزانه فشار خون صبح و عصر به مدت ۱۰ روز\n۳. کاهش شدید نمک غذا و پیاده‌روی منظم\n۴. ویزیت مجدد ۲ هفته آینده با جدول فشار خون");
  };

  // Submit Handler
  const handleSave = (statusToSave: "draft" | "finalized") => {
    setIsSubmitting(true);
    setIsTimerRunning(false);

    // Map selected IDs to text representation
    const ccTexts = templates
      .filter((t) => selectedCcIds.includes(t.id))
      .map((t) => t.phraseText);
    const peTexts = templates
      .filter((t) => selectedPeIds.includes(t.id))
      .map((t) => t.phraseText);
    const dxTexts = templates
      .filter((t) => selectedDxIds.includes(t.id))
      .map((t) => t.phraseText);

    const vitalsData: VitalsData = {
      systolicBp: systolicBp ? parseInt(systolicBp, 10) : null,
      diastolicBp: diastolicBp ? parseInt(diastolicBp, 10) : null,
      pulse: pulse ? parseInt(pulse, 10) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      spo2: spo2 ? parseInt(spo2, 10) : null,
      bloodGlucose: bloodGlucose ? parseInt(bloodGlucose, 10) : null,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      bmi: bmiCalc.bmi,
    };

    const saved = saveVisit({
      id: initialVisit?.id,
      patientId: patient.id,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      specialty,
      visitDate,
      status: statusToSave,
      durationSeconds: secondsElapsed,
      chiefComplaintIds: selectedCcIds,
      chiefComplaintsText: ccTexts,
      vitals: vitalsData,
      examFindingsIds: selectedPeIds,
      examFindingsText: peTexts,
      diagnosisIds: selectedDxIds,
      diagnosesText: dxTexts,
      planNotes: planNotes.trim(),
      freeTextFallback: freeTextFallback.trim() || undefined,
    });

    if (statusToSave === "finalized") {
      // Trigger festive celebration confetti for fast clinical workflow
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#059669", "#3b82f6", "#f59e0b"],
        });
      } catch {}
    }

    onSaved(saved);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Patient Info, Specialty Switcher, and Stopwatch */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">بیمار:</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {patient.fullName}
              </h2>
              {patient.age && (
                <span className="text-xs text-slate-500">({formatPersianNumber(patient.age)} ساله)</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>پزشک معالج: {doctor.fullName}</span>
              <span>•</span>
              <span>تاریخ: {visitDate}</span>
            </div>
          </div>
        </div>

        {/* Center: Live Timer Badge */}
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-800 dark:text-emerald-300">
          <Clock className="h-4 w-4 animate-pulse text-emerald-600 dark:text-emerald-400" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
              مدت زمان ثبت بالینی
            </span>
            <span className="text-base font-black font-mono">
              {formatPersianNumber(secondsElapsed)} ثانیه
            </span>
          </div>
        </div>

        {/* Right: Specialty Toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 p-1 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80">
          <button
            type="button"
            onClick={() => setSpecialty("internal")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              specialty === "internal"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            تخصص داخلی
          </button>
          <button
            type="button"
            onClick={() => setSpecialty("general")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              specialty === "general"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            پزشکی عمومی
          </button>
        </div>
      </div>

      {/* Quick Clinical Presets Strip (One-Click Setup) */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-850/50">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 pl-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          الگوهای سریع بالینی:
        </span>
        <button
          type="button"
          onClick={applyPresetFluURI}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
        >
          سرماخوردگی / گلودرد حاد (URI)
        </button>
        <button
          type="button"
          onClick={applyPresetHypertension}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
        >
          کنترل فشار خون بالا
        </button>
        <button
          type="button"
          onClick={applyPresetNormalCheckup}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
        >
          چکاپ دوره‌ای نرمال
        </button>
      </div>

      {/* Navigation Step Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("complaint")}
          className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all border-b-2 ${
            activeTab === "complaint"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>۱. شکایت اصلی ({formatPersianNumber(selectedCcIds.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vitals")}
          className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all border-b-2 ${
            activeTab === "vitals"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>۲. علائم حیاتی {systolicBp ? "✓" : ""}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("exam")}
          className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all border-b-2 ${
            activeTab === "exam"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          <span>۳. معاینه بالینی ({formatPersianNumber(selectedPeIds.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("diagnosis")}
          className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all border-b-2 ${
            activeTab === "diagnosis"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>۴. تشخیص بالینی ({formatPersianNumber(selectedDxIds.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all border-b-2 ${
            activeTab === "plan"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
          }`}
        >
          <FileEdit className="h-4 w-4" />
          <span>۵. طرح درمان و دارو</span>
        </button>
      </div>

      {/* TAB 1: CHIEF COMPLAINTS */}
      {activeTab === "complaint" && (
        <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                انتخاب سریع شکایت اصلی بیمار
              </h3>
              <p className="text-xs text-slate-500">
                عبارت‌های ساختاریافته‌ی مرتبط با مراجعه بیمار را با یک کلیک انتخاب کنید.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <Input
                placeholder="فیلتر در عبارت‌های شکایت..."
                value={ccSearch}
                onChange={(e) => setCcSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
            {availableChiefComplaints.map((item) => {
              const isSelected = selectedCcIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() =>
                    toggleSelection(item.id, selectedCcIds, setSelectedCcIds)
                  }
                  className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-xs md:text-sm font-semibold">
                    {item.phraseText}
                  </span>
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              onClick={() => setActiveTab("vitals")}
              className="gap-2"
            >
              <span>مرحله بعد: ثبت علائم حیاتی</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: VITALS DATA */}
      {activeTab === "vitals" && (
        <div className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              ثبت ساختاریافته علائم حیاتی (Vitals)
            </h3>
            <p className="text-xs text-slate-500">
              مقادیر ورودی بلافاصله توسط سیستم تحلیل شده و وضعیت بالینی نمایش داده می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Blood Pressure */}
            <div className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/40">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-rose-500" />
                  فشار خون (سیستول / دیاستول)
                </label>
                {bpEvaluation && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${bpEvaluation.badgeClass}`}
                  >
                    {bpEvaluation.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="سیستول (120)"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value)}
                  className="font-mono text-center text-base font-bold"
                />
                <span className="text-slate-400 font-bold">/</span>
                <Input
                  type="number"
                  placeholder="دیاستول (80)"
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(e.target.value)}
                  className="font-mono text-center text-base font-bold"
                />
                <span className="text-xs text-slate-400 font-mono">mmHg</span>
              </div>
            </div>

            {/* Pulse */}
            <div className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/40">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-500" />
                  ضربان قلب (Pulse)
                </label>
                {pulseEvaluation && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pulseEvaluation.badgeClass}`}
                  >
                    {pulseEvaluation.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="75"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="font-mono text-center font-bold"
                />
                <span className="text-xs text-slate-400 font-mono">bpm</span>
              </div>
            </div>

            {/* Temperature */}
            <div className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/40">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-amber-500" />
                  دمای بدن (Temp)
                </label>
                {tempEvaluation && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tempEvaluation.badgeClass}`}
                  >
                    {tempEvaluation.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="36.8"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="font-mono text-center font-bold"
                />
                <span className="text-xs text-slate-400 font-mono">°C</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/40">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Wind className="h-4 w-4 text-cyan-500" />
                  اکسیژن خون (SpO2)
                </label>
                {spo2Evaluation && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${spo2Evaluation.badgeClass}`}
                  >
                    {spo2Evaluation.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="font-mono text-center font-bold"
                />
                <span className="text-xs text-slate-400 font-mono">%</span>
              </div>
            </div>

            {/* Blood Glucose */}
            <div className="rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/40">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Droplet className="h-4 w-4 text-indigo-500" />
                  قند خون (BS)
                </label>
                {bsEvaluation && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bsEvaluation.badgeClass}`}
                  >
                    {bsEvaluation.label}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="95"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(e.target.value)}
                  className="font-mono text-center font-bold"
                />
                <span className="text-xs text-slate-400 font-mono">mg/dL</span>
              </div>
            </div>

            {/* Weight, Height, BMI */}
            <div className="col-span-1 sm:col-span-2 rounded-2xl border border-slate-200/80 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-850/40">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  وزن، قد و شاخص توده بدنی (BMI)
                </label>
                {bmiCalc.status && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${bmiCalc.status.badgeClass}`}
                  >
                    {bmiCalc.status.label} (BMI: {formatPersianNumber(bmiCalc.bmi ?? 0)})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="وزن (کیلوگرم)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="font-mono text-center font-bold"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="قد (سانتی‌متر)"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="font-mono text-center font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab("complaint")}
            >
              مرحله قبل
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab("exam")}
              className="gap-2"
            >
              <span>مرحله بعد: معاینه فیزیکی</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: PHYSICAL EXAM FINDINGS */}
      {activeTab === "exam" && (
        <div className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                یافته‌های معاینه بالینی تفکیک‌شده بر اساس دستگاه‌های بدن
              </h3>
              <p className="text-xs text-slate-500">
                یافته‌های مثبت یا نرمال را با یک کلیک انتخاب فرمایید.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <Input
                placeholder="جست‌وجو در معاینات..."
                value={peSearch}
                onChange={(e) => setPeSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(examFindingsBySystem).map(([system, items]) => (
              <div key={system} className="space-y-2">
                <span className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {system}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((item) => {
                    const isSelected = selectedPeIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() =>
                          toggleSelection(item.id, selectedPeIds, setSelectedPeIds)
                        }
                        className={`flex items-start justify-between rounded-2xl border p-3.5 cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-200"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="text-xs md:text-sm font-semibold leading-relaxed">
                          {item.phraseText}
                        </span>
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab("vitals")}
            >
              مرحله قبل
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab("diagnosis")}
              className="gap-2"
            >
              <span>مرحله بعد: تشخیص بالینی</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: DIAGNOSES */}
      {activeTab === "diagnosis" && (
        <div className="space-y-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                تشخیص‌های بالینی استاندارد (Assessment & Diagnosis)
              </h3>
              <p className="text-xs text-slate-500">
                فهرست استاندارد تشخیص‌های مرتبط با تخصص {specialty === "internal" ? "داخلی" : "عمومی"}.
              </p>
            </div>
            <div className="w-full sm:w-64">
              <Input
                placeholder="جست‌وجوی تشخیص یا کد ICD..."
                value={dxSearch}
                onChange={(e) => setDxSearch(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {availableDiagnoses.map((item) => {
              const isSelected = selectedDxIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() =>
                    toggleSelection(item.id, selectedDxIds, setSelectedDxIds)
                  }
                  className={`flex items-center justify-between rounded-2xl border p-3.5 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/90 text-blue-950 shadow-sm dark:bg-blue-950/40 dark:text-blue-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800"
                  }`}
                >
                  <div>
                    <span className="text-xs md:text-sm font-bold block">
                      {item.phraseText}
                    </span>
                    {item.code && (
                      <span className="text-[11px] font-mono text-slate-400">
                        ICD-10: {item.code}
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTab("exam")}
            >
              مرحله قبل
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab("plan")}
              className="gap-2"
            >
              <span>مرحله بعد: طرح درمان و ثبت نهایی</span>
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: PLAN, PRESCRIPTION & FALLBACK */}
      {activeTab === "plan" && (
        <div className="space-y-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              طرح درمان، داروها و توصیه‌های بالینی (Plan & Rx)
            </h3>
            <p className="text-xs text-slate-500">
              دستورات دارویی، آزمایشات پاراکلینیک، رژیم غذایی و زمان ویزیت بعدی را ثبت کنید.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              دستورات درمانی و داروها
            </label>
            <textarea
              rows={4}
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              placeholder="مثال:&#10;۱. قرص لوزارتان ۲۵ روزی یک عدد صبح‌ها&#10;۲. رژیم کم‌نمک و ورزش ۳۰ دقیقه روزانه&#10;۳. تکرار آزمایش قند و چربی ۲ ماه آینده"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100"
            />
          </div>

          {/* Fallback Section (Monitored for Template Coverage) */}
          <div className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFallback(!showFallback)}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <HelpCircle className="h-4 w-4 text-slate-400" />
                <span>نیاز به ثبت فیلد متن آزاد خارج از قالب دارید؟ (Fallback Note)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFallback(!showFallback)}
                className="text-xs font-semibold text-emerald-600"
              >
                {showFallback ? "بستن" : "+ افزودن"}
              </button>
            </div>

            {showFallback && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  توجه: این فیلد فقط برای موارد استثنایی و نادر بالینی تعبیه شده تا پوشش قالب‌های ساختاریافته ارزیابی شود.
                </p>
                <textarea
                  rows={2}
                  value={freeTextFallback}
                  onChange={(e) => setFreeTextFallback(e.target.value)}
                  placeholder="شرح موردی که در عبارت‌های آماده وجود نداشت..."
                  className="w-full rounded-xl border border-amber-200 bg-amber-50/20 p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {/* Action Buttons: Save Draft vs Finalize */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              انصراف و خروج
            </Button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSave("draft")}
                isLoading={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4 text-amber-500" />
                <span>ذخیره به عنوان پیش‌نویس (Draft)</span>
              </Button>

              <Button
                type="button"
                variant="default"
                onClick={() => handleSave("finalized")}
                isLoading={isSubmitting}
                className="gap-2 shadow-lg shadow-emerald-600/25 px-6"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>تایید و ثبت نهایی ویزیت (Finalize)</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
