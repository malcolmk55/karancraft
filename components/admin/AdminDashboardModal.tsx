"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AuditLog,
  Doctor,
  MedicalOffice,
  Patient,
  User,
  UserRole,
  Visit,
} from "@/types/medical";
import {
  getAuditLogs,
  getOffices,
  getPatients,
  getUsers,
  getVisits,
  saveOffice,
  saveUser,
} from "@/lib/storage";
import { formatPersianNumber } from "@/lib/utils";
import {
  ShieldAlert,
  Users,
  Building2,
  Activity,
  CheckCircle2,
  Search,
  Plus,
  ShieldCheck,
} from "lucide-react";

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export function AdminDashboardModal({
  isOpen,
  onClose,
  onDataChanged,
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = React.useState<
    "kpis" | "users" | "offices" | "audit_logs"
  >("kpis");

  const [users, setUsers] = React.useState<User[]>([]);
  const [offices, setOffices] = React.useState<MedicalOffice[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [visits, setVisits] = React.useState<Visit[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);

  // Search/Filters
  const [userSearch, setUserSearch] = React.useState("");
  const [logSearch, setLogSearch] = React.useState("");

  // Create User State
  const [isAddingUser, setIsAddingUser] = React.useState(false);
  const [newUserName, setNewUserName] = React.useState("");
  const [newUserEmail, setNewUserEmail] = React.useState("");
  const [newUserRole, setNewUserRole] = React.useState<UserRole>("doctor");
  const [newUserOfficeId, setNewUserOfficeId] = React.useState("");

  // Create Office State
  const [isAddingOffice, setIsAddingOffice] = React.useState(false);
  const [newOfficeName, setNewOfficeName] = React.useState("");
  const [newOfficeAddress, setNewOfficeAddress] = React.useState("");
  const [newOfficePhone, setNewOfficePhone] = React.useState("");
  const [newOfficeCity, setNewOfficeCity] = React.useState("تهران");

  const loadData = React.useCallback(() => {
    setUsers(getUsers());
    setOffices(getOffices());
    setPatients(getPatients());
    setVisits(getVisits());
    setAuditLogs(getAuditLogs());
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const handleToggleUserActive = (user: User) => {
    saveUser({
      ...user,
      isActive: !user.isActive,
    });
    loadData();
    if (onDataChanged) onDataChanged();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    saveUser({
      fullName: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      isActive: true,
      officeId: newUserOfficeId || undefined,
    });

    setNewUserName("");
    setNewUserEmail("");
    setIsAddingUser(false);
    loadData();
    if (onDataChanged) onDataChanged();
  };

  const handleCreateOffice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficeName.trim()) return;

    saveOffice({
      name: newOfficeName.trim(),
      address: newOfficeAddress.trim() || undefined,
      phone: newOfficePhone.trim() || undefined,
      city: newOfficeCity.trim() || "تهران",
    });

    setNewOfficeName("");
    setNewOfficeAddress("");
    setNewOfficePhone("");
    setIsAddingOffice(false);
    loadData();
    if (onDataChanged) onDataChanged();
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.includes(q)
    );
  });

  const filteredLogs = auditLogs.filter((log) => {
    const q = logSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="کنسول مدیریت مرکزی و ممیزی سیستم"
      description="مدیریت کاربران، مطب‌ها، کنترل سطوح دسترسی (RBAC) و لاگ‌های امنیتی (سند ۰۶)"
      size="3xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs (Cohesive Minimalist Styling) */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 dark:border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("kpis")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "kpis"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>داشبورد کلان</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "users"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>مدیریت کاربران ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("offices")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "offices"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>مدیریت مطب‌ها ({offices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit_logs")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === "audit_logs"
                ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>لاگ امنیتی و ممیزی ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: KPIs Overview */}
        {activeTab === "kpis" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500">کاربران فعال</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(users.filter((u) => u.isActive).length)}
                </p>
                <span className="text-[10px] text-slate-500">پزشکان و کادر پذیرش</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500">مراکز درمانی</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(offices.length)}
                </p>
                <span className="text-[10px] text-slate-500">مطب‌های ثبت‌شده</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500">کل پرونده‌ها</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(patients.length)}
                </p>
                <span className="text-[10px] text-slate-500">بایگانی فعال</span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <span className="text-[11px] font-medium text-slate-500">ویزیت‌های بالینی</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {formatPersianNumber(visits.length)}
                </p>
                <span className="text-[10px] text-teal-600 dark:text-teal-400">ثبت ساختاریافته</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>امنیت داده‌ها و حفاظت از اطلاعات بالینی:</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                کلیه تراکنش‌ها در بستر رمزنگاری محلی ثبت شده و دسترسی به اطلاعات بر اساس ماتریس RBAC کنترل می‌گردد. لاگ‌های امنیتی برای رصد حسابرسی تغییرات در دسترس است.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === "users" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="جست‌وجوی کاربر..."
                  className="pr-9 h-9 text-xs"
                />
              </div>

              <Button
                size="sm"
                onClick={() => setIsAddingUser(!isAddingUser)}
                className="gap-1.5 h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>افزودن کاربر</span>
              </Button>
            </div>

            {/* Add User Sub-form */}
            {isAddingUser && (
              <form
                onSubmit={handleCreateUser}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 space-y-3"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ثبت کاربر جدید در سامانه
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نام کامل:
                    </label>
                    <Input
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="نام و نام خانوادگی..."
                      required
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ایمیل ورود:
                    </label>
                    <Input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="user@medidoc.ir"
                      required
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نقش در سامانه:
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 h-8"
                    >
                      <option value="doctor">پزشک (Doctor)</option>
                      <option value="receptionist">منشی مطب (Receptionist)</option>
                      <option value="admin">ادمین سیستم (Admin)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingUser(false)}
                    className="h-7 text-xs"
                  >
                    انصراف
                  </Button>
                  <Button type="submit" size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                    ذخیره و ایجاد دسترسی
                  </Button>
                </div>
              </form>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="p-3">نام کاربر</th>
                    <th className="p-3">ایمیل</th>
                    <th className="p-3">نقش</th>
                    <th className="p-3">وضعیت</th>
                    <th className="p-3">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        {u.fullName}
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {u.email}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {u.role === "admin"
                            ? "ادمین کل"
                            : u.role === "doctor"
                            ? "پزشک"
                            : "منشی"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {u.isActive ? (
                          <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-[11px] font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            فعال
                          </span>
                        ) : (
                          <span className="text-rose-500 text-[11px] font-semibold">
                            غیرفعال
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserActive(u)}
                          className="h-7 text-[11px] px-2 text-slate-600 hover:text-slate-900"
                        >
                          {u.isActive ? "غیرفعال‌سازی" : "فعال‌سازی مجدد"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Offices Management */}
        {activeTab === "offices" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                مطب‌ها و کلینیک‌های فعال سامانه
              </h4>
              <Button
                size="sm"
                onClick={() => setIsAddingOffice(!isAddingOffice)}
                className="gap-1.5 h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>افزودن مطب</span>
              </Button>
            </div>

            {isAddingOffice && (
              <form
                onSubmit={handleCreateOffice}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/60 space-y-3"
              >
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ثبت مطب جدید
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نام مطب:
                    </label>
                    <Input
                      value={newOfficeName}
                      onChange={(e) => setNewOfficeName(e.target.value)}
                      placeholder="مثال: مطب ونک..."
                      required
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تلفن تماس:
                    </label>
                    <Input
                      value={newOfficePhone}
                      onChange={(e) => setNewOfficePhone(e.target.value)}
                      placeholder="021-..."
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      آدرس کامل:
                    </label>
                    <Input
                      value={newOfficeAddress}
                      onChange={(e) => setNewOfficeAddress(e.target.value)}
                      placeholder="خیابان، پلاک، طبقه..."
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingOffice(false)}
                    className="h-7 text-xs"
                  >
                    انصراف
                  </Button>
                  <Button type="submit" size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                    ثبت مطب
                  </Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {offices.map((off) => (
                <div
                  key={off.id}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {off.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{off.address}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {off.city || "تهران"}
                    </Badge>
                  </div>
                  <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 flex items-center justify-between dark:border-slate-800">
                    <span>تلفن: {off.phone || "—"}</span>
                    <span className="text-teal-600 font-semibold">فعال</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs Trail */}
        {activeTab === "audit_logs" && (
          <div className="space-y-3 sm:space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="فیلتر لاگ (نام، عملیات)..."
                className="pr-9 h-9 text-xs"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 max-h-80 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/80">
                  <tr>
                    <th className="p-3">عملیات</th>
                    <th className="p-3">کاربر</th>
                    <th className="p-3">بخش</th>
                    <th className="p-3">جزئیات</th>
                    <th className="p-3">زمان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100">
                        {log.action}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold">{log.userName}</span>{" "}
                        <span className="text-[10px] text-slate-400">({log.userRole})</span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px] font-mono">
                        {log.entityType}
                      </td>
                      <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                      <td className="p-3 text-[10px] text-slate-400 font-mono whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleTimeString("fa-IR")}{" "}
                        {new Date(log.createdAt).toLocaleDateString("fa-IR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
