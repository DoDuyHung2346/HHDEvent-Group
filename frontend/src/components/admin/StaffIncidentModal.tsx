"use client";

import { useState, useMemo } from "react";
import { StaffMember } from "@/lib/staff/types";
import { bulkReassignIncident } from "@/lib/staff/storage";
import { recommendStaffForBooking } from "@/lib/staff/recommendation";
import type { Booking } from "@/lib/schemas";

interface StaffIncidentModalProps {
  initialStaff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  allStaff: StaffMember[];
  allBookings: Booking[];
  onSuccess: (msg: string) => void;
}

export default function StaffIncidentModal({
  initialStaff,
  isOpen,
  onClose,
  allStaff,
  allBookings,
  onSuccess,
}: StaffIncidentModalProps) {
  const [sourceStaffId, setSourceStaffId] = useState<string>(initialStaff?.id || "");
  const [reason, setReason] = useState("Bị ốm đột xuất, không thể trực ca");
  const [targetStaffId, setTargetStaffId] = useState<string>("");

  const sourceStaff = useMemo(() => {
    return allStaff.find((s) => s.id === sourceStaffId) || initialStaff;
  }, [allStaff, sourceStaffId, initialStaff]);

  // Các lịch chưa xử lý của nhân viên này
  const pendingBookings = useMemo(() => {
    if (!sourceStaff) return [];
    return allBookings.filter(
      (b) => b.assignedStaffId === sourceStaff.id && b.status === "pending"
    );
  }, [allBookings, sourceStaff]);

  // Đề xuất nhân viên thay thế phù hợp nhất cho toàn bộ ca
  const replacementCandidates = useMemo(() => {
    if (!sourceStaff) return [];
    return allStaff.filter((s) => s.id !== sourceStaff.id && s.status === "active");
  }, [allStaff, sourceStaff]);

  if (!isOpen) return null;

  const handleExecuteBulkReassign = () => {
    if (!sourceStaff || !targetStaffId) return;

    const result = bulkReassignIncident(
      sourceStaff.id,
      targetStaffId,
      reason.trim() || "Sự cố đột xuất"
    );

    onSuccess(
      `Đã chuyển giao thành công ${result.successCount} lịch hẹn từ ${sourceStaff.name} sang ${result.targetStaffName}. Trạng thái nhân viên đã chuyển sang 'Sự cố'.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden">
        {/* Header Alert */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-rose-300 text-[24px]">crisis_alert</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Chế độ Xử lý Sự cố & Điều phối Lại Ca (Incident Mode)</h3>
              <p className="text-xs text-rose-200">Chuyển giao nhanh lịch hẹn sang nhân viên thay thế khi có sự cố khẩn cấp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed flex items-start gap-2">
            <span className="material-symbols-outlined text-[20px] text-rose-600 shrink-0">info</span>
            <div>
              <strong>Quy trình xử lý sự cố chuẩn:</strong> Khi nhân viên gặp vấn đề sức khỏe, tai nạn hoặc việc khẩn cấp không thể tiếp khách, hệ thống sẽ tự động gán toàn bộ các lịch hẹn đang chờ sang nhân viên dự phòng đã chọn và đánh dấu cảnh báo.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Nhân viên gặp sự cố
              </label>
              <select
                value={sourceStaffId}
                onChange={(e) => setSourceStaffId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium outline-none"
              >
                {allStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) - {s.roleLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Lý do phát sinh sự cố
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Bị sốt cao, việc gia đình đột xuất..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm outline-none"
              />
            </div>
          </div>

          {/* Danh sách lịch bị ảnh hưởng */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Lịch hẹn bị ảnh hưởng cần chuyển giao ({pendingBookings.length} lịch)</span>
              <span className="text-rose-600 font-semibold font-mono">
                {pendingBookings.length > 0 ? "Cần xử lý ngay" : "Không có lịch tồn"}
              </span>
            </div>

            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 p-2 text-xs">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  Nhân viên này hiện không có lịch hẹn nào đang chờ xử lý.
                </div>
              ) : (
                pendingBookings.map((b) => (
                  <div key={b.id} className="py-2 px-2 flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-slate-900">{b.name}</strong> •{" "}
                      <span className="text-slate-500">{b.eventType || "Tư vấn sự kiện"}</span>
                    </div>
                    <div className="font-mono text-slate-600 shrink-0">
                      {b.date} lúc <strong>{b.time}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chọn nhân viên tiếp nhận */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Chọn nhân viên tiếp nhận thay thế <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetStaffId}
              onChange={(e) => setTargetStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-300 text-sm bg-white font-medium outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">-- Chọn nhân viên thay thế phù hợp nhất --</option>
              {replacementCandidates.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) - {s.roleLabel} • Đang sẵn sàng nhận ca
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleExecuteBulkReassign}
            disabled={!targetStaffId || pendingBookings.length === 0}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>Chuyển giao toàn bộ ({pendingBookings.length} lịch)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
