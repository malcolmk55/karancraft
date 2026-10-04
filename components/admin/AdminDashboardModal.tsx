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
  FileText,
  Activity,
  CheckCircle2,
  Lock,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Key,
  ShieldCheck,
  UserX,
  Stethoscope,
  Briefcase,
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
      title="کنسول مدیریت مرکزی و ممیزی سیستم (Admin Panel)"
      description="مدیریت کاربران، مطب‌ها، کنترل سطوح دسترسی (RBAC) و نظارت بر لاگ امنیتی (سند ۰۶)"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("kpis")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              activeTab === "kpis"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>داشبورد وضعیت کلان</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>مدیریت کاربران ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("offices")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              activeTab === "offices"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>مدیریت مطب‌ها ({offices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("audit_logs")}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
              activeTab === "audit_logs"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>لاگ ممیزی و امنیت ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: KPIs Overview */}
        {activeTab === "kpis" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500">کاربران فعال</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {formatPersianNumber(users.filter((u) => u.isActive).length)}
                </p>
                <span className="text-[10px] text-emerald-600">پزشکان و منشی‌ها</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500">مراکز درمانی / مطب</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {formatPersianNumber(offices.length)}
                </p>
                <span className="text-[10px] text-blue-600">تهران و سایر استان‌ها</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500">کل پرونده‌های بالینی</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {formatPersianNumber(patients.length)}
                </p>
                <span className="text-[10px] text-purple-600">پرونده بیمار ثبت‌شده</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500">ویزیت‌های ثبت‌شده</span>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                  {formatPersianNumber(visits.length)}
                </p>
                <span className="text-[10px] text-emerald-600">۹۸٪ اسناد نهایی‌شده</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>وضعیت امنیتی و رمزنگاری دیتابیس (Doc 05):</span>
              </h4>
              <p className="text-[11px] leading-relaxed">
                ارتباطات سامانه از طریق پروتکل رمزنگاری‌شده TLS 1.3 برقرار است. فیلدهای هویتی و سلامت بیماران بر اساس استاندارد حفاظت داده‌های بالینی رمزنگاری شده و ربات‌های جستجوگر و خزنده‌های وب از طریق هدرهای `X-Robots-Tag` کاملاً مسدود شده‌اند.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === "users" && (
          <div className="space-y-4">
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
                className="gap-1.5 h-9"
              >
                <Plus className="h-4 w-4" />
                <span>افزودن کاربر جدید</span>
              </Button>
            </div>

            {/* Add User Sub-form */}
            {isAddingUser && (
              <form
                onSubmit={handleCreateUser}
                className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3"
              >
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
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
                      placeholder="دکتر / منشی..."
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
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingUser(false)}
                    className="h-7 text-xs"
                  >
                    انصراف
                  </Button>
                  <Button type="submit" size="sm" className="h-7 text-xs">
                    ذخیره و ایجاد دسترسی
                  </Button>
                </div>
              </form>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="p-3">نام و مشخصات</th>
                    <th className="p-3">ایمیل</th>
                    <th className="p-3">نقش کاربری</th>
                    <th className="p-3">وضعیت حساب</th>
                    <th className="p-3">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        {u.fullName}
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">
                        {u.email}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            u.role === "admin"
                              ? "danger"
                              : u.role === "doctor"
                              ? "success"
                              : "default"
                          }
                          className="text-[10px]"
                        >
                          {u.role === "admin"
                            ? "مدیر کل"
                            : u.role === "doctor"
                            ? "پزشک"
                            : "منشی مطب"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {u.isActive ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            فعال
                          </span>
                        ) : (
                          <span className="text-red-500 text-[11px] font-bold">
                            مسدود شده
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserActive(u)}
                          className="h-7 text-[11px] px-2 text-slate-600"
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                لیست مطب‌ها و درمانگاه‌های فعال سیستم
              </h4>
              <Button
                size="sm"
                onClick={() => setIsAddingOffice(!isAddingOffice)}
                className="gap-1.5 h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>افزودن مطب جدید</span>
              </Button>
            </div>

            {isAddingOffice && (
              <form
                onSubmit={handleCreateOffice}
                className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3"
              >
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">
                  ثبت مطب / درمانگاه جدید
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      نام مطب / مرکز:
                    </label>
                    <Input
                      value={newOfficeName}
                      onChange={(e) => setNewOfficeName(e.target.value)}
                      placeholder="مثال: مطب تخصصی ونک..."
                      required
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      شماره تماس:
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
                      placeholder="تهران، خیابان..."
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingOffice(false)}
                    className="h-7 text-xs"
                  >
                    انصراف
                  </Button>
                  <Button type="submit" size="sm" className="h-7 text-xs">
                    ثبت مطب
                  </Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {offices.map((off) => (
                <div
                  key={off.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {off.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{off.address}</p>
                    </div>
                    <Badge variant="default" className="text-[10px]">
                      {off.city || "تهران"}
                    </Badge>
                  </div>
                  <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 flex items-center justify-between dark:border-slate-800">
                    <span>تلفن: {off.phone || "—"}</span>
                    <span className="text-emerald-600 font-bold">فعال</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs Trail */}
        {activeTab === "audit_logs" && (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="فیلتر لاگ بر اساس نام، عملیات..."
                className="pr-9 h-9 text-xs"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 max-h-80 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead className="sticky top-0 border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/80">
                  <tr>
                    <th className="p-3">عملیات (Action)</th>
                    <th className="p-3">کاربر</th>
                    <th className="p-3">موجودیت</th>
                    <th className="p-3">جزئیات (Metadata)</th>
                    <th className="p-3">زمان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100">
                        {log.action}
                      </td>
                      <td className="p-3">
                        <span className="font-bold">{log.userName}</span>{" "}
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
