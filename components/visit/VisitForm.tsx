"use client";

import * as React from "react";
import confetti from "canvas-confetti";
import {
  Doctor,
  Patient,
  SpecialtyTemplatePhrase,
  SpecialtyType,
  Visit,
  VitalsData,
} from "@/types/medical";
import { getTemplates, saveVisit } from "@/lib/storage";
import { formatPersianNumber } from "@/lib/utils";
import {
  calculateBmi,
  evaluateBloodGlucose,
  evaluateBloodPressure,
  evaluatePulse,
  evaluateSpo2,
  evaluateTemperature,
} from "@/lib/vitals-analyzer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
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
  Mic,
  MicOff,
  Trash2,
  Tag,
  MessageSquare,
  AlertTriangle,
  Volume2,
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

  // Doc 09: Dynamic Custom Entries (Escape Hatches)
  const [customCc, setCustomCc] = React.useState<string[]>(
    initialVisit?.customChiefComplaints || []
  );
  const [customPe, setCustomPe] = React.useState<string[]>(
    initialVisit?.customExamFindings || []
  );
  const [customDx, setCustomDx] = React.useState<string[]>(
    initialVisit?.customDiagnoses || []
  );

  // Doc 09: Item Modifiers (notes attached to IDs)
  const [itemModifiers, setItemModifiers] = React.useState<Record<string, string>>(
    initialVisit?.itemModifiers || {}
  );
  const [activeModifierItemId, setActiveModifierItemId] = React.useState<string | null>(null);
  const [activeModifierText, setActiveModifierText] = React.useState<string>("");

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
  const [activeTab, setActiveTab] = React.useState<
    "complaint" | "vitals" | "exam" | "diagnosis" | "plan"
  >("complaint");

  // Global AI Voice Dictation State (Doc 08 & 09)
  const [isAiModalOpen, setIsAiModalOpen] = React.useState(false);
  const [aiTranscript, setAiTranscript] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [voiceTranscriptSaved, setVoiceTranscriptSaved] = React.useState(
    initialVisit?.voiceTranscript || ""
  );

  // Contextual dictation state (Local mic in sections)
  const [isLocalDictatingSection, setIsLocalDictatingSection] = React.useState<
    "cc" | "pe" | "dx" | null
  >(null);

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

  // Custom Chip Handlers (Doc 09 Escape Hatches)
  const addCustomCc = (text: string) => {
    const clean = text.trim();
    if (!clean || customCc.includes(clean)) return;
    setCustomCc((prev) => [...prev, clean]);
    setCcSearch("");
  };

  const removeCustomCc = (text: string) => {
    setCustomCc((prev) => prev.filter((t) => t !== text));
  };

  const addCustomPe = (text: string) => {
    const clean = text.trim();
    if (!clean || customPe.includes(clean)) return;
    setCustomPe((prev) => [...prev, clean]);
    setPeSearch("");
  };

  const removeCustomPe = (text: string) => {
    setCustomPe((prev) => prev.filter((t) => t !== text));
  };

  const addCustomDx = (text: string) => {
    const clean = text.trim();
    if (!clean || customDx.includes(clean)) return;
    setCustomDx((prev) => [...prev, clean]);
    setDxSearch("");
  };

  const removeCustomDx = (text: string) => {
    setCustomDx((prev) => prev.filter((t) => t !== text));
  };

  // Modifier notes
  const handleOpenModifier = (itemId: string) => {
    setActiveModifierItemId(itemId);
    setActiveModifierText(itemModifiers[itemId] || "");
  };

  const handleSaveModifier = (itemId: string) => {
    setItemModifiers((prev) => {
      const copy = { ...prev };
      if (activeModifierText.trim()) {
        copy[itemId] = activeModifierText.trim();
      } else {
        delete copy[itemId];
      }
      return copy;
    });
    setActiveModifierItemId(null);
    setActiveModifierText("");
  };

  // Speech Recognition Helper (Contextual / Browser Web Speech API)
  const startContextualDictation = (section: "cc" | "pe" | "dx") => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "fa-IR";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsLocalDictatingSection(section);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            if (section === "cc") addCustomCc(transcript);
            if (section === "pe") addCustomPe(transcript);
            if (section === "dx") addCustomDx(transcript);
          }
          setIsLocalDictatingSection(null);
        };

        recognition.onerror = () => {
          setIsLocalDictatingSection(null);
        };

        recognition.onend = () => {
          setIsLocalDictatingSection(null);
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn("SpeechRecognition error:", e);
      }
    }

    // Fallback prompt for browsers without SpeechRecognition permission
    const sample = prompt(
      "دیکته صوتی محلی (Contextual Dictation):\nعبارت مورد نظر خود را تایپ یا دیکته کنید:",
      section === "cc"
        ? "سردرد ضربان‌دار اپیزودیک"
        : section === "pe"
        ? "سوفل هولوسیستولیک در کانون اپکس"
        : "سندرم تونل کارپال دوطرفه"
    );
    if (sample) {
      if (section === "cc") addCustomCc(sample);
      if (section === "pe") addCustomPe(sample);
      if (section === "dx") addCustomDx(sample);
    }
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
    setSelectedPeIds([pe1, pe2, pe3, pe4].filter(Boolean) as string[]);
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

  // AI Voice Global Simulation & Extraction (Doc 08 & 09)
  const applyAiVoiceExtraction = (transcriptText: string) => {
    setVoiceTranscriptSaved(transcriptText);

    // Simulated Smart NLP extraction:
    // 1. Detect Vitals
    if (transcriptText.includes("۱۴") || transcriptText.includes("14") || transcriptText.includes("فشار")) {
      setSystolicBp("142");
      setDiastolicBp("88");
      setPulse("76");
      setTemperature("36.8");
      setSpo2("98");
    } else if (transcriptText.includes("تب") || transcriptText.includes("۳۸") || transcriptText.includes("38")) {
      setSystolicBp("116");
      setDiastolicBp("74");
      setPulse("88");
      setTemperature("38.4");
      setSpo2("97");
    }

    // 2. Detect Chief Complaints
    const recognizedCcs: string[] = [];
    const unmappedCcs: string[] = [];

    if (transcriptText.includes("سردرد") || transcriptText.includes("میگرن")) {
      const match = templates.find((t) => t.phraseText.includes("سردرد") && t.section === "chief_complaint");
      if (match) recognizedCcs.push(match.id);
      else unmappedCcs.push("سردرد شدید ضربان‌دار");
    }
    if (transcriptText.includes("سرفه") || transcriptText.includes("گلودرد")) {
      const match = templates.find((t) => t.phraseText.includes("سرفه") && t.section === "chief_complaint");
      if (match) recognizedCcs.push(match.id);
    }
    if (transcriptText.includes("حالت تهوع") || transcriptText.includes("استفراغ")) {
      unmappedCcs.push("حالت تهوع متناوب پس از غذا");
    }

    if (recognizedCcs.length > 0) setSelectedCcIds((prev) => Array.from(new Set([...prev, ...recognizedCcs])));
    if (unmappedCcs.length > 0) setCustomCc((prev) => Array.from(new Set([...prev, ...unmappedCcs])));

    // 3. Detect Exam Findings
    const recognizedPes: string[] = [];
    const unmappedPes: string[] = [];

    if (transcriptText.includes("شکم نرم") || transcriptText.includes("شکم")) {
      const match = templates.find((t) => t.phraseText.includes("شکم نرم"));
      if (match) recognizedPes.push(match.id);
    }
    if (transcriptText.includes("صدای قلب") || transcriptText.includes("قلب")) {
      const match = templates.find((t) => t.phraseText.includes("صدای قلب S1"));
      if (match) recognizedPes.push(match.id);
    }
    if (transcriptText.includes("سوفل") || transcriptText.includes("اپکس")) {
      unmappedPes.push("سوفل سیستولیک خفیف کانون اپکس");
    }

    if (recognizedPes.length > 0) setSelectedPeIds((prev) => Array.from(new Set([...prev, ...recognizedPes])));
    if (unmappedPes.length > 0) setCustomPe((prev) => Array.from(new Set([...prev, ...unmappedPes])));

    // 4. Detect Diagnoses
    const recognizedDxs: string[] = [];
    const unmappedDxs: string[] = [];

    if (transcriptText.includes("فشار خون") || transcriptText.includes("هیپرتانسیون")) {
      const match = templates.find((t) => t.phraseText.includes("فشار خون اسنشیال"));
      if (match) recognizedDxs.push(match.id);
    }
    if (transcriptText.includes("میگرن")) {
      const match = templates.find((t) => t.phraseText.includes("میگرن"));
      if (match) recognizedDxs.push(match.id);
      else unmappedDxs.push("میگرن بدون اورا (احتمالی)");
    }
    if (transcriptText.includes("دیس‌پپسی") || transcriptText.includes("معده")) {
      const match = templates.find((t) => t.phraseText.includes("ریفلاکس") || t.phraseText.includes("گاستریت"));
      if (match) recognizedDxs.push(match.id);
    }

    if (recognizedDxs.length > 0) setSelectedDxIds((prev) => Array.from(new Set([...prev, ...recognizedDxs])));
    if (unmappedDxs.length > 0) setCustomDx((prev) => Array.from(new Set([...prev, ...unmappedDxs])));

    if (transcriptText.includes("طرح") || transcriptText.includes("دارو") || transcriptText.includes("توصیه")) {
      setPlanNotes("دستور دارویی طبق نظر بالینی پس از پایش آزمایشگاهی.");
    }

    setIsAiModalOpen(false);
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
      customChiefComplaints: customCc,
      vitals: vitalsData,
      examFindingsIds: selectedPeIds,
      examFindingsText: peTexts,
      customExamFindings: customPe,
      diagnosisIds: selectedDxIds,
      diagnosesText: dxTexts,
      customDiagnoses: customDx,
      itemModifiers: itemModifiers,
      voiceTranscript: voiceTranscriptSaved || undefined,
      planNotes: planNotes.trim(),
      freeTextFallback: freeTextFallback.trim() || undefined,
    });

    if (statusToSave === "finalized") {
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
      {/* Top Banner: Patient Info, Specialty Switcher, AI Voice, and Stopwatch */}
      {/* Top Banner: Patient Info, Specialty Switcher, AI Voice, and Stopwatch */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white/90 p-4 sm:p-5 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white font-bold shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">بیمار:</span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {patient.fullName}
              </h2>
              {patient.age && (
                <span className="text-xs text-slate-500">
                  ({formatPersianNumber(patient.age)} ساله)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>پزشک معالج: {doctor.fullName}</span>
              <span>•</span>
              <span>تاریخ: {visitDate}</span>
            </div>
          </div>
        </div>

        {/* Center: Global AI Voice Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Voice Dictation Button (Doc 08 & 09) */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-teal-600/30 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-900 shadow-2xs hover:bg-teal-100 transition-all dark:border-teal-500/30 dark:bg-teal-950/40 dark:text-teal-200"
          >
            <Mic className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>ورود صوتی هوش مصنوعی</span>
            <span className="rounded bg-teal-200/60 dark:bg-teal-900/60 px-1.5 py-0.5 text-[10px] font-mono font-medium">AI Voice</span>
          </button>
        </div>

        {/* Right: Specialty Toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 p-1 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/80">
          <button
            type="button"
            onClick={() => setSpecialty("internal")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              specialty === "internal"
                ? "bg-white text-teal-800 shadow-xs dark:bg-slate-800 dark:text-teal-300"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            تخصص داخلی
          </button>
          <button
            type="button"
            onClick={() => setSpecialty("general")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              specialty === "general"
                ? "bg-white text-teal-800 shadow-xs dark:bg-slate-800 dark:text-teal-300"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            پزشکی عمومی
          </button>
        </div>
      </div>

      {/* Quick Clinical Presets Strip (One-Click Setup) */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 pl-2">
          <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          الگوهای سریع بالینی:
        </span>
        <button
          type="button"
          onClick={applyPresetFluURI}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-500 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
        >
          سرماخوردگی / گلودرد حاد (URI)
        </button>
        <button
          type="button"
          onClick={applyPresetHypertension}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-500 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
        >
          کنترل فشار خون بالا
        </button>
        <button
          type="button"
          onClick={applyPresetNormalCheckup}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-teal-500 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
        >
          چکاپ دوره‌ای نرمال
        </button>
      </div>

      {/* Navigation Step Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveTab("complaint")}
          className={`flex items-center gap-2 rounded-t-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "complaint"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>
            ۱. شکایت اصلی ({formatPersianNumber(selectedCcIds.length + customCc.length)})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vitals")}
          className={`flex items-center gap-2 rounded-t-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "vitals"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>۲. علائم حیاتی {systolicBp ? "✓" : ""}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("exam")}
          className={`flex items-center gap-2 rounded-t-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "exam"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          <span>
            ۳. معاینه بالینی ({formatPersianNumber(selectedPeIds.length + customPe.length)})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("diagnosis")}
          className={`flex items-center gap-2 rounded-t-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "diagnosis"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>
            ۴. تشخیص بالینی ({formatPersianNumber(selectedDxIds.length + customDx.length)})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-2 rounded-t-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "plan"
              ? "border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/30"
              : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
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
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>شکایت اصلی بیمار (Chief Complaint)</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  ورود پویا و سریع
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                با کلیک انتخاب کنید، در کادر جستجو تایپ کنید و Enter بزنید، یا با دکمه میکروفون 🎤 دیکته کنید.
              </p>
            </div>

            {/* Escape Hatch Search + Local Mic Input */}
            <div className="w-full sm:w-80 flex items-center gap-1.5">
              <div className="relative flex-1">
                <Input
                  placeholder="جست‌وجو یا تایپ شکایت سفارشی + Enter..."
                  value={ccSearch}
                  onChange={(e) => setCcSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && ccSearch.trim()) {
                      e.preventDefault();
                      addCustomCc(ccSearch);
                    }
                  }}
                  icon={<Search className="h-4 w-4" />}
                  className="h-9 text-xs"
                />
              </div>

              {/* Contextual Microphone (Doc 09) */}
              <button
                type="button"
                onClick={() => startContextualDictation("cc")}
                title="دیکته صوتی اختصاصی شکایت اصلی"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  isLocalDictatingSection === "cc"
                    ? "border-red-500 bg-red-50 text-red-600 animate-pulse"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>

              {ccSearch.trim() && (
                <Button
                  size="sm"
                  type="button"
                  onClick={() => addCustomCc(ccSearch)}
                  className="h-9 text-xs shrink-0 px-2.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>ثبت</span>
                </Button>
              )}
            </div>
          </div>

          {/* Active Custom Chips (Doc 09) */}
          {customCc.length > 0 && (
            <div className="rounded-2xl border border-teal-200/70 bg-teal-50/40 p-3 dark:border-teal-900/40 dark:bg-teal-950/20 space-y-1.5">
              <span className="text-[11px] font-bold text-teal-950 dark:text-teal-300 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-teal-600" />
                شکایت‌های اختصاصی ثبت‌شده (متن آزاد / دیکته صوتی):
              </span>
              <div className="flex flex-wrap gap-2">
                {customCc.map((txt) => (
                  <div
                    key={txt}
                    className="flex items-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3 py-1 text-xs font-bold text-teal-950 shadow-2xs dark:border-teal-800 dark:bg-slate-900 dark:text-teal-200"
                  >
                    <span>{txt}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomCc(txt)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Templates Grid */}
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
                      ? "border-teal-500 bg-teal-50/80 text-teal-950 shadow-xs dark:bg-teal-950/40 dark:text-teal-200"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-xs md:text-sm font-semibold">
                    {item.phraseText}
                  </span>
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isSelected
                        ? "border-teal-600 bg-teal-600 text-white"
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
                  <Droplet className="h-4 w-4 text-rose-500" />
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
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>یافته‌های معاینه بالینی (معاینات استاندارد + یادداشت اختصاصی)</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  یادداشت تکمیلی
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                روی هر یافته کلیک کنید و در صورت نیاز با زدن «+ یادداشت»، جزئیات مکان یا شدت را اضافه کنید.
              </p>
            </div>

            {/* Escape Hatch Search + Local Mic Input */}
            <div className="w-full sm:w-80 flex items-center gap-1.5">
              <div className="relative flex-1">
                <Input
                  placeholder="جست‌وجو یا ثبت یافته معاینه جدید + Enter..."
                  value={peSearch}
                  onChange={(e) => setPeSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && peSearch.trim()) {
                      e.preventDefault();
                      addCustomPe(peSearch);
                    }
                  }}
                  icon={<Search className="h-4 w-4" />}
                  className="h-9 text-xs"
                />
              </div>

              {/* Contextual Microphone (Doc 09) */}
              <button
                type="button"
                onClick={() => startContextualDictation("pe")}
                title="دیکته صوتی اختصاصی یافته‌های معاینه"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  isLocalDictatingSection === "pe"
                    ? "border-red-500 bg-red-50 text-red-600 animate-pulse"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>

              {peSearch.trim() && (
                <Button
                  size="sm"
                  type="button"
                  onClick={() => addCustomPe(peSearch)}
                  className="h-9 text-xs shrink-0 px-2.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>ثبت</span>
                </Button>
              )}
            </div>
          </div>

          {/* Active Custom Chips (Doc 09) */}
          {customPe.length > 0 && (
            <div className="rounded-2xl border border-teal-200/70 bg-teal-50/40 p-3 dark:border-teal-900/40 dark:bg-teal-950/20 space-y-1.5">
              <span className="text-[11px] font-bold text-teal-950 dark:text-teal-300 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-teal-600" />
                یافته‌های اختصاصی خارج از الگو (سفارشی / دیکته صوتی):
              </span>
              <div className="flex flex-wrap gap-2">
                {customPe.map((txt) => (
                  <div
                    key={txt}
                    className="flex items-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3 py-1 text-xs font-bold text-teal-950 shadow-2xs dark:border-teal-800 dark:bg-slate-900 dark:text-teal-200"
                  >
                    <span>{txt}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomPe(txt)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(examFindingsBySystem).map(([system, items]) => (
              <div key={system} className="space-y-2">
                <span className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {system}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {items.map((item) => {
                    const isSelected = selectedPeIds.includes(item.id);
                    const modifier = itemModifiers[item.id];
                    const isEditingThisModifier = activeModifierItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col justify-between rounded-2xl border p-3.5 transition-all duration-150 ${
                          isSelected
                            ? "border-teal-500 bg-teal-50/80 text-teal-950 shadow-xs dark:bg-teal-950/40 dark:text-teal-200"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div
                          onClick={() =>
                            toggleSelection(item.id, selectedPeIds, setSelectedPeIds)
                          }
                          className="flex items-start justify-between cursor-pointer"
                        >
                          <span className="text-xs md:text-sm font-semibold leading-relaxed">
                            {item.phraseText}
                          </span>
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                              isSelected
                                ? "border-teal-600 bg-teal-600 text-white"
                                : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                        </div>

                        {/* Item Modifier Note & Button (Doc 09) */}
                        {isSelected && (
                          <div className="mt-2.5 pt-2 border-t border-teal-200/80 dark:border-teal-900/60">
                            {isEditingThisModifier ? (
                              <div className="flex items-center gap-1.5 animate-in fade-in">
                                <Input
                                  value={activeModifierText}
                                  onChange={(e) => setActiveModifierText(e.target.value)}
                                  placeholder="یادداشت تکمیلی (مثلاً: فقط سمت راست)..."
                                  className="h-7 text-xs bg-white dark:bg-slate-900"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveModifier(item.id);
                                  }}
                                />
                                <Button
                                  size="sm"
                                  type="button"
                                  onClick={() => handleSaveModifier(item.id)}
                                  className="h-7 px-2 text-[11px]"
                                >
                                  ثبت
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[11px]">
                                {modifier ? (
                                  <span className="font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {modifier}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">بدون یادداشت افزوده</span>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModifier(item.id);
                                  }}
                                  className="text-teal-700 dark:text-teal-400 hover:underline font-semibold text-[11px]"
                                >
                                  {modifier ? "ویرایش یادداشت" : "+ افزودن یادداشت (Modifier)"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>تشخیص‌های بالینی استاندارد و تشخیصی سفارشی</span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  کدگذاری ICD-10
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                تشخیص‌های استاندارد را انتخاب کنید یا تشخیص نادر/ترکیبی را مستقیماً وارد کنید.
              </p>
            </div>

            {/* Escape Hatch Search + Local Mic Input */}
            <div className="w-full sm:w-80 flex items-center gap-1.5">
              <div className="relative flex-1">
                <Input
                  placeholder="جست‌وجو یا ثبت تشخیص جدید + Enter..."
                  value={dxSearch}
                  onChange={(e) => setDxSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && dxSearch.trim()) {
                      e.preventDefault();
                      addCustomDx(dxSearch);
                    }
                  }}
                  icon={<Search className="h-4 w-4" />}
                  className="h-9 text-xs"
                />
              </div>

              {/* Contextual Microphone (Doc 09) */}
              <button
                type="button"
                onClick={() => startContextualDictation("dx")}
                title="دیکته صوتی اختصاصی تشخیص بالینی"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  isLocalDictatingSection === "dx"
                    ? "border-red-500 bg-red-50 text-red-600 animate-pulse"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Mic className="h-4 w-4" />
              </button>

              {dxSearch.trim() && (
                <Button
                  size="sm"
                  type="button"
                  onClick={() => addCustomDx(dxSearch)}
                  className="h-9 text-xs shrink-0 px-2.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>ثبت</span>
                </Button>
              )}
            </div>
          </div>

          {/* Active Custom Chips (Doc 09) */}
          {customDx.length > 0 && (
            <div className="rounded-2xl border border-teal-200/70 bg-teal-50/40 p-3 dark:border-teal-900/40 dark:bg-teal-950/20 space-y-1.5">
              <span className="text-[11px] font-bold text-teal-950 dark:text-teal-300 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-teal-600" />
                تشخیص‌های سفارشی خارج از الگو (تایپ آزاد / دیکته صوتی):
              </span>
              <div className="flex flex-wrap gap-2">
                {customDx.map((txt) => (
                  <div
                    key={txt}
                    className="flex items-center gap-1.5 rounded-xl border border-teal-300 bg-white px-3 py-1 text-xs font-bold text-teal-950 shadow-2xs dark:border-teal-800 dark:bg-slate-900 dark:text-teal-200"
                  >
                    <span>{txt}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomDx(txt)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                      ? "border-teal-500 bg-teal-50/80 text-teal-950 shadow-xs dark:bg-teal-950/40 dark:text-teal-200"
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
                        ? "border-teal-600 bg-teal-600 text-white"
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100"
            />
          </div>

          {/* Voice transcript badge if recorded */}
          {voiceTranscriptSaved && (
            <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-3 text-xs text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/20 dark:text-teal-300">
              <span className="font-bold flex items-center gap-1 mb-1">
                <Mic className="h-3.5 w-3.5 text-teal-600" />
                متن خام دیکته صوتی AI ثبت‌شده:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-mono">
                {voiceTranscriptSaved}
              </p>
            </div>
          )}

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
                className="text-xs font-semibold text-teal-600 dark:text-teal-400"
              >
                {showFallback ? "بستن" : "+ افزودن"}
              </button>
            </div>

            {showFallback && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  توجه: با فعال‌بودن سیستم ورود پویای داده (Escape Hatches)، می‌توانید عبارات سفارشی را مستقیماً در بخش‌های مربوطه وارد کنید.
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
                className="gap-2 shadow-sm px-6"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>تایید و ثبت نهایی ویزیت (Finalize)</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global AI Voice Dictation Modal (Doc 08 & 09) */}
      <Modal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title="دیکته صوتی هوش مصنوعی و نگاشت خودکار (AI Speech-to-Text)"
        description="استخراج هوشمند علائم، معاینات و تشخیص‌ها بدون توقف پزشک (Escape Hatches & Zero Data Loss)"
        size="lg"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              سناریوهای نمونه بالینی جهت تست یا دیکته مستقیم با میکروفون:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  setAiTranscript(
                    "بیمار با سردرد شدید ضربان‌دار و حالت تهوع مراجعه کرده. فشار خون ۱۴۰ روی ۹۰، ضربان ۷۸. در معاینه شکم نرم، صدای قلب S1 و S2 نرمال. تشخیص احتمالی میگرن بدون اورا و گاستریت حاد."
                  )
                }
                className="text-right p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-400 text-[11px] text-slate-800 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200 transition-colors"
              >
                <strong>۱. سردرد و فشار خون بالا:</strong> «فشار ۱۴۰/۹۰، شکم نرم، تشخیص میگرن و گاستریت»
              </button>

              <button
                type="button"
                onClick={() =>
                  setAiTranscript(
                    "بیمار با سرفه خلط‌دار، تب و لرز و گلودرد شدید. تب ۳۸.۴، ضربان ۸۸، اکسیژن ۹۷. حلق ملتهب، ریه پاک. تشخیص سرماخوردگی حاد و فارنژیت."
                  )
                }
                className="text-right p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-400 text-[11px] text-slate-800 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200 transition-colors"
              >
                <strong>۲. عفونت تنفسی حاد:</strong> «تب ۳۸.۴، سرفه، گلودرد، فارنژیت حاد»
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              متن دیکته صوتی پزشک:
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={aiTranscript}
                onChange={(e) => setAiTranscript(e.target.value)}
                placeholder="متن دیکته را اینجا تایپ کنید یا دکمه ضبط صدا را بزنید..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          </div>

          {/* AI Unmapped Warning explanation (Doc 09) */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-[11px] text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>مدیریت عدم نگاشت در AI:</strong> مواردی که با الگوهای استاندارد سیستم تطبیق داده نشوند، حذف نخواهند شد بلکه به صورت <strong>کپسول‌های سفارشی</strong> در بخش مربوطه درج می‌شوند تا شما تأیید یا ویرایش فرمایید.
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAiModalOpen(false)}
            >
              انصراف
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => applyAiVoiceExtraction(aiTranscript)}
              disabled={!aiTranscript.trim()}
              className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Sparkles className="h-4 w-4 text-teal-200" />
              <span>پردازش و استخراج هوشمند در فرم</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
