"use client";

import { useState, useMemo, useEffect } from "react";
import { StaffMember, StaffRole, StaffStatus } from "@/lib/staff/types";
import { loadStaffList, deleteStaffMember, setStaffStatus } from "@/lib/staff/storage";
import { fetchAllRemoteBookings } from "@/lib/booking/api";
import type { Booking } from "@/lib/schemas";
import AddStaffModal from "./AddStaffModal";
import StaffScheduleModal from "./StaffScheduleModal";
import StaffIncidentModal from "./StaffIncidentModal";

interface StaffManagementProps {
  onShowToast: (msg: string) => void;
}

export default function StaffManagement({ onShowToast }: StaffManagementProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStaffForSchedule, setSelectedStaffForSchedule] = useState<StaffMember | null>(null);
  const [incidentStaff, setIncidentStaff] = useState<StaffMember | null>(null);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);

  const reloadData = () => {
    setStaffList(loadStaffList());
    fetchAllRemoteBookings()
      .then(setBookingsList)
      .catch((error) => {
        console.error("Lỗi tải lịch Supabase:", error);
        onShowToast("Không thể tải lịch hẹn từ Supabase.");
      });
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const activeStaff = staffList.filter((s) => s.status === "active").length;
    const incidentStaffCount = staffList.filter((s) => s.status === "incident").length;
    const todayBookingsCount = bookingsList.filter((b) => b.date === today).length;

    return {
      totalStaff: staffList.length,
      activeStaff,
      incidentStaffCount,
      todayBookingsCount,
    };
  }, [staffList, bookingsList]);

  // Bộ lọc
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.phone.includes(q);

      const matchStatus = statusFilter === "all" ? true : s.status === statusFilter;
      const matchRole = roleFilter === "all" ? true : s.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [staffList, searchQuery, statusFilter, roleFilter]);

  const handleDeleteStaff = (staffId: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${name} (${staffId}) khỏi hệ thống?`)) {
      const ok = deleteStaffMember(staffId);
      if (ok) {
        onShowToast(`Đã xóa nhân viên ${name} thành công.`);
        reloadData();
      } else {
        alert("Hệ thống yêu cầu giữ lại ít nhất 1 nhân viên điều phối.");
      }
    }
  };

  const handleStatusChange = (staffId: string, newStatus: StaffStatus) => {
    setStaffStatus(staffId, newStatus);
    onShowToast("Đã cập nhật trạng thái làm việc của nhân viên.");
    reloadData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Tổng số nhân sự</span>
            <span className="material-symbols-outlined text-[18px] text-indigo-600">groups</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalStaff}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Chuyên viên tư vấn & điều phối</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Đang sẵn sàng ca</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.activeStaff}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Sẵn sàng nhận lịch mới</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Lịch hẹn hôm nay</span>
            <span className="material-symbols-outlined text-[18px] text-amber-600">calendar_today</span>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.todayBookingsCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ca tư vấn trong ngày</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Sự cố cần đổi lịch</span>
            <span className="material-symbols-outlined text-[18px] text-rose-600">emergency_home</span>
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.incidentStaffCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cần tái điều phối ca</div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm nhân viên theo tên, mã NV, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 font-medium outline-none"
            >
              <option value="all">Tất cả chuyên môn</option>
              <option value="director_event">Concierge VIP & Điều phối</option>
              <option value="consultant_wedding">Tiệc cưới & YEP</option>
              <option value="coordinator_gala">Hội nghị & Gala</option>
              <option value="tech_lead_av">Kỹ thuật AV & Sân khấu</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 font-medium outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">🟢 Đang hoạt động</option>
              <option value="busy">🟡 Đang bận ca</option>
              <option value="incident">🔴 Sự cố / Cần đổi ca</option>
              <option value="on_leave">⚪ Nghỉ phép</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIncidentStaff(staffList[0] || null);
                setIsIncidentOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Bật chế độ điều chỉnh lịch khẩn cấp khi có sự cố"
            >
              <span className="material-symbols-outlined text-[17px] text-rose-600">crisis_alert</span>
              <span>Mode Báo sự cố</span>
            </button>

            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Thêm nhân viên</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic">
          💡 <strong>Mẹo quản trị:</strong> Nhấn trực tiếp vào bất kỳ hàng nhân viên nào để xem lịch trình chi tiết (ngày, tháng, giờ, ca làm việc) mà nhân viên đó đang đảm nhận.
        </p>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3.5 px-4">Mã NV</th>
                <th className="py-3.5 px-4">Nhân viên</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Chuyên môn / Lĩnh vực</th>
                <th className="py-3.5 px-4 text-center">Lịch đang đảm nhận</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const staffBookingsCount = bookingsList.filter(
                    (b) => b.assignedStaffId === staff.id
                  ).length;
                  const pendingCount = bookingsList.filter(
                    (b) => b.assignedStaffId === staff.id && b.status === "pending"
                  ).length;

                  return (
                    <tr
                      key={staff.id}
                      onClick={() => setSelectedStaffForSchedule(staff)}
                      className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                      title="Nhấn để xem lịch trình chi tiết của nhân viên này"
                    >
                      {/* Mã NV */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        <span className="px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200/60">
                          {staff.id}
                        </span>
                      </td>

                      {/* Tên & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${staff.avatarBg || "bg-indigo-600"} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                            {staff.name.slice(-2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                              {staff.name}
                            </div>
                            <div className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                              ★ {staff.rating}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SĐT */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 font-medium">
                        {staff.phone}
                      </td>

                      {/* Chuyên môn */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">
                          {staff.roleLabel}
                        </span>
                      </td>

                      {/* Số lượng lịch đang đảm nhận */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold">
                          <span>{staffBookingsCount} lịch</span>
                          {pendingCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title={`${pendingCount} lịch chờ`} />
                          )}
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={staff.status}
                          onChange={(e) => handleStatusChange(staff.id, e.target.value as StaffStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold outline-none border cursor-pointer ${
                            staff.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : staff.status === "incident"
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : staff.status === "busy"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          <option value="active">🟢 Đang hoạt động</option>
                          <option value="busy">🟡 Đang bận</option>
                          <option value="incident">🔴 Sự cố</option>
                          <option value="on_leave">⚪ Nghỉ phép</option>
                        </select>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStaffForSchedule(staff)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Xem lịch chi tiết ngày giờ"
                          >
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                          </button>

                          <button
                            onClick={() => {
                              setIncidentStaff(staff);
                              setIsIncidentOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Báo sự cố & điều chuyển ca khẩn cấp"
                          >
                            <span className="material-symbols-outlined text-[18px]">emergency</span>
                          </button>

                          <button
                            onClick={() => handleDeleteStaff(staff.id, staff.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa nhân viên"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddStaffModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newStaff) => {
          onShowToast(`Đã thêm thành công nhân viên ${newStaff.name} (${newStaff.id}).`);
          reloadData();
        }}
      />

      <StaffScheduleModal
        staff={selectedStaffForSchedule}
        isOpen={Boolean(selectedStaffForSchedule)}
        onClose={() => setSelectedStaffForSchedule(null)}
        allBookings={bookingsList}
        allStaff={staffList}
        onBookingUpdated={() => {
          onShowToast("Đã cập nhật lịch làm việc thành công.");
          reloadData();
        }}
        onTriggerIncident={(s) => {
          setIncidentStaff(s);
          setIsIncidentOpen(true);
        }}
      />

      <StaffIncidentModal
        initialStaff={incidentStaff}
        isOpen={isIncidentOpen}
        onClose={() => setIsIncidentOpen(false)}
        allStaff={staffList}
        allBookings={bookingsList}
        onSuccess={(msg) => {
          onShowToast(msg);
          reloadData();
        }}
      />
    </div>
  );
}
