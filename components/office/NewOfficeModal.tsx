"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveOffice, setActiveOfficeId } from "@/lib/storage";
import { Building2 } from "lucide-react";

interface NewOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOfficeCreated?: () => void;
}

export function NewOfficeModal({
  isOpen,
  onClose,
  onOfficeCreated,
}: NewOfficeModalProps) {
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("تهران");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = saveOffice({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || "تهران",
      });

      setActiveOfficeId(created.id);
      setName("");
      setAddress("");
      setPhone("");
      onClose();
      if (onOfficeCreated) onOfficeCreated();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="افزودن مطب یا مرکز درمانی جدید"
      description="ثبت مطب دوم/سوم برای پزشک یا کلینیک مستقل با تفکیک پذیرش و پرونده‌ها"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            نام مطب / مرکز درمانی:
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: مطب سعادت‌آباد..."
            required
            className="text-xs"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شهر:
            </label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="تهران"
              className="text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              تلفن تماس:
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="021-..."
              className="text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            آدرس دقیق:
          </label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="خیابان، پلاک، طبقه، واحد..."
            className="text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting}
            className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs"
          >
            <Building2 className="h-4 w-4" />
            <span>ثبت و انتخاب مطب</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
