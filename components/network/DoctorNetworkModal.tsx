"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Doctor,
  DoctorConnection,
  Patient,
  SharedPatient,
} from "@/types/medical";
import {
  getActiveDoctor,
  getAllDoctors,
  getConnections,
  getPatients,
  getSharedPatients,
  removeConnection,
  respondToConnectionRequest,
  sendConnectionRequest,
} from "@/lib/storage";
import {
  Users,
  UserCheck,
  UserPlus,
  Share2,
  Clock,
  ShieldCheck,
  Search,
  Check,
  X,
  Ban,
  Building2,
  Stethoscope,
  FileText,
  Lock,
  Eye,
  AlertCircle,
} from "lucide-react";

interface DoctorNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSharedPatient?: (patient: Patient) => void;
}

export function DoctorNetworkModal({
  isOpen,
  onClose,
  onSelectSharedPatient,
}: DoctorNetworkModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "connections" | "incoming" | "sent" | "search" | "shared_patients"
  >("connections");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [connections, setConnections] = React.useState<DoctorConnection[]>([]);
  const [sharedPatients, setSharedPatients] = React.useState<SharedPatient[]>([]);
  const [allDoctors, setAllDoctors] = React.useState<Doctor[]>([]);
  const [currentDoctor, setCurrentDoctor] = React.useState<Doctor | null>(null);

  const loadNetworkData = React.useCallback(() => {
    setConnections(getConnections());
    setSharedPatients(getSharedPatients());
    setAllDoctors(getAllDoctors());
    setCurrentDoctor(getActiveDoctor());
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadNetworkData();
    }
  }, [isOpen, loadNetworkData]);

  if (!currentDoctor) return null;

  // 1. Accepted Connections
  const acceptedConnections = connections.filter(
    (c) =>
      c.status === "accepted" &&
      (c.requesterId === currentDoctor.id || c.receiverId === currentDoctor.id)
  );

  // 2. Incoming Requests
  const incomingRequests = connections.filter(
    (c) => c.status === "pending" && c.receiverId === currentDoctor.id
  );

  // 3. Sent Requests
  const sentRequests = connections.filter(
    (c) => c.status === "pending" && c.requesterId === currentDoctor.id
  );

  // 4. Shared with Me
  const sharedWithMe = sharedPatients.filter(
    (s) => s.sharedWithDoctorId === currentDoctor.id && s.isActive
  );

  // Filter doctors for search
  const filteredDoctors = allDoctors.filter((doc) => {
    if (doc.id === currentDoctor.id) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      doc.fullName.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q) ||
      doc.city?.toLowerCase().includes(q) ||
      doc.medicalCouncilNumber.includes(q)
    );
  });

  const getConnectionStatusWith = (docId: string): DoctorConnection | undefined => {
    return connections.find(
      (c) =>
        (c.requesterId === currentDoctor.id && c.receiverId === docId) ||
        (c.requesterId === docId && c.receiverId === currentDoctor.id)
    );
  };

  const handleSendRequest = (docId: string) => {
    sendConnectionRequest(docId);
    loadNetworkData();
  };

  const handleAccept = (connId: string) => {
    respondToConnectionRequest(connId, "accepted");
    loadNetworkData();
  };

  const handleReject = (connId: string) => {
    respondToConnectionRequest(connId, "rejected");
    loadNetworkData();
  };

  const handleBlock = (connId: string) => {
    respondToConnectionRequest(connId, "blocked");
    loadNetworkData();
  };

  const handleDisconnect = (connId: string) => {
    if (confirm("آیا از قطع ارتباط با این همکار پزشک اطمینان دارید؟")) {
      removeConnection(connId);
      loadNetworkData();
    }
  };

  const handleOpenPatient = (shp: SharedPatient) => {
    const allPatients = getPatients();
    const p = allPatients.find((item) => item.id === shp.patientId);
    if (p && onSelectSharedPatient) {
      onSelectSharedPatient(p);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="شبکه ارتباط بین پزشکان و پرونده‌های مشترک"
      description="همکاری بین تخصصی، مشاوره بالینی، ارجاع بیمار و اشتراک‌گذاری امن پرونده‌ها (سند ۰۷)"
      size="2xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("connections")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "connections"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>همکاران متصل ({acceptedConnections.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("incoming")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "incoming"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>درخواست‌های دریافتی</span>
            {incomingRequests.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white font-black">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shared_patients")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "shared_patients"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>بیماران مشترک ({sharedWithMe.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "search"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>جست‌وجوی پزشکان</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sent")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "sent"
                ? "bg-slate-700 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span>درخواست‌های ارسالی ({sentRequests.length})</span>
          </button>
        </div>

        {/* Tab 1: Connected Doctors */}
        {activeTab === "connections" && (
          <div className="space-y-3">
            {acceptedConnections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
                <Users className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  هنوز ارتباطی برقرار نشده است
                </h4>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  از تب «جست‌وجوی پزشکان» می‌توانید همکاران مورد نظر خود را جست‌وجو کرده و درخواست ارتباط بالینی ارسال نمایید.
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("search")}
                  className="mt-4 gap-1.5"
                >
                  <Search className="h-4 w-4" />
                  <span>جست‌وجوی همکاران</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {acceptedConnections.map((conn) => {
                  const partnerDocId =
                    conn.requesterId === currentDoctor.id
                      ? conn.receiverId
                      : conn.requesterId;
                  const partner = allDoctors.find((d) => d.id === partnerDocId);
                  if (!partner) return null;

                  return (
                    <div
                      key={conn.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {partner.fullName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {partner.specialty === "internal" ? "متخصص بیماری‌های داخلی" : "پزشک عمومی"} • نظام: {partner.medicalCouncilNumber}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {partner.clinicName} {partner.city ? `(${partner.city})` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <Check className="h-3.5 w-3.5" />
                          ارتباط بالینی فعال
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnect(conn.id)}
                          className="h-7 text-red-600 hover:bg-red-50 hover:text-red-700 text-[11px] px-2"
                        >
                          قطع ارتباط
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Incoming Requests */}
        {activeTab === "incoming" && (
          <div className="space-y-3">
            {incomingRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
                <Check className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  درخواست دریافتی جدیدی وجود ندارد
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  تمام درخواست‌های ارتباط بررسی شده‌اند.
                </p>
              </div>
            ) : (
              incomingRequests.map((req) => {
                const sender = allDoctors.find((d) => d.id === req.requesterId);
                if (!sender) return null;

                return (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {sender.fullName}
                          </h4>
                          <Badge variant="warning" className="text-[10px]">
                            درخواست همکار
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {sender.specialty === "internal" ? "متخصص بیماری‌های داخلی" : "پزشک عمومی"} • نظام: {sender.medicalCouncilNumber}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {sender.clinicName} — درخواست جهت ارجاع و اشتراک پرونده‌ها
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(req.id)}
                        className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>پذیرش</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(req.id)}
                        className="gap-1 text-slate-600 hover:text-slate-900 h-8"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>رد</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBlock(req.id)}
                        className="text-red-500 hover:bg-red-50 h-8 px-2"
                        title="مسدودسازی همکار"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Shared Patients */}
        {activeTab === "shared_patients" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
              <div>
                <strong>اصل مالکیت پرونده (Doc 07):</strong> پرونده‌های اشتراکی همواره متعلق به پزشک مبدأ هستند. شما بسته به سطح دسترسی تعیین‌شده، می‌توانید سوابق بیمار را بررسی نمایید یا ویزیت تکمیلی ثبت فرمایید.
              </div>
            </div>

            {sharedWithMe.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
                <Share2 className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  هیچ پرونده‌ای با شما به اشتراک گذاشته نشده است
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  زمانی که همکاران متصل پرونده بیماری را برای مشاوره یا ارجاع با شما به اشتراک بگذارند، در این بخش نمایش داده خواهد شد.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sharedWithMe.map((shp) => {
                  const allPatients = getPatients();
                  const p = allPatients.find((item) => item.id === shp.patientId);
                  const patientName = p?.fullName || "بیمار بالینی";

                  return (
                    <div
                      key={shp.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {patientName}
                          </h4>
                          <Badge
                            variant={shp.accessLevel === "read_write" ? "success" : "default"}
                            className="text-[10px]"
                          >
                            {shp.accessLevel === "read_write"
                              ? "خواندن و ثبت ویزیت (Read/Write)"
                              : "فقط‌خواندنی (Read-Only)"}
                          </Badge>
                          {shp.patientConsent && (
                            <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold">
                              <Check className="h-3 w-3" />
                              رضایت بیمار اخذ شده
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          اشتراک توسط: <strong>{shp.ownerDoctorName}</strong> • تاریخ: {new Date(shp.sharedAt).toLocaleDateString("fa-IR")}
                        </p>
                        {shp.notes && (
                          <p className="text-xs bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                            یادداشت همکار: {shp.notes}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleOpenPatient(shp)}
                          className="gap-1.5"
                        >
                          <Eye className="h-4 w-4" />
                          <span>مشاهده پرونده</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Search & Connect */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جست‌وجو با نام پزشک، شماره نظام، تخصص یا شهر..."
                className="pr-10"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredDoctors.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">
                  پزشکی با این مشخصات یافت نشد.
                </p>
              ) : (
                filteredDoctors.map((doc) => {
                  const conn = getConnectionStatusWith(doc.id);

                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {doc.fullName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {doc.specialty === "internal" ? "بیماری‌های داخلی" : "پزشک عمومی"} • نظام: {doc.medicalCouncilNumber} • {doc.city || "تهران"}
                          </p>
                        </div>
                      </div>

                      <div>
                        {conn?.status === "accepted" ? (
                          <Badge variant="success" className="text-[10px]">
                            همکار متصل
                          </Badge>
                        ) : conn?.status === "pending" ? (
                          <Badge variant="warning" className="text-[10px]">
                            در انتظار پاسخ
                          </Badge>
                        ) : conn?.status === "blocked" ? (
                          <Badge variant="danger" className="text-[10px]">
                            مسدود شده
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSendRequest(doc.id)}
                            className="gap-1 h-8 text-xs"
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>ارسال درخواست ارتباط</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Sent Requests */}
        {activeTab === "sent" && (
          <div className="space-y-3">
            {sentRequests.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-8">
                درخواست ارسالی در انتظار پاسخی ندارید.
              </p>
            ) : (
              sentRequests.map((req) => {
                const receiver = allDoctors.find((d) => d.id === req.receiverId);
                if (!receiver) return null;

                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {receiver.fullName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {receiver.specialty === "internal" ? "متخصص بیماری‌های داخلی" : "پزشک عمومی"} • ارسال: {new Date(req.requestedAt).toLocaleDateString("fa-IR")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="text-[10px]">
                        در انتظار تایید همکار
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeConnection(req.id);
                          loadNetworkData();
                        }}
                        className="text-red-500 text-xs h-7 px-2"
                      >
                        لغو
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
