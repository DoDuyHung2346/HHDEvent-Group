"use client";

import { useState, useMemo } from "react";
import { StaffMember } from "@/lib/staff/types";
import { reassignBooking } from "@/lib/staff/storage";
import { recommendStaffForBooking } from "@/lib/staff/recommendation";
import type { Booking } from "@/lib/schemas";

interface StaffScheduleModalProps {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
  allBookings: Booking[];
  allStaff: StaffMember[];
  onBookingUpdated: () => void;
  onTriggerIncident: (staff: StaffMember) => void;
}

export default function StaffScheduleModal({
  staff,
  isOpen,
  onClose,
  allBookings,
  allStaff,
  onBookingUpdated,
  onTriggerIncident,
}: StaffScheduleModalProps) {
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [reassigningBookingId, setReassigningBookingId] = useState<string | null>(null);
  const [selectedTargetStaffId, setSelectedTargetStaffId] = useState<string>("");
  const [reassignReason, setReassignReason] = useState("");

  const staffBookings = useMemo(() => {
    if (!staff) return [];
    return allBookings
      .filter((b) => b.assignedStaffId === staff.id)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [allBookings, staff]);

  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(staffBookings.map((b) => b.date)));
    return dates.sort();
  }, [staffBookings]);

  const filteredList = useMemo(() => {
    if (dateFilter === "all") return staffBookings;
    return staffBookings.filter((b) => b.date === dateFilter);
  }, [staffBookings, dateFilter]);

  if (!isOpen || !staff) return null;

  const currentReassignBooking = allBookings.find((b) => b.id === reassigningBookingId);
  const availableRecommendations = currentReassignBooking
    ? recommendStaffForBooking({
        date: currentReassignBooking.date,
        time: currentReassignBooking.time,
        eventType: currentReassignBooking.eventType,
        excludeStaffId: staff.id,
      })
    : [];

  const handleConfirmReassign = () => {
    if (!reassigningBookingId || !selectedTargetStaffId) return;
    reassignBooking(reassigningBookingId, selectedTargetStaffId, reassignReason || "Admin điều chỉnh lịch thủ công");
    onBookingUpdated();
    setReassigningBookingId(null);
    setSelectedTargetStaffId("");
    setReassignReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Profile */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl ${staff.avatarBg || "bg-indigo-600"} text-white flex items-center justify-center font-bold text-lg shadow-sm`}>
              {staff.name.slice(-2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/10 text-indigo-300 font-semibold">
                  {staff.id}
                </span>
                <h3 className="font-bold text-lg text-white">{staff.name}</h3>
                <span className="text-amber-400 text-xs flex items-center gap-0.5">
                  ★ {staff.rating}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-3 mt-0.5">
                <span>📞 {staff.phone}</span>
                <span>•</span>
                <span className="text-indigo-300 font-medium">{staff.roleLabel}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onTriggerIncident(staff);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Bật chế độ điều chỉnh lịch khẩn cấp khi nhân viên gặp sự cố"
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span className="hidden sm:inline">Báo sự cố & Đổi ca</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Lọc theo ngày:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium outline-none"
            >
              <option value="all">Tất cả ngày ({staffBookings.length} lịch)</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d} ({staffBookings.filter((b) => b.date === d).length} lịch)
                </option>
              ))}
            </select>
          </div>

          <div className="text-slate-500">
            Tổng cộng: <strong className="text-slate-800">{filteredList.length} lịch hẹn</strong> đang phụ trách
          </div>
        </div>

        {/* Schedule List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 min-h-0 bg-slate-100/50">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <span className="material-symbols-outlined text-[40px] text-slate-300 mb-2 block">
                event_available
              </span>
              Nhân viên hiện không có lịch hẹn nào trong danh mục đã chọn.
            </div>
          ) : (
            filteredList.map((booking) => {
              const isMorning = parseInt(booking.time.split(":")[0], 10) < 12;
              return (
                <div
                  key={booking.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className={`px-2.5 py-1.5 rounded-xl font-mono text-center shrink-0 border ${
                      isMorning
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}>
                      <div className="text-[10px] font-bold uppercase tracking-wider">
                        {isMorning ? "Ca Sáng" : "Ca Chiều"}
                      </div>
                      <div className="text-sm font-black">{booking.time}</div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{booking.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({booking.phone})</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          booking.status === "processed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {booking.status === "processed" ? "Đã hoàn tất" : "Chờ tiếp khách"}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-0.5 font-medium">
                        {booking.eventType || "Tư vấn sự kiện tổng thể"} • Ngày: <strong>{booking.date}</strong>
                      </div>

                      {booking.notes && (
                        <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
                          Ghi chú: {booking.notes}
                        </p>
                      )}

                      {booking.incidentNote && (
                        <div className="text-[10px] text-rose-600 font-medium mt-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          {booking.incidentNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions on single booking */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setReassigningBookingId(booking.id);
                        const recs = recommendStaffForBooking({
                          date: booking.date,
                          time: booking.time,
                          eventType: booking.eventType,
                          excludeStaffId: staff.id,
                        });
                        if (recs.length > 0 && recs[0].isAvailable) {
                          setSelectedTargetStaffId(recs[0].staff.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                      <span>Chuyển chuyên viên</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Single Reassign Sub-Modal / Popover */}
        {reassigningBookingId && currentReassignBooking && (
          <div className="p-4 bg-indigo-50/90 border-t border-indigo-200 animate-in fade-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-indigo-600">published_with_changes</span>
                <span>Chuyển giao lịch của khách: <strong>{currentReassignBooking.name}</strong> ({currentReassignBooking.date} • {currentReassignBooking.time})</span>
              </div>
              <button
                onClick={() => setReassigningBookingId(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Hủy
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-indigo-950 uppercase mb-1">
                  Chọn nhân viên tiếp nhận (Hệ thống xếp theo độ phù hợp)
                </label>
                <select
                  value={selectedTargetStaffId}
                  onChange={(e) => setSelectedTargetStaffId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-300 text-xs bg-white text-slate-900 font-medium outline-none"
                >
                  <option value="">-- Chọn nhân viên tiếp nhận --</option>
                  {availableRecommendations.map((rec) => (
                    <option key={rec.staff.id} value={rec.staff.id} disabled={!rec.isAvailable}>
                      {rec.staff.name} ({rec.staff.id}) - {rec.staff.roleLabel} {rec.isAvailable ? `[Điểm: ${rec.score}%]` : "[BẬN]"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-950 uppercase mb-1">
                  Lý do chuyển ca (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bận đột xuất, chuyển giao chuyên môn..."
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-300 text-xs bg-white text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setReassigningBookingId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-600"
              >
                Đóng
              </button>
              <button
                onClick={handleConfirmReassign}
                disabled={!selectedTargetStaffId}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Xác nhận chuyển lịch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
