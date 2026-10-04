"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Doctor,
  DoctorConnection,
  Patient,
  ShareAccessLevel,
  SharedPatient,
} from "@/types/medical";
import {
  getActiveDoctor,
  getAllDoctors,
  getConnections,
  getSharedPatients,
  revokePatientShare,
  sharePatientWithDoctor,
} from "@/lib/storage";
import {
  Share2,
  Users,
  Check,
  ShieldCheck,
  Trash2,
  Stethoscope,
  Info,
  Lock,
  FileText,
} from "lucide-react";

interface SharePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onShareUpdated?: () => void;
}

export function SharePatientModal({
  isOpen,
  onClose,
  patient,
  onShareUpdated,
}: SharePatientModalProps) {
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>("");
  const [accessLevel, setAccessLevel] = React.useState<ShareAccessLevel>("read_only");
  const [patientConsent, setPatientConsent] = React.useState<boolean>(true);
  const [notes, setNotes] = React.useState<string>("");
  const [connectedDoctors, setConnectedDoctors] = React.useState<Doctor[]>([]);
  const [activeShares, setActiveShares] = React.useState<SharedPatient[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadData = React.useCallback(() => {
    const currentDoc = getActiveDoctor();
    const connections = getConnections().filter(
      (c) =>
        c.status === "accepted" &&
        (c.requesterId === currentDoc.id || c.receiverId === currentDoc.id)
    );

    const partnerIds = connections.map((c) =>
      c.requesterId === currentDoc.id ? c.receiverId : c.requesterId
    );

    const doctors = getAllDoctors().filter((d) => partnerIds.includes(d.id));
    setConnectedDoctors(doctors);

    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }

    const shares = getSharedPatients().filter(
      (s) => s.patientId === patient.id && s.isActive
    );
    setActiveShares(shares);
  }, [patient.id, selectedDoctorId]);

  React.useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const handleShare = () => {
    if (!selectedDoctorId) return;
    setIsSubmitting(true);

    try {
      sharePatientWithDoctor({
        patientId: patient.id,
        sharedWithDoctorId: selectedDoctorId,
        accessLevel,
        patientConsent,
        notes: notes.trim() || undefined,
      });

      setNotes("");
      loadData();
      if (onShareUpdated) onShareUpdated();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = (shareId: string) => {
    if (confirm("آیا از لغو اشتراک‌گذاری این پرونده با همکار اطمینان دارید؟")) {
      revokePatientShare(shareId);
      loadData();
      if (onShareUpdated) onShareUpdated();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`اشتراک‌گذاری پرونده بالینی: ${patient.fullName}`}
      description="ارجاع تخصصی، مشاوره همکار، و انتقال پرونده با حفظ مالکیت و رعایت محرمانگی (سند ۰۷)"
      size="lg"
    >
      <div className="space-y-6">
        {/* Active shares list */}
        {activeShares.length > 0 && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              اشتراک‌گذاری‌های فعال برای این بیمار:
            </h4>
            <div className="space-y-2">
              {activeShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      دکتر {share.sharedWithDoctorName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      سطح دسترسی:{" "}
                      <strong>
                        {share.accessLevel === "read_write"
                          ? "خواندن و ثبت ویزیت"
                          : "فقط‌خواندنی"}
                      </strong>{" "}
                      • تاریخ اشتراک: {new Date(share.sharedAt).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(share.id)}
                    className="text-red-600 hover:bg-red-50 text-xs h-8 gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>لغو دسترسی</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Form */}
        {connectedDoctors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-6 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
            <Users className="mx-auto h-8 w-8 text-amber-500 mb-2" />
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              هیچ همکار متصلی در شبکه شما وجود ندارد
            </h4>
            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400 max-w-sm mx-auto">
              اشتراک‌گذاری پرونده بیمار فقط با پزشکانی ممکن است که ارتباط کاری پذیرفته‌شده (Accepted) با شما دارند. ابتدا از بخش «شبکه پزشکان» به همکار خود متصل شوید.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Step 1: Doctor Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                انتخاب همکار پزشک مقصد:
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                {connectedDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.fullName} — {doc.specialty === "internal" ? "متخصص داخلی" : "پزشک عمومی"} ({doc.clinicName})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Access Level Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                سطح دسترسی همکار:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccessLevel("read_only")}
                  className={`flex flex-col items-start rounded-2xl border p-3 text-right transition-all ${
                    accessLevel === "read_only"
                      ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 font-bold"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold">فقط‌خواندنی (Read-Only)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                    مشاهده سوابق ویزیت‌ها و شرح حال بیمار بدون امکان ثبت ویزیت جدید
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccessLevel("read_write")}
                  className={`flex flex-col items-start rounded-2xl border p-3 text-right transition-all ${
                    accessLevel === "read_write"
                      ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 font-bold"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold">خواندن و ثبت ویزیت (Read/Write)</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                    امکان مشاهده سوابق و ثبت ویزیت‌های جدید با برچسب و نام پزشک همکار
                  </span>
                </button>
              </div>
            </div>

            {/* Step 3: Referral Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                یادداشت یا دلیل ارجاع برای همکار (اختیاری):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="مثال: بیمار به دلیل افت هموگلوبین و مشکوک به خونریزی گوارشی جهت آندوسکوپی خدمتتان معرفی می‌گردد..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Step 4: Patient Consent */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900">
              <input
                type="checkbox"
                id="consentCheck"
                checked={patientConsent}
                onChange={(e) => setPatientConsent(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="consentCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <strong>رضایت بیمار:</strong> بیمار از اشتراک اطلاعات پرونده بالینی با پزشک معتمد مطلع بوده و رضایت شفاهی یا کتبی خود را اعلام نموده است.
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={onClose}>
                انصراف
              </Button>
              <Button
                size="sm"
                onClick={handleShare}
                disabled={isSubmitting || !selectedDoctorId}
                className="gap-1.5"
              >
                <Share2 className="h-4 w-4" />
                <span>تأیید و اشتراک‌گذاری پرونده</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
