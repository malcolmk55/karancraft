"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Patient, SexType } from "@/types/medical";
import { savePatient } from "@/lib/storage";
import { User, Phone, CreditCard, Calendar, HeartPulse, AlertCircle, Plus, X } from "lucide-react";

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
  onSaved: (patient: Patient) => void;
}

const COMMON_ALLERGIES = ["پنی‌سیلین", "سولفونامیدها", "آسپرین", "NSAIDs", "کدئین"];
const COMMON_CONDITIONS = [
  "فشار خون اسنشیال",
  "دیابت نوع ۲",
  "کبد چرب",
  "آسم / آلرژی تنفسی",
  "کم‌کاری تیروئید",
  "بیماری قلبی",
];

export function PatientModal({
  isOpen,
  onClose,
  patientToEdit,
  onSaved,
}: PatientModalProps) {
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [nationalId, setNationalId] = React.useState("");
  const [age, setAge] = React.useState<string>("");
  const [sex, setSex] = React.useState<SexType>("male");
  const [bloodType, setBloodType] = React.useState("A+");
  const [allergies, setAllergies] = React.useState<string[]>([]);
  const [chronicConditions, setChronicConditions] = React.useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = React.useState("");
  const [customCondition, setCustomCondition] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (patientToEdit) {
      setFullName(patientToEdit.fullName);
      setPhone(patientToEdit.phone);
      setNationalId(patientToEdit.nationalId || "");
      setAge(patientToEdit.age ? String(patientToEdit.age) : "");
      setSex(patientToEdit.sex);
      setBloodType(patientToEdit.bloodType || "A+");
      setAllergies(patientToEdit.allergies || []);
      setChronicConditions(patientToEdit.chronicConditions || []);
      setNotes(patientToEdit.notes || "");
    } else {
      setFullName("");
      setPhone("");
      setNationalId("");
      setAge("");
      setSex("male");
      setBloodType("A+");
      setAllergies([]);
      setChronicConditions([]);
      setNotes("");
    }
    setError(null);
  }, [patientToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("لطفاً نام و نام خانوادگی بیمار را وارد کنید.");
      return;
    }
    if (!phone.trim()) {
      setError("شماره تماس الزامی است.");
      return;
    }

    const saved = savePatient({
      id: patientToEdit?.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      nationalId: nationalId.trim() || undefined,
      age: age ? parseInt(age, 10) : undefined,
      sex,
      bloodType,
      allergies,
      chronicConditions,
      notes: notes.trim() || undefined,
    });

    onSaved(saved);
    onClose();
  };

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const toggleCondition = (item: string) => {
    setChronicConditions((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !chronicConditions.includes(customCondition.trim())) {
      setChronicConditions([...chronicConditions, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patientToEdit ? "ویرایش پرونده بیمار" : "ثبت پرونده بیمار جدید"}
      description="مشخصات هویتی و سوابق پزشکی بیمار را ثبت کنید."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نام و نام خانوادگی بیمار <span className="text-rose-500">*</span>
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: علی حسینی"
              icon={<User className="h-4 w-4" />}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شماره همراه <span className="text-rose-500">*</span>
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 09121234567"
              icon={<Phone className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              کد ملی (اختیاری)
            </label>
            <Input
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="مثال: 0012345678"
              icon={<CreditCard className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                سن (سال)
              </label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="مثال: 38"
                icon={<Calendar className="h-4 w-4" />}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                جنسیت
              </label>
              <div className="flex h-11 rounded-xl border border-slate-200 p-1 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setSex("male")}
                  className={`flex-1 rounded-lg text-xs font-bold transition-colors ${
                    sex === "male"
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-400"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  مرد
                </button>
                <button
                  type="button"
                  onClick={() => setSex("female")}
                  className={`flex-1 rounded-lg text-xs font-bold transition-colors ${
                    sex === "female"
                      ? "bg-white text-purple-700 shadow-sm dark:bg-slate-800 dark:text-purple-400"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  زن
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Type & Allergies */}
        <div className="border-t border-slate-100 pt-4 dark:border-slate-800/80">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            حساسیت‌های دارویی و آلرژی‌ها
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_ALLERGIES.map((item) => {
              const isSelected = allergies.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAllergy(item)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              placeholder="سایر حساسیت‌ها..."
              className="h-9 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomAllergy();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomAllergy}
              className="shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              افزودن
            </Button>
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="border-t border-slate-100 pt-4 dark:border-slate-800/80">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            بیماری‌های زمینه‌ای و مزمن
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_CONDITIONS.map((item) => {
              const isSelected = chronicConditions.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCondition(item)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Input
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
              placeholder="سایر بیماری‌های زمینه‌ای..."
              className="h-9 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomCondition();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomCondition}
              className="shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              افزودن
            </Button>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            یادداشت عمومی پرونده (اختیاری)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="توضیحات کلی راجع به بیمار، شغل، مراجعات پیشین و..."
            className="w-full rounded-xl border border-slate-200 bg-white/70 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit">
            {patientToEdit ? "ذخیره تغییرات پرونده" : "ایجاد و باز کردن پرونده"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
