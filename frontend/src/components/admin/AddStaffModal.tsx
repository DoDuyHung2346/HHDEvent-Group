"use client";

import { useState } from "react";
import { StaffMember, StaffRole } from "@/lib/staff/types";
import { addStaffMember } from "@/lib/staff/storage";
import { validatePhone, validateName } from "@/lib/booking/validate";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMember: StaffMember) => void;
}

export default function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("consultant_wedding");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameErr = validateName(name);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneErr = validatePhone(cleanPhone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    try {
      const newMember = addStaffMember({
        name: name.trim(),
        phone: cleanPhone,
        role,
        id: id.trim() || undefined,
      });
      onSuccess(newMember);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi thêm nhân viên");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-300">person_add</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Thêm Nhân viên Điều phối Mới</h3>
              <p className="text-xs text-indigo-200">Phân công chuyên môn và ca làm việc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Họ và tên nhân viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm min-h-[46px] sm:min-h-0 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mã nhân viên (tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: EV-005 (để trống tự sinh)"
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm min-h-[46px] sm:min-h-0 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Số điện thoại liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm min-h-[46px] sm:min-h-0 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Chuyên môn & Lĩnh vực phụ trách <span className="text-rose-500">*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm min-h-[46px] sm:min-h-0 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
            >
              <option value="consultant_wedding">Tiệc cưới, Sinh nhật & YEP (Chuyên viên tiệc cưới)</option>
              <option value="consultant_corporate">Hội nghị, Hội thảo & Lễ Khai trương (Chuyên viên Doanh nghiệp)</option>
              <option value="coordinator_gala">Gala Dinner, Tri ân & Teambuilding (Điều phối Gala)</option>
              <option value="tech_lead_av">Kỹ thuật Âm thanh - Ánh sáng & Sân khấu (Kỹ sư AV)</option>
              <option value="director_event">Concierge VIP, Trực thăng & Sự kiện đặc biệt (Giám đốc Điều phối)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Lưu nhân viên</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
